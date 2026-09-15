import type { CaseRecord } from "@/types/database";

export const cases: CaseRecord[] = [
  {
    id: "7c5f8f6a-4d3d-4e4c-9b70-000000000101",
    case_reference: "HR-2026-0101",
    status: "Active",
    priority: "High",
    follow_up_date: "2026-09-19",
    notes: "Follow up with the assigned owner before the next review.",
    created_at: "2026-09-01T09:00:00Z",
    updated_at: "2026-09-15T09:00:00Z",
    closed_at: null,
  },
  {
    id: "7c5f8f6a-4d3d-4e4c-9b70-000000000104",
    case_reference: "HR-2026-0104",
    status: "Follow-up Due",
    priority: "Critical",
    follow_up_date: "2026-09-21",
    notes: "Review the latest evidence with the case owner.",
    created_at: "2026-09-02T09:00:00Z",
    updated_at: "2026-09-14T09:00:00Z",
    closed_at: null,
  },
  {
    id: "7c5f8f6a-4d3d-4e4c-9b70-000000000118",
    case_reference: "HR-2026-0118",
    status: "Active",
    priority: "Medium",
    follow_up_date: "2026-09-24",
    notes: "Confirm the next checkpoint with the owner.",
    created_at: "2026-09-03T09:00:00Z",
    updated_at: "2026-09-12T09:00:00Z",
    closed_at: null,
  },
];

export function getCaseById(id: string) {
  return cases.find((item) => item.id === id);
}