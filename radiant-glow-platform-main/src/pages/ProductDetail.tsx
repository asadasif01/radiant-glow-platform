import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, Minus, Plus, ShoppingBag } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { toast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type Product = Tables<"products">;
type Review = Tables<"reviews">;

const ProductDetail = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data: prod } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();
      setProduct(prod);

      if (prod) {
        const { data: revs } = await supabase
          .from("reviews")
          .select("*")
          .eq("product_id", prod.id)
          .order("created_at", { ascending: false });
        setReviews(revs ?? []);

        if (user) {
          const { data: orderItems } = await supabase
            .from("order_items")
            .select("id, order:orders!inner(user_id, status)")
            .eq("product_id", prod.id);
          const delivered = (orderItems as any)?.some(
            (oi: any) => oi.order?.user_id === user.id && oi.order?.status === "delivered"
          );
          setHasPurchased(!!delivered);
          setHasReviewed(revs?.some((r: any) => r.user_id === user.id) ?? false);
        }
      }
      setLoading(false);
    };
    fetch();
  }, [slug, user]);

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0";

  const handleAddToCart = async () => {
    if (!user) { toast({ title: "Please sign in to add to cart", variant: "destructive" }); return; }
    if (!product || product.stock_quantity <= 0) return;
    await addToCart(product.id, qty);
  };

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !product) return;
    setSubmitting(true);
    const { error } = await supabase.from("reviews").insert({
      user_id: user.id,
      product_id: product.id,
      rating,
      comment: comment.trim() || null,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Review submitted!" });
      setComment("");
      setHasReviewed(true);
      // Re-fetch reviews
      const { data: revs } = await supabase
        .from("reviews")
        .select("*")
        .eq("product_id", product.id)
        .order("created_at", { ascending: false });
      setReviews(revs ?? []);
    }
    setSubmitting(false);
  };

  if (loading) return (
    <Layout>
      <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Loading...</div>
    </Layout>
  );

  if (!product) return (
    <Layout>
      <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Product not found.</div>
    </Layout>
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10">
        <div className="grid gap-10 md:grid-cols-2">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="aspect-square overflow-hidden rounded-2xl bg-muted">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">No Image</div>
              )}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <h1 className="font-heading text-3xl font-bold text-foreground">{product.name}</h1>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className={i < Math.round(Number(avgRating)) ? "fill-accent text-accent" : "text-muted"} />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {avgRating} ({reviews.length} review{reviews.length !== 1 ? "s" : ""})
              </span>
            </div>
            <p className="mt-4 text-3xl font-bold text-primary">${product.price.toFixed(2)}</p>
            <p className="mt-4 text-muted-foreground">{product.description}</p>

            {product.ingredients && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">Ingredients</h3>
                <p className="mt-1 text-sm text-muted-foreground">{product.ingredients}</p>
              </div>
            )}
            {product.usage_instructions && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">How to Use</h3>
                <p className="mt-1 text-sm text-muted-foreground">{product.usage_instructions}</p>
              </div>
            )}

            <div className="mt-8">
              {product.stock_quantity > 0 ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-center rounded-lg border border-border">
                    <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-2 text-muted-foreground hover:text-foreground">
                      <Minus size={16} />
                    </button>
                    <span className="w-10 text-center text-sm font-medium text-foreground">{qty}</span>
                    <button onClick={() => setQty(Math.min(product.stock_quantity, qty + 1))} className="p-2 text-muted-foreground hover:text-foreground">
                      <Plus size={16} />
                    </button>
                  </div>
                  <Button onClick={handleAddToCart} className="gap-2 gradient-primary text-primary-foreground flex-1">
                    <ShoppingBag size={18} /> Add to Cart
                  </Button>
                </div>
              ) : (
                <p className="text-lg font-semibold text-destructive">Out of Stock</p>
              )}
              <p className="mt-2 text-xs text-muted-foreground">{product.stock_quantity} in stock</p>
            </div>
          </motion.div>
        </div>

        {/* Reviews */}
        <section className="mt-16">
          <h2 className="font-heading text-2xl font-bold text-foreground">Customer Reviews</h2>

          {hasPurchased && !hasReviewed && (
            <form onSubmit={handleReview} className="mt-6 rounded-xl border border-border bg-card p-6 shadow-soft">
              <h3 className="font-heading text-lg font-semibold text-card-foreground">Leave a Review</h3>
              <div className="mt-3 flex gap-1">
                {[1, 2, 3, 4, 5].map((v) => (
                  <button key={v} type="button" onClick={() => setRating(v)}>
                    <Star size={20} className={v <= rating ? "fill-accent text-accent" : "text-muted"} />
                  </button>
                ))}
              </div>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience..."
                className="mt-3"
                maxLength={1000}
              />
              <Button type="submit" className="mt-3 gradient-primary text-primary-foreground" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Review"}
              </Button>
            </form>
          )}

          <div className="mt-6 space-y-4">
            {reviews.length === 0 ? (
              <p className="text-muted-foreground">No reviews yet.</p>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="rounded-xl border border-border bg-card p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-card-foreground">
                        {"Anonymous"}
                      </span>
                      <div className="flex gap-0.5 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} className={i < review.rating ? "fill-accent text-accent" : "text-muted"} />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {review.comment && <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>}
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default ProductDetail;
