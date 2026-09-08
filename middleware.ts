import { NextResponse, type NextRequest } from "next/server";

export function middleware(_request: NextRequest) {
  // 로그인 여부는 access token이 메모리에만 있어서 서버 미들웨어가 알 수 없다.
  // /dashboard 보호는 AuthGuard + /auth/refresh 로 클라이언트에서 처리한다.
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
