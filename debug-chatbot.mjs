import { executeCaseQuery } from './src/lib/chatbot.ts';

const today = new Date();
const todayKey = today.toISOString().slice(0, 10);
const todayPlusOne = new Date(today.getTime() + 86400000).toISOString().slice(0, 10);
const thisWeekDate = new Date(today.getTime() - 86400000 * 2).toISOString().slice(0, 10);

const dynamicCases = [
  { id: '1', case_reference: 'HR-2026-0101', priority: 'High', status: 'Active', follow_up_date: todayKey, notes: 'Follow up', created_at: todayKey + 'T00:00:00Z', updated_at: todayKey + 'T00:00:00Z', closed_at: null, category: 'Emergency', assigned_doctor: 'doctor@example.com' },
  { id: '2', case_reference: 'HR-2026-0102', priority: 'Critical', status: 'Follow-up Due', follow_up_date: todayPlusOne, notes: 'Escalated', created_at: thisWeekDate + 'T00:00:00Z', updated_at: thisWeekDate + 'T00:00:00Z', closed_at: null, category: 'Emergency', assigned_doctor: 'doctor@example.com' },
  { id: '3', case_reference: 'HR-2026-0103', priority: 'Medium', status: 'Closed', follow_up_date: thisWeekDate, notes: 'Resolved', created_at: thisWeekDate + 'T00:00:00Z', updated_at: thisWeekDate + 'T00:00:00Z', closed_at: thisWeekDate + 'T00:00:00Z', category: 'General', assigned_doctor: 'other@example.com' },
];

for (const q of ["List today's pending cases", 'Show completed cases from this week', 'How many emergency cases are pending?']) {
  console.log(q);
  console.log(JSON.stringify(executeCaseQuery(q, dynamicCases), null, 2));
}
