---
phase: quick-261112-dq1
plan: 01
subsystem: about-page
tags: [about, images, webp, ui]
requires: []
provides:
  - public/abouts/*.webp（六張 512x512 服務圖）
affects:
  - src/pages/AboutPage.tsx
  - src/content/abouts.ts
tech-stack:
  added: []
  patterns: [圖片容器底色與圖片自帶底色一致（bg-surface）]
key-files:
  created:
    - public/abouts/karaoke.webp
    - public/abouts/ktv.webp
    - public/abouts/hotel.webp
    - public/abouts/pub.webp
    - public/abouts/bus.webp
    - public/abouts/repair.webp
  modified:
    - src/content/abouts.ts
    - src/pages/AboutPage.tsx
    - src/pages/AboutPage.test.tsx
  deleted:
    - public/abouts/{karaoke,ktv,hotel,pub,bus,repair}.png
decisions:
  - 卡片維持 bg-surface-raised，只把圖片容器 bg-white 改為 bg-surface（與新圖底色 #27303B 相同），img 改 object-cover
  - 圖檔與程式碼合併為單一 commit，確保每次提交 build 與畫面都正確
metrics:
  completed: 2026-11-12
  tasks: 2
  files: 15
---

# Quick 261112-dq1：關於我們服務圖換新 Summary

關於我們頁六張服務圖換成 Gemini 產生的 512x512 深色 WebP（cwebp -q 82），圖片容器由白底改為 `bg-surface`，與深色卡片無縫融合。

## 完成項目

| Task | 內容 | Commit |
|------|------|--------|
| 1 | 六張 .jpeg 轉 512x512 WebP、git rm 舊 PNG | aed3a65（與 Task 2 合併提交） |
| 2 | 測試改 .webp＋新增容器底色測試（紅燈 2 失敗）→ abouts.ts 改路徑、容器 bg-surface、img object-cover（綠燈） | aed3a65 |

## WebP 檔案大小

| 檔案 | 大小 |
|------|------|
| karaoke.webp | 9,418 B（約 9.2 KB） |
| ktv.webp | 15,384 B（約 15.0 KB） |
| hotel.webp | 23,376 B（約 22.8 KB） |
| pub.webp | 21,242 B（約 20.7 KB） |
| bus.webp | 19,504 B（約 19.0 KB） |
| repair.webp | 19,954 B（約 19.5 KB） |

合計約 106 KB，皆 512x512。

## 驗證

- `npm test`：43 個檔案、558 個測試全數通過
- `npm run build`：tsc -b、vite build 成功，dist 憑證掃描通過；dist/abouts/ 為六個 .webp
- `npm run lint`：無問題
- abouts.ts／AboutPage.test.tsx 內 `.png` 計數 0；AboutPage.tsx 內 `bg-white` 計數 0
- 舊 PNG 刪除為計畫內的刻意刪除

## Deviations from Plan

None - plan executed exactly as written.

## Threat 處理

T-q-dq1-01：cwebp 未加 `-metadata`，預設不保留 EXIF/XMP。

## Self-Check: PASSED

- 六個 webp 皆存在且為 512x512
- commit aed3a65 存在
