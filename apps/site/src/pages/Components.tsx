import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  TxAccordion,
  TxAlert,
  TxAvatar,
  TxAvatarGroup,
  TxBadge,
  TxBreadcrumb,
  TxButton,
  TxCard,
  TxCopyButton,
  TxDialog,
  TxDropMenu,
  TxEmptyState,
  TxForm,
  TxModal,
  TxNumberInput,
  TxPagination,
  TxProgress,
  TxRadio,
  TxRadioGroup,
  TxSkeleton,
  TxSlidePanel,
  TxSlider,
  TxSpinner,
  TxSwitch,
  TxTabs,
  TxTag,
  TxToast,
  TxTooltip
} from "@txstack/ui";
import { Block, Demo, Page } from "../components/Page";
import { STORYBOOK_URL } from "../lib/links";
import { Used } from "../components/Used";

/**
 * **갤러리.** 분류마다 컴포넌트 몇 개로 짠 작은 화면 하나를 실제로 돌린다 — "무엇을 만들 수 있나" 를
 * 보이는 자리다. props 는 여기서 다시 쓰지 않는다. 아래 이름을 누르면 API › ui 목록의 그 줄로 가고,
 * 거기서 Storybook 문서로 이어진다.
 */

const muted = "text-slate-600 dark:text-slate-300";

function Section({ title, lead, used, children }: { title: string; lead: ReactNode; used: string[]; children: ReactNode }) {
  return (
    <Block title={title}>
      <p className={muted}>{lead}</p>
      <Demo>{children}</Demo>
      <Used names={used} />
    </Block>
  );
}

/* --- Form ------------------------------------------------------------------------------ */

function FormDemo() {
  const [seats, setSeats] = useState<number | undefined>(5);

  return (
    <TxForm
      noValidate
      labelWidth="5rem"
      className="max-w-lg"
      onSubmit={() => {
        TxToast.show({ variant: "success", title: "저장했습니다", message: `좌석 ${seats ?? 0}석` });
      }}
    >
      <TxForm.Input caption="팀 이름" placeholder="플랫폼팀" />
      <TxForm.Dropdown caption="역할" data={["관리자", "편집자", "뷰어"]} placeholder="고르세요" />
      <TxForm.Field caption="좌석">
        <TxNumberInput value={seats} onChange={setSeats} min={1} max={50} suffix="석" />
      </TxForm.Field>
      <TxForm.Field caption="알림">
        <TxRadioGroup defaultValue="email" inline>
          <TxRadio value="email" label="메일" />
          <TxRadio value="sms" label="문자" />
        </TxRadioGroup>
      </TxForm.Field>
      <TxForm.Field caption="음량">
        <TxSlider defaultValue={40} showValue />
      </TxForm.Field>
      <TxForm.Field caption="공개">
        <TxSwitch label="팀 목록에 보이기" defaultChecked />
      </TxForm.Field>
      <TxForm.CheckBox caption="약관" label="이용약관에 동의합니다" />
      <TxButton type="submit" label="저장" />
    </TxForm>
  );
}

/* --- Data ------------------------------------------------------------------------------ */

const MEMBERS = [
  { name: "김하늘", role: "관리자", state: "활동", variant: "success" },
  { name: "박도윤", role: "편집자", state: "활동", variant: "success" },
  { name: "이서아", role: "편집자", state: "휴가", variant: "warning" },
  { name: "최민준", role: "뷰어", state: "초대 중", variant: "info" }
] as const;

function DataDemo() {
  const [page, setPage] = useState(1);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <TxAvatarGroup max={3}>
          {MEMBERS.map((member) => (
            <TxAvatar key={member.name} name={member.name} />
          ))}
        </TxAvatarGroup>
        <span className={`text-sm ${muted}`}>플랫폼팀 · {MEMBERS.length}명</span>
      </div>

      <ul className="flex flex-col divide-y rounded-lg border" style={{ borderColor: "var(--tx-color-border)" }}>
        {MEMBERS.map((member) => (
          <li key={member.name} className="flex items-center gap-3 px-3 py-2" style={{ borderColor: "var(--tx-color-border)" }}>
            <TxAvatar name={member.name} size="sm" />
            <span className="font-medium">{member.name}</span>
            <span className={`text-sm ${muted}`}>{member.role}</span>
            <TxTag variant={member.variant} dot className="ms-auto">
              {member.state}
            </TxTag>
          </li>
        ))}
      </ul>

      <div className="flex justify-center">
        <TxPagination currentPage={page} totalRows={48} pageSize={4} onChangePage={setPage} />
      </div>
    </div>
  );
}

/* --- Layout ---------------------------------------------------------------------------- */

function LayoutDemo() {
  return (
    <div className="flex flex-col gap-3">
      <TxBreadcrumb>
        <TxBreadcrumb.Item>설정</TxBreadcrumb.Item>
        <TxBreadcrumb.Item>플랫폼팀</TxBreadcrumb.Item>
      </TxBreadcrumb>

      <TxTabs
        tabs={[
          {
            label: "일반",
            content: (
              <TxCard title="팀 정보" className="mt-3">
                <p className={`text-sm ${muted}`}>카드는 테두리 · 모서리 · 그림자 · 여백을 한 곳에서 정합니다.</p>
              </TxCard>
            )
          },
          {
            label: "자주 묻는 질문",
            content: (
              <div className="mt-3">
                <TxAccordion
                  items={[
                    { title: "팀원을 어떻게 초대하나요?", content: "설정 › 팀원에서 메일 주소로 초대합니다." },
                    { title: "역할은 몇 가지인가요?", content: "관리자, 편집자, 뷰어 세 가지입니다." }
                  ]}
                />
              </div>
            )
          }
        ]}
      />
    </div>
  );
}

/* --- Overlay --------------------------------------------------------------------------- */

function OverlayDemo() {
  const [modal, setModal] = useState(false);
  const [panel, setPanel] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <TxButton label="모달 열기" variant="secondary" onClick={() => setModal(true)} />
      <TxButton label="패널 열기" variant="secondary" onClick={() => setPanel(true)} />
      <TxButton
        label="삭제"
        variant="danger"
        onClick={async () => {
          const yes = await TxDialog.confirm({ title: "팀을 삭제할까요?", message: "되돌릴 수 없습니다.", tone: "danger", confirmLabel: "삭제" });
          TxToast.show({ variant: yes ? "info" : "success", title: yes ? "삭제했습니다" : "취소했습니다" });
        }}
      />
      <TxDropMenu
        label={
          <span className="tx-button" data-variant="ghost">
            <span className="tx-button__label">더 보기 ▾</span>
          </span>
        }
      >
        <TxDropMenu.Item onClick={() => TxToast.show({ title: "이름을 바꿉니다" })}>이름 바꾸기</TxDropMenu.Item>
        <TxDropMenu.Item onClick={() => TxToast.show({ title: "복제했습니다" })}>복제</TxDropMenu.Item>
      </TxDropMenu>
      <TxTooltip tip="마우스를 올리면 뜨는 짧은 설명입니다">
        <span className={`cursor-help text-sm underline decoration-dotted ${muted}`}>도움말</span>
      </TxTooltip>

      <TxModal open={modal} onClose={() => setModal(false)} title="팀 정보">
        <p className={muted}>화면을 덮고 뜨는 창입니다. Esc나 바깥을 눌러 닫습니다.</p>
      </TxModal>
      <TxSlidePanel open={panel} onClose={() => setPanel(false)} title="필터" side="right">
        <p className={muted}>화면 가장자리에서 나오는 패널입니다. 상세 보기나 필터에 씁니다.</p>
      </TxSlidePanel>
    </div>
  );
}

/* --- Feedback -------------------------------------------------------------------------- */

function FeedbackDemo() {
  const [progress, setProgress] = useState(40);
  const [loading, setLoading] = useState(true);

  return (
    <div className="flex flex-col gap-4">
      <TxAlert variant="info" title="새 버전이 있습니다">
        페이지 안에 놓는 안내 상자입니다.
      </TxAlert>

      <div className="flex flex-wrap items-center gap-3">
        <TxButton
          label="알림 띄우기"
          variant="secondary"
          onClick={() => {
            TxToast.show({ variant: "success", title: "저장했습니다" });
          }}
        />
        <TxBadge count={3}>
          <TxButton label="받은 편지" variant="ghost" />
        </TxBadge>
        <span className={`inline-flex items-center gap-2 text-sm ${muted}`}>
          <TxSpinner decorative /> 동기화 중
        </span>
      </div>

      <div className="flex items-center gap-3">
        <TxProgress value={progress} showValue label="업로드" className="flex-1" />
        <TxButton label="+20" variant="ghost" onClick={() => setProgress((value) => (value >= 100 ? 0 : Math.min(100, value + 20)))} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <TxSkeleton loading={loading} lines={3}>
            <p className={`text-sm ${muted}`}>불러온 내용이 이 자리에 들어옵니다.</p>
          </TxSkeleton>
          <TxButton label={loading ? "불러오기 끝내기" : "다시 불러오기"} variant="text" onClick={() => setLoading((value) => !value)} />
        </div>
        <TxEmptyState variant="no-data" title="아직 팀이 없습니다" description="첫 팀을 만들어 보세요" />
      </div>
    </div>
  );
}

/* --- Action ---------------------------------------------------------------------------- */

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function ActionDemo() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <TxButton label="primary" />
        <TxButton label="secondary" variant="secondary" />
        <TxButton label="danger" variant="danger" />
        <TxButton label="ghost" variant="ghost" />
        <TxButton label="text" variant="text" />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <TxButton label="2초 걸리는 저장" onClick={() => wait(2000)} />
        <span className={`text-sm ${muted}`}>onClick이 Promise를 돌려주면 끝날 때까지 잠기고 스피너가 붙습니다.</span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <code className="text-xs whitespace-nowrap sm:text-sm">import "@txstack/ui/styles.css";</code>
        <TxCopyButton value={'import "@txstack/ui/styles.css";'} variant="ghost" />
      </div>
    </div>
  );
}

export function Components() {
  return (
    <Page
      title="Components"
      lead={
        <>
          분류마다 컴포넌트 몇 개로 짠 작은 화면입니다. 모두 실제로 동작합니다. 전체 목록과 props는{" "}
          <Link to="/api/ui#components-by-category" className="underline">
            API › ui
          </Link>
          와 Storybook에서 찾아보세요.
        </>
      }
    >
      <div className="flex flex-wrap gap-3">
        <a href={STORYBOOK_URL} className="tx-button" data-variant="primary" target="_blank" rel="noreferrer">
          <span className="tx-button__label">Storybook에서 props 보기 ↗</span>
        </a>
        <Link to="/api/ui#components-by-category" className="tx-button" data-variant="secondary">
          <span className="tx-button__label">컴포넌트 49종 목록</span>
        </Link>
      </div>

      <Section
        title="Form"
        lead="입력란, 선택, 숫자, 라디오, 슬라이더, 스위치를 TxForm 한 벌로 묶었습니다. 캡션과 입력란이 자동으로 이어집니다."
        used={["TxForm", "TxInput", "TxDropdown", "TxNumberInput", "TxRadioGroup", "TxSlider", "TxSwitch", "TxCheckBox"]}
      >
        <FormDemo />
      </Section>

      <Section
        title="Data"
        lead={
          <>
            사람과 상태를 보여 주는 목록입니다. 큰 표가 필요하면 <code>@txstack/ui/aggrid</code>의 <code>TxAgGrid</code>를 씁니다.
          </>
        }
        used={["TxAvatar", "TxTag", "TxPagination", "TxAgGrid"]}
      >
        <DataDemo />
      </Section>

      <Section title="Layout" lead="경로 표시, 탭, 카드, 펼침 목록으로 설정 화면 하나를 나눴습니다. 화면 전체의 틀은 TxAppShell이 잡습니다." used={["TxBreadcrumb", "TxTabs", "TxCard", "TxAccordion", "TxAppShell"]}>
        <LayoutDemo />
      </Section>

      <Section title="Overlay" lead="모달, 옆 패널, 확인 창, 메뉴, 도움말입니다. 확인 창은 await로 사용자의 선택을 기다립니다." used={["TxModal", "TxSlidePanel", "TxDialog", "TxDropMenu", "TxTooltip"]}>
        <OverlayDemo />
      </Section>

      <Section title="Feedback" lead="안내, 알림, 개수 표시, 진행률, 불러오는 중 표시, 빈 화면 안내입니다. 알림은 Provider 없이 어디서든 띄웁니다." used={["TxAlert", "TxToast", "TxBadge", "TxSpinner", "TxProgress", "TxSkeleton", "TxEmptyState"]}>
        <FeedbackDemo />
      </Section>

      <Section title="Action" lead="버튼의 종류와, 오래 걸리는 작업을 저절로 잠그는 버튼, 복사 버튼입니다." used={["TxButton", "TxCopyButton"]}>
        <ActionDemo />
      </Section>
    </Page>
  );
}
