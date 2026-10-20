import { describe, expect, it } from "vitest";
import * as root from "./index";
import * as arr from "./arr";
import * as async from "./async";
import * as cookie from "./browser/cookie";
import * as css from "./browser/css";
import * as file from "./browser/file";
import * as date from "./date";
import * as form from "./form";
import * as math from "./math";
import * as num from "./num";
import * as obj from "./obj";
import * as phone from "./phone-kr";
import * as rand from "./rand";
import * as str from "./str";

/**
 * **루트는 그룹의 합이다.** 두 그룹이 같은 이름을 내보내면 `export *` 는 그 이름을 조용히 빼 버린다 —
 * 함수 이름을 패키지 안에서 겹치지 않게 지은 이유가 그것이다. 여기서 깨지면 이름이 겹친 것이다.
 */
const GROUPS = { arr, async, cookie, css, file, date, form, math, num, obj, phone, rand, str };

describe("@txstack/fns 루트", () => {
  it("그룹의 값 export 를 전부, 같은 것으로 내보낸다", () => {
    const names = Object.values(GROUPS).flatMap((group) => Object.keys(group));

    expect(new Set(names).size).toBe(names.length);
    expect(Object.keys(root).sort()).toEqual([...names].sort());
    for (const group of Object.values(GROUPS)) {
      for (const [name, value] of Object.entries(group)) expect(root[name as keyof typeof root]).toBe(value);
    }
  });

  it("불러오기만 해서는 DOM 을 건드리지 않는다 — 이 테스트는 node 에서 돈다", () => {
    expect(typeof document).toBe("undefined");
    expect(typeof root.getCookie).toBe("function");
  });
});
