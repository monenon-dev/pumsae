export function daysAgoLabel(iso: string): string {
  const then = new Date(iso).getTime();
  const diffDays = Math.floor((Date.now() - then) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return "오늘";
  }
  return `${diffDays}일 전`;
}
