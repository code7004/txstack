# 900 · 새 PC 에서 세팅하기

작업 PC 를 옮길 때 밟는 절차. **git 에 다 들어 있어서 옮길 파일이 따로 없다.**

## 1. 도구

|      | 버전      | 왜                                                        |
| ---- | --------- | --------------------------------------------------------- |
| Node | `24.14.0` | `.nvmrc` · `package.json` 의 `engines` 에 고정            |
| pnpm | `10.x`    | `packageManager` 필드에 고정. **npm·yarn 을 쓰지 않는다** |

```sh
nvm use            # .nvmrc 를 읽는다. fnm 도 같다
corepack enable    # packageManager 필드를 보고 pnpm 10 을 알아서 받는다
```

`corepack` 은 Node 에 들어 있다. 따로 `npm i -g pnpm` 할 필요가 없고, 하면 오히려
버전이 갈린다.

## 2. 저장소

```sh
git clone https://github.com/code7004/txstack.git
cd txstack
pnpm install
```

## 3. 이전 구현 꺼내기

이식할 원본은 **원격의 `legacy` 브랜치**에 53개 커밋과 함께 들어 있다.
압축 파일을 옮길 필요가 없다.

```sh
git clone --branch legacy https://github.com/code7004/txstack.git ../txstack_temp
```

**워크트리로 붙이지 않는다.** 자기 `.git` 을 가진 독립 클론이어야 이 저장소의 도구가
그 폴더를 아예 보지 않는다. `../txstack_temp` 에 옛 작업 트리가 통째로 생기고
`git log` 도 그대로 동작한다. **읽기만 한다 — 거기에 커밋하지 않는다.**

이식이 다 끝나면 정리한다.

```sh
rm -rf ../txstack_temp
git push origin --delete legacy        # 더 볼 일이 없을 때
```

## 4. 확인

```sh
pnpm check           # lint + typecheck + test
pnpm build           # dist 와 dist/styles.css
pnpm storybook:dev   # http://localhost:6310
```

셋 다 통과하면 옮기기 끝이다.

## 외장 드라이브(exFAT)에 두면 느리다

`/Volumes/Workspace` 는 exFAT 이다. 대역폭은 문제가 없는데(순차 쓰기 826MB/s)
**작은 파일 다루기가 내장 디스크의 8.5배 느리다** — 200개 쓰고 읽고 지우기가 1.02s 대 0.12s 다.
JS 도구는 실행할 때마다 `node_modules` 의 파일 5만 개를 훑으므로 이 차이가 그대로 쌓인다.

더 큰 것은 **exFAT 이 하드링크를 지원하지 않는다**는 점이다. pnpm 은 전역 store 에서
하드링크를 걸어 `node_modules` 를 만드는데, 링크가 안 되니 **전부 복사한다.**
그래서 `node_modules` 가 14GB 다. 링크가 되면 수백 MB 로 끝난다.

| 재 본 것                  | 외장(exFAT) | 내장(APFS) |
| ------------------------- | ----------- | ---------- |
| 작은 파일 200개 쓰기·읽기 | 1.02s       | 0.12s      |
| 순차 쓰기                 | 826MB/s     | —          |
| 하드링크                  | **안 됨**   | 됨         |
| `node_modules`            | **14GB**    | 수백 MB    |

**작업 저장소는 내장 디스크에 두는 편이 낫다.** 외장은 보관용으로 쓰고,
읽기 전용인 `../txstack_temp` 만 외장에 둬도 된다 — 도구가 훑지 않는 폴더다.

## 알아둘 차이

- **macOS 는 확장속성을 못 싣는 볼륨(exFAT 등)에 `._파일명` 부산물을 만든다.** 소스 옆에
  그대로 생겨서 vitest 가 `._TxForm.test.tsx` 를 테스트로 집어 파싱 에러를 냈다.
  `.gitignore` · `.prettierignore` · `eslint.config.js` · `vitest.config.ts` 네 곳이 막고 있다.
- **macOS 는 기본 파일시스템이 대소문자를 구분하지 않는다.** `TxForm/txForm.tsx` 같은
  케이스 오타가 맥에서는 조용히 넘어가고 Linux CI 에서만 터진다. 파일명을 바꿀 때 주의한다.
- 줄바꿈은 `.gitattributes` 가 LF 로 고정한다. 따로 설정할 것이 없다.
- Storybook 실행 설정은 `.claude/launch.json` 에 들어 있어 그대로 따라온다.
