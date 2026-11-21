import { CriticHarness } from './harness';
import { DoctorCriticAgent } from './agents/doctor-critic';
import { PatientCriticAgent } from './agents/patient-critic';

async function main() {
  console.log('\n======================================================');
  console.log('   STARTING TICK-035: DOCTOR & PATIENT CRITIC RUNNER  ');
  console.log('======================================================\n');

  const harness = new CriticHarness();
  await harness.init();

  try {
    const doctorAgent = new DoctorCriticAgent(harness);
    const patientAgent = new PatientCriticAgent(harness);

    console.log('\n>>> [1/2] Executing Doctor Critic Agent...');
    const doctorResult = await doctorAgent.run();

    console.log('\n========================================');
    console.log('       DOCTOR CRITIC AGENT RESULTS      ');
    console.log('========================================');
    console.log(`Score:           ${doctorResult.scores.totalScore} / 10`);
    console.log(`Passed (>= 8.5): ${doctorResult.scores.passed}`);
    console.log(`Visual Craft:    ${doctorResult.scores.visualCraft} / 2.5`);
    console.log(`UX Ergonomics:   ${doctorResult.scores.uxErgonomics} / 2.5`);
    console.log(`Responsiveness:  ${doctorResult.scores.responsiveness} / 2.5`);
    console.log(`Functionality:   ${doctorResult.scores.functionalRobustness} / 2.5`);
    console.log(`Screenshots:     ${doctorResult.screenshots.length} captured`);
    console.log(`Console Errors:  ${doctorResult.telemetry.consoleErrors.length}`);
    console.log(`Network Errors:  ${doctorResult.telemetry.networkFailures.length}`);
    console.log(`Issues Logged:   ${doctorResult.issues.length}`);
    console.log('========================================\n');

    console.log('\n>>> [2/2] Executing Patient Critic Agent...');
    const patientResult = await patientAgent.run();

    console.log('\n========================================');
    console.log('       PATIENT CRITIC AGENT RESULTS     ');
    console.log('========================================');
    console.log(`Score:           ${patientResult.scores.totalScore} / 10`);
    console.log(`Passed (>= 8.5): ${patientResult.scores.passed}`);
    console.log(`Visual Craft:    ${patientResult.scores.visualCraft} / 2.5`);
    console.log(`UX Ergonomics:   ${patientResult.scores.uxErgonomics} / 2.5`);
    console.log(`Responsiveness:  ${patientResult.scores.responsiveness} / 2.5`);
    console.log(`Functionality:   ${patientResult.scores.functionalRobustness} / 2.5`);
    console.log(`Screenshots:     ${patientResult.screenshots.length} captured`);
    console.log(`Console Errors:  ${patientResult.telemetry.consoleErrors.length}`);
    console.log(`Network Errors:  ${patientResult.telemetry.networkFailures.length}`);
    console.log(`Issues Logged:   ${patientResult.issues.length}`);
    console.log('========================================\n');

    const bothPassed = doctorResult.scores.passed && patientResult.scores.passed;
    console.log(`TICK-035 Final Status: ${bothPassed ? 'ALL PASSED (>= 8.5)' : 'FAILED'}`);
  } finally {
    await harness.close();
  }
}

main().catch(console.error).finally(() => process.exit(0));
