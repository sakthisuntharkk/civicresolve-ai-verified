import { queryOptions } from "@tanstack/react-query";
import * as api from "@/services/api";

export const issuesQuery = queryOptions({ queryKey: ["issues"], queryFn: api.getIssues });

export const issueQuery = (id: string) =>
  queryOptions({ queryKey: ["issues", id], queryFn: () => api.getIssue(id) });

export const myIssuesQuery = queryOptions({ queryKey: ["issues", "mine"], queryFn: api.getMyIssues });

export const citizenSummaryQuery = queryOptions({
  queryKey: ["summary", "citizen"],
  queryFn: api.getCitizenSummary,
});

export const authorityMetricsQuery = queryOptions({
  queryKey: ["summary", "authority"],
  queryFn: api.getAuthorityMetrics,
});

export const analyticsQuery = queryOptions({ queryKey: ["analytics"], queryFn: api.getAnalytics });

export const wardsQuery = queryOptions({ queryKey: ["wards"], queryFn: api.getWards });
