# 코드

> 언제 보나: 코드를 쓰기 전에. 도메인 규칙은 각 프로젝트의 `docs/rules/` 가 갖는다.

## 1. 원칙

- **읽히는 것이 먼저다.** 짧은 것보다 뜻이 보이는 것
- **있는 구조를 먼저 따른다.** 새 패턴은 쓰는 곳이 둘 이상일 때
- **명시적으로.** 숨은 전역 · 마법 같은 자동 등록보다 import 와 인자
- **쓰지 않는 것을 미리 만들지 않는다.** 추상화 · 옵션 · 공용 패키지 모두

## 2. 파일 · 이름

다섯 프로젝트에서 실제로 쓰는 방식이다 (2026-11-17 측정).

| 대상                         | 규칙                              | 예                                             |
| ---------------------------- | --------------------------------- | ---------------------------------------------- |
| React 컴포넌트 파일          | 컴포넌트 이름 그대로 — PascalCase | `UserListPage.tsx` · `TxButton.tsx`            |
| 훅 · 함수 모듈 (프런트)      | camelCase                         | `useUserFilter.ts` · `formatPrice.ts`          |
| NestJS                       | Nest 관례 — `kebab-이름.종류.ts`  | `payout-baseline.service.ts`                   |
| 변수 · 함수                  | camelCase                         |                                                |
| 상수                         | UPPER_SNAKE_CASE                  | `MAX_PAGE_SIZE`                                |
| 타입 · 인터페이스 · 컴포넌트 | PascalCase                        |                                                |
| 폴더                         | 담은 것의 이름 규칙을 따른다      | 컴포넌트 하나면 `TxButton/`, 묶음이면 `pages/` |

**이름은 무엇인지를 말한다.** `data` · `info` · `temp` · `handle` 만으로 짓지 않는다.

## 3. TypeScript

- `strict: true`. `any` 를 쓰면 그 줄에 이유를 남긴다
- 밖으로 내보내는 함수 · 컴포넌트의 인자와 반환은 타입을 적는다
- 앱 전역(ambient) 타입 · 전역 변수에 기대지 않는다 — 옮기면 깨진다
- API 응답 · DTO 타입과 화면 상태 타입을 나눈다. ORM 타입(Prisma 등)을 API 밖으로 그대로 내보내지 않는다

## 4. import

```ts
import { useState } from "react"; // 1. 외부 라이브러리
import { TxButton } from "@txstack/ui"; // 2. 공용 패키지
import { usePayouts } from "@/features/payout"; // 3. 앱 안 (별칭)
import { Row } from "./Row"; // 4. 같은 폴더
```

- 패키지는 **공개 진입점만** import 한다 (`@txstack/ui`, `@txstack/hooks/useObjectState`). `dist/` 안을 직접 가리키지 않는다
- 상대 경로가 `../../..` 처럼 깊어지면 `@/` 별칭을 쓴다

## 5. 화면 (React)

- **UI 를 `@txstack/ui` 로 짓는다면, 어떤 컴포넌트를 쓰고 어떻게 꾸미는지는 그 패키지의 AI 가이드가 갖는다** —
  `node_modules/@txstack/ui/ai/rules.md`. 여기에 다시 적지 않는다 (컴포넌트와 함께 바뀌므로)
- 화면(page)은 조립만 한다. 데이터 가져오기 · 변환은 훅이나 데이터 계층으로
- 전역 상태는 최소로. URL 에 둘 수 있는 상태(필터 · 페이지)는 URL 에

## 6. 서버

- 요청 핸들러(controller)는 얇게 — 입력 검증과 서비스 호출만
- 업무 규칙은 서비스에, DB 접근은 그 아래 계층에
- 입력은 경계에서 검증한다(DTO · 스키마)
- 외부 서비스는 인터페이스 뒤에 두고, 개발 · 시험에는 합성 구현을 꽂는다

## 7. 주석 · 테스트

- 주석은 **왜**를 쓴다. 무엇을 하는지는 코드가 말한다. 사실이 아닌 주석은 지운다
- 결함을 고치면 그 결함을 다시 잡는 테스트를 같이 넣는다
- 테스트 이름은 동작으로 쓴다 — "빈 값이면 0 을 그린다"
