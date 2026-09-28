"use client";

import { createContext, useContext } from "react";
import type { PublicNewsItem } from "@/types/promo-template";

// 공개 홈페이지에서만 채워진다. 편집기 미리보기 등에서는 비어 있어 소식 섹션이
// 그려지지 않는다.
export const DojangNewsContext = createContext<PublicNewsItem[]>([]);

export function useDojangNews(): PublicNewsItem[] {
  return useContext(DojangNewsContext);
}
