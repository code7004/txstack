# 04 도구와 검증

> **언제 확인하는가**: 명령을 실행할 때, 빌드·테스트 설정을 건드릴 때, job 을 끝내기 전.

## 1. 환경

| 항목       | 버전         |
| ---------- | ------------ |
| Node       | `24.14.0`    |
| pnpm       | `>=10.0.0`   |
| TypeScript | `^5.8`       |
| React      | `^19` (peer) |

**pnpm 만 사용한다.** npm/yarn lockfile 을 만들지 않는다.

## 2. 자주 쓰는 명령

```sh
pnpm i                    # 설치
pnpm check                # lint + typecheck + test  ← job 끝낼 때 기본
pnpm test                 # 회귀 테스트 (vitest)
pnpm test:watch           # 워치
pnpm lint                 # 린트 / pnpm lint:fix 로 자동수정
pnpm typecheck            # 전 패키지 타입 검사
pnpm build                # packages/* 전체 빌드 (tsup)
pnpm dev                  # playground 실행
pnpm storybook:dev        # 컴포넌트 카탈로그 실행
pnpm changeset            # 변경 기록 작성 (공개 API 변경 시 필수)
```

## 3. 변경 범위별 최소 검증

**변경 범위에 맞는 최소 검증을 반드시 실행한다. 실행하지 못한 검증은 이유를 남긴다.**

| 무엇을 바꿨나          | 최소 검증                                                     |
| ---------------------- | ------------------------------------------------------------- |
| 로직 · 유틸            | `pnpm test` + 해당 케이스 테스트 추가                         |
| 공개 API (export)      | `pnpm check` + `pnpm build` + changeset                       |
| 컴포넌트 겉모습        | `pnpm storybook:dev` 로 실제 렌더 확인                        |
| 화면 사용 흐름         | `pnpm dev` (playground) 로 확인                               |
| 빌드 설정 · exports 맵 | `pnpm build` 후 `dist/*.js` · `dist/*.d.ts` 생성 확인         |
| 배포 산출물 구성       | 해당 패키지에서 `npm pack --dry-run` 으로 포함 파일 목록 확인 |
| 타입만                 | `pnpm typecheck`                                              |

## 4. 테스트

- **vitest.** 설정은 루트 `vitest.config.ts` 가 소유한다.
- 패키지별로 실행 환경이 갈린다 — `network` 는 node, React 가 붙은 것은 jsdom.
- 테스트 방향의 정답은 `902_testing` 에서 정한다. **아직 미확정이다.**
- 현재 테스트는 패키지당 1파일 수준이다. 커버리지 목표·구조는 `902_testing/10_requirements.md` 에서 결정한다.

## 5. 빌드

- **tsup.** `dist/*.js` + `dist/*.d.ts` 를 만든다. ESM 만 낸다 (`"type": "module"`).
- 무거운 선택적 의존은 **subpath export** 로 분리한다 (`@txstack/ui/aggrid` 등).
  루트 배럴을 import 해도 그 의존이 로드되지 않아야 한다.

## 6. Tailwind v4 — 소비자에게 영향이 가는 제약

`@txstack/ui` 의 테마는 런타임 CSS 가 아니라 **Tailwind 클래스 문자열**이다. 여기서 제약이 생긴다.

> 소비 앱이 `@source "../node_modules/@txstack/ui/dist";` 를 지정하지 않으면
> **클래스가 purge 되어 스타일이 전부 사라진다.**

- 다크모드는 `dark:` variant (class 전략) 기준이다.
- 테마 관련 변경 시 이 제약이 깨지지 않는지 확인하고, README 안내 문구도 함께 갱신한다.
- **이 제약을 소비자에게 계속 요구할 것인가는 미결이다** → `001_ui/10_requirements.md` 에서 결정.
