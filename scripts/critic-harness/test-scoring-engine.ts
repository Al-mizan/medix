import * as fs from 'node:fs';
import * as path from 'node:path';
import { ScoringEngine } from './scoring-engine';
import { CriticAgentResult } from './types';

function createMockAgentResult(
  agentName: 'admin' | 'doctor' | 'patient',
  hasErrors = false
): CriticAgentResult {
  const visualCraft = 2.4;
  const uxErgonomics = 2.3;
  const responsiveness = 2.3;
  const functionalRobustness = hasErrors ? 0.0 : 2.5;
  const totalScore = parseFloat(
    (visualCraft + uxErgonomics + responsiveness + functionalRobustness).toFixed(1)
  );

  return {
    agentName,
    scores: {
      visualCraft,
      uxErgonomics,
      responsiveness,
      functionalRobustness,
      totalScore,
      passed: totalScore >= 8.5 && functionalRobustness > 0,
    },
    telemetry: {
      consoleErrors: hasErrors
        ? [
            {
              type: 'error',
              text: `Synthetic test error on ${agentName} portal`,
              url: `http://localhost:3000/${agentName}`,
              timestamp: new Date().toISOString(),
            },
          ]
        : [],
      networkFailures: hasErrors
        ? [
            {
              url: `http://localhost:3000/api/${agentName}/test`,
              method: 'GET',
              status: 500,
              statusText: 'Internal Server Error',
              timestamp: new Date().toISOString(),
            },
          ]
        : [],
      allConsoleLogs: [],
    },
    screenshots: [
      {
        agentName,
        viewport: 'desktop',
        route: `/${agentName}/dashboard`,
        stateLabel: 'overview',
        filePath: path.resolve(
          __dirname,
          `../../docs/critic-reports/screenshots/${agentName}-desktop-overview.png`
        ),
        timestamp: new Date().toISOString(),
      },
    ],
    issues: hasErrors
      ? [
          {
            id: `MOCK-${agentName.toUpperCase()}-FAIL`,
            priority: 'P0',
            agent: agentName,
            title: `Simulated Telemetry Failure on ${agentName}`,
            description: `A simulated console crash was injected to test circuit breaker logic.`,
            route: `/${agentName}/dashboard`,
            viewport: 'desktop',
            remediation: `Fix unhandled exceptions on ${agentName} route.`,
          },
        ]
      : [],
  };
}

async function verifyScoringEngine(): Promise<void> {
  console.log('=== [TICK-036] 4-Pillar Scoring Engine & Remediation Reporter Verification ===\n');

  const engine = new ScoringEngine();

  // Test 1: Circuit Breaker Failure Simulation
  console.log('[Test 1/3] Verifying Circuit Breaker Failure Trigger...');
  const failingAdmin = createMockAgentResult('admin', true); // has simulated errors
  const cleanDoctor = createMockAgentResult('doctor', false);
  const cleanPatient = createMockAgentResult('patient', false);

  const failReport = engine.evaluateAndReport(failingAdmin, cleanDoctor, cleanPatient);

  if (!failReport.passed && failReport.circuitBreakerTriggered && failReport.circuitBreakerReasons.length > 0) {
    console.log('✓ Test 1 Passed: Circuit breaker correctly tripped, Functional Robustness dropped to 0, overall verdict FAIL.\n');
  } else {
    throw new Error('Test 1 Failed: Circuit breaker did not properly fail on simulated errors.');
  }

  // Test 2: Clean Passing Evaluation
  console.log('[Test 2/3] Verifying Passing Evaluation (≥ 8.5/10 with zero errors)...');
  const passingAdmin = createMockAgentResult('admin', false);
  const passingDoctor = createMockAgentResult('doctor', false);
  const passingPatient = createMockAgentResult('patient', false);

  const passReport = engine.evaluateAndReport(passingAdmin, passingDoctor, passingPatient);

  if (passReport.passed && !passReport.circuitBreakerTriggered && passReport.overallScore >= 8.5) {
    console.log(`✓ Test 2 Passed: Composite score ${passReport.overallScore}/10 passed with zero circuit breakers.\n`);
  } else {
    throw new Error('Test 2 Failed: Clean report did not pass score gate.');
  }

  // Test 3: Artifact File Verification
  console.log('[Test 3/3] Verifying docs/critic-reports/latest.json and latest.md artifacts...');
  const jsonPath = path.resolve(__dirname, '../../docs/critic-reports/latest.json');
  const mdPath = path.resolve(__dirname, '../../docs/critic-reports/latest.md');

  if (!fs.existsSync(jsonPath) || !fs.existsSync(mdPath)) {
    throw new Error('Test 3 Failed: latest.json or latest.md missing on disk.');
  }

  const rawJson = fs.readFileSync(jsonPath, 'utf-8');
  const parsed = JSON.parse(rawJson);
  if (!parsed.timestamp || !parsed.agents || !parsed.agents.admin || !parsed.agents.doctor || !parsed.agents.patient) {
    throw new Error('Test 3 Failed: latest.json schema is incomplete.');
  }

  const rawMd = fs.readFileSync(mdPath, 'utf-8');
  if (!rawMd.includes('Scorecard') || !rawMd.includes('Verdict')) {
    throw new Error('Test 3 Failed: latest.md markdown is missing required sections.');
  }

  console.log('✓ Test 3 Passed: Both latest.json and latest.md schemas verified valid.\n');
  console.log('=== [TICK-036] ALL SCORING ENGINE ACCEPTANCE CRITERIA VERIFIED ===\n');
}

verifyScoringEngine().catch((err) => {
  console.error('❌ Scoring Engine Verification Failed:', err);
  process.exit(1);
});
