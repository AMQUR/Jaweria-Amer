/**
 * Conversion headline selection.
 *
 * The line is computed from live figures so copy can never drift from the
 * data. "The norm" is only honest while A/A* is a clear majority of the
 * publicly shared records; otherwise the scale line is used. Neither line
 * promises a future grade.
 */
export interface HeadlineInput {
  aOrAStarPct: number;
  aStar: number;
  aOrAStar: number;
  sharedResults: number;
}

export function selectHeadline(input: HeadlineInput): { line: string; key: "norm" | "count" } {
  if (input.aOrAStarPct >= 75) {
    return { key: "norm", line: "Want the A*? Learn where A and A* are the norm." };
  }
  return { key: "count", line: `${input.aStar} A* results in one exam session. Your turn next.` };
}
