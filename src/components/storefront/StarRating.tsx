'use client'
import { Star } from "lucide-react";

interface Props {
  value: number;
  max?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  size?: number;
}

export const StarRating = ({ value, max = 5, interactive = false, onChange, size = 16 }: Props) => (
  <span className="inline-flex items-center gap-0.5">
    {Array.from({ length: max }, (_, i) => {
      const filled = i < Math.round(value);
      return interactive ? (
        <button
          key={i}
          type="button"
          aria-label={`Rate ${i + 1} star${i > 0 ? "s" : ""}`}
          onClick={() => onChange?.(i + 1)}
          className="focus-ring"
        >
          <Star size={size} className={filled ? "fill-accent text-accent" : "text-line"} />
        </button>
      ) : (
        <Star key={i} size={size} className={filled ? "fill-accent text-accent" : "text-line"} />
      );
    })}
  </span>
);
