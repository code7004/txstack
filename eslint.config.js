import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: ["**/node_modules/**", "**/dist/**", "**/build/**", "**/coverage/**", "**/.temp/**", "**/.changeset/**"]
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,

  {
    files: ["packages/**/*.{ts,tsx}", "apps/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true }
      },
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      react: reactPlugin,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "jsx-a11y": jsxA11y
    },
    settings: {
      react: { version: "detect" }
    },
    rules: {
      "no-redeclare": "off",
      "no-undef": "off",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/consistent-type-imports": ["error", { fixStyle: "separate-type-imports" }],
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/triple-slash-reference": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-unused-expressions": [
        "error",
        {
          allowShortCircuit: true,
          allowTernary: true,
          allowTaggedTemplates: true
        }
      ],
      "react/react-in-jsx-scope": "off",
      "react/jsx-key": "error",
      "react/prop-types": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error",
      "react-refresh/only-export-components": "off",
      "jsx-a11y/anchor-is-valid": "off",
      "jsx-a11y/alt-text": "off",
      "no-constant-condition": "off"
    }
  },

  {
    files: ["**/*.d.ts"],
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      // 선언 파일은 앰비언트 계약이라 escape-hatch(any) 사용을 허용한다. (예: type TAny = any)
      "@typescript-eslint/no-explicit-any": "off"
    }
  },

  {
    // 제네릭 재사용 UI/훅 라이브러리 계층. 제네릭 기본값(<TData = any>)과 ag-grid 등 서드파티 interop 때문에
    // any 가 관용적이며, unknown 으로 강제하면 제네릭 API가 소비처 전반에서 깨진다. 이 계층에 한해 허용한다.
    files: ["packages/ui/src/**/*.{ts,tsx}", "packages/hooks/src/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off"
    }
  },

  {
    files: ["**/*.config.{js,ts,mjs}", "**/tsup.config.ts", "**/vite.config.ts", "**/scripts/*.mjs"],
    languageOptions: {
      globals: { ...globals.node }
    }
  }
];
