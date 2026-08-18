import assert from "node:assert/strict";
import test from "node:test";
import { createBookingCode, startOfPeriod } from "./booking.js";

test("booking codes are readable and unique-shaped", () => {
  assert.match(createBookingCode(), /^WW-\d{6}-[A-F0-9]{4}$/);
});

test("month period starts at midnight on day one", () => {
  const start = startOfPeriod("month", new Date("2026-08-19T14:30:00+08:00"));
  assert.equal(start.getDate(), 1);
  assert.equal(start.getHours(), 0);
});
