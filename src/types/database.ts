export type CaseStatus = "Active" | "Follow-up Due" | "Closed" | "Archived";
export type CasePriority = "Low" | "Medium" | "High" | "Critical";

export interface CaseRecord {
  id: string;
  case_reference: string;
  priority: CasePriority;
  status: CaseStatus;
  notes: string;
  follow_up_date: string | null;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  category?: string;
  assigned_doctor?: string;
}
