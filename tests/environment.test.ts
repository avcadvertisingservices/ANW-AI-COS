import assert from "node:assert/strict";
import test from "node:test";
import {
  EnvironmentValidationError,
  requireEnvironmentVariables,
} from "../src/core/environment/index.js";

test("validation succeeds when required keys exist", () => {
  assert.doesNotThrow(() => {
    requireEnvironmentVariables(
      { APP_NAME: "ANW AI-COS", APP_VERSION: "1.0.0", NODE_ENV: "test" },
      ["APP_NAME", "APP_VERSION", "NODE_ENV"],
    );
  });
});

test("validation reports missing keys", () => {
  assert.throws(
    () => requireEnvironmentVariables(
      { APP_NAME: "ANW AI-COS", APP_VERSION: "" },
      ["APP_NAME", "APP_VERSION", "NODE_ENV"],
    ),
    (error: unknown) => {
      assert.ok(error instanceof EnvironmentValidationError);
      assert.deepEqual(error.missingKeys, ["APP_VERSION", "NODE_ENV"]);
      return true;
    },
  );
});
