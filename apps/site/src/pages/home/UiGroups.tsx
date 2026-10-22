import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { TxAlert, TxBreadcrumb, TxPagination, TxSkeleton, TxTabs, TxTag } from "@txstack/ui";
import { CodeBlock } from "../../components/CodeBlock";
import { Used } from "../../components/Used";
import { FeedbackMini } from "./mini/FeedbackMini";
import FEEDBACK_SOURCE from "./mini/FeedbackMini.tsx?raw";
import { FormMini } from "./mini/FormMini";
import FORM_SOURCE from "./mini/FormMini.tsx?raw";

/**
 * UI 를 **기능군으로** 보여 준다. 군마다 작은 실물 하나와 대표 컴포넌트 이름(→ API › ui)을 둔다.
 * 전체 목록과 변형은 Components 갤러리와 Storybook 이 갖는다 — 여기서는 범위만 보인다.
 *
 * **두 칸(폼 · 창과 피드백)만 그 실물의 코드를 함께 보인다**(docs/reports/2026-10-22 R1). 코드 탭은 실물이 쓰는
 * 파일을 `?raw` 로 그대로 읽는다 — 보이는 코드와 도는 코드가 어긋날 수 없다. 모든 칸에 붙이지 않는다.
 */
export function UiGroups() {
  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      <Group
        title="입력과 폼"
        result="입력 · 선택 · 검증 메시지를 갖춘 폼"
        used={["TxForm", "TxInput", "TxDropdown", "TxCheckBox"]}
        code={FORM_SOURCE}
        split={{ parts: "캡션과 오류 메시지를 입력란에 잇고, 체크 · 입력의 모양을 맞춥니다", app: "검증 규칙과 제출 처리" }}
        more={{ to: "/docs/start#a-first-screen-with-ui", label: "전체 가입 폼 → Getting Started" }}
      >
        <FormMini />
      </Group>
      <Group title="데이터와 목록" result="상태 표시와 페이지 이동이 있는 목록. 큰 표는 TxAgGrid" used={["TxAgGrid", "TxPagination", "TxTag"]}>
        <ListMini />
      </Group>
      <Group
        title="창과 피드백"
        result="확인을 묻고, 처리 결과를 알리는 창"
        used={["TxDialog", "TxToast", "TxModal", "TxSlidePanel"]}
        code={FEEDBACK_SOURCE}
        split={{ parts: "확인 창의 포커스 · Escape · 층 순서, 알림의 자리와 사라지는 시간", app: "무엇을 물을지, 답에 따라 무엇을 할지" }}
        more={{ to: "/docs/guide/dialogs", label: "Dialogs & Toasts 가이드" }}
      >
        <FeedbackMini />
      </Group>
      <Group title="화면 구조" result="헤더 · 메뉴 · 본문을 갖춘 업무 화면의 틀" used={["TxAppShell", "TxSideNav", "TxTabs", "TxBreadcrumb"]}>
        <StructureMini />
      </Group>
      <Group title="상태 표시" result="대기 · 빈 결과 · 오류를 설명하는 화면" used={["TxSkeleton", "TxEmptyState", "TxAlert", "TxLoading"]}>
        <StateMini />
      </Group>
      <Link to="/docs/components" className="site-card flex flex-col justify-center gap-1 rounded-lg border p-4">
        <span className="font-semibold">전체 컴포넌트 보기 →</span>
        <span className="text-sm text-slate-600 dark:text-slate-300">분류마다 실제로 동작하는 갤러리. props와 모든 변형은 거기서 Storybook으로 이어집니다.</span>
      </Link>
    </div>
  );
}

interface GroupProps {
  title: string;
  result: string;
  used: string[];
  children: ReactNode;
  /** 실물의 소스. 주면 「결과 / 코드」 탭이 생긴다 */
  code?: string;
  /** 부품이 맡는 것과 앱이 하는 것 — 코드를 보인 칸에서만 */
  split?: { parts: string; app: string };
  more?: { to: string; label: string };
}

function Group({ title, result, used, children, code, split, more }: GroupProps) {
  return (
    <section className="flex min-w-0 flex-col gap-3 rounded-lg border p-4" style={{ borderColor: "var(--tx-color-border)", backgroundColor: "var(--tx-color-surface)" }}>
      <header className="flex flex-col gap-0.5">
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300">{result}</p>
      </header>
      <div className="min-w-0 flex-1">
        {code ? (
          <TxTabs
            aria-label={`${title} — 결과와 코드`}
            tabs={[
              { label: "결과", content: <div className="pt-3">{children}</div> },
              {
                label: "코드",
                content: (
                  <div className="pt-3">
                    <CodeBlock maxHeight="16rem">{code}</CodeBlock>
                  </div>
                )
              }
            ]}
          />
        ) : (
          children
        )}
      </div>
      {split && (
        <dl className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 text-xs text-slate-600 dark:text-slate-300">
          <dt className="font-semibold">부품이 맡는 것</dt>
          <dd>{split.parts}</dd>
          <dt className="font-semibold">앱이 하는 것</dt>
          <dd>{split.app}</dd>
        </dl>
      )}
      <Used names={used} label="컴포넌트" />
      {more && (
        <Link to={more.to} className="text-sm underline">
          {more.label}
        </Link>
      )}
    </section>
  );
}

const ROWS = [
  ["주문 1041", "success", "완료"],
  ["주문 1042", "warning", "대기"],
  ["주문 1043", "danger", "실패"]
] as const;

function ListMini() {
  const [page, setPage] = useState(1);

  return (
    <div className="flex flex-col gap-2">
      <ul className="flex flex-col text-sm">
        {ROWS.map(([name, variant, label]) => (
          <li key={name} className="flex items-center justify-between border-b py-1.5 last:border-b-0" style={{ borderColor: "var(--tx-color-border)" }}>
            <span>{name.replace(/\d+$/, (n) => String(Number(n) + (page - 1) * 3))}</span>
            <TxTag variant={variant} dot>
              {label}
            </TxTag>
          </li>
        ))}
      </ul>
      <TxPagination currentPage={page} totalRows={15} pageSize={3} onChangePage={setPage} hideGroupButtons />
    </div>
  );
}

function StructureMini() {
  return (
    <div className="flex flex-col gap-2">
      <TxBreadcrumb>
        <TxBreadcrumb.Item>운영</TxBreadcrumb.Item>
        <TxBreadcrumb.Item current>대시보드</TxBreadcrumb.Item>
      </TxBreadcrumb>
      <TxTabs
        aria-label="샘플 탭"
        tabs={[
          { label: "개요", content: <p className="pt-2 text-sm text-slate-600 dark:text-slate-300">탭 · 경로 표시 · 메뉴 · 화면 틀.</p> },
          { label: "설정", content: <p className="pt-2 text-sm text-slate-600 dark:text-slate-300">지금 이 사이트의 틀이 TxAppShell입니다.</p> }
        ]}
      />
    </div>
  );
}

function StateMini() {
  return (
    <div className="flex flex-col gap-2">
      <TxSkeleton height="1rem" />
      <TxSkeleton height="1rem" width="70%" />
      <TxAlert variant="warning" title="연결이 느립니다">
        잠시 후 다시 시도합니다.
      </TxAlert>
    </div>
  );
}
