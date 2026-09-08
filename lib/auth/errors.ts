export function mapAuthError(message: string): string {
  if (/[가-힣]/.test(message)) {
    return message;
  }

  const normalized = message.toLowerCase();

  if (
    normalized.includes("already registered") ||
    normalized.includes("already been registered") ||
    normalized.includes("user already")
  ) {
    return "이미 가입된 이메일입니다. 로그인해 주세요.";
  }

  if (normalized.includes("invalid login credentials")) {
    return "이메일 또는 비밀번호가 올바르지 않습니다.";
  }

  if (normalized.includes("email not confirmed")) {
    return "이메일 인증이 아직 완료되지 않았습니다. 받은 편지함을 확인해 주세요.";
  }

  if (normalized.includes("password should be") || normalized.includes("password is known")) {
    return "비밀번호는 6자 이상이어야 합니다.";
  }

  if (normalized.includes("rate limit") || normalized.includes("too many")) {
    return "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.";
  }

  if (normalized.includes("invalid email")) {
    return "올바른 이메일 주소를 입력해 주세요.";
  }

  return "요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.";
}
