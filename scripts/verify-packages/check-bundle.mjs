// 빌드 결과를 들여다본다. 루트만 쓴 소비자에 무거운 선택 의존이 끌려 들어오지 않았는지, 스타일이 실렸는지
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const kind = process.argv[2];
const assets = join("dist", "assets");
const read = (ext) =>
  readdirSync(assets)
    .filter((file) => file.endsWith(ext))
    .map((file) => readFileSync(join(assets, file), "utf8"))
    .join("\n");

const js = read(".js");
const css = read(".css");

assert.ok(css.includes(".tx-button"), "styles.css 가 번들에 실리지 않았다");

// ag-grid 와 react-day-picker 의 코드에 늘 들어 있는 글자. 이름이 압축돼도 남는다
const AG_GRID = "AG Grid";
const DAY_PICKER = "rdp-";

if (kind === "core-ui") {
  // 선택 peer 는 설치되지 않아야 한다 — 설치 없이도 타입 검사와 빌드가 됐다는 뜻이 된다
  assert.ok(!existsSync("node_modules/ag-grid-community"), "ag-grid 가 설치돼 있다 — 선택 peer 가 아니게 됐다");
  assert.ok(!existsSync("node_modules/react-day-picker"), "react-day-picker 가 설치돼 있다 — 선택 peer 가 아니게 됐다");
  assert.ok(!js.includes(AG_GRID), "루트만 썼는데 ag-grid 가 번들에 들어왔다");
  assert.ok(!js.includes(DAY_PICKER), "루트만 썼는데 react-day-picker 가 번들에 들어왔다");
}

if (kind === "ui-subpaths") {
  assert.ok(js.includes(AG_GRID), "aggrid 서브패스를 썼는데 ag-grid 가 없다");
}

console.log(`${kind}: bundle ok (js ${Math.round(js.length / 1024)}KB, css ${Math.round(css.length / 1024)}KB)`);
