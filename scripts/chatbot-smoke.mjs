import assert from 'node:assert/strict';
import { executeCaseQuery } from '../src/lib/chatbot.ts';

const cases = [
  { id: '1', case_reference: 'HR-2026-0101', priority: 'High', status: 'Active', follow_up_date: '2026-09-19', notes: 'Follow up', created_at: '2026-09-01T00:00:00Z', updated_at: '2026-09-01T00:00:00Z', closed_at: null },
  { id: '2', case_reference: 'HR-2026-0102', priority: 'Critical', status: 'Follow-up Due', follow_up_date: '2026-09-17', notes: 'Escalated', created_at: '2026-09-02T00:00:00Z', updated_at: '2026-09-02T00:00:00Z', closed_at: null },
  { id: '3', case_reference: 'HR-2026-0103', priority: 'Medium', status: 'Closed', follow_up_date: null, notes: 'Resolved', created_at: '2026-09-03T00:00:00Z', updated_at: '2026-09-03T00:00:00Z', closed_at: '2026-09-10T00:00:00Z' },
];

const today = new Date();
const todayKey = today.toISOString().slice(0, 10);
const todayPlusOne = new Date(today.getTime() + 86400000).toISOString().slice(0, 10);
const thisWeekDate = new Date(today.getTime() - 86400000 * 2).toISOString().slice(0, 10);

const dynamicCases = [
  { id: '1', case_reference: 'HR-2026-0101', priority: 'High', status: 'Active', follow_up_date: todayKey, notes: 'Follow up', created_at: todayKey + 'T00:00:00Z', updated_at: todayKey + 'T00:00:00Z', closed_at: null, category: 'Emergency', assigned_doctor: 'doctor@example.com' },
  { id: '2', case_reference: 'HR-2026-0102', priority: 'Critical', status: 'Follow-up Due', follow_up_date: todayPlusOne, notes: 'Escalated', created_at: thisWeekDate + 'T00:00:00Z', updated_at: thisWeekDate + 'T00:00:00Z', closed_at: null, category: 'Emergency', assigned_doctor: 'doctor@example.com' },
  { id: '3', case_reference: 'HR-2026-0103', priority: 'Medium', status: 'Closed', follow_up_date: thisWeekDate, notes: 'Resolved', created_at: thisWeekDate + 'T00:00:00Z', updated_at: thisWeekDate + 'T00:00:00Z', closed_at: thisWeekDate + 'T00:00:00Z', category: 'General', assigned_doctor: 'other@example.com' },
];

const highPriority = executeCaseQuery('Show all high-priority cases', dynamicCases);
assert.equal(highPriority.intent, 'filter');
assert.equal(highPriority.matches.length, 2);

const pendingToday = executeCaseQuery("List today's pending cases", dynamicCases);
assert.equal(pendingToday.intent, 'filter');
assert.equal(pendingToday.matches.length, 1);

const emergencyPending = executeCaseQuery('How many emergency cases are pending?', dynamicCases);
assert.equal(emergencyPending.intent, 'aggregate');
assert.equal(emergencyPending.matches.length, 2);

const grouped = executeCaseQuery('Group cases by category', dynamicCases);
assert.equal(grouped.intent, 'group');
assert.ok(grouped.grouped && grouped.grouped.Emergency >= 2);

const myCases = executeCaseQuery('Show my cases', dynamicCases);
assert.equal(myCases.matches.length, 2);

const completedThisWeek = executeCaseQuery('Show completed cases from this week', dynamicCases);
assert.equal(completedThisWeek.matches.length, 1);

const flexibleQuery = executeCaseQuery('Show unresolved cases from this week that need follow-up and group them by department.', dynamicCases);
assert.equal(flexibleQuery.intent, 'group');
assert.equal(flexibleQuery.matches.length, 2);
assert.equal(flexibleQuery.grouped?.Emergency, 2);

console.log('chatbot smoke ok');
