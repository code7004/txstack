---
"@txstack/hooks": minor
---

`useUrlQuery` 의 타입 추론을 `defaults` 한 곳으로 고정한다.

기존에는 `queryTypes` / `urlKeys` 도 제네릭 `T` 의 추론 후보였다. 그래서 타입 인자를 명시하지 않고

```ts
useUrlQuery({
  defaults: { keyword: "", page: 1, onlyActive: false },
  queryTypes: { page: "number", onlyActive: "boolean" }
});
```

처럼 호출하면 `T` 가 `queryTypes` 의 키만으로 `{ page: unknown; onlyActive: unknown }` 으로 결정되어,
`query.keyword` 접근이 컴파일 에러가 났다. playground 는 `useUrlQuery<IDemoQuery>` 로 타입 인자를
명시하고 있어 이 문제가 드러나지 않았다.

- `defaults` 의 타입을 `Partial<T>` → `T` 로 바꿨다. 훅이 `{ ...defaults, ...url }` 을 `T` 로 반환하므로
  반환 상태의 키 집합은 `defaults` 가 결정한다. 기존 타입이 구현과 어긋나 있었다.
- `urlKeys` / `queryTypes` / `postParse` / `afterParse` 를 `NoInfer<T>` 로 감싸 추론 후보에서 제외했다.

**소비자 영향** — `NoInfer` 는 TypeScript 5.4 내장 유틸리티다. `@txstack/hooks` 의 타입을 쓰려면
**TypeScript 5.4 이상**이 필요하다.
