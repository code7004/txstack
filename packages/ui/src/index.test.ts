import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import * as ui from "./index";

/**
 * `001-TxTheme-S3`. 명세는 `docs/001_ui/components/04_TxTheme.md`.
 *
 * **배럴이 무엇을 내보내는지가 이 패키지의 공개 API 다.** 그런데 배럴은 `export *` 30줄이 늘어선
 * 파일이라, 뭘 실수해도 **컴파일이 통과하고 조용히 잘못된 것이 나간다.** `TxTheme` 의 D1 이
 * 그랬다 — 같은 이름의 객체를 두 곳에서 정의해 두고, **공개된 쪽과 컴포넌트가 쓰는 쪽이 서로 달랐다.**
 *
 * 그래서 여기서는 컴포넌트 동작이 아니라 **경계 자체**를 검사한다.
 *
 * **`.test.ts` 다 → node 환경에서 돈다.** 부수 효과가 하나 더 있다 — 배럴을 import 하는 데
 * DOM 이 필요하지 않다는 것까지 이 파일이 지킨다. 모듈 최상단에서 `window` 를 만지는 코드가
 * 들어오면 여기서 먼저 깨진다.
 *
 * 이 파일은 특정 컴포넌트의 것이 아니다. **공개 표면 전체를 보는 자리이므로**
 * 컴포넌트별 계약이 아니라 "경계" 에 해당하는 것만 여기 쌓는다.
 */

const SRC = import.meta.dirname;

describe("@txstack/ui 배럴 — 공개 표면", () => {
  it("내보내는 이름 중 값이 undefined 인 것이 없다", () => {
    // `export *` 는 같은 이름이 두 모듈에서 오면 **에러 없이 undefined** 를 내놓는다.
    // 소비자에게는 "import 는 되는데 런타임에 undefined" 로 나타나 원인을 찾기 어렵다.
    //
    // **이 검사는 이름이 아예 없는 경우는 못 잡는다** — 없으면 목록에 안 뜨기 때문이다.
    // 그쪽은 아래 개별 계약 검사가 맡는다. 실제로 `TxContextMenuTheme` 이 빠진 것을 잡은 건
    // 여기가 아니라 `disabledItem` 검사였다.
    const undefinedNames = Object.entries(ui)
      .filter(([, value]) => value === undefined)
      .map(([name]) => name);

    expect(undefinedNames).toEqual([]);
  });

  it("내부 전용 Tailwind 클래스 상수를 내보내지 않는다 (TxTheme 폐기)", () => {
    // 이 값들은 Tailwind 클래스 문자열이다. 공개 API 로 두면 소비자가 받아서 할 수 있는 일이
    // Tailwind 를 쓰는 것뿐이라, R4("소비자 스타일 방식 무관")와 정면으로 어긋난다.
    for (const name of ["TxClassBase", "TxClassBorder", "TxClassBorderColor", "TxClassHover", "TxClassFocus", "TxClassTheme", "TxClassFieldWrapperBase"]) {
      expect(ui, `내부 상수가 공개 API 로 새어 나갔다: ${name}`).not.toHaveProperty(name);
    }
  });

  it("TxContextMenuTheme 은 컴포넌트가 실제로 쓰는 그 객체다 (D1)", () => {
    // 여태 나가던 스테일한 사본에는 `disabledItem` 이 없었다. 그런데 같은 이름의 **타입**
    // (`theme?: DeepPartial<typeof TxContextMenuTheme>`)은 있는 쪽을 가리켰다 — 값과 타입이 갈려 있었다.
    expect(ui.TxContextMenuTheme).toHaveProperty("disabledItem");
  });

  it("TxContextMenuTheme 을 정의하는 곳은 한 군데뿐이다 (D1 근본 원인)", () => {
    // 위 두 검사는 "지금 나가는 것이 맞다" 를 본다. 정작 D1 을 만든 것은 **같은 이름이 두 곳에
    // 있다는 사실** 자체였다. 하나로 줄었는지를 여기서 못박는다.
    const files = readdirSync(SRC, { recursive: true, encoding: "utf8" }).filter((f) => f.endsWith(".ts") || f.endsWith(".tsx"));
    const definers = files
      .filter((f) => /export\s+const\s+TxContextMenuTheme\b/.test(readFileSync(join(SRC, f), "utf8")))
      // readdirSync 는 플랫폼 구분자를 쓴다. 기대값을 한 형태로 적기 위해 맞춘다.
      .map((f) => f.replace(/\\/g, "/"));

    expect(definers).toEqual(["TxContextMenu/TxContextMenu.theme.ts"]);
  });
});
