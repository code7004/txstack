import { Link } from "react-router-dom";
import { TxTag } from "@txstack/ui";

/**
 * **npm 배포 전이라는 사실을 설치 명령 바로 옆에 둔다.** 명령만 보고 따라 치면 404 로 실패한다.
 * 지금 설치하는 길(저장소에서 빌드한 `.tgz`)은 Getting Started 한 곳이 갖고, 나머지는 거기로 보낸다.
 *
 * 배포하면 이 컴포넌트를 쓰는 자리를 지우고, 명령 블록의 제목("npm 배포 후")을 고친다.
 */
export const PUBLISHED = false;

/** 설치 명령 블록의 제목. 배포 전에는 "배포 후" 기준이라는 것을 밝힌다 */
export const INSTALL_TITLE = PUBLISHED ? "sh" : "npm 배포 후";

/** `standalone` 이면 위에 명령이 없는 자리다(Home) — "위 명령은…" 대신 상태만 말한다 */
export function PrePublishNote({ standalone = false }: { standalone?: boolean }) {
  if (PUBLISHED) return null;

  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-600 dark:text-slate-300">
      <TxTag variant="warning" dot>
        npm 배포 전
      </TxTag>
      <span>
        {standalone ? "아직 npm에 없습니다. 지금은" : "위 명령은 배포 후 기준입니다. 지금은"}{" "}
        <Link to="/docs/start#2-install" className="underline">
          저장소에서 빌드한 패키지 파일로 설치
        </Link>
        합니다.
      </span>
    </p>
  );
}
