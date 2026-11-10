# Phase 5: 清理技術債 - Discussion Log

> **僅供稽核參考。** 不作為規劃、研究或執行代理的輸入。
> 決策記錄於 05-CONTEXT.md，本檔保留討論過程中考慮過的選項。

**Date:** 2026-11-10
**Phase:** 05-清理技術債
**Areas discussed:** （使用者全數交由 Claude 決定）

---

## 灰色地帶選擇

| 選項 | 說明 | 選擇 |
|------|------|------|
| check:dist 接線（WR-01） | 要不要接進部署流程，推翻 Phase 3 D-15？ | |
| 輪播暫停行為（WR-06） | hover/focus 暫停、暫停按鈕，或只尊重 reduced-motion？ | |
| 範本殘留清理範圍 | 是否一併改 lang、縮小 export？ | |
| 規劃文件補齊方式 | 放在本 phase 計畫內，或另外跑 validate／secure？ | |

**使用者回覆：** 「你都幫我做完就好」

**處理方式：** 四個項目全部由 Claude 依既有決策與專案慣例代選，結果見 05-CONTEXT.md D-01～D-15。

## Claude's Discretion

- WR-01：在 `build` 指令中明確串接 `check:dist`（不用 postbuild），推翻 D-15
- WR-06：reduced-motion 時停用自動播放、hover/focus 時暫停、手動切換後重新計時，不加可見的按鈕
- 範本殘留：刪除 react.svg、vite.svg，清理 App.css，修正 favicon type，lang 改成 zh-Hant-TW，更新 Browserslist；不縮小 export
- 文件：SUMMARY frontmatter 與 ROADMAP 放在本 phase 處理；validate-phase 1／secure-phase 4 另外執行

## Deferred Ideas

- WR-04 導覽擠壓、可見的輪播暫停按鈕 → UI 重設計 milestone
