# 900 · 새 PC 에서 세팅하기

작업 PC 를 옮길 때 밟는 절차. **이 저장소는 git 에 다 들어 있어서 옮길 파일이 없다.**

두 대(Mac · Windows PC)를 오가며 쓰거나 소비자 프로젝트까지 붙일 거면
[5. 두 대에서 쓸 때](#5-두-대에서-쓸-때--윈도우-pc-쪽) 로 간다 — 거기는 옮길 것이 있다.

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
**이식이 끝났으므로 클론해 두지 않는다** — 별도 작업 트리를 두면 관리할 것만 늘고,
필요한 것은 파일 몇 개다.

```sh
git fetch origin legacy:refs/remotes/origin/legacy   # 한 번만
git show origin/legacy:packages/hooks/src/useSafePolling.ts
git ls-tree --name-only origin/legacy:packages/ui/src
git log --oneline origin/legacy | head              # 53개 커밋도 그대로 읽힌다
```

**`legacy` 는 읽기만 한다.** 커밋하지 않고, **지우지 않는다** — 이식 이전의 유일한 사본이다.

## 4. 확인

```sh
pnpm check           # lint + typecheck + test
pnpm build           # dist 와 dist/styles.css
pnpm storybook:dev   # http://localhost:6310
```

셋 다 통과하면 옮기기 끝이다.

## 5. 두 대에서 쓸 때 — 윈도우 PC 쪽

**Mac 과 Windows PC 를 오가며 개발한다.** 위 1~4는 txstack 한 저장소 이야기고,
적용 단계에 들어가면 **저장소 넷이 서로를 참조**하므로 배치와 순서가 생긴다.

### 0. Mac 에서 push 가 먼저다

윈도우 쪽에서 할 수 있는 것이 없다. 네 저장소 모두 올리고 시작한다 —
`black-message` 의 적용 브랜치는 `-u` 로 업스트림까지 잡아 준다.

### 1. 저장소를 형제로 둔다

```
<작업폴더>/txstack                이 저장소
<작업폴더>/black-message
<작업폴더>/usertics
<작업폴더>/chain-wallet-service
```

**이 배치가 규약이다.** 소비자가 txstack 을 `link:../../../txstack/packages/ui` 로
참조하므로, 형제가 아니면 설치가 깨진다. 폴더 이름과 깊이가 Mac 과 같아야 한다
(`~/work` 든 `C:\work` 든 상관없지만 **그 안의 구조는 같아야 한다**).

### 2. 줄바꿈을 다시 받는다

**`.gitattributes` 를 pull 한 것만으로는 디스크가 안 바뀐다.** 기존 워킹 트리는
CRLF 그대로이고, `git status` 가 파일 전체를 "수정됨" 으로 띄운다. 저장소마다 한 번씩:

```sh
git pull
git rm --cached -r .    # 인덱스를 비우고
git reset --hard        # 새 attributes 로 전부 다시 체크아웃한다 (LF)
```

**`reset --hard` 는 커밋 안 한 것을 지운다.** 윈도우 쪽에 작업 중인 것이 있으면
먼저 커밋하거나 stash 한다. 끝나면 `git status` 가 깨끗해야 한다.

`core.autocrlf` 는 따로 건드리지 않는다 — `.gitattributes` 의 `eol=lf` 가 이긴다.

### 3. txstack — 설치하면 훅이 걸린다

```sh
cd txstack && pnpm install
```

`prepare` 스크립트가 husky 를 걸어서, 커밋할 때 스테이징된 파일의 포맷이 자동으로
맞춰진다. **설치를 건너뛰면 훅이 없는 채로 커밋하게 된다.**

### 4. black-message — 링크로 붙어 있다

```sh
cd black-message
git checkout feat/txstack-adoption
pnpm install
```

`@txstack/*` 가 `link:` 로 걸려 있어 **1번의 배치가 맞아야 설치가 된다.** pnpm 은
Windows 에서 디렉터리를 junction 으로 링크하므로 관리자 권한이 필요 없다.

txstack 소스를 고칠 거면 **watch 를 띄워 둔다.** 안 띄우면 소비자가 옛 `dist` 를 본다.

```sh
cd txstack && pnpm build:watch
```

### 5. git 에 없는 설정은 따로 맞춘다

**이 문서 첫 줄의 "옮길 파일이 따로 없다" 는 txstack 에만 해당한다.** 소비자
프로젝트의 환경 파일은 `.gitignore` 대상이라 **머신마다 따로 있고, 따로 틀어진다.**

| 파일                                         | 무엇                         |
| -------------------------------------------- | ---------------------------- |
| `black-message/apps/backend/src/config/.env` | DB · 비밀값 · `CORS_ORIGINS` |
| `black-message/apps/frontend/.env.*`         | `VITE_*`                     |

**2026-09-03 에 `CORS_ORIGINS` 가 바뀌었다.** dev 서버 포트를 80 에서 5173 으로
옮겼기 때문이다(macOS 는 1024 미만 포트를 root 에게만 허용한다). 윈도우 쪽 `.env` 도
같이 고치지 않으면 화면은 뜨는데 API 가 전부 막힌다.

```
CORS_ORIGINS=http://localhost:5173,...
```

**주소도 `http://localhost:5173` 로 바뀌었다.** 윈도우에서는 80 도 되던 자리라
북마크와 습관이 남아 있을 수 있다.

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

**작업 저장소는 내장 디스크에 두는 편이 낫다.** 외장은 보관용으로 쓴다.

**2026-09-03 에 그렇게 옮겼다** — 작업 저장소는 이제 `~/work` 에 있고 외장은 쓰지 않는다.
같이 옮긴 세 소비자 프로젝트에서 **줄바꿈 문제**가 하나 드러났다. Windows 에서 체크아웃한
트리라 디스크가 CRLF 인데 커밋된 원본은 LF 여서, 옮기자마자 `git status` 가 파일 수백 개를
"수정됨" 으로 띄웠다(내용 변경은 0).

### 정리 절차 — 2026-09-03 에 세 저장소에서 실제로 통한 것

**`reset --hard` 를 쓰지 않는다.** 이 정리는 대개 적용 작업 도중에 필요해지므로 잃을 것이
있는 상태다. 파일마다 HEAD 와 바이트를 비교해 **줄바꿈만 다른 것만** 바꾼다.

```sh
# 1. 무엇이 순수 CRLF 차이인지 먼저 가른다. 진짜 변경이 섞여 있으면 거기서 멈춘다
git diff --name-only HEAD | while read -r f; do
  cmp -s <(git show "HEAD:$f") <(sed $'s/\r$//' "$f") || echo "진짜 변경: $f"
done

# 2. 순수 CRLF 인 것만 LF 로 되돌린다
git diff --name-only HEAD | while read -r f; do
  cmp -s <(git show "HEAD:$f") <(sed $'s/\r$//' "$f") && { sed $'s/\r$//' "$f" > "$f.tmp" && mv "$f.tmp" "$f"; }
done

# 3. 인덱스를 다시 만든다 — 아래 이유로 이게 없으면 status 가 안 풀린다
rm -f .git/index && git read-tree HEAD
```

**3번이 핵심이다.** 파일을 LF 로 바꿔도 `git status` 가 계속 "수정됨" 이라고 한다.
`git diff` 는 아무 차이도 못 찾는데 `git status` 만 그런다 — 인덱스 엔트리가 CRLF 시절
크기(`size`)를 캐시하고 있고 `dev`/`ino` 가 0으로 기록돼 있어서다. git 에는 **캐시된
크기가 0이 아니면서 디스크와 다르면 파일을 열어보지도 않고 변경된 것으로 치는** 최적화가
있다. `git update-index --refresh` 도 `git reset` 도 이 엔트리를 고치지 못한다 —
SHA 가 같은 엔트리의 stat 정보를 그대로 물려받기 때문이다. 인덱스를 지우고 다시 만들면
크기가 0이라 git 이 그 최적화를 건너뛰고 실제로 파일을 읽는다.

```sh
git ls-files --debug <파일>   # dev:0 ino:0 이고 size 가 실제와 다르면 이 증상이다
```

**`tr -d '\r'` 을 쓰지 않는다.** 줄 끝뿐 아니라 줄 안에 있는 CR 까지 지워서 내용을 바꾼다.
`sed $'s/\r$//'` 는 줄 끝만 지운다.

### 재발은 `.gitattributes` 가 막는다

`core.autocrlf` 는 **머신별 로컬 설정**이라 Windows PC 쪽은 그대로고, 다시 clone 하면
또 재발한다. 저장소에 넣어야 두 대에서 같은 결과가 나온다.

```
* text=auto eol=lf
*.sh text eol=lf        # 배포 스크립트는 LF 여야 Linux 에서 돈다
*.ico binary            # 줄바꿈 변환을 하면 깨지는 것들
*.png binary
```

**네 저장소 모두 넣었다** (txstack 은 원래 있었고, 소비자 셋은 2026-09-03 에 추가).
`.gitattributes` 를 넣은 뒤 파일을 지우고 `git checkout` 해서 **LF 로 나오는지** 확인한다 —
그게 재발 방지가 실제로 도는지 보는 방법이다.

## 알아둘 차이

- **macOS 는 확장속성을 못 싣는 볼륨(exFAT 등)에 `._파일명` 부산물을 만든다.** 소스 옆에
  그대로 생겨서 vitest 가 `._TxForm.test.tsx` 를 테스트로 집어 파싱 에러를 냈다.
  `.gitignore` · `.prettierignore` · `eslint.config.js` · `vitest.config.ts` 네 곳이 막고 있다.
- **macOS 는 기본 파일시스템이 대소문자를 구분하지 않는다.** `TxForm/txForm.tsx` 같은
  케이스 오타가 맥에서는 조용히 넘어가고 Linux CI 에서만 터진다. 파일명을 바꿀 때 주의한다.
- 줄바꿈은 `.gitattributes` 가 LF 로 고정한다 — **네 저장소 모두 들어 있다.** 없는 저장소를
  Windows 에서 체크아웃하면 위의 "줄바꿈 문제" 가 그대로 재현된다.
- Storybook 실행 설정은 `.claude/launch.json` 에 들어 있어 그대로 따라온다.
