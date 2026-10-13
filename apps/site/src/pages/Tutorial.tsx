import { Link } from "react-router-dom";
import { TxAlert } from "@txstack/ui";
import { CodeBlock } from "../components/CodeBlock";
import { Block, Demo, Page, SideBySide } from "../components/Page";
import { MemberScreen } from "./tutorial/MemberScreen";
import MEMBER_SCREEN_SOURCE from "./tutorial/MemberScreen.tsx?raw";

export function Tutorial() {
  return (
    <Page title="Tutorial" lead="목록과 등록이 있는 화면 하나를 처음부터 끝까지 만든다. 마지막에 나오는 화면은 이 페이지 안에서 실제로 돈다.">
      <TxAlert variant="info" title="이 화면이 목표다">
        아래 다섯 단계를 지나면 <strong>검색 · 목록 · 쪽 번호 · 등록 · 삭제 확인 · 알림</strong>이 붙은 화면이 된다. 부품은 여섯 개뿐이다. 맨 아래에 <strong>통째로 붙여 넣을 수 있는 전체 코드</strong>가 있다.
      </TxAlert>

      <p className="text-slate-600 dark:text-slate-300">
        <Link to="/docs/start" className="underline">
          Getting Started
        </Link>{" "}
        를 마쳐 <code>@txstack/ui</code> 가 설치되고 스타일시트가 연결된 앱에서 시작한다. 단계마다 보이는 코드는 그 단계에서 늘어나는 부분만이다.
      </p>

      <Block title="1. 화면 껍데기">
        <p className="text-slate-600 dark:text-slate-300">
          검색줄 · 목록 · 쪽 번호가 위에서 아래로 놓인다. 자리를 잡는 것은 <code>TxFlex</code> 나 그냥 <code>div</code> 로 충분하다 — <strong>화면 골격(셸)은 이미 앱에 있다.</strong>
        </p>

        <CodeBlock title="MemberScreen.tsx">{`export function MemberScreen() {
  return (
    <div className="flex flex-col gap-3">
      <Toolbar />
      <List />
      <TxPagination … />
    </div>
  );
}`}</CodeBlock>
      </Block>

      <Block title="2. 검색은 Enter 로">
        <p className="text-slate-600 dark:text-slate-300">
          <code>TxSearchInput</code> 은 <strong>칠 때마다</strong>(<code>onChangeText</code>)와 <strong>Enter</strong>(<code>onSubmitText</code>)를 갈라 준다. 조회는 Enter 쪽에 붙인다 — 글자마다 서버를 부르면 응답이 화면보다 빨리 쌓인다.
        </p>

        <CodeBlock title="조건이 바뀌면 1쪽으로">{`const search = (next: string) => {
  setKeyword(next);
  setPage(1);        // 늘 함께. 3쪽을 보다 조건을 바꾸면 빈 화면이 나온다
};

<TxSearchInput onSubmitText={search} onClear={() => search("")} />`}</CodeBlock>
      </Block>

      <Block title="3. 등록 폼">
        <p className="text-slate-600 dark:text-slate-300">
          <code>TxForm</code> 은 <strong>캡션 · 메시지를 컨트롤과 잇는 배선</strong>을 한다(<code>label for</code> · <code>aria-invalid</code> · <code>aria-describedby</code>). 무엇이 잘못인지 판정하는 것은 앱의 일이다.
        </p>

        <CodeBlock title="MemberForm.tsx">{`<TxForm noValidate labelWidth="3.5rem" onSubmit={submit}>
  <TxForm.Input caption="이름" value={draft.name} onChangeText={…} error={error} required />
  <TxForm.Input caption="메일" type="email" value={draft.email} onChangeText={…} />

  <div className="flex justify-end gap-2">
    <TxButton type="button" label="취소" variant="secondary" onClick={close} />
    <TxButton type="submit" label="저장" />
  </div>
</TxForm>`}</CodeBlock>

        <TxAlert variant="warning" title="noValidate 를 빼면">
          브라우저가 먼저 나서서 <code>required</code> 인 칸에 자기 말풍선을 띄우고 제출을 막는다. 우리 메시지는 뜨지도 않는다 — <code>required</code> 자체는 남긴다(스크린리더가 "필수" 로 읽는다).
        </TxAlert>
      </Block>

      <Block title="4. 지우기는 되돌릴 수 없다">
        <p className="text-slate-600 dark:text-slate-300">
          <code>TxDialog.confirm</code> 은 <strong>답을 기다린다</strong> — 네이티브 <code>confirm</code> 을 <code>await</code> 로 바꾼 것이다. <code>tone=&quot;danger&quot;</code> 는 색만 바꾸는 것이 아니라 "이건 파괴적이다" 를 알리는 자리다.
        </p>

        <CodeBlock title="지우기">{`const remove = async (member: Member) => {
  if (!(await TxDialog.confirm({ title: "지울까", tone: "danger", confirmLabel: "지운다" }))) return;

  await api.remove(member.id);
  TxToast.show({ variant: "info", title: "지웠다" });
};`}</CodeBlock>

        <p className="text-slate-600 dark:text-slate-300">
          <code>TxDialog</code> · <code>TxToast</code> 는 <strong>부를 때 스스로 자리를 만든다.</strong> 앱에 Provider 를 심지 않아도 된다.
        </p>
      </Block>

      <Block title="5. 빈 결과와 쪽 번호">
        <SideBySide>
          <CodeBlock title="빈 결과는 표 대신 안내로">{`{rows.length === 0 ? (
  <TxEmptyState variant="no-result" title="찾은 회원이 없다">
    <TxButton label="조건 지우기" variant="secondary" onClick={reset} />
  </TxEmptyState>
) : (
  <Table rows={rows} />
)}

<TxPagination currentPage={page} totalRows={total} pageSize={5} onChangePage={setPage} />`}</CodeBlock>

          <div className="flex flex-col gap-3">
            <p className="text-slate-600 dark:text-slate-300">
              머리글만 남은 표는 <strong>조회가 안 된 것인지 결과가 없는 것인지</strong> 알려 주지 않는다.
            </p>
            <p className="text-slate-600 dark:text-slate-300">
              <code>TxPagination</code> 은 그리드와 무관해서 루트 배럴에 있다 — 카드 목록이나 손수 짠 표에도 같은 부품을 쓴다.
            </p>
          </div>
        </SideBySide>
      </Block>

      <Block title="완성된 화면">
        <p className="text-slate-600 dark:text-slate-300">
          아래는 그림이 아니다. <strong>검색해 보고, 등록해 보고, 지워 보라</strong> — 확인창과 알림까지 실제로 뜬다.
        </p>

        <Demo>
          <MemberScreen />
        </Demo>

        <p className="text-slate-600 dark:text-slate-300">
          수천 행을 굴리고 셀을 고쳐 넣어야 하면 표를 <code>TxAgGrid</code> 로 바꾼다 — 검색 · 등록 · 쪽 번호 코드는 그대로 두고 표만 갈아끼운다. 그 모양은 카탈로그의 <strong>Recipes › ListScreen</strong> 에 있다.
        </p>
      </Block>

      <Block title="전체 코드">
        <p className="text-slate-600 dark:text-slate-300">
          위에서 도는 화면의 소스 그대로다. <code>src/MemberScreen.tsx</code> 로 붙여 넣고 <code>App.tsx</code> 에서 <code>&lt;MemberScreen /&gt;</code> 를 그리면 같은 화면이 뜬다. 배치는 Tailwind 클래스로 잡았다 — Tailwind 가 없는 앱이면{" "}
          <code>className</code> 만 바꾸면 된다.
        </p>

        <CodeBlock title="src/MemberScreen.tsx">{MEMBER_SCREEN_SOURCE}</CodeBlock>
      </Block>
    </Page>
  );
}
