/**
 * **주소마다 자기 HTML 을 둔다** — 제목 · 설명 · 공유 카드가 그 페이지 것이 되게.
 *
 * SPA 는 HTML 이 하나라 링크를 붙여 나누면(메신저 · SNS) 어느 페이지든 홈의 카드가 뜬다.
 * 미리보기 봇은 JS 를 돌리지 않으므로 `document.title` 을 바꾸는 것으로는 닿지 않는다.
 * 또 GitHub Pages 에는 SPA 폴백이 없어서 직접 링크가 `404.html` 로 화면만 살리고 **상태는 404** 였다.
 * 경로마다 `index.html` 을 두면 둘 다 풀린다 — 본문은 같은 앱이고 `<head>` 만 다르다.
 *
 * 출처는 라우트 트리다(`src/routes.tsx` 의 `label` · `description`). 메뉴 · 검색과 같은 곳에서 읽어
 * 손으로 따로 적는 목록이 없다.
 *
 * `vite build` 다음에 돈다. `SITE_ORIGIN`(예: `https://code7004.github.io`)을 주면 절대 주소가 필요한
 * `og:url` · `canonical` 도 넣는다.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const root = fileURLToPath(new URL("..", import.meta.url));
const dist = join(root, "dist");
const base = process.env.SITE_BASE ?? "/";
const origin = process.env.SITE_ORIGIN?.replace(/\/$/, "");
const SITE_NAME = "txstack";

// routes.tsx 는 TSX 이고 화면을 지연 로드한다. Vite 로 읽으면 화면 모듈은 받지 않고 트리만 얻는다
const vite = await createServer({ root, logLevel: "error", server: { middlewareMode: true, hmr: false }, appType: "custom" });
const { routes } = await vite.ssrLoadModule("/src/routes.tsx");
await vite.close();

/** 메뉴에 오르는 화면 하나하나. 제목은 앱의 탭 제목과 같은 규칙이다(`App.tsx` 의 `useCurrentPlace`) */
function pages(tree, parent) {
  return Object.values(tree).flatMap((node) => {
    if (node.index || node.enabled === false || node.path === "*" || node.meta?.hidden || !node.meta?.label) return [];

    const section = parent?.meta?.label;
    const page = { path: node.path, title: section ? `${node.meta.label} · ${section}` : node.meta.label, description: node.meta.description };
    return [page, ...(node.children ? pages(node.children, node) : [])];
  });
}

const escape = (text) => text.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const template = await readFile(join(dist, "index.html"), "utf8");

/** `<head>` 의 같은 이름 태그를 바꾼다. 템플릿에 없으면 빌드가 실패한다 — 조용히 빠지지 않게 */
function setTag(html, pattern, tag) {
  if (!pattern.test(html)) throw new Error(`index.html 에 ${pattern} 가 없습니다`);
  return html.replace(pattern, tag);
}

function render({ path, title, description }, { index = true } = {}) {
  let html = template;
  // 폴더의 index.html 이라 Pages 는 슬래시 붙은 주소로 답한다(없으면 301 로 보낸다). 바로 200 이 나는 쪽을 대표 주소로 둔다
  const url = origin && `${origin}${base}${path.replace(/^\//, "").replace(/(.)$/, "$1/")}`;

  if (title) {
    const full = `${title} — ${SITE_NAME}`;
    html = setTag(html, /<title>[^<]*<\/title>/, `<title>${escape(full)}</title>`);
    html = setTag(html, /<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${escape(full)}" />`);
  }
  if (description) {
    html = setTag(html, /<meta name="description"[^>]*>/, `<meta name="description" content="${escape(description)}" />`);
    html = setTag(html, /<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${escape(description)}" />`);
  }

  const extra = index ? [url && `<link rel="canonical" href="${url}" />`, url && `<meta property="og:url" content="${url}" />`] : ['<meta name="robots" content="noindex" />'];
  return html.replace(/\n\s*<\/head>/, `\n    ${extra.filter(Boolean).join("\n    ")}\n  </head>`);
}

const list = pages(routes);
const written = [];

for (const page of list) {
  // 홈은 index.html 그 자리. 제목 · 설명은 index.html 에 적힌 소개를 그대로 둔다
  const home = page.path === "/";
  const file = home ? join(dist, "index.html") : join(dist, page.path, "index.html");
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, render(home ? { path: "/" } : page));
  written.push(page.path);
}

// 없는 주소. 앱이 "찾을 수 없습니다" 를 그리고, 검색에는 오르지 않는다
await writeFile(join(dist, "404.html"), render({ path: "/" }, { index: false }));

console.log(`share-meta: ${written.length}개 주소 + 404.html${origin ? "" : " (SITE_ORIGIN 없음 — og:url · canonical 생략)"}`);
