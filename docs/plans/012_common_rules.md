# 0-2. 규약 문서

- 요구사항: [010 공통 인프라](../requirements/010_common_infra.md) — C3
- 상태: 대기 (6종 중 1종 작성됨)

## 목표

`docs/rules/` 의 "(예정)" 을 0개로 만든다. 규약은 **작업 중에 참조되는 문서**라, 없으면 매번
과거 커밋을 뒤져 근거를 재발굴하게 된다.

## 현재 상태

| 문서                                   | 상태                                  |
| -------------------------------------- | ------------------------------------- |
| `01_PACKAGE_BOUNDARIES.md`             | ⬜ 예정                               |
| `02_MONOREPO_STRUCTURE.md`             | ✅ 작성됨 (2026-08-19)                |
| `03_PUBLISHING_AND_VERSIONING.md`      | ✅ 작성됨 (2026-08-19)                |
| `04_TX_UI_CONVENTIONS.md`              | ⬜ 예정                               |
| `05_TAILWIND_V4_CONSUMER_SETUP.md`     | ⬜ 예정                               |
| `06_STORYBOOK_SETUP.md`                | ✅ 작성됨 (2026-08-19)                |
| `19_FRONTEND_ROLE_SEPARATION_GUIDE.md` | ⬜ 예정 — black-message 원본에서 이식 |

## job

| ID       | job                                      | 담당 | 완료 기준                                                                     |
| -------- | ---------------------------------------- | ---- | ----------------------------------------------------------------------------- |
| C2-01    | `01_PACKAGE_BOUNDARIES` 작성             | 🤖   | 의존 방향(`ui → hooks`)·배럴 import 금지·전역 의존 금지의 근거가 있다         |
| C2-02    | `02_MONOREPO_STRUCTURE` 작성             | 🤖   | 패키지/앱 추가 절차와 `apps/*` 가 비배포인 이유가 있다                        |
| C2-03    | `04_TX_UI_CONVENTIONS` 작성              | 🤖   | `theme`/`themeMerge`/`cm`/`data-tag`/props 이름 규칙이 있다                   |
| C2-04    | `05_TAILWIND_V4_CONSUMER_SETUP` 작성     | 🤖   | `@source` 실측 수치(40,800 → 4,559 bytes)가 근거로 들어간다                   |
| ✅ C2-05 | `06_STORYBOOK_SETUP` 작성                | 🤝   | **구성의 각 조각이 왜 필요한지** 설명한다. 복붙 레시피가 아니라 계약을 적는다 |
| C2-06    | 검증 픽스처 작성 원칙 추가 (`001-2` I5)  | 🤖   | "소비자 픽스처는 일부러 순진하게 쓴다" 가 규약으로 남는다                     |
| C2-07    | `19_FRONTEND_ROLE_SEPARATION_GUIDE` 이식 | 🤖   | black-message 원본에서 가져와 도메인 제거 후 이식                             |
| C2-08    | `docs/rules/README.md` 인덱스 갱신       | 🤖   | "(예정)" 0개                                                                  |

## 검증

각 문서 상단에 **"언제 확인하나"** 한 줄이 있는지 본다. 그게 없으면 아무도 안 읽는다.

## 비고

`C2-05` 를 먼저 하는 것이 낫다 — 트랙 1-2 에서 사용자가 Storybook 을 직접 작성할 때 참조할 문서다.
