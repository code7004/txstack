# txstack demo

txstack 네 패키지로 만든 작은 운영 관리 앱입니다. 외부 서버 없이 가짜 API로 동작합니다.

| 화면                    | 하는 일                                                                  | 주로 쓴 것                                             |
| ----------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------ |
| 대시보드 `/dashboard`   | 운영 상태 요약. 카드 · 막대 · 경로를 누르면 조건이 걸린 오류 로그로 이동 | `TxCard` · `TxProgress` · TanStack Query               |
| 계정 `/accounts`        | 검색 · 필터 · 정렬 · 등록 · 수정 · 선택 삭제                             | `TxAgGrid` · `TxSlidePanel` · `TxForm` · `useUrlQuery` |
| 오류 로그 `/error-logs` | 조회 · 기간 필터 · 표 안 상태 변경 · 상세 모달 · 자동 새로고침           | `TxAgGrid` · `TxDayPickerRange` · `TxModal`            |

문서 사이트([Example](https://code7004.github.io/txstack/example))의 세 예제는 이 앱의 `src/features` 를 그대로 가져다 보여 줍니다. 코드는 이 폴더 하나에만 있습니다.

## 실행 — 이 저장소 안에서

```sh
pnpm install
pnpm build                          # 네 패키지를 빌드합니다. 이 앱은 빌드된 dist 를 씁니다
pnpm --filter @txstack/demo dev     # http://localhost:6420
```

## 실행 — 저장소 밖으로 가져가서

txstack 은 아직 npm 에 배포되지 않았습니다. 저장소에서 패키지 파일(`.tgz`)을 만들어 설치합니다.

```sh
# 1. txstack 을 받아 빌드하고 패키지 파일로 묶습니다
git clone https://github.com/code7004/txstack.git
cd txstack
pnpm install && pnpm build
pnpm -r --filter "./packages/*" exec pnpm pack --pack-destination "$PWD/.pack"

# 2. 이 폴더를 저장소 밖으로 복사합니다
cp -r apps/demo ../txstack-demo
cd ../txstack-demo
```

`package.json` 의 `workspace:*` 네 줄을 패키지 파일 경로로 바꿉니다.

```json
"@txstack/axios": "file:../txstack/.pack/txstack-axios-0.1.0.tgz",
"@txstack/hooks": "file:../txstack/.pack/txstack-hooks-0.1.0.tgz",
"@txstack/route-meta": "file:../txstack/.pack/txstack-route-meta-0.1.0.tgz",
"@txstack/ui": "file:../txstack/.pack/txstack-ui-0.1.0.tgz",
```

`tsconfig.json` 은 저장소의 공통 설정을 이어받습니다. 밖에서는 `"extends"` 줄을 지우고 아래처럼 직접 적습니다.

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "skipLibCheck": true,
    "noEmit": true,
    "types": ["vite/client"]
  },
  "include": ["src", "vite.config.ts"]
}
```

```sh
pnpm install
pnpm dev
```

`vite.config.ts` 의 `resolve.dedupe` 는 저장소 안에서만 필요합니다. 지워도 됩니다.

npm 에 배포된 뒤에는 `workspace:*` 를 배포 버전으로 바꾸면 됩니다.

## 구조

```
src/
├─ main.tsx          진입점 — QueryClientProvider · BrowserRouter · ag-grid 모듈 등록 · 가짜 서버 연결
├─ App.tsx           공통 레이아웃 — TxAppShell · 라우트 트리로 만든 메뉴 · 다크 모드 · 역할 전환
├─ routes.tsx        라우트 트리(@txstack/route-meta) — 라우터 · 메뉴 · 화면 제목이 여기서 나옵니다
├─ index.css         Tailwind 레이어 순서 · txstack 스타일 · 색 토큰
├─ lib/api.ts        HTTP 클라이언트 하나(@txstack/axios)
├─ mock/             가짜 서버 — server.ts 가 axios adapter, accounts.ts · logs.ts 가 데이터와 응답
└─ features/
   ├─ dashboard/     DashboardScreen
   ├─ accounts/      AccountsScreen · AccountForm · accountApi
   └─ error-logs/    ErrorLogsScreen · LogDetail · logApi
```

## 실제 서버로 바꾸기

1. `.env.example` 을 `.env` 로 복사하고 서버 주소를 적습니다. 주소가 있으면 `main.tsx` 가 가짜 서버를 끼우지 않습니다.

   ```sh
   VITE_API_URL=https://api.example.com
   ```

2. 서버의 응답 형식에 맞게 `src/lib/api.ts` 를 고칩니다.
   - 응답이 `{ body: ... }` 가 아니면 `unwrap`
   - 인증 토큰을 다른 곳에 두면 `getToken`, 401 을 받았을 때 할 일은 `onUnauthorized`
   - 오류 응답은 `parseApiError` 가 `{ statusCode, message }` 로 읽습니다. 형식이 다르면 화면의 `parseApiError(...).message` 자리를 맞춥니다

3. 주소와 요청 모양은 각 기능의 `*Api.ts` 에 있습니다. 서버의 엔드포인트에 맞게 고칩니다.
   - `features/accounts/accountApi.ts` — `GET /accounts` · `POST /accounts` · `PUT /accounts/:id` · `DELETE /accounts`(본문 `{ ids }`)
   - `features/error-logs/logApi.ts` — `GET /logs` · `GET /logs/:id` · `PATCH /logs/:id` · `DELETE /logs/:id` · `GET /logs/summary`

4. 다 옮겼으면 `src/mock/` 폴더와 `main.tsx` 의 가짜 서버 두 줄(`mockAdapter`)을 지웁니다.

## 알아 둘 것

- 가짜 데이터는 메모리에 있습니다. 새로고침하면 처음 상태로 돌아갑니다.
- 오류 로그의 날짜는 2026-10-14 를 "오늘"로 둔 고정 데이터입니다.
- 머리 줄의 역할 전환은 메뉴만 거릅니다(`getNavigableRoutes`). 주소로 직접 들어오는 것은 막지 않습니다 — 실제 앱에서는 서버가 거절해야 합니다.
