# 9-2. 알파 배포

- 요구사항: [900 배포](../requirements/900_release.md) — P3 · P4
- 선행: 9-1 전체
- 상태: 대기

> ## ⚠ 되돌릴 수 없다
>
> `npm publish` 는 같은 버전 번호를 다시 쓸 수 없다. unpublish 는 72시간 제한이 있고
> 이미 설치한 쪽을 깨뜨린다. **사용자가 명시적으로 요청할 때만 실행한다.**

## job

| ID    | job                                        | 담당 | 완료 기준                                             |
| ----- | ------------------------------------------ | ---- | ----------------------------------------------------- |
| P2-01 | `changeset pre enter alpha`                | 🤖   | pre 모드에 진입하고 `.changeset/pre.json` 이 생긴다   |
| P2-02 | 초기 릴리스 changeset 작성                 | 🤖   | 4종이 `0.1.0-alpha.0` 으로 갈 내용이 담긴다           |
| P2-03 | `pnpm release:version` 실행 · 결과 검토    | 🤖   | 버전·CHANGELOG 변경분을 **커밋 전에** 눈으로 확인한다 |
| P2-04 | `npm login` · 권한 확인                    | 🧑   | `npm whoami` 와 scope 권한 확인                       |
| P2-05 | **`pnpm release:publish` 실행**            | 🧑   | 사용자가 직접 실행한다. 4종이 `alpha` 태그로 올라간다 |
| P2-06 | registry 에서 실제 게시 확인               | 🤖   | `npm view @txstack/ui` 로 버전·태그·파일 목록 확인    |
| P2-07 | 빈 프로젝트에 **npm registry 에서** 설치   | 🤖   | `file:` 이 아니라 실제 설치로 typecheck·build 통과    |
| P2-08 | ag-grid 미설치 상태에서 코어만 동작 확인   | 🤖   | optional peer 설계가 실제 배포본에서도 성립한다       |
| P2-09 | Tailwind `@source` 유무 대조 (실제 설치본) | 🤖   | README 경고가 배포본에서도 맞는지 확인                |
| P2-10 | `latest` 태그가 안 붙었는지 확인           | 🤖   | 알파가 기본 설치 대상이 되지 않는다                   |
| P2-11 | 리포트 작성                                | 🤖   | `docs/reports/902_*.md` 에 배포 결과 요약             |

## 검증

`P2-07`~`P2-10` 이 검증의 본체다. `file:` 설치(0-3)와 registry 설치는 **다르다** —
registry 메타데이터·태그·`publishConfig` 동작은 실제로 올려봐야 확인된다.

## 비고

- 문제가 발견되면 **unpublish 하지 말고** `0.1.0-alpha.1` 로 올린다. 알파 태그를 쓰는 이유가 이것이다.
- `latest` 승격은 별도 판단이다. 알파를 충분히 쓴 뒤에 결정한다.
