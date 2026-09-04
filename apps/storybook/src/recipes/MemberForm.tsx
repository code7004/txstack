import { useState, type FormEvent } from "react";
import { TxButton, TxDialog, TxDivider, TxForm, TxToast } from "@txstack/ui";

import { EMPTY_MEMBER, MemberSaveError, ROLE_OPTIONS, saveMember, type Member, type Role } from "./members";

/** 클래스 둘을 잇는 것뿐. `clsx` 를 따로 깔지 않으려고 여기서 짧게 쓴다. */
const cm = (...names: (string | undefined)[]) => names.filter(Boolean).join(" ");

/**
 * 등록과 수정이 **함께 쓰는 폼.** 등록 화면에도, 목록 옆 슬라이드 패널에도 이것 하나가 들어간다.
 *
 * 라이브러리가 하는 일과 앱이 하는 일이 여기서 갈린다.
 *
 * | | |
 * | --- | --- |
 * | `TxForm` 이 하는 것 | 캡션·메시지를 컨트롤과 **잇는 배선**, 메시지 자리 잡기, 라벨 폭 맞추기 |
 * | 앱이 하는 것 | **무엇이 잘못인지 판정**하고 `error` · `warning` 에 글자를 넣는 것 |
 *
 * 검증 라이브러리를 쓰든 손으로 짜든 폼 컴포넌트는 상관하지 않는다.
 */
export interface MemberFormProps {
  /** 주면 수정, 안 주면 등록이다. */
  value?: Member;
  /**
   * 캡션을 왼쪽에 세우는 폭. 안 주면 넓은 배치는 `5rem`, 좁은 배치(`single`)는 **캡션이 위로** 간다.
   *
   * 빈 문자열(`""`)로는 못 끈다 — 그것도 값이라 CSS 변수가 그대로 선다. 끄려면 주지 않는다.
   */
  labelWidth?: string;
  /** 한 줄에 한 칸씩만 놓는다. 좁은 자리에서 켠다. */
  single?: boolean;
  onDone?: (member: Member) => void;
  onCancel?: () => void;
}

type Errors = Partial<Record<keyof Member, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PERSONAL = ["gmail.com", "naver.com", "daum.net", "hanmail.net"];

/**
 * **에러와 경고는 다르다.** 에러는 저장을 막고, 경고는 알리기만 한다 —
 * `TxForm` 은 둘을 같은 자리에 그리고 **에러가 있으면 에러를 보여 준다.**
 */
function validate(draft: Member): { errors: Errors; warnings: Errors } {
  const errors: Errors = {};
  const warnings: Errors = {};

  if (!draft.name.trim()) errors.name = "이름을 넣어야 한다";
  if (!draft.email.trim()) errors.email = "메일을 넣어야 한다";
  else if (!EMAIL.test(draft.email.trim())) errors.email = "메일 형태가 아니다";

  if (draft.phone && !/^[\d-]+$/.test(draft.phone)) errors.phone = "숫자와 - 만 넣는다";
  if (draft.point < 0) errors.point = "0 보다 작을 수 없다";

  const domain = draft.email.split("@")[1]?.toLowerCase();
  if (domain && PERSONAL.includes(domain)) warnings.email = "회사 메일이 아니다. 그대로 저장은 된다";
  if (draft.memo.length > 100) warnings.memo = `메모가 길다 (${draft.memo.length}자)`;

  return { errors, warnings };
}

export function MemberForm({ value, labelWidth, single = false, onDone, onCancel }: MemberFormProps) {
  const [draft, setDraft] = useState<Member>(value ?? EMPTY_MEMBER);
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  const dirty = JSON.stringify(draft) !== JSON.stringify(value ?? EMPTY_MEMBER);
  const { errors: found, warnings } = validate(draft);

  const set =
    <K extends keyof Member>(key: K) =>
    (next: Member[K]) => {
      setDraft((prev) => ({ ...prev, [key]: next }));

      // 고치기 시작하면 그 칸의 에러는 지운다. 고치는 중에 빨간 글자가 남아 있으면 방해만 된다
      setErrors((prev) => (key in prev ? { ...prev, [key]: undefined } : prev));
    };

  const hdSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // 제출할 때 한 번에 판정한다 — 글자를 넣는 동안 빨간 글자가 따라다니면 쓰기 어렵다
    if (Object.keys(found).length) {
      setErrors(found);
      return;
    }

    setSaving(true);

    try {
      const saved = await saveMember(draft);
      TxToast.show({ variant: "success", title: "저장했다", message: `${saved.name} (${saved.id})` });
      onDone?.(saved);
    } catch (error) {
      // 서버가 필드 단위로 돌려준 것을 그 칸에 다시 칠한다
      if (error instanceof MemberSaveError) setErrors(error.fields);
      TxToast.show({ variant: "danger", title: "저장하지 못했다", message: "빨간 글자가 붙은 칸을 고쳐 보라" });
    } finally {
      setSaving(false);
    }
  };

  const hdCancel = async () => {
    // 고친 것이 있을 때만 묻는다. 아무것도 안 고쳤는데 물으면 성가시다
    if (dirty && !(await TxDialog.confirm({ title: "그만둘까", message: "고친 내용은 저장되지 않는다.", confirmLabel: "그만둔다", cancelLabel: "계속 쓴다", tone: "danger" }))) return;

    onCancel?.();
  };

  const span = single ? undefined : "sm:col-span-2";

  // 좁은 자리에서는 캡션이 위로 간다. 라벨 폭을 잡아 두면 글자가 들어갈 칸이 남지 않는다
  const captionWidth = labelWidth ?? (single ? undefined : "5rem");

  return (
    /*
      **`noValidate` 를 준다.** 안 주면 브라우저가 먼저 나서서 `required` 인 칸에 자기
      말풍선을 띄우고 제출을 막는다 — 우리 메시지는 뜨지도 않고, 그 말풍선은 문구도
      겉모습도 우리가 손댈 수 없다. `required` 는 그대로 둔다: 스크린리더에 "필수" 로 전달된다.
    */
    <TxForm noValidate labelWidth={captionWidth} className={single ? "flex flex-col" : "grid gap-x-6 sm:grid-cols-2"} onSubmit={hdSubmit}>
      {/* 필수 표시는 앱이 그린다 — 별표를 붙일지 "(필수)" 로 쓸지는 화면마다 다르다 */}
      <TxForm.Input
        caption={
          <>
            이름 <span className="text-rose-500">*</span>
          </>
        }
        placeholder="홍길동"
        value={draft.name}
        onChangeText={set("name")}
        error={errors.name}
        required
      />

      <TxForm.Input
        caption={
          <>
            메일 <span className="text-rose-500">*</span>
          </>
        }
        type="email"
        placeholder="name@company.com"
        autoComplete="email"
        value={draft.email}
        onChangeText={set("email")}
        error={errors.email}
        warning={warnings.email}
        required
      />

      <TxForm.Input caption="연락처" placeholder="010-0000-0000" inputMode="tel" value={draft.phone} onChangeText={set("phone")} error={errors.phone} />

      <TxForm.Dropdown caption="권한" data={ROLE_OPTIONS} value={draft.role} onChangeText={(next) => set("role")((next ?? "viewer") as Role)} placeholder="고르세요" />

      <TxDivider className={span}>추가 정보</TxDivider>

      <TxForm.Input caption="포인트" type="number" min={0} value={String(draft.point)} onChangeText={(next) => set("point")(Number(next || 0))} error={errors.point} />

      <TxForm.CheckBox caption="상태" label="계정을 바로 쓸 수 있게 한다" checked={draft.active} onChangeBool={set("active")} />

      <TxForm.Textarea caption="메모" rows={3} className={span} placeholder="상담 이력 · 특이사항" value={draft.memo} onChangeText={set("memo")} warning={warnings.memo} />

      {/*
        버튼 줄에는 `TxForm.Flex` 를 쓰지 않는다 — 그건 **한 줄에 여러 칸을 놓는 자리**라
        자식이 폭을 똑같이 나눠 갖는다. 버튼까지 줄 전체로 늘어나면 눌러야 할 곳이 흐려진다.
      */}
      <div className={cm("flex justify-end gap-2", span)}>
        <TxButton type="button" label="취소" variant="secondary" onClick={hdCancel} />
        <TxButton type="submit" label={saving ? "저장 중" : "저장"} disabled={saving} />
      </div>
    </TxForm>
  );
}
