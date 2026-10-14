import { TxAlert, TxButton, TxDialog, TxForm, TxModal, TxSlidePanel, TxToast } from "@txstack/ui";
import { useState } from "react";
import { Link } from "react-router-dom";
import { CodeBlock } from "../../components/CodeBlock";
import { Block, Demo, Page } from "../../components/Page";

const muted = "text-slate-600 dark:text-slate-300";

/** 확인 창 · 알림 · 모달 · 옆 패널을 한 줄에서 눌러 본다 */
function OverlayDemo() {
  const [editing, setEditing] = useState(false);
  const [detail, setDetail] = useState(false);
  const [name, setName] = useState("플랫폼팀");
  const [stickyId, setStickyId] = useState<number | null>(null);

  const remove = async () => {
    const yes = await TxDialog.confirm({ title: "팀을 삭제할까요?", message: "팀원과 설정이 모두 삭제됩니다.", tone: "danger", confirmLabel: "삭제" });
    TxToast.show(yes ? { variant: "info", title: "삭제했습니다" } : { title: "취소했습니다" });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <TxButton label="삭제 (confirm)" variant="danger" onClick={remove} />
        <TxButton label="안내 (alert)" variant="secondary" onClick={() => TxDialog.alert({ title: "점검 안내", message: "오늘 밤 12시부터 30분간 점검합니다." })} />
        <TxButton label="이름 바꾸기 (모달)" variant="secondary" onClick={() => setEditing(true)} />
        <TxButton label="상세 보기 (옆 패널)" variant="secondary" onClick={() => setDetail(true)} />
      </div>
      <div className="flex flex-wrap gap-2">
        <TxButton
          label="알림 세 개 연달아"
          variant="ghost"
          onClick={() => {
            TxToast.show({ variant: "success", title: "업로드 완료", message: "report-1.csv" });
            TxToast.show({ variant: "success", title: "업로드 완료", message: "report-2.csv" });
            TxToast.show({ variant: "warning", title: "일부 실패", message: "report-3.csv" });
          }}
        />
        <TxButton
          label={stickyId === null ? "사라지지 않는 알림" : "그 알림 닫기"}
          variant="ghost"
          onClick={() => {
            if (stickyId === null) {
              setStickyId(TxToast.show({ variant: "danger", title: "연결이 끊겼습니다", message: "다시 연결될 때까지 남아 있습니다", duration: 0 }));
            } else {
              TxToast.dismiss(stickyId);
              setStickyId(null);
            }
          }}
        />
      </div>
      <p className={`text-sm ${muted}`}>
        지금 팀 이름: <strong className="text-[color:var(--tx-color-text)]">{name}</strong>
      </p>

      <TxModal open={editing} onClose={() => setEditing(false)} title="팀 이름 바꾸기">
        <TxForm
          noValidate
          onSubmit={(event) => {
            const value = new FormData(event.currentTarget).get("team")?.toString().trim();
            if (!value) return;
            setName(value);
            setEditing(false);
            TxToast.show({ variant: "success", title: "바꿨습니다", message: value });
          }}
        >
          <TxForm.Input caption="팀 이름" name="team" defaultValue={name} />
          <TxForm.Flex>
            <TxButton type="button" label="취소" variant="secondary" onClick={() => setEditing(false)} />
            <TxButton type="submit" label="저장" />
          </TxForm.Flex>
        </TxForm>
      </TxModal>

      <TxSlidePanel open={detail} onClose={() => setDetail(false)} title={name} side="right">
        <div className="flex flex-col gap-3">
          <p className={muted}>목록을 그대로 둔 채 옆에서 상세를 봅니다. 닫으면 보던 자리로 돌아옵니다.</p>
          <TxButton label="알림 띄우기" variant="secondary" onClick={() => void TxToast.show({ title: "패널 위에도 뜹니다" })} />
        </div>
      </TxSlidePanel>
    </div>
  );
}

export function GuideDialogs() {
  return (
    <Page title="Dialogs & Toasts" lead="확인 창, 알림, 모달, 옆 패널을 다룹니다. 확인 창과 알림은 함수로 부르고, Provider 없이 어디서든 쓸 수 있습니다.">
      <Block title="Try it">
        <p className={muted}>버튼을 눌러 보세요. 확인 창은 고를 때까지 기다렸다가 결과를 돌려주고, 알림은 여러 개가 쌓이며, 마우스를 올리면 사라지지 않고 멈춥니다.</p>
        <Demo>
          <OverlayDemo />
        </Demo>
      </Block>

      <Block title="Which one to use">
        <div className="overflow-x-auto rounded-lg border" style={{ borderColor: "var(--tx-color-border)" }}>
          <table className="site-stack-table w-full text-sm">
            <tbody className={muted}>
              {[
                ["TxDialog.confirm", "예 · 아니오를 물을 때", "삭제, 로그아웃, 저장하지 않고 나가기"],
                ["TxDialog.alert", "알리고 확인만 받을 때", "처리할 수 없는 요청, 점검 안내"],
                ["TxToast.show", "결과를 잠깐 알릴 때. 하던 일을 막지 않습니다", "저장했습니다, 요청 실패"],
                ["TxModal", "화면을 덮고 집중해서 입력받을 때", "이름 바꾸기, 짧은 등록 폼"],
                ["TxSlidePanel", "목록을 둔 채 옆에서 보거나 고칠 때", "상세 보기, 필터"],
                ["TxAlert", "페이지 안에 머물러야 하는 안내", "권한 없음, 공지"]
              ].map(([name, when, example]) => (
                <tr key={name} className="border-t align-top first:border-t-0" style={{ borderColor: "var(--tx-color-border)" }}>
                  <td className="px-3 py-2 font-mono text-xs whitespace-nowrap text-[color:var(--tx-color-text)]">{name}</td>
                  <td className="px-3 py-2">{when}</td>
                  <td className="px-3 py-2 text-slate-500 dark:text-slate-400">{example}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Block>

      <Block title="1. Ask with TxDialog.confirm">
        <p className={muted}>
          브라우저의 <code>confirm</code>을 대신합니다. 다른 점은 하나, <code>await</code>로 답을 기다린다는 것입니다. 취소 · Esc · 창 바깥 클릭은 모두 <code>false</code>입니다.
        </p>
        <CodeBlock title="src/MemberList.tsx">{`const remove = async (member: Member) => {
  const yes = await TxDialog.confirm({
    title: "회원을 삭제할까요?",
    message: \`\${member.name} 님의 정보가 삭제됩니다.\`,
    tone: "danger",          // 되돌릴 수 없는 동작이라는 표시
    confirmLabel: "삭제"
  });
  if (!yes) return;

  await api.delete(\`/members/\${member.id}\`);
};`}</CodeBlock>
        <p className={muted}>
          글자만 넘겨도 됩니다(<code>TxDialog.confirm(&quot;로그아웃할까요?&quot;)</code>). 여러 번 연달아 불러도 창이 겹치지 않고 하나씩 차례로 뜹니다.
        </p>
      </Block>

      <Block title="2. Tell with TxDialog.alert">
        <p className={muted}>알리고 확인만 받습니다. 확인을 누를 때까지 기다리므로, 다음 동작을 그 뒤에 이어 쓸 수 있습니다.</p>
        <CodeBlock title="src/Checkout.tsx">{`await TxDialog.alert({ title: "결제할 수 없습니다", message: "카드 정보를 확인해 주세요." });
navigate("/billing");`}</CodeBlock>
      </Block>

      <Block title="3. Notify with TxToast">
        <p className={muted}>
          <code>TxToast.show</code>는 알림을 띄우고 번호를 돌려줍니다. 기본 4초 뒤 사라지고, 마우스를 올리거나 키보드로 들어가면 시간이 멈춥니다. 모달 위에도 뜹니다.
        </p>
        <CodeBlock title="어디서든">{`TxToast.show("저장했습니다");
TxToast.show({ variant: "danger", title: "저장하지 못했습니다", message: "잠시 후 다시 시도해 주세요" });

// 놓치면 안 되는 알림은 스스로 사라지지 않게 하고, 직접 닫습니다
const id = TxToast.show({ variant: "danger", title: "연결이 끊겼습니다", duration: 0 });
TxToast.dismiss(id);

TxToast.dismissAll();   // 화면을 옮길 때 남은 알림을 정리합니다`}</CodeBlock>
        <p className={muted}>
          <code>variant</code>는 <code>info</code> · <code>success</code> · <code>warning</code> · <code>danger</code>로, 페이지 안의 안내 상자(<code>TxAlert</code>)와 같습니다.
        </p>
      </Block>

      <Block title="4. Call from anywhere">
        <p className={muted}>확인 창과 알림은 처음 부를 때 스스로 화면에 자리를 만듭니다. 앱을 Provider로 감쌀 필요가 없어서 컴포넌트 밖에서도 부를 수 있습니다. 예를 들어 API 클라이언트의 오류 처리에서 바로 알림을 띄웁니다.</p>
        <CodeBlock title="src/lib/api.ts">{`import { createHttpClient, parseApiError } from "@txstack/axios";
import { TxToast } from "@txstack/ui";

export const api = createHttpClient({
  baseURL: "/api",
  onError: (error) => {
    const { statusCode, message } = parseApiError(error);
    TxToast.show({ variant: "danger", title: \`요청 실패 (\${statusCode})\`, message });
  }
});`}</CodeBlock>
        <p className={muted}>
          API 클라이언트는{" "}
          <Link to="/docs/guide/http-client" className="underline">
            HTTP Client
          </Link>
          에서 다룹니다.
        </p>
      </Block>

      <Block title="5. Modal and side panel">
        <p className={muted}>
          <code>TxModal</code>과 <code>TxSlidePanel</code>은 컴포넌트로 그리고, 열림 상태는 앱이 갖습니다. 둘 다 열리면 포커스가 창 안에 머물고, Esc나 바깥을 누르면 <code>onClose</code>가 불립니다.
        </p>
        <CodeBlock title="src/MemberList.tsx">{`const [editing, setEditing] = useState<Member | null>(null);

<TxSlidePanel open={editing !== null} onClose={() => setEditing(null)} title={editing?.name} side="right">
  <MemberForm member={editing} onSaved={() => setEditing(null)} />
</TxSlidePanel>`}</CodeBlock>
        <TxAlert variant="info" title="닫히는 방법을 막을 수도 있습니다">
          입력 중인 내용을 실수로 잃지 않도록 <code>closeOnBackdrop={"{false}"}</code>나 <code>closeOnEscape={"{false}"}</code>로 바깥 클릭 · Esc 닫기를 끌 수 있습니다.
        </TxAlert>
      </Block>

      <Block title="6. App-wide defaults">
        <p className={muted}>알림의 위치 · 시간 · 개수와 확인 창의 버튼 문구는 앱을 시작할 때 한 번 정합니다.</p>
        <CodeBlock title="src/main.tsx">{`TxToast.configure({ position: "bottom-center", duration: 6000, max: 3 });
TxDialog.configure({ labels: { confirm: "OK", cancel: "Cancel" } });`}</CodeBlock>
      </Block>

      <p className={muted}>
        props 전체는{" "}
        <Link to="/api/ui#component-txdialog" className="underline">
          API › ui
        </Link>
        에서 각 컴포넌트의 Storybook 문서로 이어집니다.
      </p>
    </Page>
  );
}
