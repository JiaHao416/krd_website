import { describe, it, expect } from "vitest";

// 樣式 token 防回歸（DESIGN-02、SHELL-04、斷點表）：src 元件只能用 tailwind.config.js 的語意 token。
// 只列檔名與規則名；若誤判（例如註解提到舊 class 名），請改寫註解，不要放寬規則。
// 不使用 node:fs（專案無 @types/node），比照既有原始碼掃描測試以 import.meta.glob 讀原始碼文字。
const SOURCES = import.meta.glob(["/src/**/*.tsx", "/src/**/*.css", "!/src/**/*.test.tsx"], {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const files = Object.entries(SOURCES);

/** Tailwind 預設色票名稱 */
const PALETTE =
  "slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose";
/** 會套用色彩的 utility 前綴 */
const COLOR_UTIL =
  "bg|text|border|ring|ring-offset|outline|from|via|to|fill|stroke|divide|placeholder|decoration|shadow|accent|caret";

/** [規則名稱, 格式]；(?<![\w-]) 確保是 class 起點，前面可接任意變體前綴 */
const RULES: ReadonlyArray<readonly [string, RegExp]> = [
  ["Tailwind 預設色票", new RegExp(`(?<![\\w-])(?:[\\w-]+:)*(?:${COLOR_UTIL})-(?:${PALETTE})-\\d{2,3}\\b`)],
  ["white／black 透明度", /(?<![\w-])(?:[\w-]+:)*[a-z-]+-(?:white|black)\/\d+/],
  ["white 非圖片底色", /(?<![\w-])(?:[\w-]+:)*(?:text|border|ring|outline|from|via|to|fill|stroke|divide|shadow)-white\b/],
  ["black 色", /(?<![\w-])(?:[\w-]+:)*(?:bg|text|border|ring|outline|from|via|to|fill|stroke|divide|shadow)-black\b/],
  ["寫死色碼", /(?<![&\w])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b/],
  ["rgb／hsl 色值", /\b(?:rgba?|hsla?)\(/],
  ["禁用斷點", /(?<![\w-])(?:max-)?(?:sm|lg|2xl):/],
  ["禁用字重", /(?<![\w-])font-(?:thin|extralight|light|medium|bold|extrabold|black)\b/],
  ["預設字級", /(?<![\w-])text-(?:xs|sm|base|lg|xl|[2-9]xl)\b/],
  ["預設圓角", /(?<![\w-])rounded(?:-[trblse]{1,2})?(?:-(?:sm|md|lg|xl|2xl|3xl|full))?(?=["'`\s}])/],
  ["預設陰影", /(?<![\w-])(?:[\w-]+:)*shadow(?:-(?:sm|md|lg|xl|2xl|inner))?(?=["'`\s}])/],
  ["漸層／毛玻璃", /(?<![\w-])(?:[\w-]+:)*(?:bg-gradient-to-|backdrop-blur|blur-(?:none|sm|md|lg|xl|2xl|3xl)\b)/],
  ["互動位移縮放", /(?<![\w-])(?:[\w-]+:)*(?:hover|focus|focus-visible|active|group-hover):-?(?:translate-[xy]|scale)-/],
  ["移除焦點外框", /(?<![\w-])(?:[\w-]+:)*outline-none\b/],
  [
    "非 token 間距",
    /(?<![\w-])(?:[\w-]+:)*-?(?:p|px|py|pt|pr|pb|pl|ps|pe|m|mx|my|mt|mr|mb|ml|ms|me|gap|gap-x|gap-y|space-x|space-y)-(?!(?:0|1|2|4|6|8|12|16|24|px)\b)[\d.]+\b/,
  ],
];

describe("樣式只用語意 token", () => {
  it("掃描檔案數量合理（避免 glob 失效而空轉）", () => {
    expect(files.length).toBeGreaterThan(15);
  });

  it.each(RULES)("不含 %s", (_name, re) => {
    // 只收集檔名，不輸出匹配內容
    const hits = files.filter(([, text]) => re.test(text)).map(([path]) => path);
    expect(hits).toEqual([]);
  });
});

/** 讀取單一檔案的原始碼文字 */
function readRaw(sources: Record<string, string>): string {
  return Object.values(sources)[0] ?? "";
}

const TAILWIND_CONFIG = readRaw(
  import.meta.glob("/tailwind.config.js", {
    query: "?raw",
    import: "default",
    eager: true,
  }) as Record<string, string>
);

const INDEX_CSS = readRaw(
  import.meta.glob("/src/index.css", {
    query: "?raw",
    import: "default",
    eager: true,
  }) as Record<string, string>
);

describe("字型堆疊（DESIGN-03）", () => {
  it("設定檔依序列出 PingFang TC → Microsoft JhengHei → 微軟正黑體 → Noto Sans TC", () => {
    // 比對含引號的字型名稱，避免命中設定檔註解裡的說明文字
    const order = ["PingFang TC", "Microsoft JhengHei", "微軟正黑體", "Noto Sans TC"].map((name) =>
      TAILWIND_CONFIG.indexOf(`"${name}"`)
    );
    expect(order[0]).toBeGreaterThanOrEqual(0);
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });

  it("index.css 不載入 webfont", () => {
    expect(INDEX_CSS.length).toBeGreaterThan(0);
    expect(INDEX_CSS).not.toMatch(/@font-face|@import url\(|fonts\.googleapis/);
  });
});

// 聯絡資訊只能在 src/config/contact.ts 出現一次（SHELL-03、UX-06）
const CONTACT_SCAN = Object.entries(
  import.meta.glob(
    [
      "/src/**/*.ts",
      "/src/**/*.tsx",
      "!/src/**/*.test.ts",
      "!/src/**/*.test.tsx",
      "!/src/config/contact.ts",
    ],
    { query: "?raw", import: "default", eager: true }
  ) as Record<string, string>
);

describe("聯絡資訊單一來源（SHELL-03、UX-06）", () => {
  it.each(["永平路", "2279"])("除 contact.ts 外不含「%s」", (needle) => {
    expect(CONTACT_SCAN.length).toBeGreaterThan(15);
    const hits = CONTACT_SCAN.filter(([, text]) => text.includes(needle)).map(([path]) => path);
    expect(hits).toEqual([]);
  });
});
