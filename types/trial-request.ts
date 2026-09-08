export const DESIRED_CLASSES = [
  "KIDS",
  "ELEMENTARY",
  "MIDDLE_HIGH",
  "ADULT",
] as const;

export type DesiredClass = (typeof DESIRED_CLASSES)[number];

export const DESIRED_CLASS_LABELS: Record<DesiredClass, string> = {
  KIDS: "유치부",
  ELEMENTARY: "초등",
  MIDDLE_HIGH: "중고등",
  ADULT: "성인",
};

export const TRIAL_STATUSES = ["PENDING", "CONFIRMED", "DECLINED"] as const;

export type TrialRequestStatus = (typeof TRIAL_STATUSES)[number];

export const TRIAL_STATUS_LABELS: Record<TrialRequestStatus, string> = {
  PENDING: "대기",
  CONFIRMED: "확정",
  DECLINED: "거절",
};

export type TrialRequest = {
  id: string;
  dojangId: string;
  studentName: string;
  parentName: string;
  parentPhone: string;
  desiredClass: DesiredClass | null;
  memo: string | null;
  status: TrialRequestStatus;
  createdAt: string;
};
