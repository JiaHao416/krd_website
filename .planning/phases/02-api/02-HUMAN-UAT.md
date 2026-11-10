---
status: partial
phase: 02-api
source: [02-VERIFICATION.md]
started: 2026-11-10T05:30:00Z
updated: 2026-11-10T05:30:00Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. PROD-06：後台修改反映到官網
expected: 在 KRD-Inventory App 修改一筆商品（名稱或熱銷設定），等後端快取時間過後重新整理對應頁面，官網顯示變更
result: [pending]

### 2. Cloudflare Pages 建置
expected: push `main` 後，Cloudflare Dashboard → Pages → krd-website 最新部署建置成功、Node 版本為 `.nvmrc` 的 24，且 www.krd.com.tw 商品頁正常載入
result: [pending]

## Summary

total: 2
passed: 0
issues: 0
pending: 2
skipped: 0
blocked: 0

## Gaps
