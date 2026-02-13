import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Star, MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface ProductReviewsProps {
  productId: string;
  productName: string;
}

const StarRating = ({
  rating,
  onRate,
  interactive = false,
  size = "w-5 h-5",
}: {
  rating: number;
  onRate?: (r: number) => void;
  interactive?: boolean;
  size?: string;
}) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`${size} transition-colors ${
          star <= rating
            ? "fill-accent text-accent"
            : "text-muted-foreground/30"
        } ${interactive ? "cursor-pointer hover:text-accent" : ""}`}
        onClick={() => interactive && onRate?.(star)}
      />
    ))}
  </div>
);

const ProductReviews = ({ productId, productName }: ProductReviewsProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    reviewer_name: "",
    reviewer_email: "",
    rating: 0,
    review_text: "",
  });

  // Fetch approved reviews
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["product-reviews", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_reviews")
        .select("id, reviewer_name, rating, review_text, created_at, is_verified_purchase")
        .eq("product_id", productId)
        .eq("status", "approved")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch aggregate ratings
  const { data: ratingsData } = useQuery({
    queryKey: ["product-rating-aggregate", productId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_product_ratings", {
        p_product_id: productId,
      });
      if (error) throw error;
      return data?.[0] ?? { review_count: 0, average_rating: 0 };
    },
  });

  const avgRating = Number(ratingsData?.average_rating ?? 0);
  const reviewCount = Number(ratingsData?.review_count ?? 0);

  // Submit review mutation
  const submitReview = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("product_reviews").insert({
        product_id: productId,
        reviewer_name: formData.reviewer_name,
        reviewer_email: formData.reviewer_email || null,
        rating: formData.rating,
        review_text: formData.review_text || null,
        status: "pending",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Review Submitted!",
        description: "Your review will appear after moderation.",
      });
      setFormData({ reviewer_name: "", reviewer_email: "", rating: 0, review_text: "" });
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ["product-reviews", productId] });
      queryClient.invalidateQueries({ queryKey: ["product-rating-aggregate", productId] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to submit review.", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.reviewer_name || formData.rating === 0) {
      toast({ title: "Missing fields", description: "Please enter your name and rating.", variant: "destructive" });
      return;
    }
    submitReview.mutate();
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Customer Reviews</h2>
          {reviewCount > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <StarRating rating={Math.round(avgRating)} />
              <span className="text-sm text-muted-foreground">
                {avgRating.toFixed(1)} out of 5 · {reviewCount} review{reviewCount !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full"
          onClick={() => setShowForm(!showForm)}
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Write a Review
        </Button>
      </div>

      {/* Review Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-muted/50 border border-border/50 rounded-xl p-5 space-y-4"
        >
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Your Rating *</label>
            <StarRating rating={formData.rating} onRate={(r) => setFormData((p) => ({ ...p, rating: r }))} interactive size="w-7 h-7" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Name *</label>
              <Input
                value={formData.reviewer_name}
                onChange={(e) => setFormData((p) => ({ ...p, reviewer_name: e.target.value }))}
                placeholder="Your name"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Email (optional)</label>
              <Input
                type="email"
                value={formData.reviewer_email}
                onChange={(e) => setFormData((p) => ({ ...p, reviewer_email: e.target.value }))}
                placeholder="your@email.com"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Review</label>
            <Textarea
              value={formData.review_text}
              onChange={(e) => setFormData((p) => ({ ...p, review_text: e.target.value }))}
              placeholder="Share your experience with this product..."
              rows={3}
            />
          </div>
          <Button type="submit" className="rounded-full" disabled={submitReview.isPending}>
            <Send className="w-4 h-4 mr-2" />
            {submitReview.isPending ? "Submitting..." : "Submit Review"}
          </Button>
        </form>
      )}

      {/* Reviews List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-muted/30 rounded-xl p-5 animate-pulse h-28" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-10 bg-muted/30 rounded-xl">
          <MessageSquare className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">No reviews yet</p>
          <p className="text-sm text-muted-foreground/70">Be the first to review {productName}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-card border border-border/50 rounded-xl p-5 space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                    {review.reviewer_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{review.reviewer_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(review.created_at), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StarRating rating={review.rating} size="w-4 h-4" />
                  {review.is_verified_purchase && (
                    <span className="text-xs bg-green-500/10 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full font-medium">
                      Verified
                    </span>
                  )}
                </div>
              </div>
              {review.review_text && (
                <p className="text-sm text-muted-foreground leading-relaxed">{review.review_text}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default ProductReviews;
