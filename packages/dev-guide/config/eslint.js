/**
 * `@txstack/dev-guide/eslint` — eslint 9 flat config 조각.
 *
 *   // eslint.config.js
 *   import { base, react, node } from "@txstack/dev-guide/eslint";
 *
 *   export default [
 *     ...base({ ignores: ["vendor/**"] }),
 *     ...react({ files: ["apps/web/**\/*.{ts,tsx}"] }),
 *     ...node({ files: ["apps/api/**\/*.ts"] })
 *     // 프로젝트 고유의 것은 그 아래에
 *   ];
 *
 * 앱 폴더 이름은 프로젝트마다 다르므로 `react` · `node` 는 경로를 받는다.
 * 도구와 플러그인은 프로젝트가 설치한다(선택 peer) — 이 파일을 import 할 때만 불러온다.
 *
 * UI 부품을 고르는 규칙(`react/forbid-elements`)은 여기 없다. `@txstack/ui` 의 `ai/rules.md` 가 갖는다.
 */
import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import tseslint from "typescript-eslint";

/** @typedef {import("eslint").Linter.Config} Config */

/**
 * 모든 저장소의 바탕 — ignores · `@eslint/js` · `typescript-eslint` recommended · 공통 TS 규칙 ·
 * `*.d.ts` 완화 · 설정 파일 · 스크립트에 Node 전역 · 맨 끝에 `eslint-config-prettier`.
 *
 * @param {{ ignores?: string[] }} [options] 더 무시할 경로 (`vendor/**` 등)
 * @returns {Config[]}
 */
export function base({ ignores = [] } = {}) {
  return [
    { ignores: ["**/node_modules/**", "**/dist/**", "**/build/**", "**/coverage/**", "**/.temp/**", ...ignores] },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
      files: ["**/*.{ts,tsx,mts,cts}"],
      rules: {
        // 타입 검사가 맡는다 — 함수 오버로드 · 전역 타입을 eslint 가 잘못 잡는다
        "no-redeclare": "off",
        "no-undef": "off",
        "no-unused-vars": "off",
        // _ 접두사는 "일부러 안 쓴다" 는 표시다. `const { a: _a, ...rest } = x` 로 필드를 빼는 관용구도 허용한다
        "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_", ignoreRestSiblings: true }],
        "@typescript-eslint/no-explicit-any": "warn",
        "@typescript-eslint/consistent-type-imports": ["error", { fixStyle: "separate-type-imports" }],
        "@typescript-eslint/no-empty-object-type": "off",
        "@typescript-eslint/triple-slash-reference": "off",
        "@typescript-eslint/ban-ts-comment": "off",
        "@typescript-eslint/no-unused-expressions": ["error", { allowShortCircuit: true, allowTernary: true, allowTaggedTemplates: true }],
        "no-constant-condition": "off"
      }
    },
    {
      // 선언 파일은 앰비언트 계약이라 쓰지 않는 이름과 any 가 자연스럽다
      files: ["**/*.d.ts"],
      rules: { "@typescript-eslint/no-unused-vars": "off", "@typescript-eslint/no-explicit-any": "off" }
    },
    {
      files: ["**/*.config.{js,mjs,cjs,ts,mts,cts}", "**/scripts/**/*.{js,mjs,cjs,ts,mts}"],
      languageOptions: { globals: { ...globals.node } }
    },
    prettier
  ];
}

/**
 * React 화면 — 브라우저 전역 · `react` · `react-hooks` · `react-refresh` · `jsx-a11y`.
 *
 * @param {{ files: string[] }} options React 코드가 있는 경로 (`apps/web/**\/*.{ts,tsx}` 등)
 * @returns {Config[]}
 */
export function react({ files }) {
  return [
    {
      files,
      languageOptions: {
        parserOptions: { ecmaFeatures: { jsx: true } },
        globals: { ...globals.browser }
      },
      plugins: { react: reactPlugin, "react-hooks": reactHooks, "react-refresh": reactRefresh, "jsx-a11y": jsxA11y },
      settings: { react: { version: "detect" } },
      rules: {
        // 접근성 규칙은 recommended 그대로(오류). 의도된 예외는 그 줄에서 끄고 이유를 적는다
        ...jsxA11y.flatConfigs.recommended.rules,
        // 라우터 링크를 <a> 로 그리는 부품과 장식 이미지가 흔하다 — 이 둘만 끈다
        "jsx-a11y/anchor-is-valid": "off",
        "jsx-a11y/alt-text": "off",
        "react/react-in-jsx-scope": "off",
        "react/jsx-key": "error",
        "react/prop-types": "off",
        "react-hooks/rules-of-hooks": "error",
        "react-hooks/exhaustive-deps": "error",
        "react-refresh/only-export-components": "off"
      }
    }
  ];
}

/**
 * Node 코드 — 서버 · 워커 · 스크립트. 전역만 바꾸고 규칙은 `base` 그대로다.
 *
 * @param {{ files: string[] }} options Node 코드가 있는 경로 (`apps/api/**\/*.ts` 등)
 * @returns {Config[]}
 */
export function node({ files }) {
  return [{ files, languageOptions: { globals: { ...globals.node } } }];
}
