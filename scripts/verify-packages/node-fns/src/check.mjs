// React · DOM 없이 Node 에서 돈다. 루트에 browser 함수가 섞여 있어도 불러오기만으로는 document 를 건드리지 않는다
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import * as fns from "@txstack/fns";
import { formatNumber as fromGroup } from "@txstack/fns/num";
import { getCookie } from "@txstack/fns/browser/cookie";

assert.equal(existsSync("node_modules/react"), false, "react 가 설치되어 있으면 안 된다");
assert.equal(typeof document, "undefined");

// 루트와 그룹 진입점이 같은 함수를 준다
assert.equal(fns.formatNumber, fromGroup);
assert.equal(fns.getCookie, getCookie);

assert.equal(fns.formatNumber(1234.5678, { locale: "ko-KR" }), "1,234.568");
assert.equal(fns.formatBytes(2 ** 50), "1 PB");
assert.equal(fns.isoWeek("20251231")?.key, "2026-W01");
assert.equal(fns.lastDays(1)[0].getHours(), 0);
assert.equal(fns.maskPhone("010-1234-5678"), "010****5678");
assert.deepEqual(await fns.dedupePhones(["a", "a"]), { uniques: ["a"], duplicates: ["a"] });
assert.deepEqual(fns.checkForm({ name: "" }), { name: "name is empty" });
assert.deepEqual(fns.diffObject({ a: 1 }, { a: 2 }), { a: 2 });
assert.deepEqual(fns.sortByOrder([{ p: "b" }, { p: "a" }], ["a"], "p")[0], { p: "a" });
assert.equal(fns.paletteColor(3), "#3B82F6");
assert.equal(fns.lerp(0, 10, 0.5), 5);
assert.ok(fns.randomInt(0, 10) < 10);
await fns.sleep(1);
assert.equal(await fns.withLoading(async () => 1)(), 1);

console.log("node-fns: ok");
