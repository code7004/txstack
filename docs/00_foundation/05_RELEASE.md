# 05 버전과 배포

> **언제 확인하는가**: 공개 API 를 바꿀 때, 버전을 올릴 때, npm 에 올릴 때.

## 1. 대원칙

**배포는 최하위 우선순위다.** 되돌릴 수 없기 때문이다.
되돌릴 수 있는 동안(문서·설계·구현 단계) 최대한 다듬는다.

- **`npm publish` 는 사용자가 명시적으로 요청할 때만 한다.**
- 초기에는 `alpha` 태그로 배포한다.

## 2. changesets

**changesets** 로 패키지별 독립 버전을 매긴다. 모노레포지만 버전은 묶이지 않는다.

```sh
pnpm changeset          # 변경 기록 작성
pnpm release:version    # changeset -> 버전/CHANGELOG 반영
pnpm release:publish    # 빌드 후 npm 배포 (사용자 요청 시에만)
```

- **공개 API(export)를 바꿨으면 changeset 을 함께 작성한다.** job 을 끝내는 조건에 포함된다.
- scope 패키지이므로 `--access public` 이 필요하다 (`.changeset/config.json` 의 `access: public`).
- `apps/*` 는 `private: true` 이며 changesets `ignore` 대상이다.

## 2-1. 지금은 `0.x` 다 — **major 를 쓰지 않는다** (2026-08-26 결정)

**사용자가 배포를 결정하기 전까지 버전은 `0.x` 에 머문다.** 배포 시점은 **`tx-ui` 컴포넌트가
어느 정도 구축된 뒤에 사용자가 판단한다.** 그때까지는 npm 에 아무것도 올라가지 않는다.

| 무엇                    | `0.x` 에서      |
| ----------------------- | --------------- |
| export 제거 · 이름 변경 | **`minor`**     |
| 기본 동작 변경          | **`minor`**     |
| export 추가 · 옵션 추가 | `minor`         |
| 내부 수정 · 문서 · 타입 | `patch`         |
| **`major`**             | **쓰지 않는다** |

**이유는 하나다.** `major` 를 쓰면 `0.0.0` → `1.0.0` 이 되어 **배포도 안 한 패키지를 안정 버전으로
선언**하게 된다. semver 도 `0.x` 를 "공개 API 가 아직 굳지 않은 구간" 으로 규정한다.

> **이걸 안 적어 둬서 세 번 어긋났다.** `TxSpinner`·`TxButton`·`TxTheme` 이 전부 export 를 제거하면서
> §3 의 "제거는 major" 를 어기고 `minor` 를 썼다. **매번 옳은 판단을 했지만 규약은 계속 거짓이었다** —
> changeset 만 고치고 규약을 안 고친 것이 문제였다.

**`1.0.0` 을 언제 내는지는 여기서 정하지 않는다.** 사용자가 배포를 결정하는 자리에서 함께 정한다.
그 시점부터 §3 이 그대로 살아난다.

## 3. breaking change 판정 — **`1.0.0` 이후**

> **지금은 §2-1 이 이긴다.** 아래는 `1.0.0` 을 낸 뒤의 규칙이다.

다음은 **major** 다. 애매하면 major 로 본다.

- export 를 제거하거나 이름을 바꿨다
- props / 옵션을 필수로 만들었다
- peerDependencies 범위를 좁혔다
- 기본 동작이 바뀌었다 (같은 코드가 다른 결과를 낸다)
- subpath export 경로가 바뀌었다

다음은 **minor** — export 추가, 옵션 추가(기본값이 기존 동작과 같음).
다음은 **patch** — 내부 수정, 문서, 타입 정밀화(기존 사용 코드가 계속 통과함).

## 4. 배포 전 점검

- [ ] `pnpm check` 통과
- [ ] `pnpm build` 후 `dist/*.js` · `dist/*.d.ts` 존재
- [ ] `npm pack --dry-run` 으로 포함 파일 확인 — `src/` 나 테스트가 들어가지 않았나
- [ ] peerDependencies 가 맞나 — React 가 dependencies 에 섞이지 않았나
- [ ] README 의 설치·설정 안내가 실제와 맞나 (특히 `@txstack/ui` 의 `styles.css` import)
- [ ] `@txstack/ui` — `dist/styles.css` 가 tarball 에 실제로 들어갔나 (`npm pack --dry-run`)
- [ ] **Claude 가이드 파일이 `files` 에 포함되어 실제로 tarball 에 들어갔나** → [904](../904_claude_guide/README.md)
- [ ] changeset 이 모든 변경을 덮나
