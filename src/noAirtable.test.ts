import { describe, it, expect } from "vitest";

// 原始碼憑證殘留回歸檢查：src 內不得再出現 Airtable 網址、token 或 Base ID。
// 規則只描述「格式」，不得寫入任何實際值；若誤報請改名，不要放寬 regex。
// 需與 scripts/check-dist.mjs 的規則保持一致（由下方「規則一致」測試強制比對）。
// 不使用 node:fs（專案無 @types/node，tsc -b 會失敗），改用 import.meta.glob 讀原始碼文字。
const SOURCES = import.meta.glob("/src/**/*.{ts,tsx}", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

/** 本測試檔自身（內含規則描述，需排除） */
const SELF = "/src/noAirtable.test.ts";

/** 禁止出現的規則：[規則名稱, 格式] */
const FORBIDDEN: ReadonlyArray<readonly [string, RegExp]> = [
  ["airtable 字樣", /airtable/i],
  ["Airtable API 網址", /api\.airtable\.com/i],
  ["Base ID 格式", /\bapp[A-Za-z0-9]{14}\b/],
  ["PAT 格式", /\bpat[A-Za-z0-9]{14}\.[A-Za-z0-9]{64}\b/],
  ["舊式 API key 格式", /\bkey[A-Za-z0-9]{14}\b/],
];

const files = Object.entries(SOURCES).filter(([path]) => path !== SELF);

describe("原始碼不得含 Airtable 痕跡", () => {
  it("掃描檔案數量合理（避免 glob 失效而空轉）", () => {
    expect(files.length).toBeGreaterThan(20);
  });

  it.each(FORBIDDEN)("不含 %s", (_name, re) => {
    // 只收集檔名，不輸出匹配內容
    const hits = files.filter(([, text]) => re.test(text)).map(([path]) => path);
    expect(hits).toEqual([]);
  });
});

// 以 ?raw 讀入 dist 檢查腳本的原始碼文字（同樣不需要 node:fs）
const CHECK_DIST_SOURCE = Object.values(
  import.meta.glob("/scripts/check-dist.mjs", {
    query: "?raw",
    import: "default",
    eager: true,
  }) as Record<string, string>
)[0];

describe("規則與 scripts/check-dist.mjs 一致", () => {
  it("兩邊的 FORBIDDEN 清單逐條相同（名稱、regex 與 flags）", () => {
    // 擷取腳本中 `const FORBIDDEN = [` 到 `];` 之間的每一條規則
    const block = CHECK_DIST_SOURCE.match(/const FORBIDDEN = \[\n([\s\S]*?)\n\];/);
    expect(block).not.toBeNull();
    const scriptRules = (block?.[1] ?? "")
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    // 用與腳本相同的寫法序列化本檔規則，雙向逐條比對
    const testRules = FORBIDDEN.map(([name, re]) => `["${name}", ${re.toString()}],`);
    expect(scriptRules).toEqual(testRules);
  });
});
