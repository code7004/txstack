import { base, node, react } from "@txstack/dev-guide/eslint";

/**
 * 규칙은 `@txstack/dev-guide/eslint` 가 갖는다 — 이 저장소가 첫 소비자다.
 * 여기에는 txstack 에만 해당하는 것만 둔다.
 */
export default [
  // `._*` 는 macOS 가 확장속성을 못 싣는 볼륨(exFAT 등)에 만드는 부산물이다. 소스 옆에 그대로 생긴다
  ...base({ ignores: ["**/.changeset/**", "**/._*"] }),
  ...react({ files: ["packages/**/*.{ts,tsx}", "apps/**/*.{ts,tsx}"] }),
  // 패키지는 브라우저와 Node 양쪽에서 돈다 (axios · fns 는 Node 에서도 불린다)
  ...node({ files: ["packages/**/*.{ts,tsx}", "apps/**/*.{ts,tsx}", "**/vite.config.ts", "**/tsup.config.ts"] }),

  {
    // 제네릭 재사용 UI/훅 라이브러리 계층. 제네릭 기본값(<TData = any>)과 ag-grid 등 서드파티 interop 때문에
    // any 가 관용적이며, unknown 으로 강제하면 제네릭 API가 소비처 전반에서 깨진다. 이 계층에 한해 허용한다.
    files: ["packages/ui/src/**/*.{ts,tsx}", "packages/hooks/src/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off"
    }
  }
];
