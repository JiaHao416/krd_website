/**
 * C5a 語意色票（UI-SPEC §Color）；陰影也引用這裡的值，色碼只在此處出現一次
 */
const COLORS = {
  surface: "#27303B",
  "surface-raised": "#323C49",
  ink: "#EEF1F5",
  "ink-muted": "#B9C2CD",
  accent: "#F0A04B",
  "accent-ink": "#1C232C",
  "accent-hover": "#F6BC7C",
  "accent-shadow": "#B5732E",
  "block-1": "#2C4258",
  "block-2": "#3A4A5E",
  "block-3": "#5A4A1E",
  sand: "#3A4553",
  dash: "#5A6676",
  tape: "#F0B43C",
  success: "#7ED6A0",
  danger: "#FF8A7A",
  white: "#FFFFFF",
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    // 本階段先用 extend 與舊 class 並存；收尾 plan 改為 theme 覆寫
    extend: {
      colors: COLORS,
      // 系統字型堆疊：Mac→蘋方、Windows→微軟正黑體、Android→Noto Sans TC；不載入 webfont
      fontFamily: {
        sans: [
          '"PingFang TC"',
          '"Microsoft JhengHei"',
          '"微軟正黑體"',
          '"Noto Sans TC"',
          "system-ui",
          "sans-serif",
        ],
      },
      // 4 級字級；heading／display 由 index.css 的 CSS 變數依斷點切換
      fontSize: {
        label: ["15px", { lineHeight: "1.6" }],
        body: ["17px", { lineHeight: "1.6" }],
        heading: ["var(--font-size-heading)", { lineHeight: "1.25" }],
        display: ["var(--font-size-display)", { lineHeight: "1.15" }],
      },
      lineHeight: {
        card: "1.35",
      },
      borderRadius: {
        pill: "9999px",
        image: "16px",
        card: "20px",
        block: "24px",
        panel: "32px",
      },
      // 實色陰影（無模糊），營造貼紙／便條的立體感
      boxShadow: {
        card: "0 6px 0 rgba(0,0,0,0.3)",
        "card-sm": "0 4px 0 rgba(0,0,0,0.3)",
        "card-lg": "0 8px 0 rgba(0,0,0,0.3)",
        note: `0 6px 0 ${COLORS.sand}`,
        "note-sm": `0 4px 0 ${COLORS.sand}`,
        bar: `0 6px 0 ${COLORS.sand}`,
        "bar-sm": `0 4px 0 ${COLORS.sand}`,
        btn: `0 6px 0 ${COLORS["accent-shadow"]}`,
        "btn-pressed": `0 2px 0 ${COLORS["accent-shadow"]}`,
        "btn-float": `0 6px 0 ${COLORS["accent-hover"]}`,
        float: "0 -6px 16px rgba(0,0,0,0.25)",
      },
      outlineOffset: {
        3: "3px",
      },
    },
  },
  plugins: [],
};
