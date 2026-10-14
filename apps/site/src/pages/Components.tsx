import { TxAlert } from "@txstack/ui";
import { Block, Page } from "../components/Page";
import { STORYBOOK_URL } from "../lib/links";

/**
 * 부품 레퍼런스는 **스토리북이 갖는다.** 여기서 다시 쓰지 않는다 —
 * 같은 내용을 두 곳에서 관리하면 반드시 어긋난다.
 */
export function Components() {
  return (
    <Page title="Components" lead="컴포넌트별 props, 토큰, 조합 예제는 Storybook 카탈로그에 있습니다. 49종 모두 직접 조작해 볼 수 있습니다.">
      <div className="flex flex-wrap gap-3">
        <a href={STORYBOOK_URL} className="tx-button" data-variant="primary" target="_blank" rel="noreferrer">
          <span className="tx-button__label">카탈로그 열기</span>
        </a>
      </div>

      <TxAlert variant="info" title="로컬에서 실행하기">
        저장소에서 <code>pnpm storybook:dev</code>를 실행하면 <code>localhost:6310</code>에서 열립니다. 배포된 카탈로그는 이 사이트의 <code>/storybook/</code> 경로에 있습니다.
      </TxAlert>

      <Block title="What's in the catalog">
        <ul className="list-inside list-disc text-slate-600 dark:text-slate-300">
          <li>카테고리별 컴포넌트 — Form · Data · Layout · Overlay · Feedback · Action</li>
          <li>
            <strong>Recipes</strong> — 로그인, 등록, 목록, 슬라이드 편집처럼 <strong>컴포넌트를 조합해 만든 화면 예제</strong>
          </li>
          <li>Introduction — 설치, 토큰, 다크 모드, Tailwind와 함께 쓰기</li>
        </ul>
      </Block>
    </Page>
  );
}
