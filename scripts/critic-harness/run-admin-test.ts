import { CriticHarness } from './harness';
import { AdminCriticAgent } from './agents/admin-critic';

async function main() {
  const harness = new CriticHarness();
  await harness.init();

  try {
    const adminAgent = new AdminCriticAgent(harness);
    const result = await adminAgent.run();

    console.log('\n========================================');
    console.log('       ADMIN CRITIC AGENT RESULTS       ');
    console.log('========================================');
    console.log(`Score:           ${result.scores.totalScore} / 10`);
    console.log(`Passed (>= 8.5): ${result.scores.passed}`);
    console.log(`Visual Craft:    ${result.scores.visualCraft} / 2.5`);
    console.log(`UX Ergonomics:   ${result.scores.uxErgonomics} / 2.5`);
    console.log(`Responsiveness:  ${result.scores.responsiveness} / 2.5`);
    console.log(`Functionality:   ${result.scores.functionalRobustness} / 2.5`);
    console.log(`Screenshots:     ${result.screenshots.length} captured`);
    console.log(`Console Errors:  ${result.telemetry.consoleErrors.length}`);
    console.log(`Network Errors:  ${result.telemetry.networkFailures.length}`);
    console.log(`Issues Logged:   ${result.issues.length}`);
    console.log('========================================\n');

    if (result.issues.length > 0) {
      console.log('Ranked Issues:');
      result.issues.forEach((issue) => {
        console.log(`- [${issue.priority}] ${issue.title} on ${issue.route}`);
      });
    }
  } finally {
    await harness.close();
  }
}

main().catch(console.error).finally(() => process.exit(0));
