import type { SVGProps } from "react";

/**
 * **내부 전용 아이콘. 배럴(`src/index.ts`)에서 내보내지 않는다.**
 *
 * 두 개짜리 아이콘 세트는 소비자에게 쓸모가 없다 — 소비자는 이미 자기 세트(lucide·heroicons…)를
 * 쓴다. 공개하면 이름과 모양이 공개 API 가 되어 바꿀 때마다 major 다.
 * **닫는 건 major 지만 나중에 여는 건 minor** 이므로 지금은 닫아 둔다.
 *
 * 소비자가 아이콘을 갈아끼워야 하는 자리(입력창의 지우기·검색 버튼)는
 * 그 컴포넌트가 prop 으로 받는 쪽이 맞다. `TxInput` 을 옮길 때 판단한다.
 *
 * ## 두 가지 규약
 *
 * - **`width`/`height` 가 `1em`** — 놓인 자리의 `font-size` 를 따라간다
 * - **`fill="currentColor"`** — 놓인 자리의 `color` 를 따라간다
 *
 * `TxSpinner` 와 같은 규약이다. 그래서 버튼이나 문단 안에 넣으면 저절로 맞는다.
 * 크기를 따로 주려면 `width`/`height` 를 넘긴다.
 *
 * 명세: `docs/001_ui.md`
 */

/** 닫기 · 지우기. 원 안의 X. */
export function TxIconClose(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" {...props}>
      <path
        fill="currentColor"
        d="M20.48 3.512a11.97 11.97 0 0 0-8.486-3.514C5.366-.002-.007 5.371-.007 11.999c0 3.314 1.344 6.315 3.516 8.487A11.97 11.97 0 0 0 11.995 24c6.628 0 12.001-5.373 12.001-12.001c0-3.314-1.344-6.315-3.516-8.487m-1.542 15.427a9.8 9.8 0 0 1-6.943 2.876c-5.423 0-9.819-4.396-9.819-9.819a9.8 9.8 0 0 1 2.876-6.943a9.8 9.8 0 0 1 6.942-2.876c5.422 0 9.818 4.396 9.818 9.818a9.8 9.8 0 0 1-2.876 6.942z"
      ></path>
      <path
        fill="currentColor"
        d="m13.537 12l3.855-3.855a1.091 1.091 0 0 0-1.542-1.541l.001-.001l-3.855 3.855l-3.855-3.855A1.091 1.091 0 0 0 6.6 8.145l-.001-.001l3.855 3.855l-3.855 3.855a1.091 1.091 0 1 0 1.541 1.542l.001-.001l3.855-3.855l3.855 3.855a1.091 1.091 0 1 0 1.542-1.541l-.001-.001z"
      ></path>
    </svg>
  );
}

/** 체크 표시. `TxCheckBox` 가 쓴다. */
export function TxIconCheck(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" {...props}>
      <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19L21 7l-1.41-1.41z"></path>
    </svg>
  );
}

/** 검색. 돋보기. */
export function TxIconSearch(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="1em" height="1em" {...props}>
      <path
        fill="currentColor"
        d="M456.69 421.39L362.6 327.3a173.8 173.8 0 0 0 34.84-104.58C397.44 126.38 319.06 48 222.72 48S48 126.38 48 222.72s78.38 174.72 174.72 174.72A173.8 173.8 0 0 0 327.3 362.6l94.09 94.09a25 25 0 0 0 35.3-35.3M97.92 222.72a124.8 124.8 0 1 1 124.8 124.8a124.95 124.95 0 0 1-124.8-124.8"
      ></path>
    </svg>
  );
}

/** 사람. 사진도 이름도 없는 `TxAvatar` 가 쓴다. */
export function TxIconUser(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" {...props}>
      <path fill="currentColor" d="M12 12a5 5 0 1 0 0-10a5 5 0 0 0 0 10m0 2c-4.42 0-8 2.24-8 5v1a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1c0-2.76-3.58-5-8-5"></path>
    </svg>
  );
}
