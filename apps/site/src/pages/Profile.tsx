import { TxAvatar, TxTag } from "@txstack/ui";
import { Link } from "react-router-dom";
import { Block, Page } from "../components/Page";
import { CAREER, PROFILE, PROJECTS, QUALITY_BACKGROUND, SKILLS, STRENGTHS, WAYS_OF_WORKING, WHY, WHY_RESULTS, type ProfileLink } from "./profile/profile";

/**
 * 만든 사람 소개. **내용은 `profile/profile.ts` 가 갖고**, 이 화면은 배치만 한다.
 *
 * 순서는 읽는 사람이 묻는 순서다 — 누구인가 → 무엇을 잘하나 → 무엇을 만들었나 → txstack 과 어떻게 이어지나 → 지나온 길.
 * 좁은 화면에서도 위에서 아래로 그대로 읽히게 가로 타임라인 · 탭을 쓰지 않는다.
 */

const muted = "text-slate-600 dark:text-slate-300";
const line = { borderColor: "var(--tx-color-border)" };
const strong = "text-[color:var(--tx-color-primary-strong)]";

/** 사이트 안이면 라우터로, `#` 이면 같은 화면 안으로, 그 밖은 새 탭으로 */
function ProfileAnchor({ link, className }: { link: ProfileLink; className?: string }) {
  const { href, label } = link;

  if (href.startsWith("/"))
    return (
      <Link to={href} className={className}>
        {label} →
      </Link>
    );
  if (href.startsWith("#") || href.startsWith("mailto:"))
    return (
      <a href={href} className={className}>
        {label}
      </a>
    );

  return (
    <a href={href} target="_blank" rel="noreferrer" className={className}>
      {label} ↗
    </a>
  );
}

function LinkRow({ links }: { links: ProfileLink[] }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
      {links.map((link) => (
        <li key={link.href}>
          <ProfileAnchor link={link} className={`font-semibold underline-offset-4 hover:underline ${strong}`} />
        </li>
      ))}
    </ul>
  );
}

export function Profile() {
  return (
    <Page title="Profile">
      <header className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <TxAvatar name={PROFILE.name} size="lg" />
          <div className="flex flex-col gap-1">
            <p className="text-xl font-semibold">{PROFILE.name}</p>
            <p className={muted}>{PROFILE.role}</p>
          </div>
        </div>
        <div className="flex flex-col gap-3 text-slate-700 dark:text-slate-200">
          {PROFILE.intro.map((text) => (
            <p key={text}>{text}</p>
          ))}
        </div>
        <LinkRow links={[...PROFILE.links, { label: "대표 프로젝트", href: "#projects" }]} />
      </header>

      <Block title="Strengths">
        <div className="grid gap-3 md:grid-cols-3">
          {STRENGTHS.map((item) => (
            <section key={item.title} className="flex flex-col gap-2 rounded-lg border p-4" style={line}>
              <h3 className="font-semibold">{item.title}</h3>
              <p className={`text-sm ${muted}`}>{item.desc}</p>
              <p className={`text-sm ${muted}`}>
                <strong className="text-[color:var(--tx-color-text)]">경험</strong> · {item.story}
              </p>
              <div className="mt-auto pt-1">
                <LinkRow links={item.links} />
              </div>
            </section>
          ))}
        </div>
      </Block>

      <Block title="Projects">
        <div className="flex flex-col gap-4">
          {PROJECTS.map((project) => (
            <section key={project.name} className="flex flex-col gap-3 rounded-lg border p-4" style={line}>
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h3 className="font-semibold">{project.name}</h3>
                {project.facts && <span className="text-xs text-slate-500 dark:text-slate-400">{project.facts.join(" · ")}</span>}
              </div>
              <p className={muted}>{project.problem}</p>
              <ul className={`flex list-inside list-disc flex-col gap-1 text-sm ${muted}`}>
                {project.work.map((text) => (
                  <li key={text}>{text}</li>
                ))}
              </ul>
              <dl className={`grid gap-x-4 gap-y-1 text-sm sm:grid-cols-[4rem_1fr] ${muted}`}>
                <dt className="font-semibold text-[color:var(--tx-color-text)]">역할</dt>
                <dd>{project.role}</dd>
                <dt className="font-semibold text-[color:var(--tx-color-text)]">기술</dt>
                <dd className="flex flex-wrap gap-1.5">
                  {project.tech.map((name) => (
                    <TxTag key={name}>{name}</TxTag>
                  ))}
                </dd>
              </dl>
              {project.links && <LinkRow links={project.links} />}
            </section>
          ))}
        </div>
        <div className="flex flex-col gap-2 rounded-lg border-s-4 py-1 ps-4" style={line}>
          <h3 className="font-semibold">품질 기준의 배경 — 의료·재활 소프트웨어</h3>
          {QUALITY_BACKGROUND.map((text) => (
            <p key={text} className={`text-sm ${muted}`}>
              {text}
            </p>
          ))}
        </div>
      </Block>

      <Block title="Why I built txstack">
        {WHY.map((text) => (
          <p key={text} className={muted}>
            {text}
          </p>
        ))}
        <ul className="flex flex-col">
          {WHY_RESULTS.map((item) => (
            <li key={item.problem} className="flex flex-col gap-1 border-b py-3 sm:flex-row sm:items-baseline sm:gap-4" style={line}>
              <span className="text-sm font-semibold sm:w-56 sm:shrink-0">{item.problem}</span>
              <span className={`text-sm ${muted}`}>{item.result}</span>
              <ProfileAnchor link={item.link} className={`text-sm font-semibold whitespace-nowrap underline-offset-4 hover:underline sm:ms-auto ${strong}`} />
            </li>
          ))}
        </ul>
      </Block>

      <Block title="Career">
        <ol className="flex flex-col">
          {CAREER.map((item) => (
            <li key={item.period} className="flex flex-col gap-1 border-s-2 pb-4 ps-4 last:pb-0" style={line}>
              <span className="text-xs text-slate-500 dark:text-slate-400">{item.period}</span>
              <span className="font-semibold">{item.area}</span>
              <span className={`text-sm ${muted}`}>{item.desc}</span>
            </li>
          ))}
        </ol>
      </Block>

      <Block title="How I work">
        <ul className={`flex list-inside list-disc flex-col gap-1 ${muted}`}>
          {WAYS_OF_WORKING.map((text) => (
            <li key={text}>{text}</li>
          ))}
        </ul>
      </Block>

      <Block title="Tech stack">
        <dl className="flex flex-col gap-3">
          {SKILLS.map(({ group, items }) => (
            <div key={group} className="flex flex-col gap-1.5 sm:flex-row sm:gap-4">
              <dt className="text-sm font-semibold sm:w-36 sm:shrink-0">{group}</dt>
              <dd className="flex flex-wrap gap-1.5">
                {items.map((name) => (
                  <TxTag key={name}>{name}</TxTag>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      </Block>
    </Page>
  );
}
