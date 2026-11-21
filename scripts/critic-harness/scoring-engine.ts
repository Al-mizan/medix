import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  CriticAgentResult,
  FullEvaluationReport,
  RankedIssue,
} from './types';

export class ScoringEngine {
  private outputDir: string;

  constructor(outputDir = path.resolve(__dirname, '../../docs/critic-reports')) {
    this.outputDir = outputDir;
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  public evaluateAndReport(
    adminResult: CriticAgentResult,
    doctorResult: CriticAgentResult,
    patientResult: CriticAgentResult
  ): FullEvaluationReport {
    console.log('\n======================================================');
    console.log('      MEDIX CRITIC QUALITY GATE EVALUATION REPORT     ');
    console.log('======================================================\n');

    const circuitBreakerReasons: string[] = [];
    const allAgents = [adminResult, doctorResult, patientResult];

    // Check circuit breaker triggers across all agents
    allAgents.forEach((agent) => {
      if (agent.telemetry.consoleErrors.length > 0) {
        circuitBreakerReasons.push(
          `[${agent.agentName.toUpperCase()}] ${agent.telemetry.consoleErrors.length} browser console errors recorded.`
        );
      }
      if (agent.telemetry.networkFailures.length > 0) {
        circuitBreakerReasons.push(
          `[${agent.agentName.toUpperCase()}] ${agent.telemetry.networkFailures.length} HTTP >= 400 network failures recorded.`
        );
      }
    });

    const circuitBreakerTriggered = circuitBreakerReasons.length > 0;

    // Calculate aggregate score
    const totalRaw = adminResult.scores.totalScore + doctorResult.scores.totalScore + patientResult.scores.totalScore;
    const overallScore = parseFloat((totalRaw / 3).toFixed(2));

    // Passing condition: all three agents >= 8.5 AND zero circuit breakers triggered
    const allPassed =
      adminResult.scores.passed &&
      doctorResult.scores.passed &&
      patientResult.scores.passed &&
      !circuitBreakerTriggered &&
      overallScore >= 8.5;

    // Collate all issues and sort by priority: P0 > P1 > P2
    const allIssues: RankedIssue[] = [
      ...adminResult.issues,
      ...doctorResult.issues,
      ...patientResult.issues,
    ].sort((a, b) => {
      const priorityOrder = { P0: 0, P1: 1, P2: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    const report: FullEvaluationReport = {
      timestamp: new Date().toISOString(),
      passed: allPassed,
      overallScore,
      circuitBreakerTriggered,
      circuitBreakerReasons,
      agents: {
        admin: adminResult,
        doctor: doctorResult,
        patient: patientResult,
      },
      rankedIssues: allIssues,
    };

    // Save docs/critic-reports/latest.json
    const jsonPath = path.join(this.outputDir, 'latest.json');
    fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf-8');
    console.log(`✓ Machine-readable report saved to: ${jsonPath}`);

    // Generate docs/critic-reports/latest.md
    const mdContent = this.generateMarkdownSummary(report);
    const mdPath = path.join(this.outputDir, 'latest.md');
    fs.writeFileSync(mdPath, mdContent, 'utf-8');
    console.log(`✓ Executive summary saved to: ${mdPath}`);

    // Print summary to terminal
    this.printTerminalSummary(report);

    return report;
  }

  private generateMarkdownSummary(report: FullEvaluationReport): string {
    const statusBadge = report.passed ? '🟢 PASS (≥ 8.5/10)' : '🔴 FAIL (< 8.5 or Circuit Breaker)';

    let md = `# Medix Quality Gate Evaluation Report\n\n`;
    md += `- **Date**: ${report.timestamp}\n`;
    md += `- **Verdict**: ${statusBadge}\n`;
    md += `- **Overall Platform Score**: **${report.overallScore} / 10**\n`;
    md += `- **Circuit Breaker Status**: ${report.circuitBreakerTriggered ? '⚠️ TRIGGERED' : '✅ CLEAN'}\n\n`;

    if (report.circuitBreakerReasons.length > 0) {
      md += `### Circuit Breaker Violations (Zero-Tolerance Gate)\n\n`;
      report.circuitBreakerReasons.forEach((reason) => {
        md += `- ❌ ${reason}\n`;
      });
      md += `\n`;
    }

    md += `## Agent Persona Scorecards\n\n`;
    md += `| Critic Agent | Visual Craft (2.5) | UX Ergonomics (2.5) | Responsiveness (2.5) | Functionality (2.5) | Total (10) | Result |\n`;
    md += `| :--- | :---: | :---: | :---: | :---: | :---: | :---: |\n`;

    const agents = [report.agents.admin, report.agents.doctor, report.agents.patient];
    agents.forEach((ag) => {
      const p = ag.scores;
      const resLabel = p.passed ? '✅ PASS' : '❌ FAIL';
      md += `| **${ag.agentName.toUpperCase()}** | ${p.visualCraft} | ${p.uxErgonomics} | ${p.responsiveness} | ${p.functionalRobustness} | **${p.totalScore}** | ${resLabel} |\n`;
    });

    md += `\n## Captured State Screenshots (${agents.reduce((sum, a) => sum + a.screenshots.length, 0)} total)\n\n`;
    agents.forEach((ag) => {
      md += `### ${ag.agentName.toUpperCase()} Screenshots\n\n`;
      ag.screenshots.forEach((s) => {
        md += `- **[${s.viewport.toUpperCase()}]** \`${s.route}\` (${s.stateLabel}): [\`${path.basename(s.filePath)}\`](./screenshots/${path.basename(s.filePath)})\n`;
      });
      md += `\n`;
    });

    if (report.rankedIssues.length > 0) {
      md += `## Ranked Issues for Builder Agent Remediation\n\n`;
      report.rankedIssues.forEach((issue, idx) => {
        md += `### ${idx + 1}. [${issue.priority}] ${issue.title}\n\n`;
        md += `- **Agent**: ${issue.agent.toUpperCase()}\n`;
        md += `- **Route**: \`${issue.route}\` (${issue.viewport})\n`;
        md += `- **Description**: ${issue.description}\n`;
        md += `- **Remediation**: ${issue.remediation}\n\n`;
      });
    } else {
      md += `## Remediation Status\n\nNo P0/P1/P2 issues detected. All workflows, design tokens, and interactions verified clean!\n`;
    }

    return md;
  }

  private printTerminalSummary(report: FullEvaluationReport): void {
    console.log('------------------------------------------------------');
    console.log(`OVERALL PLATFORM VERDICT: ${report.passed ? 'PASSED (>= 8.5)' : 'FAILED'}`);
    console.log(`COMPOSITE SCORE:         ${report.overallScore} / 10.0`);
    console.log('------------------------------------------------------');
    console.log(`Admin Agent:   ${report.agents.admin.scores.totalScore}/10 (${report.agents.admin.scores.passed ? 'PASS' : 'FAIL'})`);
    console.log(`Doctor Agent:  ${report.agents.doctor.scores.totalScore}/10 (${report.agents.doctor.scores.passed ? 'PASS' : 'FAIL'})`);
    console.log(`Patient Agent: ${report.agents.patient.scores.totalScore}/10 (${report.agents.patient.scores.passed ? 'PASS' : 'FAIL'})`);
    console.log('------------------------------------------------------');
    if (report.rankedIssues.length > 0) {
      console.log(`Ranked Issues Found: ${report.rankedIssues.length}`);
      report.rankedIssues.forEach((i) => {
        console.log(`  [${i.priority}] (${i.agent}) ${i.title}`);
      });
    } else {
      console.log('Zero broken flows, zero console errors, zero network failures.');
    }
    console.log('======================================================\n');
  }
}
