/**
 * Unit tests for identifier.utils.ts
 *
 * These tests verify the identifier type detection logic for distinguishing
 * between user IDs (UUIDs) and session IDs.
 */

import { describe, it } from "node:test";
import assert from "node:assert";
import {
  isUserId,
  isValidIdentifier,
  getIdentifierType,
} from "../identifier.utils";

describe("identifier.utils - Identifier Type Detection", () => {
  describe("isUserId", () => {
    it("should return true for valid UUID v4", () => {
      const uuid = "550e8400-e29b-41d4-a716-446655440000";
      assert.strictEqual(isUserId(uuid), true);
    });

    it("should return true for valid UUID v1", () => {
      const uuid = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
      assert.strictEqual(isUserId(uuid), true);
    });

    it("should return true for crypto.randomUUID() format", () => {
      // crypto.randomUUID() generates v4 UUIDs
      const uuid = crypto.randomUUID();
      assert.strictEqual(isUserId(uuid), true);
    });

    it("should return true for uppercase UUID", () => {
      const uuid = "550E8400-E29B-41D4-A716-446655440000";
      assert.strictEqual(isUserId(uuid), true);
    });

    it("should return true for mixed case UUID", () => {
      const uuid = "550e8400-E29B-41d4-A716-446655440000";
      assert.strictEqual(isUserId(uuid), true);
    });

    it("should return false for nanoid format", () => {
      const sessionId = "V1StGXR8_Z5jdHi6B-myT";
      assert.strictEqual(isUserId(sessionId), false);
    });

    it("should return false for short alphanumeric string", () => {
      const sessionId = "abc123xyz";
      assert.strictEqual(isUserId(sessionId), false);
    });

    it("should return false for empty string", () => {
      assert.strictEqual(isUserId(""), false);
    });

    it("should return false for null", () => {
      assert.strictEqual(isUserId(null as any), false);
    });

    it("should return false for undefined", () => {
      assert.strictEqual(isUserId(undefined as any), false);
    });

    it("should return false for non-string types", () => {
      assert.strictEqual(isUserId(123 as any), false);
      assert.strictEqual(isUserId({} as any), false);
      assert.strictEqual(isUserId([] as any), false);
    });

    it("should return false for UUID-like string with wrong format", () => {
      const invalidUuid = "550e8400-e29b-41d4-a716-44665544000"; // Missing one char
      assert.strictEqual(isUserId(invalidUuid), false);
    });

    it("should return false for UUID without hyphens", () => {
      const invalidUuid = "550e8400e29b41d4a716446655440000";
      assert.strictEqual(isUserId(invalidUuid), false);
    });

    it("should return false for UUID with extra characters", () => {
      const invalidUuid = "550e8400-e29b-41d4-a716-446655440000-extra";
      assert.strictEqual(isUserId(invalidUuid), false);
    });

    it("should return false for string with spaces", () => {
      const invalidUuid = "550e8400 e29b 41d4 a716 446655440000";
      assert.strictEqual(isUserId(invalidUuid), false);
    });
  });

  describe("isValidIdentifier", () => {
    it("should return true for valid UUID", () => {
      const uuid = "550e8400-e29b-41d4-a716-446655440000";
      assert.strictEqual(isValidIdentifier(uuid), true);
    });

    it("should return true for valid session ID (8+ chars)", () => {
      const sessionId = "abc123xyz";
      assert.strictEqual(isValidIdentifier(sessionId), true);
    });

    it("should return true for nanoid format", () => {
      const sessionId = "V1StGXR8_Z5jdHi6B-myT";
      assert.strictEqual(isValidIdentifier(sessionId), true);
    });

    it("should return true for long alphanumeric session ID", () => {
      const sessionId = "abcdefgh12345678";
      assert.strictEqual(isValidIdentifier(sessionId), true);
    });

    it("should return false for empty string", () => {
      assert.strictEqual(isValidIdentifier(""), false);
    });

    it("should return false for whitespace only", () => {
      assert.strictEqual(isValidIdentifier("   "), false);
    });

    it("should return false for short session ID (< 8 chars)", () => {
      const shortId = "abc123";
      assert.strictEqual(isValidIdentifier(shortId), false);
    });

    it("should return false for null", () => {
      assert.strictEqual(isValidIdentifier(null as any), false);
    });

    it("should return false for undefined", () => {
      assert.strictEqual(isValidIdentifier(undefined as any), false);
    });

    it("should return false for non-string types", () => {
      assert.strictEqual(isValidIdentifier(123 as any), false);
      assert.strictEqual(isValidIdentifier({} as any), false);
      assert.strictEqual(isValidIdentifier([] as any), false);
    });

    it("should return true for session ID with special characters", () => {
      const sessionId = "abc_123-xyz_789";
      assert.strictEqual(isValidIdentifier(sessionId), true);
    });

    it("should handle trimmed strings correctly", () => {
      const sessionId = "  abc123xyz  ";
      assert.strictEqual(isValidIdentifier(sessionId), true);
    });
  });

  describe("getIdentifierType", () => {
    it("should return 'user' for valid UUID", () => {
      const uuid = "550e8400-e29b-41d4-a716-446655440000";
      assert.strictEqual(getIdentifierType(uuid), "user");
    });

    it("should return 'user' for crypto.randomUUID()", () => {
      const uuid = crypto.randomUUID();
      assert.strictEqual(getIdentifierType(uuid), "user");
    });

    it("should return 'session' for nanoid format", () => {
      const sessionId = "V1StGXR8_Z5jdHi6B-myT";
      assert.strictEqual(getIdentifierType(sessionId), "session");
    });

    it("should return 'session' for alphanumeric session ID", () => {
      const sessionId = "abc123xyz789";
      assert.strictEqual(getIdentifierType(sessionId), "session");
    });

    it("should return 'invalid' for empty string", () => {
      assert.strictEqual(getIdentifierType(""), "invalid");
    });

    it("should return 'invalid' for short string", () => {
      const shortId = "abc";
      assert.strictEqual(getIdentifierType(shortId), "invalid");
    });

    it("should return 'invalid' for null", () => {
      assert.strictEqual(getIdentifierType(null as any), "invalid");
    });

    it("should return 'invalid' for undefined", () => {
      assert.strictEqual(getIdentifierType(undefined as any), "invalid");
    });

    it("should return 'invalid' for whitespace only", () => {
      assert.strictEqual(getIdentifierType("   "), "invalid");
    });

    it("should return correct type for uppercase UUID", () => {
      const uuid = "550E8400-E29B-41D4-A716-446655440000";
      assert.strictEqual(getIdentifierType(uuid), "user");
    });

    it("should return 'session' for long session ID", () => {
      const sessionId = "abcdefghijklmnopqrstuvwxyz123456";
      assert.strictEqual(getIdentifierType(sessionId), "session");
    });
  });

  describe("Edge Cases and Integration", () => {
    it("should correctly identify multiple UUIDs", () => {
      const uuids = [
        "550e8400-e29b-41d4-a716-446655440000",
        "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
        crypto.randomUUID(),
        crypto.randomUUID(),
      ];

      uuids.forEach((uuid) => {
        assert.strictEqual(isUserId(uuid), true);
        assert.strictEqual(getIdentifierType(uuid), "user");
      });
    });

    it("should correctly identify multiple session IDs", () => {
      const sessionIds = [
        "V1StGXR8_Z5jdHi6B-myT",
        "abc123xyz789",
        "session_12345678",
        "guest-cart-id-123",
      ];

      sessionIds.forEach((sessionId) => {
        assert.strictEqual(isUserId(sessionId), false);
        assert.strictEqual(getIdentifierType(sessionId), "session");
      });
    });

    it("should handle boundary case of 8 character session ID", () => {
      const sessionId = "12345678";
      assert.strictEqual(isValidIdentifier(sessionId), true);
      assert.strictEqual(isUserId(sessionId), false);
      assert.strictEqual(getIdentifierType(sessionId), "session");
    });

    it("should handle boundary case of 7 character session ID", () => {
      const sessionId = "1234567";
      assert.strictEqual(isValidIdentifier(sessionId), false);
      assert.strictEqual(getIdentifierType(sessionId), "invalid");
    });

    it("should distinguish between similar looking strings", () => {
      const uuid = "550e8400-e29b-41d4-a716-446655440000";
      const notUuid = "550e8400-e29b-41d4-a716-44665544000x";

      assert.strictEqual(isUserId(uuid), true);
      assert.strictEqual(isUserId(notUuid), false);
    });

    it("should handle real-world session ID from crypto.randomUUID()", () => {
      // Session IDs might also be UUIDs if using crypto.randomUUID()
      const sessionId = crypto.randomUUID();
      assert.strictEqual(isUserId(sessionId), true);
      assert.strictEqual(isValidIdentifier(sessionId), true);
      assert.strictEqual(getIdentifierType(sessionId), "user");
    });

    it("should validate identifier format consistency", () => {
      const validIdentifiers = [
        "550e8400-e29b-41d4-a716-446655440000",
        "V1StGXR8_Z5jdHi6B-myT",
        "abc123xyz789",
        crypto.randomUUID(),
      ];

      validIdentifiers.forEach((id) => {
        assert.strictEqual(isValidIdentifier(id), true);
        const type = getIdentifierType(id);
        assert.ok(type === "user" || type === "session");
      });
    });
  });

  describe("Type Safety and Error Handling", () => {
    it("should handle various falsy values", () => {
      const falsyValues = [null, undefined, "", 0, false, NaN];

      falsyValues.forEach((value) => {
        assert.strictEqual(isUserId(value as any), false);
        assert.strictEqual(isValidIdentifier(value as any), false);
        assert.strictEqual(getIdentifierType(value as any), "invalid");
      });
    });

    it("should handle objects and arrays", () => {
      const nonStringValues = [{}, [], { id: "test" }, ["test"]];

      nonStringValues.forEach((value) => {
        assert.strictEqual(isUserId(value as any), false);
        assert.strictEqual(isValidIdentifier(value as any), false);
        assert.strictEqual(getIdentifierType(value as any), "invalid");
      });
    });

    it("should handle numbers", () => {
      const numbers = [123, 456.789, Infinity, -Infinity];

      numbers.forEach((num) => {
        assert.strictEqual(isUserId(num as any), false);
        assert.strictEqual(isValidIdentifier(num as any), false);
        assert.strictEqual(getIdentifierType(num as any), "invalid");
      });
    });
  });
});
