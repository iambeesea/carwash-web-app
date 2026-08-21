import assert from "node:assert/strict";
import test from "node:test";
import { createSessionToken, hashPassword, verifyPassword, verifySessionToken } from "./auth.js";

test("password hashes are salted and verifiable", async () => {
  const first = await hashPassword("CleanCar123");
  const second = await hashPassword("CleanCar123");

  assert.notEqual(first, second);
  assert.equal(await verifyPassword("CleanCar123", first), true);
  assert.equal(await verifyPassword("WrongPassword123", first), false);
});

test("session tokens preserve the authenticated account id", async () => {
  const token = await createSessionToken("local:test-user");
  const payload = await verifySessionToken(token);

  assert.equal(payload.sub, "local:test-user");
  assert.equal(payload.iss, "washwise-api");
  assert.equal(payload.aud, "washwise-web");
});
