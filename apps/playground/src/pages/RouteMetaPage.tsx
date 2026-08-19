import { getNavigableRoutes, useCurrentRouteNode, type RouteNode, type RouteTree } from "@txstack/route-meta";
import { TxCard, TxFlex, TxJsonTree } from "@txstack/ui";
import { useOutletContext } from "react-router-dom";
import { StateBox } from "./StateBox";

/** 메뉴 파생 결과를 보기 좋게 요약 (element 는 React 노드라 직렬화에서 뺀다) */
function summarize(nodes: RouteNode[]): unknown[] {
  return nodes.map((node) => ({
    path: node.path,
    label: node.meta?.label,
    hidden: node.meta?.hidden ?? false,
    enabled: node.enabled ?? true
  }));
}

export const RouteMetaPage = () => {
  // 트리는 Shell 이 Outlet context 로 내려준다. 직접 import 하면 menu.tsx 와 순환 참조가 된다.
  const tree = useOutletContext<RouteTree>();
  const current = useCurrentRouteNode(tree);

  const declared = Object.values(tree);
  const navigable = getNavigableRoutes(tree);

  return (
    <TxFlex className="flex-col gap-4">
      <TxCard caption="이 화면의 좌측 메뉴는 하드코딩이 아니다">
        <TxCard.Content className="text-sm text-slate-600 dark:text-slate-300">
          <code>menu.tsx</code> 의 <code>RouteTree</code> 하나에서 라우터(<code>RouteRenderer</code>)와 메뉴(<code>getNavigableRoutes</code>)가 모두 파생된다. 아래 두 목록의 개수 차이가 그 증거다.
        </TxCard.Content>
      </TxCard>

      <TxCard caption={`선언된 라우트 ${declared.length}개 → 메뉴에 노출 ${navigable.length}개`}>
        <TxCard.Content className="grid gap-4 md:grid-cols-2">
          <div>
            <div className="pb-1 text-xs font-bold text-slate-500 dark:text-slate-400">선언 전체</div>
            <TxJsonTree data={summarize(declared)} isRootType />
          </div>
          <div>
            <div className="pb-1 text-xs font-bold text-slate-500 dark:text-slate-400">getNavigableRoutes 결과</div>
            <TxJsonTree data={summarize(navigable)} isRootType />
          </div>
        </TxCard.Content>
      </TxCard>

      <TxCard caption="필터링 규칙">
        <TxCard.Content>
          <ul className="list-disc pl-5 text-sm text-slate-600 dark:text-slate-300">
            <li>
              <code>/disabled</code> — <code>enabled: false</code> 라 라우터에도, 메뉴에도 없다.
            </li>
            <li>
              <code>/hidden</code> — <code>meta.hidden: true</code> 라 메뉴에는 없지만 URL 로는 접근된다. 주소창에 직접 쳐보라.
            </li>
            <li>
              <code>index: true</code> 인 홈은 메뉴에서 빠진다. 좌측 상단 로고가 홈 링크다.
            </li>
            <li>
              <code>meta.permissions</code> 가 있으면 권한이 맞을 때만 노출된다.
            </li>
          </ul>
        </TxCard.Content>
      </TxCard>

      <StateBox caption="useCurrentRouteNode — 현재 매칭된 노드" value={{ pathname: current.pathname, meta: current.meta, params: current.params }} />
    </TxFlex>
  );
};
