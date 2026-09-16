import type { CaseRecord } from "@/types/database";

export type ChatIntent = "filter" | "group" | "aggregate" | "details" | "summary" | "help";

export type SupportedQuestion = {
  id: string;
  question: string;
  intent: ChatIntent;
  groupBy?: "category" | "status" | "priority" | "doctor";
  aggregate?: "count";
  filters?: {
    priority?: ("Low" | "Medium" | "High" | "Critical")[];
    status?: ("Active" | "Follow-up Due" | "Closed" | "Archived")[];
    category?: string[];
    followUp?: boolean;
    unresolved?: boolean;
    doctor?: string;
    daysOlderThan?: number;
    createdSinceDays?: number;
    updatedSinceDays?: number;
    timeRange?: "today" | "this_week";
    createdRange?: "today" | "this_week";
    updatedRange?: "today" | "this_week";
  };
};

export type ChatQueryResult = {
  intent: ChatIntent;
  filters: {
    priority?: string;
    status?: string;
    category?: string;
    doctor?: string;
    followUp?: boolean;
    unresolved?: boolean;
    daysOlderThan?: number;
    timeRange?: string;
  };
  matches: CaseRecord[];
  grouped?: Record<string, number>;
  groupBy?: "category" | "status" | "priority" | "doctor";
  response: string;
};

const supportedQuestions: SupportedQuestion[] = [
  {
    id: "high-priority-cases",
    question: "Show all high-priority cases",
    intent: "filter",
    filters: { priority: ["High", "Critical"] },
  },
  {
    id: "today-pending-cases",
    question: "List today's pending cases",
    intent: "filter",
    filters: { status: ["Follow-up Due", "Active"], timeRange: "today" },
  },
  {
    id: "follow-up-required",
    question: "Show cases requiring follow-up",
    intent: "filter",
    filters: { followUp: true },
  },
  {
    id: "unresolved-cases",
    question: "Show unresolved cases",
    intent: "filter",
    filters: { unresolved: true },
  },
  {
    id: "my-cases",
    question: "Show my cases",
    intent: "filter",
    filters: { doctor: "doctor@example.com" },
  },
  {
    id: "emergency-cases",
    question: "Show emergency cases",
    intent: "filter",
    filters: { category: ["Emergency"], priority: ["High", "Critical"] },
  },
  {
    id: "group-by-category",
    question: "Group cases by category",
    intent: "group",
    filters: {},
    groupBy: "category",
  },
  {
    id: "pending-emergency-count",
    question: "How many emergency cases are pending?",
    intent: "aggregate",
    filters: { category: ["Emergency"], status: ["Follow-up Due", "Active"] },
    aggregate: "count",
  },
  {
    id: "pending-over-3-days",
    question: "Show cases pending for more than 3 days",
    intent: "filter",
    filters: { status: ["Follow-up Due", "Active"], daysOlderThan: 3 },
  },
  {
    id: "completed-this-week",
    question: "Show completed cases from this week",
    intent: "filter",
    filters: { status: ["Closed"], timeRange: "this_week" },
  },
];

const predefinedQuestions = supportedQuestions.map((question) => question.question);

function normalize(value: string) {
  return value.toLowerCase().trim();
}

function hasTerm(value: string, term: string) {
  return new RegExp(`(^|\\b)${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(\\b|$)`, "i").test(value);
}

function resolveFilterDate(value: string | null | undefined) {
  if (!value) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toUtcDayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function isWithinTimeRange(value: string | null | undefined, range: "today" | "this_week") {
  const date = resolveFilterDate(value);
  if (!date) return false;

  const now = new Date();

  if (range === "today") {
    return toUtcDayKey(date) === toUtcDayKey(now);
  }

  const startOfWeek = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - now.getUTCDay()));
  startOfWeek.setUTCHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setUTCDate(startOfWeek.getUTCDate() + 6);
  endOfWeek.setUTCHours(23, 59, 59, 999);

  return date >= startOfWeek && date <= endOfWeek;
}

function matchesStatus(item: CaseRecord, statuses?: ("Active" | "Follow-up Due" | "Closed" | "Archived")[]) {
  return !statuses || statuses.includes(item.status as "Active" | "Follow-up Due" | "Closed" | "Archived");
}

function matchesPriority(item: CaseRecord, priorities?: ("Low" | "Medium" | "High" | "Critical")[]) {
  return !priorities || priorities.includes(item.priority as "Low" | "Medium" | "High" | "Critical");
}

function matchesCategory(item: CaseRecord, categories?: string[]) {
  if (!categories || categories.length === 0) return true;
  const normalizedCategory = (item.category ?? "General").toLowerCase();
  return categories.some((category) => normalizedCategory === category.toLowerCase());
}

function matchesDoctor(item: CaseRecord, doctor?: string) {
  if (!doctor) return true;
  return (item.assigned_doctor ?? "doctor@example.com").toLowerCase() === doctor.toLowerCase();
}

function matchesFollowUp(item: CaseRecord, followUp?: boolean) {
  if (!followUp) return true;
  return item.status === "Follow-up Due" || Boolean(item.follow_up_date);
}

function matchesUnresolved(item: CaseRecord, unresolved?: boolean) {
  if (!unresolved) return true;
  return item.status !== "Closed" && item.status !== "Archived";
}

function matchesDaysOlderThan(item: CaseRecord, daysOlderThan?: number) {
  if (!daysOlderThan) return true;
  const candidateDate = resolveFilterDate(item.follow_up_date) ?? resolveFilterDate(item.created_at);
  if (!candidateDate) return true;
  const diffDays = Math.floor((Date.now() - candidateDate.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays > daysOlderThan;
}

function matchesTimeRange(item: CaseRecord, range?: string) {
  if (!range) return true;
  if (range === "today") {
    return isWithinTimeRange(item.follow_up_date, "today") || isWithinTimeRange(item.created_at, "today") || isWithinTimeRange(item.updated_at, "today");
  }
  if (range === "this_week") {
    return isWithinTimeRange(item.follow_up_date, "this_week") || isWithinTimeRange(item.created_at, "this_week") || isWithinTimeRange(item.updated_at, "this_week");
  }
  return true;
}

function matchesDateWindow(item: CaseRecord, dateField: "created_at" | "updated_at" | "follow_up_date", range?: string, sinceDays?: number) {
  if (!range && sinceDays === undefined) return true;

  const candidateDate = resolveFilterDate(item[dateField]);
  if (!candidateDate) return false;

  if (range && !isWithinTimeRange(item[dateField], range as "today" | "this_week")) {
    return false;
  }

  if (sinceDays !== undefined) {
    const diffDays = Math.floor((Date.now() - candidateDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays > sinceDays) {
      return false;
    }
  }

  return true;
}

function resolveGroupBy(input: string): SupportedQuestion["groupBy"] {
  const normalized = normalize(input);

  if (/(department|category)/.test(normalized)) return "category";
  if (/(status)/.test(normalized)) return "status";
  if (/(priority)/.test(normalized)) return "priority";
  if (/(doctor|owner|assigned doctor)/.test(normalized)) return "doctor";

  return undefined;
}

function inferDimensionFilters(input: string, doctor = "doctor@example.com"): SupportedQuestion["filters"] {
  const normalized = normalize(input);
  const filters: SupportedQuestion["filters"] = {};

  const isPendingContext = (/(pending|waiting|awaiting|open)/.test(normalized) || hasTerm(normalized, "not closed")) && !hasTerm(normalized, "completed") && !hasTerm(normalized, "closed") && !hasTerm(normalized, "resolved") && !hasTerm(normalized, "finished");

  if (isPendingContext) {
    filters.status = ["Active", "Follow-up Due"];
  }

  if (hasTerm(normalized, "completed") || hasTerm(normalized, "closed") || hasTerm(normalized, "resolved") || hasTerm(normalized, "finished")) {
    filters.status = ["Closed"];
  }

  if (hasTerm(normalized, "follow-up") || hasTerm(normalized, "follow up") || hasTerm(normalized, "requires follow-up") || hasTerm(normalized, "needs follow-up") || hasTerm(normalized, "needs followup")) {
    filters.followUp = true;
  }

  if (hasTerm(normalized, "unresolved") || hasTerm(normalized, "still open") || hasTerm(normalized, "not resolved") || hasTerm(normalized, "not closed")) {
    filters.unresolved = true;
  }

  if (/(my cases|assigned to me|my assigned|my case)/.test(normalized)) {
    filters.doctor = doctor;
  }

  if (hasTerm(normalized, "emergency") || hasTerm(normalized, "urgent")) {
    filters.category = ["Emergency"];
    filters.priority = ["High", "Critical"];
  }

  if ((hasTerm(normalized, "high-priority") || hasTerm(normalized, "high priority") || hasTerm(normalized, "critical")) && !hasTerm(normalized, "not high") && !hasTerm(normalized, "low")) {
    filters.priority = ["High", "Critical"];
  }

  if (hasTerm(normalized, "normal") || hasTerm(normalized, "routine") || hasTerm(normalized, "standard") || hasTerm(normalized, "medium")) {
    filters.priority = ["Low", "Medium"];
  }

  if (hasTerm(normalized, "general") || hasTerm(normalized, "department") || hasTerm(normalized, "category")) {
    const category = hasTerm(normalized, "general") || hasTerm(normalized, "routine") ? "General" : undefined;
    if (category) {
      filters.category = [category];
    }
  }

  if (hasTerm(normalized, "today")) {
    filters.timeRange = "today";
    filters.createdRange = "today";
    filters.updatedRange = "today";
  }

  if (hasTerm(normalized, "this week") || hasTerm(normalized, "week")) {
    filters.timeRange = "this_week";
    filters.createdRange = "this_week";
    filters.updatedRange = "this_week";
  }

  const lastDaysMatch = normalized.match(/last\s+(\d+)\s+days|past\s+(\d+)\s+days|within\s+(\d+)\s+days/);
  if (lastDaysMatch) {
    const days = Number(lastDaysMatch[1] ?? lastDaysMatch[2] ?? lastDaysMatch[3]);
    if (days > 0) {
      filters.createdSinceDays = days;
      filters.updatedSinceDays = days;
    }
  }

  const olderMatch = normalized.match(/(more than|over|older than)\s+(\d+)\s+days|for\s+(\d+)\s+days/);
  if (olderMatch) {
    const days = Number(olderMatch[2] ?? olderMatch[3]);
    if (days > 0) {
      filters.daysOlderThan = days;
    }
  }

  return filters;
}

function parseFlexibleAnalysis(input: string, doctor = "doctor@example.com") {
  const normalized = normalize(input);
  const filters = inferDimensionFilters(input, doctor) ?? {};
  const groupBy = resolveGroupBy(input);

  if (!groupBy && Object.keys(filters).length === 0) {
    return null;
  }

  let intent: ChatIntent = "filter";
  if (groupBy) {
    intent = "group";
  } else if (/(how many|count|total)/.test(normalized)) {
    intent = "aggregate";
  }

  return { filters, groupBy, intent };
}

function inferSupportedQuery(input: string, doctor = "doctor@example.com"): SupportedQuestion | undefined {
  const normalized = normalize(input);

  const dynamicAnalysis = parseFlexibleAnalysis(input, doctor);
  const exactQuestionMatch = supportedQuestions.some((rule) => normalize(rule.question) === normalized);

  if (!exactQuestionMatch && dynamicAnalysis) {
    return {
      id: dynamicAnalysis.groupBy ? "dynamic-group" : "dynamic-filter",
      question: input,
      intent: dynamicAnalysis.intent,
      groupBy: dynamicAnalysis.groupBy,
      filters: dynamicAnalysis.filters,
    };
  }

  const matchScores = supportedQuestions.map((rule) => {
    const question = normalize(rule.question);
    let score = 0;

    if (normalized.includes(question)) score += 100;

    if (rule.id === "high-priority-cases") {
      if (/show.*high[- ]priority.*cases|show.*urgent.*cases|show.*emergency.*cases/.test(normalized)) score += 40;
    }

    if (rule.id === "today-pending-cases") {
      if (/today.*pending|pending.*today|list.*today.*pending/.test(normalized)) score += 40;
    }

    if (rule.id === "follow-up-required") {
      if (/follow[- ]up|requires follow[- ]up|needs follow[- ]up/.test(normalized)) score += 35;
    }

    if (rule.id === "unresolved-cases") {
      if (/unresolved|open cases|not closed/.test(normalized)) score += 35;
    }

    if (rule.id === "my-cases") {
      if (/my cases|my case|show my/.test(normalized)) score += 35;
    }

    if (rule.id === "emergency-cases") {
      if (/emergency.*cases|show.*emergency|urgent.*cases/.test(normalized)) score += 30;
    }

    if (rule.id === "group-by-category") {
      if (/group.*by.*category|category.*group|cases by category/.test(normalized)) score += 50;
    }

    if (rule.id === "pending-emergency-count") {
      if (/how many.*emergency.*pending|emergency.*pending.*count|how many.*pending.*emergency/.test(normalized)) score += 80;
    }

    if (rule.id === "pending-over-3-days") {
      if (/pending.*more than 3 days|3 days.*pending|over 3 days/.test(normalized)) score += 45;
    }

    if (rule.id === "completed-this-week") {
      if (/completed.*this week|closed.*this week|finished.*this week/.test(normalized)) score += 45;
    }

    return { rule, score };
  });

  const bestMatch = matchScores
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score)[0];

  if (!bestMatch) return undefined;

  const selectedRule = bestMatch.rule;
  if (selectedRule.id === "my-cases") {
    return {
      ...selectedRule,
      filters: {
        ...selectedRule.filters,
        doctor,
      },
    };
  }

  return selectedRule;
}

export function getPredefinedQuestions() {
  return predefinedQuestions;
}

export function executeCaseQuery(input: string, cases: CaseRecord[], doctor = "doctor@example.com"): ChatQueryResult {
  const supported = inferSupportedQuery(input, doctor);

  if (!supported) {
    return {
      intent: "help",
      filters: {},
      matches: [],
      response: "Supported queries: " + supportedQuestions.map((item) => item.question).slice(0, 6).join("; ") + ".",
    };
  }

  const inferredFilters = inferDimensionFilters(input, doctor) ?? {};
  const filters = { ...inferredFilters, ...(supported.filters ?? {}) };
  let matches = [...cases].filter((item) => {
    if (!matchesStatus(item, filters.status)) return false;
    if (!matchesPriority(item, filters.priority)) return false;
    if (!matchesCategory(item, filters.category)) return false;
    if (!matchesDoctor(item, filters.doctor)) return false;
    if (!matchesFollowUp(item, filters.followUp)) return false;
    if (!matchesUnresolved(item, filters.unresolved)) return false;
    if (!matchesDaysOlderThan(item, filters.daysOlderThan)) return false;
    if (!matchesDateWindow(item, "created_at", filters.createdRange, filters.createdSinceDays)) return false;
    if (!matchesDateWindow(item, "updated_at", filters.updatedRange, filters.updatedSinceDays)) return false;
    if (!matchesTimeRange(item, filters.timeRange)) return false;
    return true;
  });

  if (supported.id === "high-priority-cases") {
    matches = matches.filter((item) => item.priority === "High" || item.priority === "Critical");
  }

  if (supported.id === "emergency-cases") {
    matches = matches.filter((item) => {
      const category = (item.category ?? "").toLowerCase();
      return category === "emergency" || item.priority === "High" || item.priority === "Critical";
    });
  }

  if (supported.id === "pending-emergency-count") {
    const emergencyPending = matches.filter((item) => {
      const category = (item.category ?? "").toLowerCase();
      return (category === "emergency" || item.priority === "High" || item.priority === "Critical") && (item.status === "Follow-up Due" || item.status === "Active");
    });
    return {
      intent: "aggregate",
      filters: { category: "Emergency", status: "Follow-up Due" },
      matches: emergencyPending,
      response: `There are ${emergencyPending.length} emergency cases pending.`,
    };
  }

  const groupBy = supported.groupBy ?? (supported.intent === "group" ? resolveGroupBy(input) : undefined);
  if (groupBy || supported.id === "group-by-category") {
    const effectiveGroupBy = groupBy ?? "category";
    const grouped = matches.reduce<Record<string, number>>((accumulator, item) => {
      const groupValue = (() => {
        switch (effectiveGroupBy) {
          case "status": return item.status;
          case "priority": return item.priority;
          case "doctor": return item.assigned_doctor ?? "Unassigned";
          case "category":
          default: return item.category ?? "General";
        }
      })();

      accumulator[groupValue] = (accumulator[groupValue] ?? 0) + 1;
      return accumulator;
    }, {});

    return {
      intent: "group",
      filters: filters as ChatQueryResult["filters"],
      matches,
      grouped,
      groupBy: effectiveGroupBy,
      response: `Cases grouped by ${effectiveGroupBy}: ${Object.entries(grouped).map(([key, value]) => `${key}: ${value}`).join(", ") || "no groups"}.`,
    };
  }

  if (supported.intent === "details" && matches.length > 0) {
    const caseRecord = matches[0];
    return {
      intent: "details",
      filters: {
        category: caseRecord.category ?? "General",
      },
      matches,
      response: `${caseRecord.case_reference} is ${caseRecord.status.toLowerCase()} with ${caseRecord.priority.toLowerCase()} priority. Follow-up: ${caseRecord.follow_up_date ?? "not set"}.`,
    };
  }

  if (supported.intent === "summary") {
    const open = matches.filter((item) => item.status !== "Closed" && item.status !== "Archived").length;
    const critical = matches.filter((item) => item.priority === "Critical").length;
    return {
      intent: "summary",
      filters: filters as ChatQueryResult["filters"],
      matches,
      response: `Summary: ${open} open cases and ${critical} critical cases.`,
    };
  }

  if (supported.intent === "aggregate") {
    return {
      intent: "aggregate",
      filters: filters as ChatQueryResult["filters"],
      matches,
      response: `I found ${matches.length} matching case(s).`,
    };
  }

  return {
    intent: supported.intent,
    filters: filters as ChatQueryResult["filters"],
    matches,
    response: matches.length > 0
      ? `I found ${matches.length} case(s) matching your request.`
      : "No cases match the current filter set.",
  };
}
