import type React from "react";

/**
 * 내부 DOM 헬퍼.
 *
 * 원본에서는 앱 쪽 `core/extensions.ts`(1000줄 이상)에 있던 함수들이다.
 * tx-ui 는 그중 두 개만 쓰므로, 파일 전체를 끌고 오는 대신 필요한 것만 옮겼다.
 * 공개 API 가 아니다 — 패키지 배럴에서 export 하지 않는다.
 */

let shortUIDCounter = 0;

/** 짧은 유사 고유 ID. DOM id/style id 구분용이며 암호학적 용도가 아니다. */
export function shortUID(): string {
  const time = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 6);
  shortUIDCounter = (shortUIDCounter + 1) % 10000; // 0~9999
  return time + rand + shortUIDCounter.toString(36);
}

/**
 * 지정된 CSS 선택자에 대응하는 스타일 규칙을 동적으로 생성하거나 업데이트한다.
 * 이미 동일한 selector 규칙이 존재하면 삭제 후 재삽입한다.
 *
 * @param styleId style 태그의 고유 ID
 * @param selector CSS 선택자 (예: ".my-class", "#app")
 * @param rules 스타일 객체 (React.CSSProperties 형식, camelCase 사용)
 */
export function createCSS(styleId: string, selector: string, rules: React.CSSProperties): void {
  let style = document.getElementById(styleId) as HTMLStyleElement | null;

  if (!style) {
    style = document.createElement("style");
    style.id = styleId;
    document.head.appendChild(style);
  }

  const sheet = style.sheet;
  if (!sheet) return;

  const cssRules = Object.entries(rules)
    .map(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
      return `${cssKey}: ${value};`;
    })
    .join(" ");

  // 기존 동일 selector 규칙 제거
  for (let i = 0; i < sheet.cssRules.length; i++) {
    if (sheet.cssRules[i].cssText.startsWith(selector)) {
      sheet.deleteRule(i);
      break;
    }
  }

  try {
    sheet.insertRule(`${selector} { ${cssRules} }`, sheet.cssRules.length);
  } catch {
    console.warn("[@txstack/ui] Unable to insert CSS rule.");
  }
}
