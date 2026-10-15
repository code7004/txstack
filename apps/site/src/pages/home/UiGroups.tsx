import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { TxAlert, TxBreadcrumb, TxButton, TxDialog, TxForm, TxPagination, TxSkeleton, TxTabs, TxTag, TxToast } from "@txstack/ui";
import { Used } from "../../components/Used";

/**
 * UI 를 **기능군으로** 보여 준다. 군마다 작은 실물 하나와 대표 컴포넌트 이름(→ API › ui)을 둔다.
 * 전체 목록과 변형은 Components 갤러리와 Storybook 이 갖는다 — 여기서는 범위만 보인다.
 */
export function UiGroups() {
  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      <Group title="입력과 폼" result="입력 · 선택 · 검증 메시지를 갖춘 폼" used={["TxForm", "TxInput", "TxDropdown", "TxCheckBox"]}>
        <FormMini />
      </Group>
      <Group title="데이터와 목록" result="상태 표시와 페이지 이동이 있는 목록. 큰 표는 TxAgGrid" used={["TxAgGrid", "TxPagination", "TxTag"]}>
        <ListMini />
      </Group>
      <Group title="창과 피드백" result="확인을 묻고, 처리 결과를 알리는 창" used={["TxDialog", "TxToast", "TxModal", "TxSlidePanel"]}>
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

function Group({ title, result, used, children }: { title: string; result: string; used: string[]; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-lg border p-4" style={{ borderColor: "var(--tx-color-border)", backgroundColor: "var(--tx-color-surface)" }}>
      <header className="flex flex-col gap-0.5">
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300">{result}</p>
      </header>
      <div className="flex-1">{children}</div>
      <Used names={used} label="컴포넌트" />
    </section>
  );
}

function FormMini() {
  const [email, setEmail] = useState("kim@");
  const error = email && !/^\S+@\S+\.\S+$/.test(email) ? "메일 형식이 아닙니다" : undefined;

  return (
    <TxForm noValidate onSubmit={() => undefined}>
      <TxForm.Input caption="메일" value={email} onChangeText={setEmail} error={error} />
      <TxForm.CheckBox caption="약관" label="이용약관에 동의합니다" />
    </TxForm>
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

function FeedbackMini() {
  return (
    <div className="flex flex-wrap gap-2">
      <TxButton
        label="삭제 (확인 창)"
        variant="danger"
        onClick={async () => {
          const yes = await TxDialog.confirm({ title: "항목을 삭제할까요?", message: "샘플이라 실제로 지워지지는 않습니다.", tone: "danger", confirmLabel: "삭제" });
          TxToast.show(yes ? { variant: "info", title: "삭제했습니다" } : { title: "취소했습니다" });
        }}
      />
      <TxButton label="저장 (알림)" variant="secondary" onClick={() => void TxToast.show({ variant: "success", title: "저장했습니다" })} />
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
