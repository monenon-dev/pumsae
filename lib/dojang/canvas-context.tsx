"use client";

import { createContext, useContext } from "react";
import type { CanvasBreakpoint, CanvasTextElement } from "@/types/dojang";

export type CanvasEditorContextValue = {
  editable: boolean;
  breakpoint: CanvasBreakpoint;
  onBreakpointChange: (breakpoint: CanvasBreakpoint) => void;
  onChange: (updater: (elements: CanvasTextElement[]) => CanvasTextElement[]) => void;
};

const defaultValue: CanvasEditorContextValue = {
  editable: false,
  breakpoint: "desktop",
  onBreakpointChange: () => {},
  onChange: () => {},
};

export const CanvasEditorContext = createContext<CanvasEditorContextValue>(defaultValue);

export function useCanvasEditor(): CanvasEditorContextValue {
  return useContext(CanvasEditorContext);
}
