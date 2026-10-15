import { useState, useSyncExternalStore, type CSSProperties } from "react";
import { TxButton, TxForm, TxSwitch, TxTag } from "@txstack/ui";
import { CodeBlock } from "../../components/CodeBlock";

/**
 * **토큰을 바꾸면 무엇이 바뀌는지 결과로 보인다.** 변수는 이 판(`div`)에만 얹으므로 사이트의 나머지는 그대로다.
 * 다크는 이 판에 `dark` 클래스를 붙인다 — 토큰의 다크 값이 `.dark` 아래에 정의돼 있어서 판 안에서만 바뀐다.
 *
 * **사이트 전체가 다크면 판만 라이트로 되돌릴 수 없다.** 라이트 값은 `:root` 에 있고 `html.dark` 가 그것을 덮어
 * 판까지 물려준다. 그때는 스위치를 켠 채로 잠그고 이유를 적는다.
 */

/** 사이트의 다크 모드(`<html class="dark">`)를 따라간다 */
function useSiteDark() {
  return useSyncExternalStore(
    (notify) => {
      const observer = new MutationObserver(notify);
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
      return () => observer.disconnect();
    },
    () => document.documentElement.classList.contains("dark")
  );
}

const COLORS = [
  { name: "민트", primary: "#2dd4bf", onAccent: "#04231f", strong: "#0f766e", strongDark: "#2dd4bf" },
  { name: "파랑", primary: "#2563eb", onAccent: "#ffffff", strong: "#1d4ed8", strongDark: "#60a5fa" },
  { name: "보라", primary: "#7c3aed", onAccent: "#ffffff", strong: "#6d28d9", strongDark: "#a78bfa" },
  { name: "주황", primary: "#f97316", onAccent: "#2a1003", strong: "#c2410c", strongDark: "#fb923c" }
];

const RADII = [
  { name: "각지게", value: "0.125rem" },
  { name: "기본", value: "0.375rem" },
  { name: "둥글게", value: "0.75rem" }
];

export function ThemeTry() {
  const [color, setColor] = useState(COLORS[1]!);
  const [radius, setRadius] = useState(RADII[1]!);
  const [panelDark, setPanelDark] = useState(false);
  const siteDark = useSiteDark();
  const dark = siteDark || panelDark;

  const strong = dark ? color.strongDark : color.strong;
  const tokens = {
    "--tx-color-primary": color.primary,
    "--tx-color-on-accent": color.onAccent,
    "--tx-color-primary-strong": strong,
    "--tx-radius": radius.value
  };

  return (
    <div className="grid items-start gap-4 lg:grid-cols-2">
      <div className="flex flex-col gap-3">
        <fieldset className="flex flex-wrap items-center gap-2">
          <legend className="mb-1 text-sm text-slate-600 dark:text-slate-300">강조색</legend>
          {COLORS.map((item) => (
            <TxButton key={item.name} label={item.name} variant={item === color ? "primary" : "secondary"} aria-pressed={item === color} onClick={() => setColor(item)} />
          ))}
        </fieldset>
        <fieldset className="flex flex-wrap items-center gap-2">
          <legend className="mb-1 text-sm text-slate-600 dark:text-slate-300">모서리</legend>
          {RADII.map((item) => (
            <TxButton key={item.name} label={item.name} variant={item === radius ? "primary" : "secondary"} aria-pressed={item === radius} onClick={() => setRadius(item)} />
          ))}
        </fieldset>
        <div className="flex flex-col gap-1">
          <TxSwitch label="이 판만 다크 모드" checked={dark} disabled={siteDark} onChangeBool={setPanelDark} />
          {siteDark && <span className="text-xs text-slate-500 dark:text-slate-400">사이트가 다크 모드라 이 판도 다크입니다. 오른쪽 위 ☀로 라이트로 바꾸면 판만 따로 바꿔 볼 수 있습니다.</span>}
        </div>

        {/* 바뀐 값만 보인다. 판 밖(사이트 전체)은 그대로다 */}
        <CodeBlock language="css" title="app.css">{`:root {
  --tx-color-primary: ${color.primary};
  --tx-color-on-accent: ${color.onAccent};
  --tx-color-primary-strong: ${color.strong};
  --tx-radius: ${radius.value};
}${
          dark
            ? `

.dark {
  --tx-color-primary-strong: ${color.strongDark};
}`
            : ""
        }`}</CodeBlock>
      </div>

      <div className={`flex flex-col gap-3 rounded-lg border p-5 ${panelDark ? "dark" : ""}`} style={{ ...(tokens as CSSProperties), borderColor: "var(--tx-color-border)", backgroundColor: "var(--tx-color-surface)", color: "var(--tx-color-text)" }}>
        <div className="flex flex-wrap items-center gap-2">
          <TxButton label="저장" />
          <TxButton label="취소" variant="secondary" />
          <TxTag variant="info" dot>
            진행 중
          </TxTag>
        </div>
        <TxForm noValidate onSubmit={() => undefined}>
          <TxForm.Input caption="이름" placeholder="홍길동" />
        </TxForm>
        <TxSwitch label="알림 받기" defaultChecked />
      </div>
    </div>
  );
}
