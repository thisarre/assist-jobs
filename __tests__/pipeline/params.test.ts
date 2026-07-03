import { describe, it, expect } from "vitest";
import {
  parsePipelineParams,
  buildPipelineHref,
} from "@/features/opportunities/pipeline/params";

describe("parsePipelineParams", () => {
  it("applies defaults for empty input", () => {
    const p = parsePipelineParams({});
    expect(p).toEqual({
      view: "table",
      q: "",
      status: "",
      priority: "",
      sort: "createdAt",
      dir: "desc",
    });
  });

  it("reads valid values", () => {
    const p = parsePipelineParams({
      view: "kanban",
      q: "  react ",
      status: "contacted",
      priority: "high",
      sort: "dailyRate",
      dir: "asc",
    });
    expect(p.view).toBe("kanban");
    expect(p.q).toBe("react");
    expect(p.status).toBe("contacted");
    expect(p.priority).toBe("high");
    expect(p.sort).toBe("dailyRate");
    expect(p.dir).toBe("asc");
  });

  it("falls back on invalid enum/sort/dir/view values", () => {
    const p = parsePipelineParams({
      view: "grid",
      status: "nope",
      priority: "urgent",
      sort: "hacker",
      dir: "sideways",
    });
    expect(p.view).toBe("table");
    expect(p.status).toBe("");
    expect(p.priority).toBe("");
    expect(p.sort).toBe("createdAt");
    expect(p.dir).toBe("desc");
  });

  it("takes the first value when a param is an array", () => {
    const p = parsePipelineParams({ q: ["a", "b"] });
    expect(p.q).toBe("a");
  });
});

describe("buildPipelineHref", () => {
  const base = parsePipelineParams({});

  it("omits default values", () => {
    expect(buildPipelineHref(base, {})).toBe("/opportunities");
  });

  it("includes non-default overrides", () => {
    expect(buildPipelineHref(base, { view: "kanban" })).toBe(
      "/opportunities?view=kanban"
    );
    expect(buildPipelineHref(base, { status: "won", sort: "title", dir: "asc" })).toBe(
      "/opportunities?status=won&sort=title&dir=asc"
    );
  });

  it("merges over the current params", () => {
    const current = parsePipelineParams({ status: "contacted" });
    expect(buildPipelineHref(current, { priority: "high" })).toBe(
      "/opportunities?status=contacted&priority=high"
    );
  });
});
