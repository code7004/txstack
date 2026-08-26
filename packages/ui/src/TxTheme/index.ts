/**
 * **내부 전용 공유 클래스 상수. 배럴(`src/index.ts`)에서 내보내지 않는다.**
 *
 * 이 값들은 Tailwind 클래스 문자열이다. 공개 API 로 두면 소비자가 이걸 받아서 할 수 있는 일이
 * **Tailwind 를 쓰는 것뿐**이라, "소비자가 CSS·Sass·Tailwind 중 무엇을 쓰든 상관없다"
 * (`docs/001_ui/10_requirements.md` R4)와 정면으로 어긋난다.
 *
 * **이 파일은 사라질 예정이다.** 아직 자체 CSS 로 옮기지 않은 컴포넌트들이 `*.theme.ts` 에서
 * 이걸 참조하고 있어서 남아 있을 뿐이다. 각 컴포넌트가 자기 `S2` 에서 CSS + `--tx-*` 토큰으로
 * 옮겨가면 참조가 하나씩 줄고, **마지막 참조가 사라질 때 이 폴더를 지운다.**
 *
 * 그래서 **여기에 새 상수를 추가하지 않는다.** 새로 필요한 값은 `tokens.css` 나
 * 그 컴포넌트의 `.css` 에 둔다 (`docs/001_ui/20_design.md` §5).
 *
 * 명세: docs/001_ui/components/04_TxTheme.md
 */

/** 공통 표면 — 배경과 글자. `.dark` 짝을 함께 들고 있다 */
export const TxClassBase = "bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100";

/** 테두리 — 굵기까지 포함한다 */
export const TxClassBorder = "border border-gray-300 dark:border-gray-600";

/** 테두리 색만. 굵기를 따로 주는 자리에서 쓴다 */
export const TxClassBorderColor = "border-gray-300 dark:border-gray-600";

export const TxClassHover = "hover:bg-gray-100 dark:hover:bg-gray-700";

export const TxClassFocus = "focus-within:ring-blue-500 focus-within:ring-2";
