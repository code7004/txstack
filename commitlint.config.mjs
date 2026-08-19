export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // 제목 대소문자 제약 해제 (대문자/소문자 시작 모두 허용)
    "subject-case": [0],
    // 본문/푸터 줄 길이 제한 해제 — 상세한 설명과 마크다운(목록·링크·표 등)을 자유롭게 쓰기 위함.
    "body-max-line-length": [0],
    "footer-max-line-length": [0]
  }
};
