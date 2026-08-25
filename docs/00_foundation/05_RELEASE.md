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

## 3. breaking change 판정

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
- [ ] README 의 설치·설정 안내가 실제와 맞나 (특히 `@txstack/ui` 의 Tailwind `@source`)
- [ ] **Claude 가이드 파일이 `files` 에 포함되어 실제로 tarball 에 들어갔나** → [904](../904_claude_guide/README.md)
- [ ] changeset 이 모든 변경을 덮나
