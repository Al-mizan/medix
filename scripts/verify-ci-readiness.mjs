import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const errors = [];

// 1. Check CI-CD workflow triggers & concurrency
const cicdYamlPath = path.join(rootDir, '.github/workflows/cicd.yml');
if (fs.existsSync(cicdYamlPath)) {
  const content = fs.readFileSync(cicdYamlPath, 'utf8');
  const pushMatch = content.match(/push:\s*\n\s*branches:\s*\[([^\]]+)\]/);
  if (!pushMatch || !pushMatch[1].includes('"development"')) {
    errors.push('[FAIL] .github/workflows/cicd.yml does not trigger on push to "development" branch.');
  }
  if (content.includes('group: deploy-main')) {
    errors.push('[FAIL] .github/workflows/cicd.yml has hardcoded concurrency group "deploy-main" which collides across branches.');
  }
} else {
  errors.push('[FAIL] .github/workflows/cicd.yml missing');
}

// 2. Check Lighthouse workflow triggers
const lighthouseYamlPath = path.join(rootDir, '.github/workflows/lighthouse.yml');
if (fs.existsSync(lighthouseYamlPath)) {
  const content = fs.readFileSync(lighthouseYamlPath, 'utf8');
  const pushMatch = content.match(/push:\s*\n\s*branches:\s*\[([^\]]+)\]/);
  if (!pushMatch || !pushMatch[1].includes('"development"')) {
    errors.push('[FAIL] .github/workflows/lighthouse.yml does not trigger on push to "development" branch.');
  }
}

// 3. Check root package.json filter targets
const packageJsonPath = path.join(rootDir, 'package.json');
const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const brokenScripts = Object.entries(pkg.scripts || {}).filter(
  ([, script]) => script.includes('--filter backend ') || script.includes('--filter frontend ') || script.endsWith('--filter backend') || script.endsWith('--filter frontend')
);
if (brokenScripts.length > 0) {
  errors.push(
    `[FAIL] package.json scripts have invalid filters (must target "backend-ph-healthcare" or "frontend-ph-healthcare"): ${brokenScripts.map(([k]) => k).join(', ')}`
  );
}

// 4. Check backend container lockfile dependencies
const backendPkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'backend/package.json'), 'utf8'));
const backendLock = fs.readFileSync(path.join(rootDir, 'backend/pnpm-lock.yaml'), 'utf8');
const missingBackend = Object.keys({ ...backendPkg.dependencies, ...backendPkg.devDependencies }).filter(
  (dep) => !backendLock.includes(dep)
);
if (missingBackend.length > 0) {
  errors.push(`[FAIL] backend/pnpm-lock.yaml is missing dependencies from backend/package.json: ${missingBackend.join(', ')}`);
}

// Output results
if (errors.length > 0) {
  console.error('\n--- CI Readiness Verification: FAILED ---');
  for (const err of errors) {
    console.error(err);
  }
  console.error(`\nFound ${errors.length} root-cause issue(s) preventing CI from functioning properly.`);
  process.exit(1);
} else {
  console.log('\n--- CI Readiness Verification: PASSED ---');
  console.log('All workflow triggers, filter names, concurrency scopes, and container lockfiles are valid!');
  process.exit(0);
}
