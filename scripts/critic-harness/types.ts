/**
 * Critic Harness Type Definitions
 * Supporting multi-agent visual, UX, and functional verification across viewports.
 */

export type ViewportMode = 'desktop' | 'mobile';

export interface ViewportConfig {
  name: ViewportMode;
  width: number;
  height: number;
  deviceScaleFactor: number;
  isMobile: boolean;
  hasTouch: boolean;
  userAgent?: string;
}

export const DESKTOP_VIEWPORT: ViewportConfig = {
  name: 'desktop',
  width: 1440,
  height: 900,
  deviceScaleFactor: 1,
  isMobile: false,
  hasTouch: false,
};

export const MOBILE_VIEWPORT: ViewportConfig = {
  name: 'mobile',
  width: 390,
  height: 844,
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
  userAgent:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
};

export interface ConsoleErrorRecord {
  type: string;
  text: string;
  url?: string;
  timestamp: string;
}

export interface NetworkFailureRecord {
  url: string;
  method: string;
  status: number;
  statusText: string;
  timestamp: string;
}

export interface TelemetrySummary {
  consoleErrors: ConsoleErrorRecord[];
  networkFailures: NetworkFailureRecord[];
  allConsoleLogs: Array<{ type: string; text: string; timestamp: string }>;
}

export interface ScreenshotMetadata {
  agentName: 'admin' | 'doctor' | 'patient';
  viewport: ViewportMode;
  route: string;
  stateLabel: string;
  filePath: string;
  timestamp: string;
}

export interface PillarScoreBreakdown {
  visualCraft: number; // 0 - 2.5
  uxErgonomics: number; // 0 - 2.5
  responsiveness: number; // 0 - 2.5
  functionalRobustness: number; // 0 - 2.5
  totalScore: number; // 0 - 10.0
  passed: boolean; // totalScore >= 8.5 && functionalRobustness > 0
}

export interface RankedIssue {
  id: string;
  priority: 'P0' | 'P1' | 'P2';
  agent: 'admin' | 'doctor' | 'patient';
  title: string;
  description: string;
  route: string;
  viewport: ViewportMode;
  screenshotRef?: string;
  remediation: string;
}

export interface CriticAgentResult {
  agentName: 'admin' | 'doctor' | 'patient';
  scores: PillarScoreBreakdown;
  telemetry: TelemetrySummary;
  screenshots: ScreenshotMetadata[];
  issues: RankedIssue[];
}

export interface FullEvaluationReport {
  timestamp: string;
  passed: boolean;
  overallScore: number;
  circuitBreakerTriggered: boolean;
  circuitBreakerReasons: string[];
  agents: {
    admin: CriticAgentResult;
    doctor: CriticAgentResult;
    patient: CriticAgentResult;
  };
  rankedIssues: RankedIssue[];
}
