import { describe, it, expect } from "vitest";
import { MESSAGE_TYPES } from "@/lib/constants";

describe("MESSAGE_TYPES", () => {
  it("contains the eight outreach message types", () => {
    expect(MESSAGE_TYPES).toEqual([
      "linkedin_connection",
      "linkedin_followup",
      "cold_email",
      "recruiter_reply",
      "polite_decline",
      "interview_prep",
      "questions_to_ask",
      "short_pitch",
    ]);
  });
});
