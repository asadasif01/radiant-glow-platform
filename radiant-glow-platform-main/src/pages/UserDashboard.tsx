import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Package, Star, User } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type Order = Tables<"orders"> & { order_items?: Tables<"order_items">[] };

const statusColors: Record<string, string> = {
  pending: "bg-gold-light text-accent",
  processing: "bg-secondary text-secondary-foreground",
  shipped: "bg-rose-light text-primary",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-destructive/10 text-destructive",
};

const UserDashboard = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [tab, setTab] = useState<"profile" | "orders">("orders");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) setFullName(profile.full_name ?? "");
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      const { data } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setOrders((data as Order[]) ?? []);
    };
    fetchOrders();
  }, [user]);

  const handleUpdateName = async () => {
    if (!user || !fullName.trim()) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName.trim() })
      .eq("user_id", user.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      await refreshProfile();
      toast({ title: "Name updated!" });
    }
    setSaving(false);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10">
        <h1 className="font-heading text-3xl font-bold text-foreground">My Account</h1>

        <div className="mt-6 flex gap-4 border-b border-border">
          <button
            onClick={() => setTab("orders")}
            className={`pb-3 text-sm font-medium transition-colors ${tab === "orders" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}
          >
            <Package size={16} className="mr-1.5 inline" /> Orders
          </button>
          <button
            onClick={() => setTab("profile")}
            className={`pb-3 text-sm font-medium transition-colors ${tab === "profile" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}
          >
            <User size={16} className="mr-1.5 inline" /> Profile
          </button>
        </div>

        {tab === "profile" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 max-w-md space-y-4">
            {profile?.avatar_url && (
              <img src={profile.avatar_url} alt="Avatar" className="h-20 w-20 rounded-full object-cover border border-border" />
            )}
            <div>
              <Label>Email</Label>
              <Input value={user?.email ?? ""} disabled />
            </div>
            <div>
              <Label>Full Name</Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={100} />
            </div>
            <div>
              <Label>Phone Number</Label>
              <Input value={profile?.phone_number ?? ""} disabled />
              <p className="mt-1 text-xs text-muted-foreground">Phone number cannot be changed.</p>
            </div>
            <Button onClick={handleUpdateName} disabled={saving} className="gradient-primary text-primary-foreground">
              {saving ? "Saving..." : "Update Name"}
            </Button>
          </motion.div>
        )}

        {tab === "orders" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 space-y-4">
            {orders.length === 0 ? (
              <p className="text-muted-foreground">No orders yet.</p>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="rounded-xl border border-border bg-card p-5 shadow-soft">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="font-heading font-semibold text-card-foreground">#{order.order_number}</span>
                      <span className="ml-3 text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[order.status] ?? "bg-muted text-muted-foreground"}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                  <div className="mt-3 space-y-1">
                    {order.order_items?.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm text-muted-foreground">
                        <span>{item.product_name} × {item.quantity}</span>
                        <span>${(item.unit_price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex justify-between border-t border-border pt-2 font-bold text-foreground">
                    <span>Total</span>
                    <span>${order.total_price.toFixed(2)}</span>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default UserDashboard;
