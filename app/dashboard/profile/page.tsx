import { redirect } from "next/navigation";

// 프로필은 대시보드 밖의 단독 페이지(/profile)로 옮겼다. 예전 주소는 그쪽으로 보낸다.
export default function DashboardProfilePage() {
  redirect("/profile");
}
