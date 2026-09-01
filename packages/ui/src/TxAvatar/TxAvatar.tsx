import { useState } from "react";
import { TxIconUser } from "../TxIcons";
import { cm } from "../tx-ui.utils";
import type { TxAvatarProps } from "./TxAvatar.types";
import { toInitials } from "./TxAvatar.utils";

/**
 * 사람 한 명을 나타내는 동그란 칸.
 *
 * @example
 * ```tsx
 * <TxAvatar src={user.photo} name="김재훈" />   // 사진, 못 불러오면 이니셜
 * <TxAvatar name="김재훈" />                    // 이니셜 — "재훈"
 * <TxAvatar />                                  // 사람 아이콘
 *
 * <TxAvatar name="김재훈" size="lg" shape="square" />
 * <TxAvatar name="김재훈" onClick={openProfile} />
 * ```
 *
 * **떨어지는 순서는 사진 → 이니셜 → 아이콘**이다. 사진 주소를 줬는데 못 불러와도
 * 빈칸이 남지 않는다.
 *
 * `name` 하나가 **이니셜의 원본이자 스크린리더가 읽는 이름**이다. 사진이 떨어져도
 * 읽히는 것이 바뀌지 않는다.
 *
 * 크기 셋 말고 다른 크기가 필요하면 토큰으로 준다 —
 * `<TxAvatar style={{ "--tx-avatar-size": "5rem" }} />`.
 *
 * **접속 중 표시 같은 점은 `TxBadge` 로 얹는다** — `<TxBadge dot variant="success"><TxAvatar …/></TxBadge>`.
 *
 * 명세: `docs/001_ui.md`
 */
export function TxAvatar({ src, name, initials, icon, size = "md", shape = "circle", onClick, className, ...props }: TxAvatarProps) {
  const [broken, setBroken] = useState(false);

  /**
   * 사진 주소가 바뀌면 **다시 시도한다.** 한 번 못 불러왔다고 그 상태로 굳으면,
   * 목록에서 자리를 돌려 쓰는 아바타가 남의 실패를 물려받는다.
   */
  const [tried, setTried] = useState(src);
  if (tried !== src) {
    setTried(src);
    setBroken(false);
  }

  const text = initials ?? (name ? toInitials(name) : "");
  const shell = {
    ...props,
    "data-tag": "TxAvatar",
    "data-size": size,
    "data-shape": shape,
    className: cm("tx-avatar", className)
  };

  /**
   * 안쪽은 전부 **읽히지 않는다.** 이름은 껍데기가 한 번만 말한다 —
   * 사진의 `alt` 와 이니셜 글자가 함께 읽히면 같은 사람이 두 번 불린다.
   */
  const content =
    src && !broken ? (
      <img className="tx-avatar__image" src={src} alt="" onError={() => setBroken(true)} />
    ) : text ? (
      <span className="tx-avatar__initials" aria-hidden>
        {text}
      </span>
    ) : (
      <span className="tx-avatar__icon" aria-hidden>
        {icon ?? <TxIconUser />}
      </span>
    );

  if (onClick) {
    return (
      <button {...shell} type="button" aria-label={name} onClick={onClick}>
        {content}
      </button>
    );
  }

  // 이름이 없으면 장식이다. `role` 도 이름도 주지 않아 스크린리더가 지나간다.
  return (
    <span {...shell} role={name ? "img" : undefined} aria-label={name}>
      {content}
    </span>
  );
}
