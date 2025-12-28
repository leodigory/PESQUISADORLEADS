import { describe, expect, it } from "vitest";
import {
  isLeadComment,
  extractKeywords,
  parseInstagramUsername,
  getInstagramProfileUrl,
  isValidInstagramUsername,
} from "./leadExtractor";

describe("Lead Extraction Utilities", () => {
  describe("isLeadComment", () => {
    it("should detect lead keywords in comments", () => {
      expect(isLeadComment("Mais informações sobre este imóvel")).toBe(true);
      expect(isLeadComment("Eu quero saber o preço")).toBe(true);
      expect(isLeadComment("Me chama no DM")).toBe(true);
      expect(isLeadComment("Qual é o valor?")).toBe(true);
      expect(isLeadComment("Tenho interesse neste imóvel")).toBe(true);
    });

    it("should not detect non-lead comments", () => {
      expect(isLeadComment("Que lindo!")).toBe(false);
      expect(isLeadComment("Adorei a foto")).toBe(false);
      expect(isLeadComment("Parabéns pelo trabalho")).toBe(false);
    });

    it("should be case insensitive", () => {
      expect(isLeadComment("MAIS INFORMAÇÕES")).toBe(true);
      expect(isLeadComment("Mais Informações")).toBe(true);
    });
  });

  describe("extractKeywords", () => {
    it("should extract all matching keywords", () => {
      const keywords = extractKeywords("Mais informações, qual o valor e preço?");
      expect(keywords).toContain("mais informações");
      expect(keywords).toContain("qual o valor");
      expect(keywords).toContain("preço");
    });

    it("should return empty array for non-lead comments", () => {
      const keywords = extractKeywords("Que lindo!");
      expect(keywords).toEqual([]);
    });
  });

  describe("parseInstagramUsername", () => {
    it("should parse username from Instagram URL", () => {
      expect(parseInstagramUsername("https://www.instagram.com/joao_silva/")).toBe("joao_silva");
      expect(parseInstagramUsername("instagram.com/maria.santos")).toBe("maria.santos");
    });

    it("should parse username from @mention", () => {
      expect(parseInstagramUsername("@joao_silva")).toBe("joao_silva");
      expect(parseInstagramUsername("@maria.santos")).toBe("maria.santos");
    });

    it("should parse standalone username", () => {
      expect(parseInstagramUsername("joao_silva")).toBe("joao_silva");
    });

    it("should return null for invalid input", () => {
      expect(parseInstagramUsername("not a username!@#")).toBeNull();
    });
  });

  describe("getInstagramProfileUrl", () => {
    it("should generate correct Instagram profile URL", () => {
      expect(getInstagramProfileUrl("joao_silva")).toBe("https://www.instagram.com/joao_silva/");
      expect(getInstagramProfileUrl("maria.santos")).toBe("https://www.instagram.com/maria.santos/");
    });
  });

  describe("isValidInstagramUsername", () => {
    it("should validate correct usernames", () => {
      expect(isValidInstagramUsername("joao_silva")).toBe(true);
      expect(isValidInstagramUsername("maria.santos")).toBe(true);
      expect(isValidInstagramUsername("user123")).toBe(true);
      expect(isValidInstagramUsername("a")).toBe(true);
    });

    it("should reject invalid usernames", () => {
      expect(isValidInstagramUsername("user@name")).toBe(false);
      expect(isValidInstagramUsername("user name")).toBe(false);
      expect(isValidInstagramUsername("")).toBe(false);
      expect(isValidInstagramUsername("a".repeat(31))).toBe(false);
    });
  });
});
