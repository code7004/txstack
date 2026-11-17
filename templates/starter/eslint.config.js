import { base, node, react } from "@txstack/dev-guide/eslint";

export default [
  ...base(),
  ...react({ files: ["apps/frontend/**/*.{ts,tsx}"] }),
  // NestJS 는 데코레이터 메타데이터로 주입한다 — decorators 가 consistent-type-imports 를 끈다
  ...node({ files: ["apps/backend/**/*.ts"], decorators: true }),
  {
    // UI 는 txstack 을 먼저 쓴다 — 대체 부품이 있는 원시 요소에 경고한다 (@txstack/ui 의 ai/rules.md 6장).
    // 예외는 그 줄에서 끄고 이유를 적는다: eslint-disable-next-line react/forbid-elements -- txstack-gap: …
    files: ["apps/frontend/src/**/*.tsx"],
    rules: {
      "react/forbid-elements": [
        "warn",
        {
          forbid: [
            { element: "button", message: "TxButton 을 쓴다 — 아이콘만 있으면 <TxButton icon aria-label>" },
            { element: "input", message: "TxInput · TxCheckBox · TxRadio · TxSlider · TxNumberInput · TxFileUpload 중 하나를 쓴다" },
            { element: "textarea", message: "TxTextarea 를 쓴다" },
            { element: "select", message: "TxDropdown · TxDropdownMulti 를 쓴다" },
            { element: "details", message: "TxCollapsible · TxAccordion 을 쓴다" },
            { element: "summary", message: "TxCollapsible 의 title 을 쓴다" },
            { element: "dialog", message: "TxModal · TxDialog 를 쓴다" },
            { element: "table", message: "TxAgGrid(@txstack/ui/aggrid) 를 쓴다" },
            { element: "hr", message: "TxDivider 를 쓴다" }
          ]
        }
      ]
    }
  }
];
