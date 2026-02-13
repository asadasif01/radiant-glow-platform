import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const Cart = () => {
  const { items, totalPrice, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [shippingAddress, setShippingAddress] = useState("");
  const [placing, setPlacing] = useState(false);

  const handlePlaceOrder = async () => {
    if (!user) return;
    if (!profile?.profile_completed) {
      toast({ title: "Please complete your profile first", variant: "destructive" });
      navigate("/complete-profile");
      return;
    }
    if (!shippingAddress.trim()) {
      toast({ title: "Please enter a shipping address", variant: "destructive" });
      return;
    }
    if (items.length === 0) return;

    setPlacing(true);

    // Validate stock
    for (const item of items) {
      if (!item.product || item.quantity > item.product.stock_quantity) {
        toast({
          title: "Insufficient stock",
          description: `${item.product?.name ?? "Product"} doesn't have enough stock.`,
          variant: "destructive",
        });
        setPlacing(false);
        return;
      }
    }

    const orderNumber = `RG-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    // Create order
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        order_number: orderNumber,
        total_price: totalPrice,
        shipping_address: shippingAddress.trim(),
        status: "pending",
      })
      .select()
      .single();

    if (orderErr || !order) {
      toast({ title: "Order failed", description: orderErr?.message, variant: "destructive" });
      setPlacing(false);
      return;
    }

    // Insert order items
    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.product?.name ?? "Unknown",
      quantity: item.quantity,
      unit_price: item.product?.price ?? 0,
    }));

    const { error: itemsErr } = await supabase.from("order_items").insert(orderItems);
    if (itemsErr) {
      toast({ title: "Order items failed", description: itemsErr.message, variant: "destructive" });
      setPlacing(false);
      return;
    }

    // Deduct stock
    for (const item of items) {
      await supabase
        .from("products")
        .update({
          stock_quantity: (item.product?.stock_quantity ?? 0) - item.quantity,
          units_sold: (item.product as any)?.units_sold
            ? (item.product as any).units_sold + item.quantity
            : item.quantity,
        })
        .eq("id", item.product_id);
    }

    await clearCart();
    setPlacing(false);
    toast({ title: "Order placed!", description: `Order #${orderNumber}` });
    navigate("/dashboard");
  };

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 py-20">
          <ShoppingBag size={48} className="text-muted-foreground" />
          <h2 className="mt-4 font-heading text-2xl font-bold text-foreground">Your cart is empty</h2>
          <p className="mt-2 text-muted-foreground">Browse our collection and add items to your cart.</p>
          <Link to="/shop">
            <Button className="mt-6 gradient-primary text-primary-foreground">Continue Shopping</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10">
        <h1 className="font-heading text-3xl font-bold text-foreground">Shopping Cart</h1>
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                className="flex gap-4 rounded-xl border border-border bg-card p-4 shadow-soft"
              >
                <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                  {item.product?.image_url ? (
                    <img src={item.product.image_url} alt={item.product.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">No img</div>
                  )}
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <Link to={`/product/${item.product?.slug}`} className="font-heading font-semibold text-card-foreground hover:text-primary">
                      {item.product?.name}
                    </Link>
                    <p className="text-sm text-primary font-bold">${(item.product?.price ?? 0).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center rounded-md border border-border">
                      <button onClick={() => updateQuantity(item.product_id, item.quantity - 1)} className="p-1.5 text-muted-foreground hover:text-foreground">
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-sm text-foreground">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product_id, item.quantity + 1)} className="p-1.5 text-muted-foreground hover:text-foreground">
                        <Plus size={14} />
                      </button>
                    </div>
                    <button onClick={() => removeFromCart(item.product_id)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 size={16} />
                    </button>
                    <span className="ml-auto font-bold text-foreground">
                      ${((item.product?.price ?? 0) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-soft h-fit">
            <h2 className="font-heading text-xl font-bold text-card-foreground">Order Summary</h2>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between font-bold text-foreground">
                <span>Total</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
            </div>
            <div className="mt-4">
              <Label htmlFor="address">Shipping Address</Label>
              <Textarea
                id="address"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="Enter your full shipping address"
                className="mt-1"
                maxLength={500}
              />
            </div>
            <Button
              onClick={handlePlaceOrder}
              className="mt-4 w-full gradient-primary text-primary-foreground"
              disabled={placing}
            >
              {placing ? "Placing Order..." : "Place Order"}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Cart;
