import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// 專案未開 vitest globals，RTL 不會自動 cleanup，
// 否則後一個測試會看到前一個測試殘留的 DOM，故每個測試後手動清理
afterEach(() => cleanup());
