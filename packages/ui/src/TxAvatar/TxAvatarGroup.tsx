import { Children } from "react";
import { cm } from "../tx-ui.utils";
import { TxAvatar } from "./TxAvatar";
import type { TxAvatarGroupProps } from "./TxAvatar.types";

/**
 * 아바타 여럿을 겹쳐 쌓는다.
 *
 * @example
 * ```tsx
 * <TxAvatarGroup max={3}>
 *   {members.map((m) => (
 *     <TxAvatar key={m.id} src={m.photo} name={m.name} />
 *   ))}
 * </TxAvatarGroup>
 * ```
 *
 * **`max` 를 넘으면 뒤에 `+2` 한 칸이 붙는다.** 그 칸도 "외 2명" 으로 읽힌다 —
 * 남은 사람이 있다는 것은 보는 사람에게만 보이면 안 된다.
 *
 * 겹치는 정도는 토큰이다 — `.tx-avatar-group { --tx-avatar-overlap: 0.5rem }`.
 *
 * 명세: `docs/001_ui.md`
 */
export function TxAvatarGroup({ max, size = "md", shape = "circle", moreLabel = (rest) => `외 ${rest}명`, className, children, ...props }: TxAvatarGroupProps) {
  const items = Children.toArray(children);
  const shown = max !== undefined && items.length > max ? items.slice(0, max) : items;
  const rest = items.length - shown.length;

  return (
    <span {...props} data-tag="TxAvatarGroup" className={cm("tx-avatar-group", className)}>
      {shown}

      {/* 앞의 것들과 같은 칸이라 `TxAvatar` 를 그대로 쓴다 — 겹침도 테두리도 한 규칙에서 나온다 */}
      {rest > 0 && <TxAvatar size={size} shape={shape} name={moreLabel(rest)} initials={`+${rest}`} />}
    </span>
  );
}
