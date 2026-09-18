import type { OrderStatus as OrderStatusType } from "../../types/domain";
import { titleCase } from "../../utils/format";

const steps: OrderStatusType[] = ["pending", "confirmed", "processing", "shipped", "out_for_delivery", "delivered"];

export const OrderStatus = ({ status }: { status: OrderStatusType }) => {
  const current = steps.indexOf(status);
  return (
    <div className="grid gap-3">
      {steps.map((step, index) => (
        <div key={step} className="flex items-center gap-3">
          <span className={`grid h-7 w-7 place-items-center border text-xs font-bold ${index <= current ? "border-palm bg-palm text-white" : "border-line bg-white text-muted"}`}>{index + 1}</span>
          <span className={index <= current ? "font-semibold text-ink" : "text-muted"}>{titleCase(step)}</span>
        </div>
      ))}
    </div>
  );
};
