import { TxCard, TxFlex } from "@txstack/ui";
import { Link } from "react-router-dom";

const PACKAGES = [
  { name: "@txstack/ui", to: "/ui/input", desc: "Tx* 컴포넌트. 이 화면의 카드·버튼·입력이 전부 이 패키지다." },
  { name: "@txstack/hooks", to: "/hooks", desc: "useUrlQuery · useStateForObject · useSafePolling." },
  { name: "@txstack/route-meta", to: "/route-meta", desc: "좌측 메뉴와 라우터가 같은 트리에서 파생된다." },
  { name: "@txstack/network", to: "/network", desc: "토큰 주입 · 401 처리 · 응답 봉투 해제." }
];

export const HomePage = () => (
  <TxFlex className="flex-col gap-4">
    <TxCard caption="이 playground 자체가 4개 패키지의 통합 테스트다">
      <TxCard.Content className="flex flex-col gap-2 text-sm text-slate-600 dark:text-slate-300">
        <p>각 패키지를 따로 전시하는 대신, 서로 물려서 동작하게 만들었다.</p>
        <ul className="list-disc pl-5">
          <li>
            좌측 메뉴는 <b>route-meta</b> 가 <code>routes.tsx</code> 에서 파생시킨다.
          </li>
          <li>
            hooks 화면의 상태는 <b>hooks</b> 의 <code>useUrlQuery</code> 로 URL 에 유지된다.
          </li>
          <li>
            network 화면은 <b>network</b> 로 목 서버를 호출한다.
          </li>
          <li>
            그리고 전부 <b>ui</b> 로 그려진다.
          </li>
        </ul>
      </TxCard.Content>
    </TxCard>

    <div className="grid gap-3 md:grid-cols-2">
      {PACKAGES.map((pkg) => (
        <Link key={pkg.name} to={pkg.to}>
          <TxCard caption={pkg.name} className="h-full transition-colors hover:border-blue-400">
            <TxCard.Content className="text-sm text-slate-600 dark:text-slate-300">{pkg.desc}</TxCard.Content>
          </TxCard>
        </Link>
      ))}
    </div>

    <TxCard caption="서브패스 분리 확인">
      <TxCard.Content className="text-sm text-slate-600 dark:text-slate-300">
        <b>AgGrid ↗</b> 와 <b>DayPicker ↗</b> 는 <code>@txstack/ui/aggrid</code> · <code>@txstack/ui/daypicker</code> 서브패스에서 온다. 개발자도구 Network 탭을 열고 이 두 메뉴로 이동하면, 그때 처음으로 ag-grid / react-day-picker 청크가 받아진다.
        다른 화면에서는 받지 않는다.
      </TxCard.Content>
    </TxCard>
  </TxFlex>
);
