import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { parseApiError } from "@txstack/axios";
import { TxAlert, TxButton, TxForm, TxSlidePanel, TxToast } from "@txstack/ui";
import { ROLES, STATUSES, TEAMS, accountApi, type Account, type AccountDraft } from "./accountApi";

type Errors = Partial<Record<keyof AccountDraft | "confirm", string>>;

const EMPTY: AccountDraft = { username: "", name: "", email: "", role: "member", status: "invited", teams: [], password: "" };

/** 검사 규칙은 앱이 정합니다. 비밀번호는 새로 만들 때만 검사합니다 */
function validate(draft: AccountDraft, confirm: string, creating: boolean): Errors {
  return {
    username: /^[a-z][a-z0-9._]{2,19}$/.test(draft.username) ? undefined : "영문 소문자로 시작하는 3~20자로 입력해 주세요",
    name: draft.name.trim() ? undefined : "이름을 입력해 주세요",
    email: /^\S+@\S+\.\S+$/.test(draft.email) ? undefined : "올바른 메일 형식이 아닙니다",
    teams: draft.teams.length ? undefined : "팀을 하나 이상 골라 주세요",
    password: !creating || (draft.password?.length ?? 0) >= 8 ? undefined : "8자 이상 입력해 주세요",
    confirm: !creating || confirm === draft.password ? undefined : "비밀번호가 다릅니다"
  };
}

interface Props {
  /** `null` 이면 닫힘, `"new"` 면 새 계정, 계정이면 그 계정을 고칩니다 */
  target: Account | "new" | null;
  onClose: () => void;
  onSaved: () => void;
}

/** 옆에서 열리는 계정 폼. 목록을 그대로 둔 채 만들고 고칩니다 */
export function AccountForm({ target, onClose, onSaved }: Props) {
  return (
    <TxSlidePanel open={target !== null} onClose={onClose} side="right" title={target === "new" ? "새 계정" : target ? `${target.name} 고치기` : undefined}>
      {/* 열 때마다 새로 그려 이전 입력이 남지 않게 합니다 */}
      {target !== null && <AccountFormBody key={target === "new" ? "new" : target.id} target={target} onClose={onClose} onSaved={onSaved} />}
    </TxSlidePanel>
  );
}

function AccountFormBody({ target, onClose, onSaved }: { target: Account | "new"; onClose: () => void; onSaved: () => void }) {
  const creating = target === "new";
  const [draft, setDraft] = useState<AccountDraft>(creating ? EMPTY : { ...target, password: undefined });
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  const set = <K extends keyof AccountDraft>(key: K, value: AccountDraft[K]) => {
    const next = { ...draft, [key]: value };
    setDraft(next);
    // 한 번 오류가 난 칸은 고치는 즉시 다시 검사합니다
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: validate(next, confirm, creating)[key] }));
  };

  const queryClient = useQueryClient();
  const save = useMutation({
    mutationFn: (next: AccountDraft) => (creating ? accountApi.create(next) : accountApi.update(target.id, next)),
    onSuccess: (saved) => {
      TxToast.show({ variant: "success", title: creating ? "계정을 만들었습니다" : "저장했습니다", message: `${saved.name} (${saved.username})` });
      // 목록이 다시 불리도록 낡은 것으로 표시합니다
      void queryClient.invalidateQueries({ queryKey: ["accounts"] });
      onSaved();
    }
  });

  const submit = () => {
    const found = validate(draft, confirm, creating);
    setErrors(found);
    if (!Object.values(found).some(Boolean)) save.mutate(draft);
  };

  return (
    <TxForm noValidate onSubmit={submit}>
      {/* 409(아이디 중복) 같은 서버의 거절은 폼 위에 그대로 보여 줍니다 */}
      {save.error && (
        <TxAlert variant="danger" title="저장하지 못했습니다">
          {parseApiError(save.error).message}
        </TxAlert>
      )}

      <TxForm.Input caption="아이디" value={draft.username} onChangeText={(value) => set("username", value.toLowerCase())} error={errors.username} autoComplete="off" required />
      <TxForm.Input caption="이름" value={draft.name} onChangeText={(value) => set("name", value)} error={errors.name} required />
      <TxForm.Input caption="메일" type="email" value={draft.email} onChangeText={(value) => set("email", value)} error={errors.email} required />

      {creating && (
        <>
          <TxForm.Input caption="비밀번호" type="password" value={draft.password ?? ""} onChangeText={(value) => set("password", value)} error={errors.password} autoComplete="new-password" required />
          <TxForm.Input caption="비밀번호 확인" type="password" value={confirm} onChangeText={setConfirm} error={errors.confirm} autoComplete="new-password" required />
        </>
      )}

      <TxForm.Dropdown caption="역할" data={ROLES} value={draft.role} onChangeText={(value) => set("role", value as AccountDraft["role"])} />
      <TxForm.Dropdown caption="상태" data={STATUSES} value={draft.status} onChangeText={(value) => set("status", value as AccountDraft["status"])} />
      <TxForm.DropdownMulti caption="팀" data={TEAMS} value={draft.teams} onChangeText={(values) => set("teams", values)} placeholder="고르세요" error={errors.teams} />

      <TxForm.Flex>
        <TxButton type="button" label="취소" variant="secondary" onClick={onClose} />
        <TxButton type="submit" label={creating ? "만들기" : "저장"} disabled={save.isPending} />
      </TxForm.Flex>
    </TxForm>
  );
}
