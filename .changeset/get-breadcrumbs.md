---
"@txstack/route-meta": minor
---

`getBreadcrumbs(tree, pathname, basename?)` 를 더한다 — `useBreadcrumbs` 와 같은 규칙으로 **라우터 밖에서** 주소 하나로 경로 칸을 만든다. 주소를 상태로 들고 있는 미리보기 · 렌더 전의 탭 제목 · 서버 · 테스트에서 쓴다. 라우터에 `basename` 을 줬다면 같은 값을 넘긴다(칸의 `path` 는 그것을 뗀 주소다). 쿼리 · 조각은 보지 않고, 부를 때마다 새 배열이다.

`useBreadcrumbs` 는 이제 이 함수를 지금 주소로 부른다. 결과는 같고, 쿼리 · 조각만 바뀌었을 때도 같은 배열을 돌려준다.
