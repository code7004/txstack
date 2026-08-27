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

이식할 원본은 **이 저장소의 `legacy` 브랜치**에 53개 커밋과 함께 들어 있다.
압축 파일을 옮길 필요가 없다.

```sh
git worktree add ../txstack_temp legacy
```

`../txstack_temp` 에 옛 작업 트리가 통째로 생기고 `git log` 도 그대로 동작한다.
**읽기만 한다 — 거기에 커밋하지 않는다.**

이식이 다 끝나면 정리한다.

```sh
git worktree remove ../txstack_temp
git push origin --delete legacy        # 더 볼 일이 없을 때
```

## 4. 확인

```sh
pnpm check           # lint + typecheck + test
pnpm build           # dist 와 dist/styles.css
pnpm storybook:dev   # http://localhost:6310
```

셋 다 통과하면 옮기기 끝이다.

## 알아둘 차이

- **macOS 는 기본 파일시스템이 대소문자를 구분하지 않는다.** `TxForm/txForm.tsx` 같은
  케이스 오타가 맥에서는 조용히 넘어가고 Linux CI 에서만 터진다. 파일명을 바꿀 때 주의한다.
- 줄바꿈은 `.gitattributes` 가 LF 로 고정한다. 따로 설정할 것이 없다.
- Storybook 실행 설정은 `.claude/launch.json` 에 들어 있어 그대로 따라온다.
