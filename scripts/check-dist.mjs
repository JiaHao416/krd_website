// dist/ 憑證殘留檢查：build 後執行 `npm run check:dist`。
// 規則需與 src/noAirtable.test.ts 保持一致（該測試會逐條比對 FORBIDDEN，請維持一行一條的寫法）；
// 只描述格式，不得寫入實際值。
// 命中時只輸出「相對路徑：規則名稱」，絕不輸出匹配內容。
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const DIST = join(ROOT, "dist");

/** 禁止出現的規則：[規則名稱, 格式] */
const FORBIDDEN = [
  ["airtable 字樣", /airtable/i],
  ["Airtable API 網址", /api\.airtable\.com/i],
  ["Base ID 格式", /\bapp[A-Za-z0-9]{14}\b/],
  ["PAT 格式", /\bpat[A-Za-z0-9]{14}\.[A-Za-z0-9]{64}\b/],
  ["舊式 API key 格式", /\bkey[A-Za-z0-9]{14}\b/],
];

/** 略過的二進位圖檔副檔名 */
const SKIP_EXT = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico"]);

/** 遞迴列出目錄下所有檔案 */
function listFiles(dir) {
  const result = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) result.push(...listFiles(full));
    else result.push(full);
  }
  return result;
}

if (!existsSync(DIST)) {
  console.error("找不到 dist/，請先執行 npm run build");
  process.exit(1);
}

const files = listFiles(DIST).filter((f) => !SKIP_EXT.has(extname(f).toLowerCase()));
if (files.length === 0) {
  console.error("dist/ 內沒有可掃描的檔案，請先執行 npm run build");
  process.exit(1);
}

let hitCount = 0;
for (const file of files) {
  const text = readFileSync(file, "utf8");
  for (const [name, re] of FORBIDDEN) {
    if (re.test(text)) {
      hitCount += 1;
      console.error(`${relative(ROOT, file)}：${name}`);
    }
  }
}

if (hitCount > 0) process.exit(1);
console.log(`dist/ 檢查通過：${files.length} 個檔案，無 Airtable 網址、token 或 Base ID`);
