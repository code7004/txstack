import { useState } from "react";
import { TxAlert, TxButton, TxDropdown, TxEmptyState, TxForm, TxModal, TxSearchInput, TxSkeleton, TxTag, TxToast, type TxTagVariant } from "@txstack/ui";

/**
 * 첫 화면의 대표 데모 — **팀원 관리 화면의 작은 일부.** 검색 · 필터 → 목록 · 상태 표시 → 편집 창 → 저장 → 알림이
 * 실제로 동작한다. 데이터는 이 파일 안의 샘플이라 외부 요청이 없고, 새로고침하면 처음으로 돌아간다.
 *
 * 표는 가벼운 손 표다. AG Grid 는 무거워서 홈에서 불러오지 않는다 — 큰 표는 Example 로 보낸다.
 */

type Status = "active" | "invited" | "suspended";

interface Member {
  id: number;
  name: string;
  team: string;
  status: Status;
}

const STATUS: Record<Status, { name: string; variant: TxTagVariant }> = {
  active: { name: "사용 중", variant: "success" },
  invited: { name: "초대됨", variant: "info" },
  suspended: { name: "정지", variant: "danger" }
};

const STATUS_ITEMS = (Object.keys(STATUS) as Status[]).map((value) => ({ name: STATUS[value].name, value }));

const SAMPLE: Member[] = [
  { id: 1, name: "김하늘", team: "플랫폼", status: "active" },
  { id: 2, name: "박도윤", team: "결제", status: "invited" },
  { id: 3, name: "이서아", team: "검색", status: "active" },
  { id: 4, name: "최민준", team: "데이터", status: "suspended" },
  { id: 5, name: "정유나", team: "플랫폼", status: "active" }
];

/** 화면이 겪는 네 가지 상태. 실제 앱이라면 요청 결과가 정한다 — 여기서는 골라서 본다 */
type View = "data" | "loading" | "empty" | "error";

const VIEWS: { name: string; value: View }[] = [
  { name: "데이터", value: "data" },
  { name: "불러오는 중", value: "loading" },
  { name: "결과 없음", value: "empty" },
  { name: "오류", value: "error" }
];

export function HomePreview() {
  const [members, setMembers] = useState(SAMPLE);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("");
  const [view, setView] = useState<View>("data");
  const [editing, setEditing] = useState<Member | null>(null);

  const keyword = q.trim();
  const rows = view === "empty" ? [] : members.filter((member) => (!keyword || member.name.includes(keyword) || member.team.includes(keyword)) && (!status || member.status === status));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <TxSearchInput aria-label="팀원 검색" placeholder="이름, 팀" value={q} onChangeText={setQ} onClear={() => setQ("")} className="min-w-0 flex-1" />
        <TxDropdown aria-label="상태" data={[{ name: "모든 상태", value: "" }, ...STATUS_ITEMS]} value={status} onChangeText={(value) => setStatus(value ?? "")} className="w-32" />
      </div>

      {view === "loading" ? (
        <div className="flex flex-col gap-2" aria-label="불러오는 중">
          {Array.from({ length: 4 }, (_, index) => (
            <TxSkeleton key={index} height="2.25rem" />
          ))}
        </div>
      ) : view === "error" ? (
        <TxAlert variant="danger" title="목록을 불러오지 못했습니다">
          <div className="flex flex-col items-start gap-2">
            잠시 후 다시 시도해 주세요.
            <TxButton label="다시 시도" variant="secondary" onClick={() => setView("data")} />
          </div>
        </TxAlert>
      ) : rows.length === 0 ? (
        <TxEmptyState variant="no-result" title="찾는 팀원이 없습니다" description="검색어나 상태를 바꿔 보세요">
          <TxButton
            label="조건 지우기"
            variant="secondary"
            onClick={() => {
              setQ("");
              setStatus("");
              setView("data");
            }}
          />
        </TxEmptyState>
      ) : (
        <div className="overflow-x-auto rounded-lg border" style={{ borderColor: "var(--tx-color-border)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-start" style={{ backgroundColor: "var(--tx-color-muted)" }}>
                <th className="px-3 py-2 text-start font-semibold">이름</th>
                <th className="hidden px-3 py-2 text-start font-semibold sm:table-cell">팀</th>
                <th className="px-3 py-2 text-start font-semibold">상태</th>
                <th className="px-3 py-2">
                  <span className="sr-only">편집</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((member) => (
                <tr key={member.id} className="border-t" style={{ borderColor: "var(--tx-color-border)" }}>
                  <td className="px-3 py-1.5">{member.name}</td>
                  <td className="hidden px-3 py-1.5 text-slate-600 sm:table-cell dark:text-slate-300">{member.team}</td>
                  <td className="px-3 py-1.5">
                    <TxTag variant={STATUS[member.status].variant} dot>
                      {STATUS[member.status].name}
                    </TxTag>
                  </td>
                  <td className="px-3 py-1.5 text-end">
                    <TxButton label="편집" aria-label={`${member.name} 편집`} variant="text" onClick={() => setEditing(member)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
        <span>샘플 데이터로 동작하는 데모입니다</span>
        <span className="flex items-center gap-2">
          <span aria-hidden>화면 상태</span>
          <TxDropdown aria-label="화면 상태" data={VIEWS} value={view} onChangeText={(value) => setView((value as View) ?? "data")} className="w-32 text-sm" />
        </span>
      </div>

      <EditMember
        member={editing}
        onClose={() => setEditing(null)}
        onSave={(next) => {
          setMembers((prev) => prev.map((member) => (member.id === next.id ? next : member)));
          setEditing(null);
          TxToast.show({ variant: "success", title: "저장했습니다", message: `${next.name} · ${STATUS[next.status].name}` });
        }}
      />
    </div>
  );
}

/** 편집 창. 이름을 비우면 저장하지 않고 칸 아래에 이유를 보인다 */
function EditMember({ member, onClose, onSave }: { member: Member | null; onClose: () => void; onSave: (member: Member) => void }) {
  return (
    <TxModal open={member !== null} onClose={onClose} title="팀원 편집" size="sm">
      {member && <EditForm key={member.id} member={member} onClose={onClose} onSave={onSave} />}
    </TxModal>
  );
}

function EditForm({ member, onClose, onSave }: { member: Member; onClose: () => void; onSave: (member: Member) => void }) {
  const [draft, setDraft] = useState(member);
  const [error, setError] = useState<string>();

  return (
    <TxForm
      noValidate
      onSubmit={() => {
        if (!draft.name.trim()) return setError("이름을 입력해 주세요");
        onSave({ ...draft, name: draft.name.trim() });
      }}
    >
      <TxForm.Input
        caption="이름"
        value={draft.name}
        onChangeText={(name) => {
          setDraft((prev) => ({ ...prev, name }));
          if (error && name.trim()) setError(undefined);
        }}
        error={error}
        required
      />
      <TxForm.Dropdown caption="상태" data={STATUS_ITEMS} value={draft.status} onChangeText={(value) => setDraft((prev) => ({ ...prev, status: (value as Status) ?? prev.status }))} />
      <TxForm.Flex>
        <TxButton type="button" label="취소" variant="secondary" onClick={onClose} />
        <TxButton type="submit" label="저장" />
      </TxForm.Flex>
    </TxForm>
  );
}
