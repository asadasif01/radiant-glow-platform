import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DollarSign, Package, ShoppingCart, Users, AlertTriangle, Plus, Pencil, Trash2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type Product = Tables<"products">;
type Order = Tables<"orders"> & { order_items?: Tables<"order_items">[] };
type Category = Tables<"categories">;

const AdminDashboard = () => {
  const [tab, setTab] = useState<"overview" | "products" | "orders">("overview");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState({ revenue: 0, totalOrders: 0, totalProducts: 0, totalUsers: 0, lowStock: 0 });
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Product form state
  const [pName, setPName] = useState("");
  const [pDesc, setPDesc] = useState("");
  const [pIngredients, setPIngredients] = useState("");
  const [pUsage, setPUsage] = useState("");
  const [pPrice, setPPrice] = useState("");
  const [pStock, setPStock] = useState("");
  const [pCategory, setPCategory] = useState("");
  const [pImageFile, setPImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchAll = async () => {
    const [{ data: prods }, { data: ords }, { data: cats }, { data: profiles }] = await Promise.all([
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false }),
      supabase.from("categories").select("*"),
      supabase.from("profiles").select("id"),
    ]);
    setProducts(prods ?? []);
    setOrders((ords as Order[]) ?? []);
    setCategories(cats ?? []);

    const deliveredOrders = (ords ?? []).filter((o: any) => o.status === "delivered");
    const revenue = deliveredOrders.reduce((sum: number, o: any) => sum + Number(o.total_price), 0);
    const lowStock = (prods ?? []).filter((p) => p.stock_quantity <= 5 && p.is_active).length;

    setStats({
      revenue,
      totalOrders: (ords ?? []).length,
      totalProducts: (prods ?? []).length,
      totalUsers: (profiles ?? []).length,
      lowStock,
    });
  };

  useEffect(() => { fetchAll(); }, []);

  const resetForm = () => {
    setPName(""); setPDesc(""); setPIngredients(""); setPUsage("");
    setPPrice(""); setPStock(""); setPCategory(""); setPImageFile(null);
    setEditingProduct(null);
  };

  const openEdit = (p: Product) => {
    setEditingProduct(p);
    setPName(p.name);
    setPDesc(p.description ?? "");
    setPIngredients(p.ingredients ?? "");
    setPUsage(p.usage_instructions ?? "");
    setPPrice(String(p.price));
    setPStock(String(p.stock_quantity));
    setPCategory(p.category_id ?? "");
    setProductDialogOpen(true);
  };

  const handleSaveProduct = async () => {
    if (!pName.trim() || !pPrice) {
      toast({ title: "Name and price are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    const slug = pName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now().toString(36);

    let image_url = editingProduct?.image_url ?? null;
    if (pImageFile) {
      const path = `products/${slug}.${pImageFile.name.split(".").pop()}`;
      const { error: upErr } = await supabase.storage.from("product-images").upload(path, pImageFile, { upsert: true });
      if (upErr) { toast({ title: "Image upload failed", variant: "destructive" }); setSaving(false); return; }
      const { data: pubUrl } = supabase.storage.from("product-images").getPublicUrl(path);
      image_url = pubUrl.publicUrl;
    }

    const payload = {
      name: pName.trim(),
      slug: editingProduct?.slug ?? slug,
      description: pDesc.trim() || null,
      ingredients: pIngredients.trim() || null,
      usage_instructions: pUsage.trim() || null,
      price: parseFloat(pPrice),
      stock_quantity: parseInt(pStock) || 0,
      category_id: pCategory || null,
      image_url,
    };

    if (editingProduct) {
      const { error } = await supabase.from("products").update(payload).eq("id", editingProduct.id);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Product updated!" });
    } else {
      const { error } = await supabase.from("products").insert(payload);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Product added!" });
    }

    resetForm();
    setProductDialogOpen(false);
    setSaving(false);
    await fetchAll();
  };

  const handleDeleteProduct = async (id: string) => {
    await supabase.from("products").update({ is_active: false }).eq("id", id);
    toast({ title: "Product deactivated" });
    await fetchAll();
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    await supabase.from("orders").update({ status }).eq("id", orderId);
    toast({ title: `Order marked as ${status}` });
    await fetchAll();
  };

  const overviewCards = [
    { label: "Total Revenue", value: `$${stats.revenue.toFixed(2)}`, icon: DollarSign, color: "text-accent" },
    { label: "Total Orders", value: stats.totalOrders, icon: ShoppingCart, color: "text-primary" },
    { label: "Total Products", value: stats.totalProducts, icon: Package, color: "text-primary" },
    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "text-primary" },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10">
        <h1 className="font-heading text-3xl font-bold text-foreground">Admin Dashboard</h1>

        <div className="mt-6 flex gap-4 border-b border-border">
          {(["overview", "products", "orders"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-3 text-sm font-medium capitalize transition-colors ${tab === t ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "overview" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {overviewCards.map((card) => (
                <div key={card.label} className="rounded-xl border border-border bg-card p-5 shadow-soft">
                  <div className="flex items-center gap-3">
                    <card.icon size={20} className={card.color} />
                    <span className="text-sm text-muted-foreground">{card.label}</span>
                  </div>
                  <p className="mt-2 font-heading text-2xl font-bold text-card-foreground">{card.value}</p>
                </div>
              ))}
            </div>
            {stats.lowStock > 0 && (
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-accent bg-gold-light p-3">
                <AlertTriangle size={18} className="text-accent" />
                <span className="text-sm font-medium text-foreground">
                  {stats.lowStock} product{stats.lowStock > 1 ? "s" : ""} with low stock (≤5 units)
                </span>
              </div>
            )}
            {/* Recent orders */}
            <h2 className="mt-8 font-heading text-xl font-bold text-foreground">Recent Orders</h2>
            <div className="mt-4 space-y-3">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
                  <div>
                    <span className="font-medium text-card-foreground">#{order.order_number}</span>
                    <span className="ml-3 text-sm text-muted-foreground">${order.total_price.toFixed(2)}</span>
                  </div>
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground capitalize">
                    {order.status}
                  </span>
                </div>
              ))}
              {orders.length === 0 && <p className="text-muted-foreground">No orders yet.</p>}
            </div>
          </motion.div>
        )}

        {tab === "products" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6">
            <Dialog open={productDialogOpen} onOpenChange={(open) => { setProductDialogOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button className="gap-2 gradient-primary text-primary-foreground">
                  <Plus size={16} /> Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle className="font-heading">{editingProduct ? "Edit Product" : "Add Product"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <div><Label>Name *</Label><Input value={pName} onChange={(e) => setPName(e.target.value)} maxLength={200} /></div>
                  <div><Label>Description</Label><Textarea value={pDesc} onChange={(e) => setPDesc(e.target.value)} maxLength={2000} /></div>
                  <div><Label>Ingredients</Label><Textarea value={pIngredients} onChange={(e) => setPIngredients(e.target.value)} maxLength={2000} /></div>
                  <div><Label>Usage Instructions</Label><Textarea value={pUsage} onChange={(e) => setPUsage(e.target.value)} maxLength={2000} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Price ($) *</Label><Input type="number" step="0.01" min="0" value={pPrice} onChange={(e) => setPPrice(e.target.value)} /></div>
                    <div><Label>Stock</Label><Input type="number" min="0" value={pStock} onChange={(e) => setPStock(e.target.value)} /></div>
                  </div>
                  <div>
                    <Label>Category</Label>
                    <select value={pCategory} onChange={(e) => setPCategory(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground">
                      <option value="">Select category</option>
                      {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                    </select>
                  </div>
                  <div><Label>Product Image</Label><Input type="file" accept="image/*" onChange={(e) => setPImageFile(e.target.files?.[0] ?? null)} /></div>
                  <Button onClick={handleSaveProduct} disabled={saving} className="w-full gradient-primary text-primary-foreground">
                    {saving ? "Saving..." : editingProduct ? "Update Product" : "Add Product"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <div className="mt-6 space-y-3">
              {products.length === 0 ? (
                <p className="text-muted-foreground">No products yet. Add your first product!</p>
              ) : (
                products.map((p) => (
                  <div key={p.id} className={`flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-soft ${!p.is_active ? "opacity-50" : ""}`}>
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                        {p.image_url ? <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-[10px] text-muted-foreground">No img</div>}
                      </div>
                      <div>
                        <span className="font-medium text-card-foreground">{p.name}</span>
                        <div className="flex gap-3 text-xs text-muted-foreground">
                          <span>${p.price.toFixed(2)}</span>
                          <span>Stock: {p.stock_quantity}</span>
                          <span>Sold: {p.units_sold}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(p)}><Pencil size={14} /></Button>
                      {p.is_active && <Button variant="ghost" size="sm" onClick={() => handleDeleteProduct(p.id)}><Trash2 size={14} /></Button>}
                    </div>
                  </div>
                ))
              )}
            </div>
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
                    <select
                      value={order.status}
                      onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                      className="rounded-lg border border-border bg-background px-2 py-1 text-sm text-foreground"
                    >
                      {["pending", "processing", "shipped", "delivered", "cancelled"].map((s) => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mt-3 space-y-1">
                    {order.order_items?.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm text-muted-foreground">
                        <span>{item.product_name} × {item.quantity}</span>
                        <span>${(item.unit_price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 flex justify-between border-t border-border pt-2 font-bold text-foreground">
                    <span>Total</span>
                    <span>${order.total_price.toFixed(2)}</span>
                  </div>
                  {order.shipping_address && (
                    <p className="mt-2 text-xs text-muted-foreground">📍 {order.shipping_address}</p>
                  )}
                </div>
              ))
            )}
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default AdminDashboard;
