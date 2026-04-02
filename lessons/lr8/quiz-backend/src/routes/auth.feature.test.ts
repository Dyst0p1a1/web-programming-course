import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { createTestApp } from "../../tests/setup/test-app.js";

describe("auth routes", () => {
  let app: Awaited<ReturnType<typeof createTestApp>>["app"];
  let cleanup: Awaited<ReturnType<typeof createTestApp>>["cleanup"] | undefined;

  beforeEach(async () => {
    const testApp = await createTestApp("auth-feature");
    app = testApp.app;
    cleanup = testApp.cleanup;
  });

  afterEach(async () => {
    if (cleanup) {
      await cleanup();
    }
  });

  it("authenticates user with test GitHub code", async () => {
    const response = await app.request("/api/auth/github/callback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: "test_code" }),
    });

    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.token).toBeTypeOf("string");
    expect(body.user.email).toBe("testuser@example.com");
  });

  it("returns current user for valid token", async () => {
    const authResponse = await app.request("/api/auth/github/callback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: "test_code" }),
    });
    const { token } = await authResponse.json();

    const meResponse = await app.request("/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    expect(meResponse.status).toBe(200);
    const body = await meResponse.json();
    expect(body.user.githubId).toBe("123456");
  });

  it("rejects request without token", async () => {
    const response = await app.request("/api/auth/me");
    expect(response.status).toBe(401);
  });
});