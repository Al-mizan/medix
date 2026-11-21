import { spawnSync } from 'node:child_process';
import * as path from 'node:path';

export function runCriticSeeder(): void {
  const rootDir = process.cwd();
  const backendDir = path.resolve(rootDir, 'backend');

  console.log('Running Critic Seeder via backend workspace...');
  const result = spawnSync('pnpm', ['exec', 'tsx', 'src/app/utils/seed-critic.ts'], {
    cwd: backendDir,
    stdio: 'inherit',
    env: process.env,
  });

  if (result.status !== 0) {
    throw new Error(`Critic Seeder exited with code ${result.status}`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    runCriticSeeder();
  } catch (err: any) {
    console.error(err.message);
    process.exit(1);
  }
}
