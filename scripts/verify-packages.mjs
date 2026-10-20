#!/usr/bin/env node
/**
 * **배포 파일을 설치해 검증한다**(docs/008 B).
 *
 * 사이트와 Storybook 은 패키지 소스에 별칭을 걸어 쓰므로, npm 에 올라갈 파일(`.tgz`)이 실제로 쓰이는지는
 * 따로 확인해야 한다. 패키지를 모두 `pnpm pack` 으로 묶고, 저장소 밖 임시 폴더에 소비자 앱을 만들어 설치한 뒤
 * 타입 검사 · 빌드 · 실행을 돌린다.
 *
 *   pnpm build && pnpm verify:packages            # 전부
 *   pnpm verify:packages core-ui node-axios       # 골라서
 *
 * 소비자 앱은 scripts/verify-packages/ 에 있다. 외부 의존(react · vite 등)은 레지스트리에서 받는다.
 * UI 앱은 타입 검사와 빌드까지 본다(브라우저에서 띄우지는 않는다). node-axios · node-fns 는 Node 에서 실제로 실행한다.
 */
import { execSync } from "node:child_process";
import { cpSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const fixtures = join(root, "scripts", "verify-packages");

/** 소비자 앱. `react18` 은 core-ui 를 React 18 로 바꿔 지원 하한을 본다 */
const CASES = {
  "core-ui": {},
  "ui-subpaths": {},
  app: {},
  "node-axios": {},
  "node-fns": {},
  react18: { from: "core-ui", deps: { react: "^18.3.1", "react-dom": "^18.3.1" }, devDeps: { "@types/react": "^18.3.0", "@types/react-dom": "^18.3.0" } },
  // route-meta · hooks 의 peer 하한(react-router-dom >=6)
  router6: { from: "app", deps: { "react-router-dom": "^6.30.0" } }
};

const picked = process.argv.slice(2);
const names = picked.length ? picked : Object.keys(CASES);

const run = (command, cwd) => execSync(command, { cwd, stdio: "pipe", encoding: "utf8", env: { ...process.env, CI: "1" } });

const work = mkdtempSync(join(tmpdir(), "txstack-verify-"));
const pack = join(work, "pack");

console.log(`패키지를 묶는다 → ${pack}`);
run(`pnpm -r --filter "./packages/*" exec pnpm pack --pack-destination "${pack}"`, root);

const tarballs = Object.fromEntries(
  readdirSync(pack).map((file) => {
    const name = file.replace(/^txstack-/, "").replace(/-\d+\.\d+\.\d+.*\.tgz$/, "");
    return [`@txstack/${name}`, `file:${join(pack, file)}`];
  })
);

cpSync(join(fixtures, "tsconfig.base.json"), join(work, "tsconfig.base.json"));
cpSync(join(fixtures, "check-bundle.mjs"), join(work, "check-bundle.mjs"));

const results = [];

for (const name of names) {
  const spec = CASES[name];
  if (!spec) throw new Error(`없는 소비자 앱: ${name}`);

  const dir = join(work, name);
  cpSync(join(fixtures, spec.from ?? name), dir, { recursive: true });

  const pkgPath = join(dir, "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  for (const field of ["dependencies", "devDependencies"]) {
    for (const dep of Object.keys(pkg[field] ?? {})) if (pkg[field][dep] === "TXSTACK") pkg[field][dep] = tarballs[dep];
  }
  Object.assign((pkg.dependencies ??= {}), spec.deps);
  Object.assign((pkg.devDependencies ??= {}), spec.devDeps);
  pkg.name = `verify-${name}`;
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

  process.stdout.write(`- ${name} … `);
  try {
    run("pnpm install --prefer-offline --ignore-scripts", dir);
    const out = run("pnpm run --silent verify", dir).trim();
    const version = (dep) => {
      try {
        return JSON.parse(readFileSync(join(dir, "node_modules", dep, "package.json"), "utf8")).version;
      } catch {
        return "—";
      }
    };
    const react = `${version("react")}${spec.from === "app" || name === "app" ? ` · router ${version("react-router-dom")}` : ""}`;
    results.push({ name, ok: true, react, note: out.split("\n").at(-1) });
    console.log("ok");
  } catch (error) {
    results.push({
      name,
      ok: false,
      react: "?",
      note: String(error.stdout || error.message)
        .trim()
        .split("\n")
        .slice(-12)
        .join("\n")
    });
    console.log("FAIL");
  }
}

console.log("\n결과");
for (const result of results) console.log(`${result.ok ? "✓" : "✗"} ${result.name.padEnd(12)} react ${result.react.padEnd(8)} ${result.ok ? result.note : ""}`);

const failed = results.filter((result) => !result.ok);
for (const result of failed) console.log(`\n✗ ${result.name}\n${result.note}`);

if (failed.length) {
  console.log(`\n실패한 앱은 남겨 둔다: ${work}`);
  process.exit(1);
}
rmSync(work, { recursive: true, force: true });
