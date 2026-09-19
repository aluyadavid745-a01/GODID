'use client'
import { Star, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { StarRating } from "../../components/storefront/StarRating";
import { adminApi } from "../../services/api";
import type { Review } from "../../types/domain";

export const AdminReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.reviews().then((r) => { setReviews(r); setLoading(false); });
  }, []);

  const remove = async (id: string) => {
    await adminApi.deleteReview(id);
    setReviews((prev) => prev.filter((r) => r.id !== id));
  };

  const toggle = async (id: string, approved: boolean) => {
    await adminApi.approveReview(id, approved);
    setReviews((prev) => prev.map((r) => r.id === id ? { ...r, approved } : r));
  };

  const sorted = [...reviews].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold">Reviews</h2>
          <p className="mt-1 text-sm text-muted">{reviews.length} review{reviews.length !== 1 ? "s" : ""} total</p>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-3">{[1, 2, 3].map((i) => <div key={i} className="h-24 animate-pulse rounded bg-line" />)}</div>
      ) : sorted.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center text-muted">
          <Star size={32} className="text-line" />
          <p className="font-semibold">No reviews yet</p>
          <p className="text-sm">Customer reviews will appear here once submitted.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {sorted.map((review) => (
            <div key={review.id} className="border border-line bg-white p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <StarRating value={review.rating} size={14} />
                    <span className="font-semibold text-sm">{review.authorName}</span>
                    <span className="text-xs text-muted">on <span className="font-medium text-ink">{review.productName}</span></span>
                    <span className="text-xs text-muted">{new Date(review.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 border ${review.approved ? "border-palm text-palm bg-palm/5" : "border-clay text-clay bg-clay/5"}`}>
                      {review.approved ? "Approved" : "Hidden"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted leading-relaxed">{review.body}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggle(review.id, !review.approved)}
                    className="border border-line px-3 py-1.5 text-xs font-semibold hover:border-ink transition"
                  >
                    {review.approved ? "Hide" : "Approve"}
                  </button>
                  <button onClick={() => remove(review.id)} className="border border-line p-1.5 text-muted hover:border-red-700 hover:text-red-700 transition" aria-label="Delete review">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
