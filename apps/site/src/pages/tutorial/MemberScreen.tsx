import { useEffect, useState } from "react";
import { parseApiError } from "@txstack/axios";
import { useUrlQuery } from "@txstack/hooks/useUrlQuery";
import { TxButton, TxCard, TxDialog, TxEmptyState, TxForm, TxPagination, TxSearchInput, TxToast } from "@txstack/ui";
import { api, type Member, type MemberPage } from "./memberApi";

const PAGE_SIZE = 5;

export function MemberScreen() {
  // 검색어와 페이지는 주소에 담습니다. 새로고침하거나 주소를 공유해도 같은 화면이 열립니다
  const [query, setQuery] = useUrlQuery({ defaults: { q: "", page: 1 } });

  const [data, setData] = useState<MemberPage>({ rows: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(0);

  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ name: "", email: "" });
  const [error, setError] = useState<string>();

  // 조건이 바뀔 때마다 목록을 다시 불러옵니다
  useEffect(() => {
    let alive = true;
    setLoading(true);

    api
      .get<MemberPage>("/members", { q: query.q, page: query.page, size: PAGE_SIZE })
      .then((page) => alive && setData(page))
      .catch((err) => TxToast.show({ variant: "danger", title: "목록을 불러오지 못했습니다", message: parseApiError(err).message }))
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, [query.q, query.page, reload]);

  const search = (q: string) => setQuery({ q, page: 1 });

  const submit = async () => {
    if (!draft.name.trim()) return setError("이름을 입력해 주세요");

    try {
      const member = await api.post<Member>("/members", draft);
      setAdding(false);
      setDraft({ name: "", email: "" });
      setError(undefined);
      TxToast.show({ variant: "success", title: "등록했습니다", message: `${member.name} (${member.id})` });
      setReload((n) => n + 1);
    } catch (err) {
      setError(parseApiError(err).message);
    }
  };

  const remove = async (member: Member) => {
    const yes = await TxDialog.confirm({ title: "회원을 삭제할까요?", message: `${member.name} 님의 정보가 삭제됩니다.`, tone: "danger", confirmLabel: "삭제" });
    if (!yes) return;

    await api.delete(`/members/${member.id}`);
    TxToast.show({ variant: "info", title: "삭제했습니다" });
    setReload((n) => n + 1);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <TxSearchInput placeholder="이름, 메일로 검색" aria-label="회원 검색" defaultValue={query.q} className="w-56" onSubmitText={search} onClear={() => search("")} />
        <span className="text-sm text-slate-500 dark:text-slate-400">{loading ? "불러오는 중…" : `${data.total}명`}</span>
        <TxButton label={adding ? "닫기" : "회원 등록"} variant={adding ? "secondary" : "primary"} className="ms-auto" onClick={() => setAdding((prev) => !prev)} />
      </div>

      {adding && (
        <TxCard title="회원 등록">
          <TxForm noValidate labelWidth="3.5rem" onSubmit={() => void submit()}>
            <TxForm.Input caption="이름" placeholder="홍길동" value={draft.name} onChangeText={(name) => setDraft((prev) => ({ ...prev, name }))} error={error} required />
            <TxForm.Input caption="메일" type="email" placeholder="you@company.com" value={draft.email} onChangeText={(email) => setDraft((prev) => ({ ...prev, email }))} />

            <div className="flex justify-end gap-2">
              <TxButton type="button" label="취소" variant="secondary" onClick={() => setAdding(false)} />
              <TxButton type="submit" label="저장" />
            </div>
          </TxForm>
        </TxCard>
      )}

      {!loading && data.rows.length === 0 ? (
        <TxEmptyState variant="no-result" title="검색 결과가 없습니다" description="검색어를 바꿔 보세요">
          <TxButton label="조건 지우기" variant="secondary" onClick={() => search("")} />
        </TxEmptyState>
      ) : (
        <div className="overflow-x-auto rounded-lg border" style={{ borderColor: "var(--tx-color-border)", opacity: loading ? 0.6 : 1 }}>
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
              {data.rows.map((row) => (
                <tr key={row.id} className="border-t" style={{ borderColor: "var(--tx-color-border)" }}>
                  <td className="px-3 py-2">{row.name}</td>
                  <td className="px-3 py-2">{row.email}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{row.joinedAt}</td>
                  <td className="px-3 py-2 text-end">
                    <TxButton label="삭제" variant="text" onClick={() => remove(row)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex justify-center">
        <TxPagination currentPage={query.page} totalRows={data.total} pageSize={PAGE_SIZE} onChangePage={(page) => setQuery({ page })} />
      </div>
    </div>
  );
}
