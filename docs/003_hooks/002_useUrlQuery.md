# 002 · useUrlQuery

> **URL 쿼리스트링을 화면 상태처럼 쓴다.**

|             |                                                                                |
| ----------- | ------------------------------------------------------------------------------ |
| 진입점      | `@txstack/hooks/useUrlQuery` — 서브패스. peer `react-router-dom`               |
| 내보내는 것 | `useUrlQuery` · `UseUrlQueryOptions`                                           |
| 소스        | [`packages/hooks/src/useUrlQuery.ts`](../../packages/hooks/src/useUrlQuery.ts) |
| 테스트      | 22개                                                                           |

## 개발 목적

필터 값이 주소에 남으면 **새로고침 · 공유 · 즐겨찾기가 그대로 복원된다.** 세 프로젝트가
각자 `useSearchParams` 를 감싸 이걸 만들었고, 셋 다 같은 자리에서 무한 반복을 냈다.

## 기능

```tsx
import { useUrlQuery } from "@txstack/hooks/useUrlQuery";

const [query, setQuery] = useUrlQuery({ defaults: { a: 10, b: 20 } });

query.a; // 10 — 문자열이 아니라 숫자로 복원된다
setQuery({ a: 20 }); // 주소창이 ?a=20&b=20 으로 바뀐다
```

### 이 훅이 지키는 세 가지

**① 새로고침해도 그대로다.** `?a=10&b=20` 로 들어오면 그 값이 상태다.

**② 주소에 기재만 하고 페이지를 이동시키지 않는다.** `setQuery` 는 같은 경로의 쿼리만
갈아끼운다. 라우트 매칭 결과가 같으므로 컴포넌트는 언마운트되지 않고, `replace` 기본값이
`true` 라 히스토리도 쌓이지 않는다.

**③ 객체로 바로 쓴다.** `defaults` 값의 타입이 복원 규칙이 된다 — `page: 1` 이면
`?page=2` 를 문자열이 아니라 숫자 `2` 로 읽는다.

### 옵션

```tsx
const [query, setQuery] = useUrlQuery({
  defaults: { page: 1, size: 20, keyword: "" },

  urlKeys: ["status"], // defaults 에 없지만 URL 에서 읽을 키
  queryTypes: { status: "number" }, // 기본값이 없어 복원 규칙을 직접 줘야 하는 키
  postParse: (q) => ((q.size ?? 0) > 100 ? { size: 100 } : {}), // 주소를 손으로 고쳐도 한도를 지킨다

  encode: true, // 쿼리 전체를 base64url 한 덩어리로 감춘다 → ?_q=eyJ...
  encodeKey: "_q", // 그때 쓸 키 이름. 기본 "_q"
  replace: true // 기본값. false 면 필터를 만질 때마다 히스토리가 쌓인다
});
```

### `urlKeys` 를 쓰면 `T` 를 직접 적는다

`T` 는 `defaults` 에서 추론된다. `urlKeys` 의 키는 `defaults` 에 없으니, 추론에 맡기면
그 키가 `T` 에 없어 `query.keyword` 가 타입 에러다. **선택 필드를 가진 타입을 직접 넘긴다.**

```tsx
interface Query {
  from: number;
  size: number;
  keyword?: string;
  userGrade?: number;
}

const [q, setQ] = useUrlQuery<Query>({
  defaults: { from: 0, size: 50 }, // 필수 필드만 기본값을 준다
  urlKeys: ["keyword", "userGrade"], // Query 에 있는 키만 받는다 — 오타는 컴파일 에러
  queryTypes: { userGrade: "number" } // 기본값이 없으니 복원 규칙을 준다
});

q.keyword; // string | undefined
```

**모양은 선언이 정한다. 주소가 정하지 않는다.** 공유된 주소는 누구나 고칠 수 있으므로,
주소가 어떻게 생겼든 `query` 는 선언한 타입을 지킨다.

| 선언                                          | 주소                   | 읽은 값                           |
| --------------------------------------------- | ---------------------- | --------------------------------- |
| `ids: [] as number[]`                         | `?ids[]=1&ids[]=2`     | `[1, 2]` — 쓸 때도 `key[]`        |
| 〃                                            | `?ids=1&ids=2`         | `[1, 2]`                          |
| 〃                                            | `?ids=1`               | `[1]` — 하나여도 배열             |
| `q: ""`                                       | `?q=a&q=b` · `?q[]=a`  | `"a"` — 단일 값은 **첫 값**       |
| 〃                                            | `?q=a,b`               | `"a,b"` — 콤마는 쪼개지 않음      |
| `page: 1`                                     | `?page=abc` · `?page=` | `1` — 읽을 수 없으면 기본값       |
| `on: true`                                    | `?on=yes`              | `true` — `true` · `false` 만 읽음 |
| 선언 없음 (`urlKeys` 에만, `queryTypes` 없음) | `?tag=1&tag=2`         | `[1, 2]` — 주소 생김새로 짐작     |

배열 원소의 타입은 `queryTypes` 로 준다(`queryTypes: { ids: "number" }`). 빈 배열 기본값만으로는
원소 타입을 알 수 없어, 주지 않으면 숫자처럼 생긴 것은 숫자로 읽는다. 읽을 수 없는 원소는 버린다.

`encode: true` 로 감춘 값도 같다. JSON 이라 타입이 실려 오지만 선언과 맞지 않는 키는 버리고 기본값을 쓴다.

### 반환값 identity

`setQuery` 는 **항상 같은 함수**고, `query` 는 **URL 이 바뀔 때만 새 객체**가 된다.

`defaults` 를 인라인으로 넘겨도(`{ defaults: { a: 10 } }`) 매 렌더 새 객체가 만들어지지
않는다. 옵션을 ref 로 붙잡고 의존성을 `searchParams` 하나로 두기 때문이다. 그래서 둘 다
`useEffect` 의존성에 그대로 넣어도 루프가 나지 않는다.

### 알아둘 것 — data router

`loader` 를 쓰는 라우트에서는 로케이션이 바뀌면 loader 가 다시 돈다. 필터를 loader 로 읽고
있다면 의도한 동작일 것이고, 아니라면 그 라우트에서 `shouldRevalidate` 를 조정한다.

## 개발 항목

- [x] **구현** — `packages/hooks/src/useUrlQuery.ts`
- [x] **테스트** — 36개. jsdom + `MemoryRouter` 로 **실제 주소 변화**를 관찰한다
- [x] **서브패스 분리** — 루트 배럴은 `react-router-dom` 을 모른다
- [x] `urlKeys` 의 타입 — API 는 그대로 두고 "`T` 를 직접 적는다" 를 사용 규칙으로 올렸다 (2026-11-11).
      `usertics` 27개 화면이 이 모양으로 쓰고 타입이 따라온다

## 정한 것 · 고친 것

### 콤마 분해를 없앴다 (2차)

한때 값에 `,` 가 있으면 배열로 쪼갰다. **선언된 타입을 무시하는 동작이었다** —
`defaults: { q: "" }` 로 `string` 을 선언한 자리에 런타임에 `string[]` 이 들어온다.

`apps/site` 의 검색 화면에서 실제로 터졌다: 주소창에 `?q=react,hooks` 를 넣으면
소비자 코드의 `query.q.trim()` 이 `TypeError` 를 던지고 **화면이 하얘졌다.** 반환 타입이
`string` 이라고 말하면서 배열을 주면 소비자는 방어할 이유가 없다.

문서에도 없고 테스트도 없던 동작이라 지웠다. 배열은 `key[]` 나 반복 키로 **선언해서** 쓴다.

### 반복 키를 배열로 만들지 않는다 (0.1.2)

같은 키가 두 번 오면 **선언과 상관없이** 배열로 만들었다. 콤마 분해와 같은 결함이 한 겹 더 남아 있던 것이다 —
`apps/site` 의 계정 예제에 `?q=a&q=b` 로 들어가면 `trim is not a function` 과 빈 목록이 났다.
선언 쪽에서 보면 반대 결함도 있었다. 배열로 선언한 키에 `?ids=1` 하나가 오면 배열이 아니라 `1` 이 됐다.

이제 모양은 선언(기본값 · `queryTypes`)이 정한다. 단일 값 키가 반복되면 `URLSearchParams.get()` 처럼 첫 값을 쓴다.
같이 고친 것: 숫자로 선언한 키에 `?page=abc` 는 `NaN`, `?page=` 는 `0` 이었다 — 지금은 기본값.
boolean 은 `true` 가 아닌 모든 것을 `false` 로 읽었다 — 지금은 `true` · `false` 만 읽고 나머지는 기본값.
`encode` 로 감춘 JSON 은 검사 없이 그대로 넘겼다 — 지금은 같은 규칙으로 거른다.

선언하지 않은 키는 그대로 주소 생김새로 짐작한다. 짐작 말고 다른 근거가 없기 때문이다.

### URL 이 단일 출처다

상태를 따로 들지 않고 `useSearchParams` 에서 매번 파생시킨다. **URL 로 되쓰는 `useEffect` 가
없고, 쓰기는 `setQuery` 를 부를 때만 일어난다.** 원본과 가장 크게 달라진 점이다.

### 무한 반복이 났던 이유

```ts
useEffect(() => {
  writeQuery(state, setSearchParams, encode, replace);
}, [encode, replace, setSearchParams, state]);
```

`setSearchParams` 를 부르면 → `searchParams` 가 바뀌고 → **`setSearchParams` 의 identity 도
바뀌어** → effect 가 다시 돌고 → 또 쓴다.

URL 을 단일 출처로 만들면 이 effect 자체가 필요 없어진다. 쓰기는 `setQuery` 호출 시 한 번뿐이다.

### 그 밖에 고친 것

| 원본                                                        | 지금                           | 왜                                                                         |
| ----------------------------------------------------------- | ------------------------------ | -------------------------------------------------------------------------- |
| 마운트 시 `defaults` 를 전부 URL 에 기록                    | 마운트 시 주소를 건드리지 않음 | 들어가기만 해도 히스토리가 replace 되고 기본값이 주소창에 노출됐다         |
| 옵션이 매 렌더 새 객체 → 반환값 identity 불안정             | 옵션을 ref 로 붙잡음           | 소비자는 `defaults` 를 거의 항상 인라인으로 넘긴다. 소비자 쪽 루프의 원인  |
| `searchQuery`·`getUrlQuery`·`pushUrlQuery`·`updateUrlQuery` | 삭제                           | `window.history` 를 직접 만져 라우터 상태와 어긋난다. 요청 범위에도 없었다 |
| `decodeObject` 실패 시 `console.error`                      | 조용히 defaults 로             | 주소를 손으로 고친 것뿐인데 라이브러리가 앱 콘솔을 더럽힐 이유가 없다      |
| `afterParse`                                                | 삭제                           | 원본에서 이미 `@deprecated` 였다                                           |
| `ENCODED_QUERY_KEY = "encioesode"`                          | `encodeKey` 옵션 (기본 `_q`)   | 오타처럼 보이는 매직 문자열이 공개 URL 에 노출되는데 소비자가 못 바꿨다    |

**회귀 테스트로 못 박은 둘** — "마운트만으로 주소를 건드리지 않는다" 와
"인라인 `defaults` 에도 identity 가 유지된다". 둘 다 무한 반복으로 이어지던 지점이다.
