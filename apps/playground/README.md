# @txstack/playground

4개 패키지를 **서로 물려서** 돌려보는 샘플 앱. npm 에 배포하지 않는다 (`private: true`, changesets `ignore`).

```sh
pnpm dev     # http://localhost:5310
```

## 왜 패키지별로 따로 전시하지 않았나

각 패키지를 독립적으로 나열하면 "빌드는 되는데 같이 쓰면 깨지는" 문제를 못 잡는다. 그래서 이 앱은 4개를 엮어서 쓴다.

| 패키지                | 이 앱에서의 역할                                           |
| --------------------- | ---------------------------------------------------------- |
| `@txstack/route-meta` | 좌측 메뉴와 라우터가 `menu.tsx` 트리 하나에서 파생된다     |
| `@txstack/hooks`      | hooks 화면의 상태가 `useUrlQuery` 로 URL 에 유지된다       |
| `@txstack/network`    | network 화면이 목 어댑터로 실제 요청/401/봉투해제를 태운다 |
| `@txstack/ui`         | 위 전부를 그린다                                           |

## 확인 포인트

- **서브패스 격리** — `AgGrid ↗` / `DayPicker ↗` 로 이동할 때만 ag-grid / react-day-picker 청크가 받아진다. 개발자도구 Network 탭에서 볼 수 있다.
- **route-meta 필터링** — `/route-meta` 화면의 "선언 N개 → 노출 M개" 차이. `enabled: false`, `meta.hidden`, `index: true` 가 빠진다.
- **network 옵션 주입** — `/network` 에서 토큰을 제거하고 호출하면 응답의 `authorization` 이 `null` 이 되고, 401 을 유발하면 `onUnauthorized` 로그가 쌓인다.
- **정렬 동치** — `/ui/data` 의 TxCoolTable 은 lodash `orderBy` 를 걷어낸 자리다. 값이 없는 행이 오름차순에서 맨 뒤, 내림차순에서 맨 앞으로 가야 한다.

## Vite alias 에 대해

`vite.config.ts` 는 `@txstack/*` 를 **패키지 소스로 alias** 한다. 없으면 `dist` 를 소비하게 되어 라이브러리를 한 줄 고칠 때마다 `pnpm build` + dev 서버 재시작이 필요하다 (tsup 이 청크 해시를 바꿔 Vite 모듈 그래프가 깨진다).

배포 계약은 그래도 검증된다 — `tsc` 는 이 alias 를 쓰지 않고 `package.json` 의 `exports` → `dist/*.d.ts` 로 해석하므로, 서브패스나 타입이 깨지면 `pnpm typecheck` 에서 잡힌다.

## ag-grid 사용 시 소비 앱이 해야 하는 것

`AgGridPage.tsx` 참고. 라이브러리가 대신 해주지 않는다.

```ts
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
ModuleRegistry.registerModules([AllCommunityModule]);
```

빠뜨리면 그리드가 빈 화면으로 뜨고 콘솔에 ag-grid error #272 가 찍힌다.
