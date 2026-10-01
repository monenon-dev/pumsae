import type { Metadata } from "next";
import Link from "next/link";
import { PumsaeLogo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export const metadata: Metadata = {
  title: "개인정보처리방침 | PUMSAE",
  description: "PUMSAE가 수집하는 개인정보와 그 이용·보관·파기 방법을 안내합니다.",
};

// 방침을 바꾸면 날짜를 새로 적고, 이전 내용은 git 기록으로 남긴다.
const EFFECTIVE_DATE = "2026년 10월 1일";

const OFFICER = {
  name: "조서희",
  email: "whtjgml2002@gmail.com",
};

// 체험 신청 보관 기간. backend/app/core/retention.py의 TRIAL_RETENTION_DAYS와 맞춘다.
const TRIAL_RETENTION = "신청일로부터 1년";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold text-pumsae-ink">{title}</h2>
      <div className="mt-3 space-y-3 text-[15px] leading-7 text-zinc-700">{children}</div>
    </section>
  );
}

function Table({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-pumsae-line">
      <table className="w-full min-w-[520px] text-left text-sm">
        <thead className="bg-pumsae-line/60 text-pumsae-ink">
          <tr>
            {head.map((cell) => (
              <th key={cell} className="px-3 py-2 font-semibold">
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[0]} className="border-t border-pumsae-line align-top">
              {row.map((cell, index) => (
                <td key={index} className="px-3 py-2.5 leading-6">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-pumsae-bg">
      <header className="border-b border-pumsae-line bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" aria-label="PUMSAE 홈">
            <PumsaeLogo />
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-20 pt-10 sm:px-6">
        <h1 className="text-2xl font-bold tracking-tight text-pumsae-ink sm:text-3xl">
          개인정보처리방침
        </h1>
        <p className="mt-2 text-sm text-pumsae-muted">시행일: {EFFECTIVE_DATE}</p>

        <p className="mt-6 text-[15px] leading-7 text-zinc-700">
          PUMSAE(이하 &ldquo;서비스&rdquo;)는 태권도장이 홈페이지를 만들고 학부모의 체험 신청을
          받을 수 있게 돕는 서비스입니다. 서비스는 「개인정보 보호법」을 지키며, 어떤 개인정보를
          왜 받고 어떻게 보관·파기하는지 아래와 같이 알려드립니다.
        </p>
        <p className="mt-3 text-[15px] leading-7 text-zinc-700">
          학부모가 도장 홈페이지에서 남기는 체험 신청과 도장이 올리는 사진은 <b>해당 도장</b>이
          받고 관리하는 정보이며, 서비스는 도장을 대신해 이를 저장·전달합니다.
        </p>

        <Section title="1. 처리하는 개인정보와 목적">
          <Table
            head={["구분", "항목", "목적"]}
            rows={[
              [
                "관장·사범 회원",
                "이메일, 이름, 비밀번호(암호화 저장), 도장 이름·역할",
                "회원 가입과 로그인, 도장 홈페이지·대시보드 제공, 문의 응대",
              ],
              [
                "체험 신청 (학부모)",
                "학생 이름, 보호자 이름, 보호자 연락처 / 선택: 희망 반, 메모",
                "도장이 체험 수업 일정을 안내하고 연락하기 위함",
              ],
              [
                "사진첩",
                "도장이 올린 수업·행사 사진(사진 속 인물 포함)",
                "도장 홈페이지 사진첩 제공. 학부모 공개로 정한 앨범만 공개",
              ],
              [
                "모바일 앱",
                "푸시 알림 토큰(기기 식별값)",
                "새 체험 신청을 관장·사범의 휴대폰으로 알리기 위함",
              ],
              [
                "자동 수집",
                "로그인 유지 쿠키, 접속 기록(IP 주소, 요청 시각)",
                "로그인 상태 유지, 서비스 안정성·보안 확인",
              ],
            ]}
          />
          <p>
            서비스는 광고·마케팅 목적으로 개인정보를 쓰지 않으며, 방문 분석 도구나 광고 추적
            쿠키를 사용하지 않습니다.
          </p>
        </Section>

        <Section title="2. 보유 기간과 파기">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>회원 정보: 회원 탈퇴 시까지. 탈퇴하면 지체 없이 파기합니다.</li>
            <li>
              체험 신청: <b>{TRIAL_RETENTION}</b>. 기간이 지나면 서버가 매일 자동으로 삭제합니다.
              도장이 탈퇴하면 그 도장의 신청도 함께 삭제합니다.
            </li>
            <li>사진첩 사진: 도장이 삭제하거나 도장이 탈퇴할 때까지.</li>
            <li>푸시 알림 토큰: 로그아웃하거나 앱을 삭제해 토큰이 무효가 될 때까지.</li>
          </ul>
          <p>
            전자 정보는 복구할 수 없는 방법으로 데이터베이스와 저장소에서 삭제합니다. 법령에 따라
            보관해야 하는 정보가 생기면 그 기간 동안만 따로 보관합니다.
          </p>
        </Section>

        <Section title="3. 제3자 제공">
          <p>
            서비스는 개인정보를 제3자에게 제공하지 않습니다. 체험 신청 정보는 신청한 도장의
            관장·사범에게만 보이며, 법령에 따른 요청이 있는 경우에만 예외로 합니다.
          </p>
        </Section>

        <Section title="4. 처리 위탁과 국외 이전">
          <p>
            서비스 운영을 위해 아래 업체의 클라우드에 개인정보를 저장·처리합니다. 모두 해외에 서버가
            있어, 서비스 이용 시 인터넷을 통해 수시로 전송됩니다.
          </p>
          <Table
            head={["업체", "맡기는 일", "이전 국가"]}
            rows={[
              ["Neon Inc.", "데이터베이스(회원·체험 신청 등 전체 정보) 보관", "싱가포르"],
              ["Railway Corp.", "API 서버 운영", "미국 등 업체 서버 소재국"],
              ["Vercel Inc.", "웹사이트 운영", "미국 등 업체 서버 소재국"],
              ["Cloudflare, Inc.", "사진 파일 저장(R2)", "미국 등 업체 서버 소재국"],
              ["Google LLC (Firebase)", "모바일 앱 푸시 알림 전송", "미국 등 업체 서버 소재국"],
            ]}
          />
          <p>
            보관 기간은 위 2번과 같습니다. 국외 이전을 원하지 않으면 서비스 가입이나 체험 신청을
            하지 않을 수 있으나, 이 경우 서비스를 이용할 수 없습니다.
          </p>
        </Section>

        <Section title="5. 정보주체의 권리와 행사 방법">
          <p>
            누구든지 자신의 개인정보를 열람·정정·삭제하거나 처리 정지를 요구할 수 있습니다.
          </p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>관장·사범: 이름과 비밀번호는 프로필 화면에서 직접 바꿀 수 있습니다.</li>
            <li>
              회원 탈퇴, 체험 신청 삭제, 사진 삭제 요청: 아래 개인정보 보호책임자에게 이메일로
              요청하시면 확인 후 지체 없이 처리합니다.
            </li>
            <li>학부모는 체험 신청을 받은 도장에 직접 요청할 수도 있습니다.</li>
          </ul>
        </Section>

        <Section title="6. 안전성 확보 조치">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>비밀번호는 복원할 수 없는 방식(bcrypt)으로 암호화해 저장합니다.</li>
            <li>모든 통신은 HTTPS로 암호화합니다.</li>
            <li>도장마다 자기 도장의 정보만 볼 수 있도록 접근 권한을 나눕니다.</li>
            <li>로그인 유지 쿠키는 스크립트가 읽을 수 없는 httpOnly 쿠키로 발급합니다.</li>
          </ul>
        </Section>

        <Section title="7. 쿠키">
          <p>
            서비스는 로그인 상태를 유지하기 위한 쿠키 하나만 사용합니다. 브라우저 설정에서 쿠키를
            막을 수 있지만, 그러면 로그인 상태가 유지되지 않습니다.
          </p>
        </Section>

        <Section title="8. 아동의 개인정보">
          <p>
            체험 신청서의 학생 이름은 보호자가 직접 입력합니다. 사진첩은 기본이 비공개이며, 도장이
            학부모 공개로 정한 앨범만 도장 홈페이지에 보입니다. 사진 게시에 대한 동의는 도장이
            학부모에게 받아야 합니다.
          </p>
        </Section>

        <Section title="9. 개인정보 보호책임자">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>책임자: {OFFICER.name}</li>
            <li>
              연락처:{" "}
              <a href={`mailto:${OFFICER.email}`} className="underline">
                {OFFICER.email}
              </a>
            </li>
          </ul>
          <p>개인정보 관련 문의·불만·피해 구제는 위 연락처로 보내 주세요.</p>
        </Section>

        <Section title="10. 권익 침해 구제">
          <p>개인정보 침해로 도움이 필요하면 아래 기관에 문의할 수 있습니다.</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>개인정보침해신고센터: (국번 없이) 118, privacy.kisa.or.kr</li>
            <li>개인정보분쟁조정위원회: 1833-6972, www.kopico.go.kr</li>
            <li>대검찰청 사이버수사과: (국번 없이) 1301</li>
            <li>경찰청 사이버수사국: (국번 없이) 182</li>
          </ul>
        </Section>

        <Section title="11. 방침의 변경">
          <p>
            이 방침이 바뀌면 시행 7일 전에 이 페이지에 알립니다. 수집 항목이나 이용 목적이 크게
            바뀌는 경우에는 30일 전에 알립니다.
          </p>
        </Section>
      </main>
    </div>
  );
}
