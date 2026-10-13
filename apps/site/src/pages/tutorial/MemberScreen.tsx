import { useMemo, useState } from "react";
import { TxButton, TxCard, TxDialog, TxEmptyState, TxForm, TxPagination, TxSearchInput, TxToast } from "@txstack/ui";

interface Member {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
}

const NAMES = ["김하늘", "박도윤", "이서아", "최민준", "정유나", "한지호", "오세린"];

const SEED: Member[] = Array.from({ length: 23 }, (_, index) => ({
  id: `M-${1041 + index}`,
  name: `${NAMES[index % NAMES.length]}${index < NAMES.length ? "" : ` ${Math.floor(index / NAMES.length) + 1}`}`,
  email: `user${index + 1}@example.com`,
  joinedAt: `2025-${String((index % 12) + 1).padStart(2, "0")}-1${index % 9}`
}));

const PAGE_SIZE = 5;

/** 예제라 데이터는 이 파일 안에 있다. 실제 앱에서는 `rows` 를 API 에서 받는다 */
export function MemberScreen() {
  const [rows, setRows] = useState(SEED);
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ name: "", email: "" });
  const [error, setError] = useState<string>();

  const found = useMemo(() => rows.filter((row) => `${row.name} ${row.email}`.toLowerCase().includes(keyword.toLowerCase())), [rows, keyword]);
  const shown = found.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const search = (next: string) => {
    setKeyword(next);
    setPage(1);
  };

  const submit = () => {
    if (!draft.name.trim()) return setError("이름을 넣어야 한다");

    const member: Member = { id: `M-${1041 + rows.length}`, name: draft.name, email: draft.email || "—", joinedAt: "2026-09-02" };
    setRows((prev) => [member, ...prev]);
    setAdding(false);
    setDraft({ name: "", email: "" });
    setError(undefined);
    TxToast.show({ variant: "success", title: "등록했다", message: `${member.name} (${member.id})` });
  };

  const remove = async (member: Member) => {
    if (!(await TxDialog.confirm({ title: "지울까", message: `${member.name} 을(를) 지운다.`, tone: "danger", confirmLabel: "지운다" }))) return;

    setRows((prev) => prev.filter((row) => row.id !== member.id));
    TxToast.show({ variant: "info", title: "지웠다" });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <TxSearchInput placeholder="이름 · 메일로 찾기" aria-label="회원 검색" className="w-56" onSubmitText={search} onClear={() => search("")} />
        <span className="text-sm text-slate-500 dark:text-slate-400">{found.length}명</span>
        <TxButton label={adding ? "닫기" : "회원 등록"} variant={adding ? "secondary" : "primary"} className="ms-auto" onClick={() => setAdding((prev) => !prev)} />
      </div>

      {adding && (
        <TxCard title="회원 등록">
          <TxForm
            noValidate
            labelWidth="3.5rem"
            onSubmit={(event) => {
              event.preventDefault();
              submit();
            }}
          >
            <TxForm.Input caption="이름" placeholder="홍길동" value={draft.name} onChangeText={(name) => setDraft((prev) => ({ ...prev, name }))} error={error} required />
            <TxForm.Input caption="메일" type="email" placeholder="you@company.com" value={draft.email} onChangeText={(email) => setDraft((prev) => ({ ...prev, email }))} />

            <div className="flex justify-end gap-2">
              <TxButton type="button" label="취소" variant="secondary" onClick={() => setAdding(false)} />
              <TxButton type="submit" label="저장" />
            </div>
          </TxForm>
        </TxCard>
      )}

      {shown.length === 0 ? (
        <TxEmptyState variant="no-result" title="찾은 회원이 없다" description="검색어를 바꿔 보라">
          <TxButton label="조건 지우기" variant="secondary" onClick={() => search("")} />
        </TxEmptyState>
      ) : (
        <div className="overflow-x-auto rounded-lg border" style={{ borderColor: "var(--tx-color-border)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: "var(--tx-color-muted)" }}>
                <th className="px-3 py-2 text-start font-semibold">이름</th>
                <th className="px-3 py-2 text-start font-semibold">메일</th>
                <th className="px-3 py-2 text-start font-semibold">가입일</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {shown.map((row) => (
                <tr key={row.id} className="border-t" style={{ borderColor: "var(--tx-color-border)" }}>
                  <td className="px-3 py-2">{row.name}</td>
                  <td className="px-3 py-2">{row.email}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{row.joinedAt}</td>
                  <td className="px-3 py-2 text-end">
                    <TxButton label="지우기" variant="text" onClick={() => remove(row)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex justify-center">
        <TxPagination currentPage={page} totalRows={found.length} pageSize={PAGE_SIZE} onChangePage={setPage} />
      </div>
    </div>
  );
}
