// React · DOM 없이 Node 에서 돈다. browser/ 밖의 진입점은 document 를 건드리면 안 된다
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import * as arr from "@txstack/fns/arr";
import { sleep, withLoading } from "@txstack/fns/async";
import * as date from "@txstack/fns/date";
import * as form from "@txstack/fns/form";
import * as math from "@txstack/fns/math";
import * as num from "@txstack/fns/num";
import * as obj from "@txstack/fns/obj";
import * as phone from "@txstack/fns/phone-kr";
import * as rand from "@txstack/fns/rand";
import * as str from "@txstack/fns/str";

assert.equal(existsSync("node_modules/react"), false, "react 가 설치되어 있으면 안 된다");
assert.equal(typeof document, "undefined");

assert.equal(num.format(1234.5678, { locale: "ko-KR" }), "1,234.568");
assert.equal(num.bytes(2 ** 50), "1 PB");
assert.equal(date.isoWeek("20251231")?.key, "2026-W01");
assert.equal(date.lastDays(1)[0].getHours(), 0);
assert.equal(phone.mask("010-1234-5678"), "010****5678");
assert.deepEqual(await phone.dedupe(["a", "a"]), { uniques: ["a"], duplicates: ["a"] });
assert.deepEqual(form.check({ name: "" }), { name: "name is empty" });
assert.deepEqual(obj.diff({ a: 1 }, { a: 2 }), { a: 2 });
assert.deepEqual(arr.sortByOrder([{ p: "b" }, { p: "a" }], ["a"], "p")[0], { p: "a" });
assert.equal(str.paletteColor(3), "#3B82F6");
assert.equal(math.lerp(0, 10, 0.5), 5);
assert.ok(rand.int(0, 10) < 10);
await sleep(1);
assert.equal(await withLoading(async () => 1)(), 1);

// browser/ 진입점은 불러오기만 해서는 document 를 건드리지 않는다
await import("@txstack/fns/browser/cookie");
await import("@txstack/fns/browser/css");
await import("@txstack/fns/browser/file");

console.log("node-fns: ok");
