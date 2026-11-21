import * as path from 'node:path';
import * as fs from 'node:fs';
import { CdpBrowser, CdpPage } from './cdp-browser';
import {
  DESKTOP_VIEWPORT,
  MOBILE_VIEWPORT,
  ScreenshotMetadata,
  TelemetrySummary,
  ViewportConfig,
  ViewportMode,
} from './types';

export class CriticHarness {
  private browser: CdpBrowser | null = null;
  private screenshots: ScreenshotMetadata[] = [];
  private screenshotBaseDir: string;

  constructor(screenshotDir?: string) {
    // Always default to repo root docs/critic-reports/screenshots
    const defaultDir = path.resolve(__dirname, '../../docs/critic-reports/screenshots');
    this.screenshotBaseDir = screenshotDir || defaultDir;
    if (!fs.existsSync(this.screenshotBaseDir)) {
      fs.mkdirSync(this.screenshotBaseDir, { recursive: true });
    }
  }

  public async init(): Promise<void> {
    this.browser = await CdpBrowser.launch();
  }

  public async createSession(
    viewportMode: ViewportMode = 'desktop'
  ): Promise<{ page: CdpPage; viewport: ViewportConfig }> {
    if (!this.browser) {
      throw new Error('CriticHarness not initialized. Call init() first.');
    }
    const viewport = viewportMode === 'mobile' ? MOBILE_VIEWPORT : DESKTOP_VIEWPORT;
    const page = await this.browser.newPage(viewport);
    return { page, viewport };
  }

  public async captureStep(
    page: CdpPage,
    agentName: 'admin' | 'doctor' | 'patient',
    viewport: ViewportMode,
    route: string,
    stateLabel: string
  ): Promise<ScreenshotMetadata> {
    const sanitizedRoute = route.replace(/[^a-zA-Z0-9_-]/g, '_').replace(/^_+|_+$/g, '') || 'root';
    const sanitizedState = stateLabel.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
    const fileName = `${agentName}-${viewport}-${sanitizedRoute}-${sanitizedState}.png`;
    const filePath = path.join(this.screenshotBaseDir, fileName);

    await page.screenshot(filePath, { fullPage: false });

    const metadata: ScreenshotMetadata = {
      agentName,
      viewport,
      route,
      stateLabel,
      filePath,
      timestamp: new Date().toISOString(),
    };

    this.screenshots.push(metadata);
    return metadata;
  }

  public getRecordedScreenshots(): ScreenshotMetadata[] {
    return [...this.screenshots];
  }

  public async close(): Promise<void> {
    if (this.browser) {
      this.browser.close();
      this.browser = null;
    }
  }
}
