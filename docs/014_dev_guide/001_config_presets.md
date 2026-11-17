# 014-1 · 설정 프리셋

> `@txstack/dev-guide` 2단계. **prettier · eslint · commitlint 설정을 서브패스로 내보낸다.**
> 지금은 프로젝트마다 같은 설정을 복사해 두고 조금씩 어긋나 있다. 규칙 문서(`rules/`)와 같은 패키지에서
> 설정도 함께 오게 해, "dev-guide 를 따른다" 가 문서뿐 아니라 도구에서도 성립하게 한다.

**2026-11-17 추천안대로 합의하고 구현했다** — 아래 "정한 것" · "구현하며 정한 것". 배포는 `0.2.0` 으로 한다.

## 1. 지금 — 다섯 곳의 설정 (2026-11-17 조사)

txstack 과 기존 프로젝트 넷을 비교했다. 프로젝트 이름은 적지 않는다.

### prettier

| 옵션            | 다섯 곳 중                                       |
| --------------- | ------------------------------------------------ |
| `printWidth`    | **다섯 곳 모두 250**                             |
| `semi`          | **다섯 곳 모두 true**                            |
| `singleQuote`   | 셋은 `false` · 둘은 `true`                       |
| `trailingComma` | 셋은 `"none"` · 둘은 `"all"` (위의 둘과 같은 곳) |

`.prettierignore` 는 다섯 곳 모두 `node_modules` · `dist` · `coverage` · `pnpm-lock.yaml` 을 갖고, 나머지는 저장소마다 다르다.

### eslint — 다섯 곳 모두 flat config, eslint 9

| 공통 (다섯 곳 모두)                                        | React 앱이 있는 넷 중                                                                     |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `@eslint/js` recommended · `typescript-eslint` recommended | `react` · `react-hooks` · `react-refresh` · `jsx-a11y` 플러그인 — **넷**                  |
| ignores: `node_modules` · `dist`                           | `exhaustive-deps` **error** — **넷**                                                      |
|                                                            | `no-unused-vars` 는 끄고 `@typescript-eslint/no-unused-vars` 로 — **넷** (`^_` 허용은 둘) |
|                                                            | `react-in-jsx-scope` · `prop-types` off — **넷**                                          |
|                                                            | `eslint-config-prettier` 를 얹는다 — **넷**                                               |
|                                                            | `rules-of-hooks` **error** — **셋** (하나는 빠져 있다)                                    |
|                                                            | `consistent-type-imports` **error** (`separate-type-imports`) — **셋**                    |

갈리는 것: `no-explicit-any`(warn 둘 · off 하나 · 손대지 않아 `typescript-eslint` 기본값 error 하나), `react-refresh/only-export-components`(off 셋 · warn 하나),
`jsx-a11y` 를 recommended 전체로 켜는가(하나) · 일부만 끄는가(셋), 타입 정보를 쓰는 규칙(하나, 서버 앱에만).

### commitlint · 훅

- commitlint 는 셋이 쓴다 — 모두 `@commitlint/config-conventional`. 하나는 제목 대소문자와 본문 · 푸터 줄 길이 제한을 끈다
  (한글 제목, 표 · 목록이 든 본문). [rules/commits.md](../../packages/dev-guide/rules/commits.md) 가 정한 것이 이쪽이다
- `lint-staged` 는 다섯 곳 모두 같은 모양 — 코드는 `eslint --fix` → `prettier --write`, 나머지는 `prettier --write`
- `pre-commit` 훅은 다섯 곳 모두 같은 스크립트(VS Code 에서 색을 끄는 분기까지)

## 2. 소비자가 쓰는 모습 — 예제

### prettier

```js
// prettier.config.js
export { default } from "@txstack/dev-guide/prettier";
```

### commitlint

```js
// commitlint.config.mjs
export { default } from "@txstack/dev-guide/commitlint";
```

### lint-staged

```js
// lint-staged.config.mjs   (package.json 의 "lint-staged" 필드 대신)
export { default } from "@txstack/dev-guide/lint-staged";
```

### eslint — 조각을 앱 경로에 얹는다

앱 폴더 이름(`apps/web` · `apps/frontend` · `apps/api`)은 프로젝트마다 다르다. 그래서 **경로를 받는 함수**로 낸다.

```js
// eslint.config.js
import { base, react, node } from "@txstack/dev-guide/eslint";

export default [
  ...base({ ignores: ["vendor/**"] }), // ignores · js · typescript-eslint · prettier · *.d.ts · 설정 파일
  ...react({ files: ["apps/web/**/*.{ts,tsx}", "apps/admin/**/*.{ts,tsx}"] }),
  ...node({ files: ["apps/api/**/*.ts", "scripts/**/*.mjs"] }),

  // 프로젝트 고유의 것은 그 아래에 — 예외는 이유와 함께 00_DEV_GUIDE_DIFF.md 에도 적는다
  { files: ["apps/api/**/*.ts"], rules: { "@typescript-eslint/consistent-type-imports": "off" } } // Nest DI
];
```

| 조각      | 담는 것                                                                                                                                                                                                                   |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `base()`  | ignores(`node_modules` · `dist` · `build` · `coverage` · `.temp` + 받은 것) · `@eslint/js` · `typescript-eslint` recommended · 공통 TS 규칙 · `*.d.ts` 완화 · `*.config.*` 에 Node 전역 · `eslint-config-prettier`(맨 끝) |
| `react()` | 브라우저 전역 · `react` · `react-hooks` · `react-refresh` · `jsx-a11y` · 위 표의 "넷이 같음" 규칙                                                                                                                         |
| `node()`  | Node 전역. 규칙은 `base` 그대로                                                                                                                                                                                           |

UI 부품을 고르는 규칙(`react/forbid-elements`)은 넣지 않는다 — [AI Guide 와의 경계](000_README.md) 대로 `@txstack/ui` 의 `ai/rules.md` 에 남는다.

### 설치

```sh
pnpm add -D @txstack/dev-guide prettier                       # prettier 만
pnpm add -D @commitlint/cli @commitlint/config-conventional   # commitlint 를 쓰면
pnpm add -D eslint @eslint/js typescript-eslint globals eslint-config-prettier \
  eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-react-refresh eslint-plugin-jsx-a11y   # eslint 를 쓰면
```

**도구와 플러그인은 소비자가 설치한다** — 선택 peer(`peerDependenciesMeta.optional`). 문서만 쓰는 프로젝트는 지금처럼
아무것도 더 받지 않는다. 기존 프로젝트는 이미 전부 설치돼 있다.

## 3. 패키지 구성

```text
packages/dev-guide/
  config/
    prettier.js       printWidth 250 · semi · (따옴표 · 끝 쉼표는 정할 것 1)
    commitlint.js     config-conventional + subject-case · body/footer 줄 길이 off
    lint-staged.js    코드 → eslint --fix · prettier --write / 나머지 → prettier --write
    eslint.js         base · react · node
  package.json        exports: "./prettier" · "./commitlint" · "./lint-staged" · "./eslint"
```

- **빌드 없이 손으로 쓴 ESM `.js`** — 설정 파일은 작고, 지금 패키지에 빌드 단계가 없다. 타입은 JSDoc 으로 단다
- `./eslint` 를 import 할 때만 eslint 플러그인을 불러온다. `./prettier` 는 아무것도 import 하지 않는다
- 규칙을 더하는 일이라 판은 **`0.2.0`** (README 「버전 정책」의 minor)

## 4. 검증

- `scripts/dev-guide.test.ts` 에 더한다 — 프리셋을 실제로 불러 eslint(`ESLint` API) · prettier(`format`)로 짧은 코드를 돌려
  기대한 규칙이 걸리는지 · 포맷이 맞는지
- `verify:packages dev-guide` 에 더한다 — 워크스페이스 밖에 설치하고 위 예제 네 파일을 그대로 써서 `eslint` · `prettier --check` · `commitlint` 가 도는지
- txstack 자신도 프리셋으로 바꾼다 — 가장 먼저 쓰는 소비자다. 바꾼 뒤 `pnpm check` 가 그대로 통과해야 한다

## 5. 정한 것 (2026-11-17 사용자 합의)

1. **prettier 따옴표 · 끝 쉼표 — 추천: 큰따옴표 · `"none"` (셋이 쓰는 쪽).** 다른 둘은 적용할 때 `pnpm format` 결과를 커밋 하나로 따로 담는다
2. **eslint 의 갈리는 규칙 — 추천은 txstack 이 지금 통과하는 값.** `no-explicit-any` warn, `react-refresh/only-export-components` off,
   `jsx-a11y` 는 recommended 를 켜되 `anchor-is-valid` · `alt-text` 만 끈다(지금의 셋보다 조금 엄격 — 적용할 때 경고가 늘 수 있다)
3. **타입 정보를 쓰는 규칙(`recommendedTypeChecked`)은 넣지 않는다.** 느리고 tsconfig 경로가 프로젝트마다 다르다. 필요한 곳이 자기 설정에서 켠다
4. **도구 · 플러그인은 선택 peer 로.** dependencies 로 넣으면 설치는 한 줄이 되지만, 문서만 쓰는 프로젝트도 eslint 플러그인을 받게 된다
5. **lint-staged 프리셋도 낸다.** 다섯 곳이 같은 모양이라 빼면 그것만 복사본으로 남는다. `pre-commit` · `commit-msg` 훅 스크립트는
   `.husky/` 파일이라 프리셋이 될 수 없다 — `rules/commits.md` 5장에 그대로 붙일 내용을 싣는다
6. **`.prettierignore` 는 프리셋으로 못 낸다**(prettier 가 패키지에서 읽지 않는다). `docs-structure` 처럼 템플릿(`templates/prettierignore`)으로 준다

## 6. 구현하며 정한 것

- **`jsx-a11y` recommended 는 그대로(오류) 켠다.** 처음 켜자 txstack 자신에서 오류 50건이 나와 잠시 경고로 낮췄고
  (그때 recommended 가 끈 규칙까지 켜지는 실수가 있었다), 50건을 하나씩 분류해 정리한 뒤 오류로 되돌렸다 (2026-11-17 사용자 결정).

  | 묶음                   | 건수 | 처리                                                                                                                                                            |
  | ---------------------- | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | 실제 결함              | 3    | `TxDayPicker` 트리거 `role="combobox"`(버튼 역할에서 `aria-invalid` 가 무시됐다) · `TxContextMenu` 왼쪽 클릭 모드를 키보드로 열기 + 키보드로 열면 가운데에 뜨기 |
  | 테스트 스텁            | 4    | 가짜 `<a>` 가 `children` 을 명시해 넘긴다                                                                                                                       |
  | 의도된 동작            | 27   | 그 줄에서 끄고 이유를 적었다 — 바깥이 키를 함께 듣는 구조 · `aria-activedescendant` · 바탕 클릭 닫기 · 사용자가 연 화면의 `autoFocus` · 스크롤 영역 포커스 등   |
  | 테스트 · 스토리 하네스 | 16   | txstack `eslint.config.js` 에서 `*.test.tsx` · `*.stories.tsx` 에 한해 상호작용 규칙 셋을 끈다                                                                  |

  분류표에서 결함으로 봤던 `TxCarousel` 의 스크롤 영역은 다시 보니 의도된 동작이었다 — 이름은 감싼 `section` 이 주고,
  스크롤 영역은 키보드로 닿아야 한다. `TxInputLike` 는 `aria-invalid` 를 빼는 대신 `role="combobox"` 를 줬다 —
  `TxForm` 이 오류 상태를 트리거에 싣는 계약(테스트)을 지키고 `TxDropdown` 과 같아진다

- txstack 은 lint 경고 0 · 오류 0 으로 시작한다
- **0.3.0 — monorepo 스타터를 지으며 더한 둘** (2026-11-17 사용자 결정)
  - **import 규칙 셋** — `import/no-duplicates` · `import/first` · `import/no-self-import` (오류). create-next-app 의 `eslint-config-next` 에
    든 플러그인 가운데 우리 프리셋에 없던 것이 `eslint-plugin-import` 하나였다. 파일 하나만 보는 셋만 켠다 —
    `no-cycle` 은 TypeScript 경로 해석기가 더 필요하고 큰 저장소에서 lint 가 느려져 프로젝트 몫으로 남겼다.
    `no-duplicates` 는 `import type` 줄을 따로 세므로 `consistent-type-imports`(separate) 와 부딪히지 않는다
  - **`node({ decorators: true })`** — `consistent-type-imports` 를 끈다. NestJS 는 생성자 인자의 타입을 런타임 메타데이터로 읽어
    주입하므로 `import type` 으로 바꾸면 주입이 깨진다. 기존 프로젝트도 같은 예외를 각자 두고 있었다
- txstack 자신이 첫 소비자다 — `prettier.config.js` · `lint-staged.config.mjs` 는 한 줄, `eslint.config.js` 는 txstack 고유의 예외 하나.
  루트에 `@txstack/dev-guide: workspace:*`. 포맷 결과는 그대로다
- 패키지에 `"type": "module"` 을 더했다 — `config/*.js` 가 ESM 이다
- 검증: `scripts/dev-guide.test.ts`(프리셋으로 실제 prettier · eslint 실행), `verify:packages dev-guide`(README 의 설정 예제를 그대로 파일로 써서
  eslint · prettier · commitlint 실행, lint-staged 설정 로드)
