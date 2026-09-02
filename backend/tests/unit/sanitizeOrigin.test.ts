import { describe, it, expect } from "vitest";
import { sanitizeOrigin } from "../../src/config/env";

describe("sanitizeOrigin", () => {
  it("returns a clean origin unchanged", () => {
    expect(sanitizeOrigin("https://aqsa-eight-kappa.vercel.app")).toBe(
      "https://aqsa-eight-kappa.vercel.app"
    );
  });

  it("strips markdown link wrapping", () => {
    expect(
      sanitizeOrigin("[https://aqsa-eight-kappa.vercel.app](https://aqsa-eight-kappa.vercel.app)")
    ).toBe("https://aqsa-eight-kappa.vercel.app");
  });

  it("strips a trailing slash", () => {
    expect(sanitizeOrigin("https://aqsa-eight-kappa.vercel.app/")).toBe(
      "https://aqsa-eight-kappa.vercel.app"
    );
  });

  it("strips a trailing slash inside a markdown-wrapped value", () => {
    expect(
      sanitizeOrigin("[https://aqsa-eight-kappa.vercel.app/](https://aqsa-eight-kappa.vercel.app/)")
    ).toBe("https://aqsa-eight-kappa.vercel.app");
  });

  it("trims surrounding whitespace", () => {
    expect(sanitizeOrigin("  https://aqsa-eight-kappa.vercel.app  ")).toBe(
      "https://aqsa-eight-kappa.vercel.app"
    );
  });

  it("leaves an unrecognized malformed value as-is rather than guessing", () => {
    expect(sanitizeOrigin("not-a-url")).toBe("not-a-url");
  });
});
