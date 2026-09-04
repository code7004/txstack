# 015 · TxAgGrid

> ag-grid 위에 **목록 화면에서 늘 하는 일**을 얹은 표.

|             |                                                                             |
| ----------- | --------------------------------------------------------------------------- |
| 진입점      | `@txstack/ui/aggrid` — 서브패스. peer `ag-grid-community` · `ag-grid-react` |
| 내보내는 것 | `TxAgGrid, TxAgGridProvider`                                                |
| 소스        | [`packages/ui/src/TxAgGrid/`](../../packages/ui/src/TxAgGrid)               |
| 테스트      | 43개                                                                        |

## 개발 목적

ag-grid 위에 **목록 화면에서 늘 하는 일**(열 정의 · 정렬 · 필터 · 순번 · 빈 상태)을 얹는다. 도메인 지식은 넣지 않는다 — 넣는 순간 네 번째 프로젝트가 못 쓴다.

## 기능

- 열을 **필드 이름만으로** 만든다 (`option.headers`). 안 주면 첫 행의 키에서 만든다
- `offset` 을 주면 맨 앞에 순번(`#`) 열이 붙는다. **행 데이터는 건드리지 않는다**
- `pagination` 을 주면 아래에 쪽 번호가 붙는다 (`TxPagination`)
- 서버 정렬은 `option.serverSortColumns` + `onChangeSort` 다 — 화살표만 그리고 순서는 서버가 정한다

### 쓰는 법

```tsx
<TxAgGrid rowData={data?.rows} isLoading={isLoading} offset={offset} defaultColDef={{ flex: 1 }} option={{ headers: ["id", "name"], editColumns: ["name"] }} pagination={{ currentPage, totalRows, pageSize: 50, onChangePage }} />
```

**모듈 등록은 소비 앱이 한다** — `ModuleRegistry.registerModules([AllCommunityModule])`.
라이브러리가 대신 하면 필요한 모듈만 고르거나 enterprise 모듈을 쓰는 선택지를 뺏는다.

## 개발 항목

- [x] **구현** — `packages/ui/src/TxAgGrid/`
- [x] **테스트** — 43개
- [x] **스토리** — `TxAgGrid.stories.tsx`. **쓰는 순서로 세워 두었다** —
      `Setup`(모듈 등록·높이) → `Columns` → `SortInBrowser` → `SortOnServer` → `Editing` →
      `RowNumberAndPaging` → `Selection` → `Loading` → `Theme`, `Playground` 는 맨 뒤.
      문서 머리에 **먼저 알아 둘 세 가지**(서브패스 설치 · 모듈 등록 · 감싸는 자리가 높이를
      가져야 한다는 것)와 **안 보이거나 이상할 때** 표를 뒀다
- [x] **CSS 계약 테스트** — 토큰 · 다크 분기 없음 · `styles.css` 적재 · `@layer tx`

## 정한 것 · 고친 것

원본 673줄에서 **죽은 prop 둘**과 **경계 위반 넷**이 나왔다.

`colWidths` 는 **선언만 있고 읽는 코드가 없었다.** 그런데 앱이 실제로
`colWidths: [4, 20, 42, 10, 14, 6, 13]` 을 넘기고 있었다 — 소비자는 폭이 먹는다고 믿는 중이었다.
쓸 일이 없다고 확인받아 지웠다. `data?: TData` 도 같은 상태였는데 이쪽은 더 나빴다 —
구조분해에 없어서 `{...props}` 를 타고 `<AgGridReact data={…}>` 로 흘러갔다.

### 쪽 번호는 그리드의 것이 아니다

원본은 페이지네이션을 `TxAgGrid` 안에 묶고 **ag-grid 내부 클래스(`ag-paging-panel`)** 로
껍데기를 그렸다. 그쪽이 이름을 바꾸면 조용히 깨진다.

`TxPagination` 으로 갈라 **루트 배럴**에 뒀다 — 카드 목록이나 손수 짠 표에도 쓰이는데
`ag-grid` 서브패스에 숨기면 그걸 쓰려고 ag-grid 를 설치해야 한다.

**`10000` 매직넘버도 함께 걷어냈다.** 페이지 수 상한이 `Math.floor(10000 / pageSize)` 로
박혀 있었는데, 그 1만은 검색엔진이 돌려주는 결과 창의 한계다. 백엔드 사정을 UI 컴포넌트가
알고 있었던 것이다. 이제 `maxPage` 로 소비자가 준다.

버튼도 되살렸다. 원본은 페이지 버튼마다 Tailwind 클래스 덩어리를 발라 `TxButton` 의 색·상태를
통째로 덮었다 — `--tx-color-primary` 를 바꿔도 페이지 번호만 안 따라왔다. 지금은 `variant` 만 준다.

### 순번 열이 행 데이터를 건드리고 있었다

원본은 행마다 객체를 복사해 `#` 키를 심었다. 소비자가 준 객체에 없던 필드가 생기고,
매번 새 객체라 `getRowId` 없이 쓰면 그리드가 행을 처음부터 다시 만든다.
`valueGetter` 로 행 위치에서 계산하도록 바꿨다.

**그런데 그것만으로는 부족했다 — Storybook 에서 잡혔다.** `offset` 을 클로저로 잡았더니
3쪽으로 넘겨도 순번이 1부터 다시 시작했다. 그리드가 들고 있던 옛 함수가 그대로 불린 것이다.
값을 그리드 `context` 에서 읽도록 바꾸고, `offset` 이 바뀌면 그 열만 다시 그린다.
**같은 열 정의가 새 `offset` 을 따라오는지**를 테스트가 지킨다.

### 테마 enum 은 ag-grid 를 되파는 것이었다

`AGGrid_Theme_TYPE` enum 이 하는 일은 ag-grid 가 이미 내보내는 테마를 우리 이름으로 다시
파는 것뿐이었다. 그래서 소비자는 `withPart` 조합을 만들 수 없었고, 앱은 자기 `constants.enum.ts` 에
**같은 enum 을 또** 만들어 두고 있었다. 없애고 `TxAgGridProvider` 가 **Theme 객체를 그대로** 받는다.

**표 안쪽의 겉모습은 ag-grid 의 테마가 소유한다.** 우리 CSS 는 바깥 틀과 우리가 얹은 것
(순번 열·편집 표시)만 맡는다 — 같은 것을 두 곳이 정하면 어긋난다. 그래서 **다크모드도
ag-grid 테마가 정한다**: `--tx-*` 를 뒤집어도 표 안쪽은 따라오지 않으므로, 앱의 테마 상태를
Provider 에 물려야 한다. CSS 계약 테스트가 `.ag-*` 선택자를 쓰면 실패한다.

### 그 밖에 고친 것

- `className` 기본값이 Tailwind 문자열(`"flex flex-1 min-h-0 flex-col"`)이라 소비자가
  `className` 을 주면 **레이아웃이 교체되어 그리드가 높이를 잃었다.** 높이를 CSS 가 소유한다
- default export → named (배럴의 `export *` 가 default 를 못 실어 서브패스가 따로 받아내고 있었다)
- 주석 처리된 `console.log` 블록과 deps 배열 안의 주석을 걷어냈다
- `TxAgGridIconEdit` 은 아이콘이 아니라 헤더 렌더러였다 → `TxAgGridHeader`, 내부 전용
