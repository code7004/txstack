import { createHttpClient, parseApiError, type IApiError } from "@txstack/axios";

/**
 * **공개 API 를 부르는 자리.** 백엔드를 두지 않고도 진짜 요청 · 에러 · 지연을 겪는다 —
 * `@txstack/axios` 가 테스트 밖에서 처음 도는 곳이다.
 *
 * GitHub 검색 API 는 인증 없이 **분당 10회**다. 그 한계를 넘으면 403 이 오는데,
 * 그것도 예제의 일부다 — 에러를 어떻게 보여 주는지가 목록 화면의 절반이다.
 */
export const github = createHttpClient({
  baseURL: "https://api.github.com",
  timeout: 10_000,

  headers: {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28"
  },

  /**
   * **응답 봉투는 앱이 안다.** 라이브러리는 `res.data` 를 그대로 주는 것이 기본이고,
   * GitHub 는 봉투가 없어서 여기서는 건드리지 않는다. 회사 API 가 `{ body: T }` 라면
   * 이 자리에 `unwrap: (data) => data.body` 를 준다.
   */

  /**
   * 토큰도 앱이 정한다. 이 사이트는 인증 없이 쓰지만, 넣는다면 이 자리다 —
   * 라이브러리가 저장 위치(로컬스토리지 · 쿠키 · 메모리)를 정하지 않는다.
   */
  getToken: () => undefined
});

export interface Repo {
  id: number;
  full_name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  language: string | null;
  pushed_at: string;
}

export interface RepoSearch {
  total_count: number;
  items: Repo[];
}

export type RepoSort = "best-match" | "stars" | "updated";

export interface SearchInput {
  q: string;
  page: number;
  perPage: number;
  sort: RepoSort;
}

/**
 * 저장소 검색. **`q` 가 비면 부르지 않는다** — GitHub 는 빈 검색어에 422 를 준다.
 *
 * `sort` 가 `best-match` 면 파라미터를 아예 빼야 한다(빈 문자열을 보내면 관련도 순이
 * 아니라 오류다). 이런 자리가 앱마다 다르므로 라이브러리가 대신 정리하지 않는다.
 */
export async function searchRepos({ q, page, perPage, sort }: SearchInput): Promise<RepoSearch> {
  return github.get<RepoSearch>("/search/repositories", {
    q,
    page,
    per_page: perPage,
    ...(sort === "best-match" ? {} : { sort, order: "desc" })
  });
}

/**
 * 에러를 화면에 쓸 한 줄로 바꾼다.
 *
 * `parseApiError` 는 어떤 실패든 `{ statusCode, message }` 로 정규화한다 —
 * 네트워크가 끊긴 것, 시간이 초과된 것, 서버가 준 본문까지 한 형태로 온다.
 */
export function toMessage(error: unknown): IApiError {
  const parsed = parseApiError(error);

  // GitHub 는 한계를 넘으면 403 에 안내 문구를 담아 준다. 그대로 보여 주면 무슨 일인지 읽힌다
  if (parsed.statusCode === 403) return { ...parsed, message: "요청이 너무 잦다 (GitHub 는 인증 없이 분당 10회). 잠시 뒤에 다시 눌러 보라." };
  if (parsed.statusCode === 422) return { ...parsed, message: "검색어를 다시 확인해 보라." };

  return parsed;
}
