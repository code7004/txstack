import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import * as ui from "./index";

/**
 * **배럴이 무엇을 내보내는지가 이 패키지의 공개 API 다.** 그런데 배럴은 `export *` 가 늘어선
 * 파일이라 무엇을 실수해도 **컴파일이 통과하고 조용히 잘못된 것이 나간다.**
 *
 * 그래서 여기서는 컴포넌트 동작이 아니라 **경계 자체**를 검사한다.
 * 특정 컴포넌트의 계약은 각자의 테스트가 맡고, 여기에는 "공개 표면" 에 해당하는 것만 쌓는다.
 *
 * **`.test.ts` 다 → node 환경에서 돈다.** 부수 효과가 하나 더 있다 — 배럴을 import 하는 데
 * DOM 이 필요하지 않다는 것까지 이 파일이 지킨다. 모듈 최상단에서 `window` 를 만지는 코드가
 * 들어오면 여기서 먼저 깨진다.
 */

describe("@txstack/ui 배럴 — 공개 표면", () => {
  it("내보내는 이름 중 값이 undefined 인 것이 없다", () => {
    // `export *` 는 같은 이름이 두 모듈에서 오면 **에러 없이 undefined** 를 내놓는다.
    // 소비자에게는 "import 는 되는데 런타임에 undefined" 로 나타나 원인을 찾기 어렵다.
    const undefinedNames = Object.entries(ui)
      .filter(([, value]) => value === undefined)
      .map(([name]) => name);

    expect(undefinedNames).toEqual([]);
  });

  it("default export 를 두지 않는다", () => {
    // 배럴의 `export *` 는 default 를 실어 나르지 않는다. 컴포넌트가 default 로 나가면
    // 파일 경로로 직접 import 하던 습관이 패키지에서는 조용히 깨진다.
    expect(ui).not.toHaveProperty("default");
  });

  it("내부 전용 아이콘이 새어 나가지 않는다", () => {
    // 두 개짜리 아이콘 세트는 소비자에게 쓸모가 없고, 공개하면 이름과 모양이 공개 API 가 된다.
    // 닫는 건 major 지만 나중에 여는 건 minor 이므로 지금은 닫아 둔다 (TxIcons/index.tsx).
    for (const name of ["TxIconClose", "TxIconSearch", "TxIconCheck"]) {
      expect(ui, `내부 전용 아이콘이 공개 API 로 새어 나갔다: ${name}`).not.toHaveProperty(name);
    }
  });

  it("내부 부품이 새어 나가지 않는다", () => {
    // TxInputLike 는 aria-expanded 를 부모가 주입해야 정확하다. 열림 상태를 모르는 소비자가
    // 쓰면 접근성이 거짓이 된다. useInput·parseTxInputNumber 는 구현 세부다.
    //
    // *Shell 셋은 바탕 부품이다. 특히 TxPopup 은 **포커스를 옮기지 않아서**, 그대로 공개하면
    // 소비자가 포커스를 스스로 관리해야 하는 팝오버를 받는다. 요구가 생기면 그때 낸다.
    for (const name of ["TxInputLike", "useInput", "parseTxInputNumber", "useTxFormControl", "TxFormBase", "TxPopup", "TxMenuShell", "TxDropdownShell"]) {
      expect(ui, `내부 부품이 공개 API 로 새어 나갔다: ${name}`).not.toHaveProperty(name);
    }
  });

  /**
   * 서브패스로 가른 것이 루트로 새면 소비자가 `react-day-picker` 를 설치하지 않았을 때
   * 배럴을 import 하는 것만으로 깨진다. 분리가 살아 있는지 여기서 지킨다.
   */
  it("서브패스 전용 컴포넌트가 루트 배럴에 없다", () => {
    for (const name of ["TxDayPicker", "TxDayPickerRange", "TxAgGrid", "TxAgGridProvider", "TxFormDayPicker", "TxFormDayPickerRange"]) {
      expect(ui, `서브패스 컴포넌트가 루트 배럴로 새어 나갔다: ${name}`).not.toHaveProperty(name);
    }
  });

  /**
   * 쪽 번호는 그리드와 무관하다. 서브패스에 숨기면 카드 목록이나 손수 짠 표에서 쓰려는 소비자가
   * `ag-grid` 를 설치해야 한다.
   */
  it("TxPagination 은 루트 배럴에 있다 — ag-grid 와 무관하다", () => {
    expect(ui).toHaveProperty("TxPagination");
  });

  it("모든 공개 이름이 Tx 로 시작한다", () => {
    const offenders = Object.keys(ui).filter((name) => !name.startsWith("Tx"));
    expect(offenders).toEqual([]);
  });
});

/**
 * **컴포넌트는 자기 `className` 에 Tailwind 를 싣지 않는다.** 전부 `tx-*` 와 CSS 변수다.
 *
 * 그래서 `cm()` 이 `tailwind-merge` 를 뗄 수 있었다 — 정리할 충돌이 애초에 없다.
 * 여기서 한 곳이라도 유틸리티를 싣기 시작하면 그 판단이 무너지므로, 이 검사가 그 문을 지킨다.
 * (소비자가 `className` 으로 주는 Tailwind 는 자기 것이라 상관없다. 그것이 이기는 것은
 * `twMerge` 가 아니라 `@layer tx` 덕분이다.)
 */
describe("@txstack/ui — Tailwind 를 싣지 않는다", () => {
  const here = import.meta.dirname;

  /** 흔한 유틸리티의 머리. 이름이 이렇게 시작하면 Tailwind 것으로 본다. */
  const UTILITY = /^(?:flex|grid|block|inline|hidden|relative|absolute|fixed|sticky|[mp][trblxy]?-|w-|h-|min-|max-|size-|text-|font-|bg-|border|rounded|shadow|gap-|space-|items-|justify-|self-|order-|z-|opacity-|overflow-|cursor-|transition|duration-|ease-|animate-|ring|outline-|leading-|tracking-|truncate|sr-only)/;

  /** 주석 속 예제는 **소비자 쓰임**을 보여 주는 문서지 우리가 싣는 클래스가 아니다. */
  const strip = (text: string) => text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

  const sources = readdirSync(here, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.startsWith("Tx"))
    .flatMap((dir) =>
      readdirSync(join(here, dir.name))
        .filter((file) => file.endsWith(".tsx") && !file.endsWith(".stories.tsx") && !file.endsWith(".test.tsx"))
        .map((file) => [`${dir.name}/${file}`, strip(readFileSync(join(here, dir.name, file), "utf8"))] as const)
    );

  it("훑을 파일을 찾았다", () => {
    expect(sources.length).toBeGreaterThan(20);
  });

  it.each(sources)("%s", (_name, source) => {
    // `cm("tx-…", …)` 과 className="…" 의 **문자열 리터럴**만 본다
    const literals = [...source.matchAll(/(?:className=|cm\()\s*"([^"]*)"/g)].map((match) => match[1]);
    const utilities = literals.flatMap((literal) => literal.split(/\s+/)).filter((name) => UTILITY.test(name));

    expect(utilities).toEqual([]);
  });
});
