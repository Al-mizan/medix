import { spawn, ChildProcess } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as net from 'node:net';
import {
  ConsoleErrorRecord,
  DESKTOP_VIEWPORT,
  MOBILE_VIEWPORT,
  NetworkFailureRecord,
  TelemetrySummary,
  ViewportConfig,
} from './types';

export class CdpPage {
  private ws: WebSocket;
  private messageId = 1;
  private pendingCallbacks = new Map<number, { resolve: (val: any) => void; reject: (err: any) => void }>();
  private consoleErrors: ConsoleErrorRecord[] = [];
  private networkFailures: NetworkFailureRecord[] = [];
  private allLogs: Array<{ type: string; text: string; timestamp: string }> = [];
  public currentUrl = '';

  constructor(ws: WebSocket) {
    this.ws = ws;
    this.ws.addEventListener('message', (event) => this.handleMessage(event.data.toString()));
  }

  private handleMessage(raw: string) {
    let msg: any;
    try {
      msg = JSON.parse(raw);
    } catch {
      return;
    }

    if (msg.id && this.pendingCallbacks.has(msg.id)) {
      const { resolve, reject } = this.pendingCallbacks.get(msg.id)!;
      this.pendingCallbacks.delete(msg.id);
      if (msg.error) {
        reject(new Error(msg.error.message || JSON.stringify(msg.error)));
      } else {
        resolve(msg.result);
      }
      return;
    }

    if (msg.method === 'Runtime.consoleAPICalled') {
      const type = msg.params.type;
      const text = (msg.params.args || [])
        .map((a: any) => (a.value !== undefined ? String(a.value) : a.description || ''))
        .join(' ');
      const timestamp = new Date().toISOString();
      this.allLogs.push({ type, text, timestamp });

      if (type === 'error' || type === 'assert') {
        this.consoleErrors.push({
          type,
          text,
          url: this.currentUrl,
          timestamp,
        });
      }
    }

    if (msg.method === 'Runtime.exceptionThrown') {
      const text = msg.params.exceptionDetails?.text || 'Uncaught Exception';
      const desc = msg.params.exceptionDetails?.exception?.description || '';
      const timestamp = new Date().toISOString();
      this.consoleErrors.push({
        type: 'exception',
        text: `${text}: ${desc}`,
        url: this.currentUrl,
        timestamp,
      });
    }

    if (msg.method === 'Network.responseReceived') {
      const { response } = msg.params;
      const status = response.status;
      // Track 4xx and 5xx responses (excluding expected preflights or benign favicon 404s if needed)
      if (status >= 400) {
        this.networkFailures.push({
          url: response.url,
          method: response.requestHeaders?.[':method'] || 'GET',
          status,
          statusText: response.statusText || '',
          timestamp: new Date().toISOString(),
        });
      }
    }
  }

  public send<T = any>(method: string, params: Record<string, any> = {}): Promise<T> {
    return new Promise((resolve, reject) => {
      const id = this.messageId++;
      this.pendingCallbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  public async init(): Promise<void> {
    await this.send('Page.enable');
    await this.send('Runtime.enable');
    await this.send('Network.enable');
    await this.send('DOM.enable');
  }

  public async setViewport(config: ViewportConfig): Promise<void> {
    await this.send('Emulation.setDeviceMetricsOverride', {
      width: config.width,
      height: config.height,
      deviceScaleFactor: config.deviceScaleFactor,
      mobile: config.isMobile,
      screenOrientation: { angle: 0, type: 'portraitPrimary' },
    });

    if (config.hasTouch) {
      await this.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    } else {
      await this.send('Emulation.setTouchEmulationEnabled', { enabled: false });
    }

    if (config.userAgent) {
      await this.send('Emulation.setUserAgentOverride', { userAgent: config.userAgent });
    }
  }

  public async goto(url: string, timeoutMs = 30000): Promise<void> {
    this.currentUrl = url;
    await this.send('Page.navigate', { url });
    await this.waitForLoad(timeoutMs);
  }

  public async waitForLoad(timeoutMs = 30000): Promise<void> {
    const startTime = Date.now();
    while (Date.now() - startTime < timeoutMs) {
      const res = await this.evaluate(`document.readyState`);
      if (res === 'complete' || res === 'interactive') {
        // Give client frameworks a brief settling interval
        await this.waitForTimeout(500);
        return;
      }
      await this.waitForTimeout(200);
    }
  }

  public async waitForTimeout(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
  }

  public async evaluate<T = any>(expressionOrFn: string | (() => T)): Promise<T> {
    const expression = typeof expressionOrFn === 'function' ? `(${expressionOrFn.toString()})()` : expressionOrFn;
    const result = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });

    if (result.exceptionDetails) {
      const errorMsg = result.exceptionDetails.exception?.description || result.exceptionDetails.text;
      throw new Error(`Evaluation failed: ${errorMsg}`);
    }

    return result.result?.value;
  }

  public async waitForSelector(selector: string, timeoutMs = 15000): Promise<void> {
    const startTime = Date.now();
    while (Date.now() - startTime < timeoutMs) {
      const exists = await this.evaluate(`Boolean(document.querySelector(${JSON.stringify(selector)}))`);
      if (exists) return;
      await this.waitForTimeout(200);
    }
    throw new Error(`Timeout waiting for selector: "${selector}" after ${timeoutMs}ms`);
  }

  public async click(selector: string): Promise<void> {
    await this.waitForSelector(selector);
    const success = await this.evaluate(`
      (() => {
        const el = document.querySelector(${JSON.stringify(selector)});
        if (!el) return false;
        el.scrollIntoView({ behavior: 'instant', block: 'center' });
        el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
        el.click();
        return true;
      })()
    `);
    if (!success) {
      throw new Error(`Could not click selector: ${selector}`);
    }
    await this.waitForTimeout(300);
  }

  public async fill(selector: string, text: string): Promise<void> {
    await this.waitForSelector(selector);
    await this.evaluate(`
      (() => {
        const el = document.querySelector(${JSON.stringify(selector)});
        if (!el) throw new Error("Element not found: " + ${JSON.stringify(selector)});
        el.scrollIntoView({ behavior: 'instant', block: 'center' });
        el.focus();
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
          || Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
        if (nativeSetter) {
          nativeSetter.call(el, ${JSON.stringify(text)});
        } else {
          el.value = ${JSON.stringify(text)};
        }
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      })()
    `);
    await this.waitForTimeout(200);
  }

  public async screenshot(outputPath: string, options: { fullPage?: boolean } = {}): Promise<string> {
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const captureOptions: any = { format: 'png' };
    if (options.fullPage) {
      captureOptions.captureBeyondViewport = true;
    }

    const { data } = await this.send('Page.captureScreenshot', captureOptions);
    const buffer = Buffer.from(data, 'base64');
    fs.writeFileSync(outputPath, buffer);
    return outputPath;
  }

  public async clearCookies(): Promise<void> {
    await this.send('Network.clearBrowserCookies');
    await this.waitForTimeout(200);
  }

  public getTelemetry(): TelemetrySummary {
    return {
      consoleErrors: [...this.consoleErrors],
      networkFailures: [...this.networkFailures],
      allConsoleLogs: [...this.allLogs],
    };
  }

  public clearTelemetry(): void {
    this.consoleErrors = [];
    this.networkFailures = [];
    this.allLogs = [];
  }
}

export class CdpBrowser {
  private chromeProcess: ChildProcess | null = null;
  private port: number;

  constructor(port = 9225) {
    this.port = port;
  }

  private static async getFreePort(): Promise<number> {
    return new Promise((resolve) => {
      const server = net.createServer();
      server.listen(0, '127.0.0.1', () => {
        const port = (server.address() as net.AddressInfo).port;
        server.close(() => resolve(port));
      });
    });
  }

  public static async launch(): Promise<CdpBrowser> {
    const port = await CdpBrowser.getFreePort();
    const browser = new CdpBrowser(port);
    await browser.start();
    return browser;
  }

  private async start(): Promise<void> {
    const chromePath = '/usr/bin/google-chrome';
    if (!fs.existsSync(chromePath)) {
      throw new Error(`Google Chrome binary not found at ${chromePath}`);
    }

    this.chromeProcess = spawn(chromePath, [
      '--headless=new',
      `--remote-debugging-port=${this.port}`,
      '--disable-gpu',
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-background-networking',
      '--disable-extensions',
      '--hide-scrollbars',
      '--mute-audio',
    ]);

    // Poll until debugging port is ready
    const startTime = Date.now();
    let ready = false;
    while (Date.now() - startTime < 10000) {
      try {
        const res = await fetch(`http://127.0.0.1:${this.port}/json/version`);
        if (res.ok) {
          ready = true;
          break;
        }
      } catch {
        // wait and retry
      }
      await new Promise((r) => setTimeout(r, 100));
    }

    if (!ready) {
      this.close();
      throw new Error(`Headless Chrome failed to bind to port ${this.port} within 10s`);
    }
  }

  public async newPage(viewport: ViewportConfig = DESKTOP_VIEWPORT): Promise<CdpPage> {
    const res = await fetch(`http://127.0.0.1:${this.port}/json/new?about:blank`, { method: 'PUT' });
    const target = await res.json();
    const ws = new WebSocket(target.webSocketDebuggerUrl);

    await new Promise((resolve, reject) => {
      ws.onopen = () => resolve(true);
      ws.onerror = reject;
    });

    const page = new CdpPage(ws);
    await page.init();
    await page.setViewport(viewport);
    return page;
  }

  public close(): void {
    if (this.chromeProcess) {
      this.chromeProcess.kill('SIGKILL');
      this.chromeProcess = null;
    }
  }
}
