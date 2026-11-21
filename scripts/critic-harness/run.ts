import { CriticHarness } from './harness';
import { AdminCriticAgent } from './agents/admin-critic';
import { DoctorCriticAgent } from './agents/doctor-critic';
import { PatientCriticAgent } from './agents/patient-critic';
import { ScoringEngine } from './scoring-engine';
import { resetAndSeedCriticDatabase } from '../../backend/src/app/utils/seed-critic';

export async function runFullCriticSuite(): Promise<boolean> {
  console.log('\n======================================================');
  console.log('   STARTING MEDIX POST-BUILD MULTI-AGENT CRITIC SUITE  ');
  console.log('======================================================\n');

  // Step 1: Ensure Deterministic Database State & Clean Accounts
  console.log('[Step 1/3] Executing deterministic critic test seeder...');
  await resetAndSeedCriticDatabase();

  // Step 2: Initialize Harness & Run All 3 Critic Agents
  console.log('\n[Step 2/3] Launching Critic Agents across Desktop & Mobile...');
  const harness = new CriticHarness();
  await harness.init();

  try {
    const adminAgent = new AdminCriticAgent(harness);
    const doctorAgent = new DoctorCriticAgent(harness);
    const patientAgent = new PatientCriticAgent(harness);

    console.log('\n>>> Running [1/3] Admin Critic Agent...');
    const adminResult = await adminAgent.run();

    console.log('\n>>> Running [2/3] Doctor Critic Agent...');
    const doctorResult = await doctorAgent.run();

    console.log('\n>>> Running [3/3] Patient Critic Agent...');
    const patientResult = await patientAgent.run();

    // Step 3: Compute 4-Pillar Scores and Generate Reports
    console.log('\n[Step 3/3] Evaluating 4-Pillar Scores & Writing Reports...');
    const engine = new ScoringEngine();
    const report = engine.evaluateAndReport(adminResult, doctorResult, patientResult);

    return report.passed;
  } finally {
    await harness.close();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runFullCriticSuite()
    .then((passed) => {
      process.exit(passed ? 0 : 1);
    })
    .catch((err) => {
      console.error('Fatal Critic Suite Error:', err);
      process.exit(1);
    });
}
