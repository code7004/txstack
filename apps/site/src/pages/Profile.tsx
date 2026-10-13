import { TxAvatar, TxTag } from "@txstack/ui";
import type { ReactNode } from "react";
import { Block, Page } from "../components/Page";

/**
 * **이 페이지의 내용은 만든 사람만 쓸 수 있다.** 여기를 채우면 화면이 따라온다.
 *
 * 비어 있는 칸은 배포판에서 **그 칸째로 사라지고**, 개발 서버(`pnpm site:dev`)에서만 점선
 * 자리표시로 보인다 — 채우는 동안 어디에 무엇이 놓이는지 보면서 쓸 수 있게.
 */
const PROFILE = {
  /** 이름. 비어 있으면 배포판에서 이 페이지 전체가 "준비 중" 이 된다 */
  name: "",
  /** 한 줄 — 무엇을 하는 사람인가 */
  role: "",
  /** 아바타 이미지 주소. 비면 이름 첫 글자가 나온다 */
  avatar: "",
  /** 두세 문단. 문단마다 배열 한 칸 */
  intro: [] as string[],
  /** 왜 txstack 을 만들었나. 문단마다 배열 한 칸 */
  why: [] as string[],
  /** 다루는 것 — 태그로 보인다 */
  skills: [] as string[],
  links: [] as { label: string; href: string }[]
};

const DRAFT = import.meta.env.DEV;

/** 비어 있으면 배포판에서는 아무것도 그리지 않고, 개발 중에는 자리를 보여 준다 */
function Slot({ filled, hint, children }: { filled: boolean; hint: string; children: ReactNode }) {
  if (filled) return children;
  if (!DRAFT) return null;

  return <div className="rounded-lg border border-dashed px-4 py-3 text-sm text-slate-500 dark:text-slate-400" style={{ borderColor: "var(--tx-color-border)" }}>{`PROFILE.${hint} 를 채운다 — src/pages/Profile.tsx`}</div>;
}

export function Profile() {
  const { name, role, avatar, intro, why, skills, links } = PROFILE;

  if (!name && !DRAFT) {
    return <Page title="Profile" lead="준비 중이다." />;
  }

  return (
    <Page title="Profile">
      <header className="flex items-center gap-5">
        <TxAvatar src={avatar || undefined} name={name || "?"} size="lg" />
        <div className="flex flex-col gap-1">
          <Slot filled={!!name} hint="name">
            <p className="text-xl font-semibold">{name}</p>
          </Slot>
          <Slot filled={!!role} hint="role">
            <p className="text-slate-600 dark:text-slate-300">{role}</p>
          </Slot>
        </div>
      </header>

      <Slot filled={intro.length > 0} hint="intro">
        <div className="flex flex-col gap-3 text-slate-700 dark:text-slate-200">
          {intro.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </Slot>

      <Slot filled={why.length > 0} hint="why">
        <Block title="왜 txstack 인가">
          {why.map((line) => (
            <p key={line} className="text-slate-600 dark:text-slate-300">
              {line}
            </p>
          ))}
        </Block>
      </Slot>

      <Slot filled={skills.length > 0} hint="skills">
        <Block title="다루는 것">
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <TxTag key={skill}>{skill}</TxTag>
            ))}
          </div>
        </Block>
      </Slot>

      <Slot filled={links.length > 0} hint="links">
        <Block title="링크">
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {links.map((link) => (
              <li key={link.href}>
                <a href={link.href} target="_blank" rel="noreferrer" className="underline">
                  {link.label} ↗
                </a>
              </li>
            ))}
          </ul>
        </Block>
      </Slot>
    </Page>
  );
}
