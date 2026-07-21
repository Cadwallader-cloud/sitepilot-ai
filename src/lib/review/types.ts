import type { Website } from "@/lib/website";

export type ReviewStatus = "pass" | "warn" | "fail";

export type Issue = {
  id: string;
  message: string;
  severity: ReviewStatus;
};

export type ReviewResult = {
  score: number;
  passed: boolean;
  issues: Issue[];
  recommendations: string[];
};

/** General review contract — Website in, scored result out. */
export interface Reviewer {
  id: string;
  review(website: Website): Promise<ReviewResult>;
}

/** @deprecated Use Issue — kept for content section checks */
export type ReviewCheck = {
  id: string;
  status: ReviewStatus;
  message: string;
};
