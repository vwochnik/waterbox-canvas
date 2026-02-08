import { readFileSync, mkdtempSync, existsSync, rmSync, cpSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function main() {
  const pkg = JSON.parse(readFileSync("package.json", "utf-8"));
  const repository = pkg.repository?.url;
  if (!repository) {
    throw new Error("Can't extract repository from package.json");
  }

  const date = (new Date()).toISOString();

  const tempDir = mkdtempSync(join(tmpdir(), "waterbox-canvas"));

  process.on('exit', () => {
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  console.info("Copying files to " + tempDir);
  cpSync("dist/public", tempDir, { recursive: true })

  console.info("Switching to " + tempDir);
  process.chdir(tempDir);

  await run("git init");
  await run("git checkout --orphan gh-pages");
  await run("git add .");
  await run(`git commit -m "Site built at ${date}"`);
  await run(`git remote add origin ${repository}`);
  await run("git push -fu origin gh-pages");
}

async function run(cmd: string) {
  console.info("Running: " + cmd);
  return execAsync(cmd);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
})
