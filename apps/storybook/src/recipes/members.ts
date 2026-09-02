import { useEffect, useState } from "react";

/**
 * 레시피가 함께 쓰는 **가짜 서버.**
 *
 * 진짜 fetch 도, 검증 라이브러리도, 상태 관리도 넣지 않는다 — 넣는 순간 "이 UI 를 쓰려면
 * react-query 가 필요한가?" 로 읽힌다. 여기서 흉내 내는 것은 **딱 두 가지**다:
 * 목록이 늦게 오는 것, 저장이 실패하며 **필드 에러를 돌려주는 것.**
 */

export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  point: number;
  joinedAt: string;
  active: boolean;
  memo: string;
}

export type Role = "admin" | "manager" | "viewer";

/** `TxDropdown` 은 `{ name, value }` 를 받는다. 보이는 글자와 보내는 값이 다를 때 쓴다. */
export const ROLE_OPTIONS = [
  { name: "관리자", value: "admin" },
  { name: "매니저", value: "manager" },
  { name: "일반", value: "viewer" }
] as const;

const NAMES = ["김하늘", "박도윤", "이서아", "최민준", "정유나", "한지호", "오세린", "장우진", "윤가온", "서다인"];

export const MEMBERS: Member[] = Array.from({ length: 47 }, (_, index) => ({
  id: `M-${1041 + index}`,
  name: `${NAMES[index % NAMES.length]}${index < NAMES.length ? "" : ` ${Math.floor(index / NAMES.length) + 1}`}`,
  email: `user${index + 1}@${index % 3 === 0 ? "example.com" : "gmail.com"}`,
  phone: `010-${String(1000 + index).slice(0, 4)}-${String(9000 - index).slice(0, 4)}`,
  role: (["admin", "manager", "viewer"] as const)[index % 3],
  point: [0, 890, 5120, 12400, 30250][index % 5],
  joinedAt: `2025-${String((index % 12) + 1).padStart(2, "0")}-${String((index % 27) + 1).padStart(2, "0")}`,
  active: index % 7 !== 0,
  memo: index % 5 === 0 ? "전화 상담 이력 있음" : ""
}));

export const EMPTY_MEMBER: Member = {
  id: "",
  name: "",
  email: "",
  phone: "",
  role: "viewer",
  point: 0,
  joinedAt: "",
  active: true,
  memo: ""
};

export interface MemberQuery {
  page: number;
  pageSize: number;
  keyword?: string;
  role?: Role | "";
}

export interface MemberPage {
  rows: Member[];
  total: number;
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** 서버 한 번 다녀오는 것을 흉내 낸다. 실제로는 이 자리에 fetch 가 온다. */
export function useMembers({ page, pageSize, keyword, role }: MemberQuery) {
  const [state, setState] = useState<{ data?: MemberPage; isLoading: boolean }>({ isLoading: true });

  useEffect(() => {
    let alive = true;
    setState((prev) => ({ ...prev, isLoading: true }));

    void wait(450).then(() => {
      if (!alive) return;

      const filtered = MEMBERS.filter((member) => {
        const hitKeyword = !keyword || `${member.name} ${member.email}`.toLowerCase().includes(keyword.toLowerCase());
        return hitKeyword && (!role || member.role === role);
      });

      setState({ isLoading: false, data: { rows: filtered.slice((page - 1) * pageSize, page * pageSize), total: filtered.length } });
    });

    return () => {
      alive = false;
    };
  }, [page, pageSize, keyword, role]);

  return state;
}

/** 저장이 필드 단위로 실패할 수 있다는 것을 알린다. */
export class MemberSaveError extends Error {
  constructor(readonly fields: Partial<Record<keyof Member, string>>) {
    super("저장하지 못했다");
    this.name = "MemberSaveError";
  }
}

/**
 * 저장. **`dup@example.com` 은 늘 중복으로 튕긴다** — 서버가 돌려준 에러를 폼이
 * 다시 칠하는 모양을 보여 주려고 둔 자리다.
 */
export async function saveMember(input: Member): Promise<Member> {
  await wait(700);

  if (input.email.trim().toLowerCase() === "dup@example.com") {
    throw new MemberSaveError({ email: "이미 쓰고 있는 메일이다" });
  }

  return { ...input, id: input.id || `M-${1041 + MEMBERS.length}` };
}
