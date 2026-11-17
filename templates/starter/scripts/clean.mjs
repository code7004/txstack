// pnpm clean — 설치 · 빌드로 만든 것을 지운다. 운영체제와 상관없이 돈다
// pnpm store prune 은 하지 않는다 — PC 전체의 저장소를 지운다
import { readdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const made = ["node_modules", "dist", "coverage"];
const dirs = [
  ".",
  ...["apps", "packages"].flatMap((group) =>
    readdirSync(group, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => join(group, entry.name))
  )
];

for (const dir of dirs) for (const name of made) rmSync(join(dir, name), { recursive: true, force: true });
console.log(`지웠다: ${dirs.length}곳의 ${made.join(" · ")}`);
