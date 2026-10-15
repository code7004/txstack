import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { TxAppShell, TxButton, TxDialog, TxDropdown, TxForm, TxPagination, TxTag, TxToast, type TxButtonProps } from "@txstack/ui";
import "@txstack/ui/styles.css";

// 루트 진입점만 쓴다. 표(aggrid)와 달력(daypicker)은 설치하지 않았다 — 그래도 타입 검사와 빌드가 돼야 한다
const save: TxButtonProps["onClick"] = async () => {
  if (await TxDialog.confirm("저장할까요?")) TxToast.show({ variant: "success", title: "저장했습니다" });
};

function App() {
  const [page, setPage] = useState(1);
  return (
    <TxAppShell header={<strong>verify</strong>}>
      <TxForm noValidate onSubmit={() => undefined}>
        <TxForm.Input caption="이름" required />
        <TxDropdown aria-label="상태" data={["사용", "정지"]} />
      </TxForm>
      <TxTag variant="success" dot>
        사용 중
      </TxTag>
      <TxPagination currentPage={page} totalRows={100} onChangePage={setPage} />
      <TxButton label="저장" onClick={save} />
    </TxAppShell>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
