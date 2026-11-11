import { Fragment } from "react";
import type { SpecRow } from "../pages/productDetailText";

interface SpecTableProps {
  /** 規格列（已排除沒有值的列） */
  rows: SpecRow[];
}

// 規格表：名稱固定寬度、值欄可在任意位置換行（長 SKU 不撐破版面）；沒有列時整區不渲染
const SpecTable = ({ rows }: SpecTableProps) => {
  if (rows.length === 0) return null;

  return (
    <dl className="grid grid-cols-[96px_minmax(0,1fr)] gap-y-2 rounded-card bg-sand px-6 py-4 text-label">
      {rows.map((row, index) => (
        <Fragment key={`${row.label}-${index}`}>
          <dt className="text-ink-muted">{row.label}</dt>
          <dd className="text-ink [overflow-wrap:anywhere]">{row.value}</dd>
        </Fragment>
      ))}
    </dl>
  );
};

export default SpecTable;
