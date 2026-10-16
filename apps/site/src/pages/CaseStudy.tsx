import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Block, Page } from "../components/Page";
import { STORYBOOK_URL } from "../lib/links";

/**
 * **무엇을 왜 설계했고 어떻게 검증했나**(docs/009 작업 4). 포트폴리오로 이 사이트를 보는 사람이 평가할 자리다.
 *
 * 출처는 docs/007_about_draft — **저장소에서 확인할 수 있는 것만** 싣는다. 쓰는 서비스 수 · 줄어든 시간 같은 성과는
 * 측정하거나 확인받은 것이 없어 싣지 않는다. 소비자 프로젝트 이름도 싣지 않는다.
 */

const REPO = "https://github.com/code7004/txstack/blob/main/";

/** 저장소의 파일. 주장마다 확인할 자리를 붙인다 */
function Src({ path, children }: { path: string; children?: ReactNode }) {
  return (
    <a href={`${REPO}${path}`} target="_blank" rel="noreferrer" className="font-mono text-xs underline">
      {children ?? path}
    </a>
  );
}

const muted = "text-slate-600 dark:text-slate-300";
const th = "py-2 pe-4 text-start font-semibold";
const row = "border-b align-top";
const line = { borderColor: "var(--tx-color-border)" };

/** 라이브러리가 하는 일과 앱이 정해서 넘기는 일 */
const POLICY = [
  ["토큰을 요청에 붙이고 401 을 감지한다", "토큰을 어디서 읽나(getToken), 401 에 무엇을 하나(onUnauthorized)"],
  ["응답에서 본문을 꺼내는 자리를 둔다", "응답 봉투의 모양(unwrap) — { body } 인지 { data } 인지"],
  ["오류를 한 형태로 읽는다(parseApiError)", "그 오류를 어디에 어떻게 보여 주나"],
  ["로그의 민감한 값을 가린다", "무엇을 가리고(maskFields) 로그를 어디로 보낼지(onRequest · onResponse)"],
  ["메뉴에서 권한 없는 항목을 뺀다", "권한 판정(canAccess). 주소 접근을 막는 일은 앱과 서버"],
  ["컴포넌트의 모양을 그린다", "색 · 모서리 · 간격(--tx-* 토큰), 놓이는 자리(className)"]
];

/** 실제로 드러나 고친 결함. 원인 → 고친 것 → 다시 생기지 않게 막은 자리 */
const FIXES = [
  {
    title: "로그가 토큰을 그대로 내보냈다",
    found: "HTTP 클라이언트를 검수하며 재현했습니다. 디버그 오류 로그가 오류 응답의 본문을, 로그의 URL 이 ?token= 같은 쿼리를 가리지 않고 찍었습니다.",
    cause: "가리기가 요청 · 응답 본문의 최상위 키에만 걸려 있었습니다. 오류 로그와 URL, 중첩된 값은 그 길을 지나지 않았습니다.",
    fix: "로그로 나가는 모든 길(요청 · 응답 · 오류, URL 쿼리, 중첩 객체 · 배열 · JSON 문자열)이 같은 가리기를 거치게 했습니다. 서버로 나가는 요청과 앱이 받는 응답은 바꾸지 않고, 로그용 사본만 가립니다.",
    proof: (
      <>
        <Src path="packages/axios/src/client.test.ts">client.test.ts</Src> — 오류 로그 · URL 쿼리 · 중첩 · 순환 참조 · 원본 보존
      </>
    )
  },
  {
    title: "좁은 화면에서 메뉴 서랍이 닫히지 않았다",
    found: "이 사이트를 만들며 드러났습니다. 서랍 속 링크를 누르면 주소는 바뀌는데 서랍이 열린 채 남았습니다.",
    cause: "서랍의 열림 상태가 셸 안에 있어 앱이 닫을 길이 없었습니다. 카탈로그(Storybook)에서는 주소가 바뀌지 않아 보이지 않았습니다.",
    fix: "서랍 안의 링크를 누르면 셸이 스스로 닫습니다. 새 탭 · 내려받기 · 보조키 클릭은 그대로 둡니다. 공개 API 는 바꾸지 않았습니다.",
    proof: (
      <>
        <Src path="packages/ui/src/TxAppShell/TxAppShell.test.tsx">TxAppShell.test.tsx</Src> — 서랍 안의 링크를 누르면 닫힌다
      </>
    )
  },
  {
    title: "강조색 하나가 채움과 글자를 겸했다",
    found: "사이트의 강조색을 밝은 민트로 바꾸자 버튼은 괜찮은데 현재 메뉴 표시와 포커스 링이 흰 바탕에서 읽히지 않았습니다(대비 1.7:1).",
    cause: "같은 토큰이 채우는 면과 바탕 위의 글자 · 선에 함께 쓰였습니다. 밝은 색은 채움에는 맞고 글자에는 맞지 않습니다.",
    fix: "글자 · 선용 토큰(--tx-color-primary-strong)을 따로 냈습니다. 사이트가 부품 토큰을 하나씩 돌려 놓던 여섯 줄이 한 줄이 됐고, 기본 팔레트의 대비 미달도 함께 고쳐졌습니다.",
    proof: (
      <>
        <Src path="packages/ui/src/index.test.ts">index.test.ts</Src> — 포커스 링과 글자용 토큰은 읽히는 쪽을 쓴다
      </>
    )
  }
];

export function CaseStudy() {
  return (
    <Page title="Case Study" lead="txstack을 왜 이렇게 나눴고, 무엇을 앱에 남겼고, 어떻게 확인하는지 정리했습니다. 각 주장 옆에 확인할 수 있는 코드와 테스트를 붙였습니다.">
      <Block title="Problem">
        <p className={muted}>
          여러 서비스가 같은 UI 컴포넌트와 같은 HTTP(axios) 설정을 각자 복사해 쓰고 있었습니다. 고칠 일이 생기면 서비스마다 다시 고쳐야 했고, 복사본은 조금씩 달라졌습니다. 라우트와 메뉴도 서비스마다 따로 적어서, 화면을 하나 더하면 두 곳을 고쳐야 했고
          어긋나기 쉬웠습니다.
        </p>
        <p className={muted}>
          그래서 공통된 부분만 꺼내 <strong>어느 서비스의 도메인도 모르는 라이브러리</strong>로 나눴습니다. 기준은 하나입니다 — 다음 프로젝트가 설치만으로 그대로 쓸 수 있는가. 이전 구현은 <code>legacy</code> 브랜치에 남겨 두고, 하나씩 열어 읽고
          정리해 옮겼습니다.
        </p>
      </Block>

      <Block title="Decisions">
        <p className={muted}>
          <strong>필요한 것만 설치하도록 네 패키지로 나눴습니다.</strong> 의존 방향은 <code>ui → hooks</code> 하나만 허용하고, <code>route-meta</code> · <code>hooks</code> · <code>axios</code>는 서로를 가져오지 않습니다. <code>axios</code>는 React
          없이도 동작합니다. 표와 달력처럼 무거운 의존은 <code>@txstack/ui/aggrid</code> · <code>@txstack/ui/daypicker</code>로 따로 두어, 쓰지 않으면 설치하지도 불러오지도 않습니다.
        </p>
        <p className={muted}>
          <strong>서비스마다 다른 규칙은 라이브러리가 정하지 않고 앱이 넘깁니다.</strong> 라이브러리가 그것을 정하면 다음 서비스에서 바로 깨집니다.
        </p>
        <div className="overflow-x-auto">
          <table className="site-stack-table w-full text-sm">
            <thead>
              <tr className="border-b" style={line}>
                <th className={th}>라이브러리가 합니다</th>
                <th className={th}>앱이 정해서 넘깁니다</th>
              </tr>
            </thead>
            <tbody className={muted}>
              {POLICY.map(([lib, app]) => (
                <tr key={lib} className={row} style={line}>
                  <td className="py-2 pe-4">{lib}</td>
                  <td className="py-2 pe-4" data-label="앱이 정함">
                    {app}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={muted}>
          <strong>디자인은 CSS 변수로 바꿉니다.</strong> 컴포넌트 CSS는 색을 직접 쓰지 않고 <code>--tx-*</code> 토큰만 참조하고, 모든 스타일이 <code>@layer tx</code> 안에 있어 앱의 클래스가 항상 이깁니다. 이 사이트도 컴포넌트 CSS를 한 줄도 덮어쓰지
          않고 토큰만으로 꾸몄습니다 — <Src path="apps/site/src/theme.css" />.
        </p>
      </Block>

      <Block title="Main case: one route tree">
        <p className={muted}>
          관리 화면에서 가장 자주 어긋나던 것은 라우트와 메뉴였습니다. <code>route-meta</code>는 라우트를 트리 하나로 선언하고, 거기서 라우터 등록(<code>buildRouteObjects</code>) · 메뉴 데이터(<code>getNavRoutes</code>) · 지금 위치(
          <code>useCurrentRoute</code>)를 모두 만듭니다. 화면을 더하거나 이름을 바꿀 때 고치는 곳이 한 곳입니다.
        </p>
        <ul className={`flex list-inside list-disc flex-col gap-1 ${muted}`}>
          <li>
            <strong>정의와 실행을 나눴습니다.</strong> <code>meta</code>(이름 · 아이콘 · 권한)는 라우터로 넘기지 않습니다. 라우터는 react-router 그대로입니다.
          </li>
          <li>
            <strong>권한은 메뉴를 거르는 데까지입니다.</strong> 주소로 직접 들어오는 것을 막는 일은 앱과 서버의 몫이라고 문서와 시연에 밝혔습니다.
          </li>
          <li>
            <strong>이 사이트가 그 트리로 돕니다.</strong> 가로 줄 · 왼쪽 줄 · 탭 제목 · 다음 장 · 사이트 검색 · 주소마다의 공유 정보가 모두 <Src path="apps/site/src/routes.tsx">routes.tsx</Src> 한 곳에서 나옵니다.
          </li>
        </ul>
        <p className={muted}>
          직접 바꿔 보려면{" "}
          <Link to="/" className="underline">
            Home의 시연
          </Link>
          , 화면까지 등록한 완성 코드는{" "}
          <Link to="/example/routes" className="underline">
            Example › Routes
          </Link>
          와{" "}
          <Link to="/example/app" className="underline">
            Example › App
          </Link>
          에 있습니다.
        </p>
      </Block>

      <Block title="Fixes">
        <p className={muted}>실제로 드러난 결함 셋입니다. 원인을 찾아 라이브러리에서 고치고, 다시 생기지 않도록 테스트로 막았습니다.</p>
        <div className="flex flex-col gap-4">
          {FIXES.map((item) => (
            <section key={item.title} className="flex flex-col gap-2 rounded-lg border p-4" style={line}>
              <h3 className="font-semibold">{item.title}</h3>
              <dl className={`grid gap-x-4 gap-y-1 text-sm sm:grid-cols-[5rem_1fr] ${muted}`}>
                <dt className="font-semibold text-[color:var(--tx-color-text)]">드러남</dt>
                <dd>{item.found}</dd>
                <dt className="font-semibold text-[color:var(--tx-color-text)]">원인</dt>
                <dd>{item.cause}</dd>
                <dt className="font-semibold text-[color:var(--tx-color-text)]">고침</dt>
                <dd>{item.fix}</dd>
                <dt className="font-semibold text-[color:var(--tx-color-text)]">막음</dt>
                <dd>{item.proof}</dd>
              </dl>
            </section>
          ))}
        </div>
      </Block>

      <Block title="Evidence">
        <ul className={`flex list-inside list-disc flex-col gap-1 ${muted}`}>
          <li>
            <strong>테스트</strong> — lint · 타입 검사 · 테스트 1,833개(<code>pnpm check</code>). 화면 테스트 환경(jsdom)은 스타일시트를 못 보므로, CSS 파일을 글자로 읽어 토큰만 쓰는지 · 레이어 안에 있는지를 검사합니다.
          </li>
          <li>
            <strong>배포 파일 검증</strong> — 네 패키지를 실제 배포 파일(<code>.tgz</code>)로 묶어 저장소 밖의 새 앱에 설치하고, React 18 · 19와 react-router 6 · 7에서 타입 검사 · 빌드하고, axios는 Node에서 실제로 실행합니다(
            <Src path="scripts/verify-packages.mjs">verify-packages.mjs</Src>).
          </li>
          <li>
            <strong>CI</strong> — PR마다 위 검사를 돌리고, 이 사이트의 배포도 검사를 통과해야만 나갑니다(<Src path=".github/workflows/ci.yml">ci.yml</Src>).
          </li>
          <li>
            <strong>첫 소비자</strong> — 이 사이트가 네 패키지를 주소창 · 새로고침 · 직접 링크 · 실제 요청과 함께 씁니다. 카탈로그에서는 안 보이던 것을 여기서 찾아 라이브러리에서 고쳤습니다(위의 둘째 · 셋째 결함).
          </li>
          <li>
            <strong>동작하는 예제</strong> —{" "}
            <Link to="/example" className="underline">
              Example
            </Link>
            의 운영 화면, 컴포넌트마다의{" "}
            <a href={STORYBOOK_URL} className="underline">
              Storybook
            </a>
            .
          </li>
        </ul>
      </Block>

      <Block title="Limits">
        <ul className={`flex list-inside list-disc flex-col gap-1 ${muted}`}>
          <li>
            <strong>npm에 아직 배포하지 않았습니다.</strong> 네 패키지 모두 <code>0.1.0</code>이고, 지금은 저장소에서 빌드한 파일로 설치합니다.
          </li>
          <li>
            <strong>기존 서비스에 적용하는 중입니다.</strong> 실제 서비스에서 드러나는 것을 라이브러리에서 고치는 단계이고, npm 배포는 그 다음입니다.
          </li>
          <li>
            <strong>확인한 범위가 좁습니다.</strong> Node 24에서만 확인했고, 표(ag-grid)는 35 버전을 기준으로 합니다.
          </li>
          <li>배포 전에 정할 이름이 남아 있고, 영문 문서는 아직 없습니다.</li>
        </ul>
      </Block>
    </Page>
  );
}
