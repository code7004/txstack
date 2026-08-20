# Rules 인덱스

항상 유효한 규약 문서 모음. 기능·구조·배포를 바꾸기 전에 해당 문서를 먼저 확인한다.

| 문서                                                                 | 언제 확인하나                                                                    |
| -------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `01_PACKAGE_BOUNDARIES.md`                                           | 패키지 간 import 를 추가하거나 의존성을 늘릴 때 (예정)                           |
| [`02_MONOREPO_STRUCTURE.md`](02_MONOREPO_STRUCTURE.md)               | 패키지·앱을 추가하거나, 루트 스크립트를 만들거나, 워크스페이스 설정을 바꿀 때    |
| [`03_PUBLISHING_AND_VERSIONING.md`](03_PUBLISHING_AND_VERSIONING.md) | 공개 API 를 바꾸거나 npm 배포를 하거나, `package.json` 엔트리 필드를 손댈 때     |
| `04_TX_UI_CONVENTIONS.md`                                            | Tx\* 컴포넌트를 추가·수정할 때 (theme/themeMerge/cm/data-tag 패턴) (예정)        |
| `05_TAILWIND_V4_CONSUMER_SETUP.md`                                   | 테마 클래스나 빌드 산출물 구성을 바꿀 때 (예정)                                  |
| [`06_STORYBOOK_SETUP.md`](06_STORYBOOK_SETUP.md)                     | 스토리를 추가·수정하거나 Storybook 구성을 건드릴 때. 처음 스토리를 쓴다면 먼저   |
| `19_FRONTEND_ROLE_SEPARATION_GUIDE.md`                               | 프론트 역할 분리 원칙 — 이 라이브러리의 설계 근거 (black-message 에서 이식 예정) |

> 작성 순서는 [트랙 0-2](../plans/012_common_rules.md) 를 따른다. 아직 파일이 없는 항목은 `(예정)` 으로 표시한다.
