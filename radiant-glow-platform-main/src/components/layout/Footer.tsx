import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t border-border bg-secondary/30 theme-transition">
    <div className="container mx-auto px-4 py-12">
      <div className="grid gap-8 md:grid-cols-4">
        <div>
          <h3 className="font-heading text-xl font-bold text-foreground">
            Radiant <span className="text-primary">Glow</span>
          </h3>
          <p className="mt-3 text-sm text-muted-foreground">
            Premium skincare crafted with nature's finest ingredients for your radiant, healthy skin.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-foreground">Shop</h4>
          <div className="flex flex-col gap-2">
            <Link to="/shop" className="text-sm text-muted-foreground hover:text-foreground">All Products</Link>
            <Link to="/shop?category=serums" className="text-sm text-muted-foreground hover:text-foreground">Serums</Link>
            <Link to="/shop?category=moisturizers" className="text-sm text-muted-foreground hover:text-foreground">Moisturizers</Link>
            <Link to="/shop?category=cleansers" className="text-sm text-muted-foreground hover:text-foreground">Cleansers</Link>
          </div>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-foreground">Company</h4>
          <div className="flex flex-col gap-2">
            <Link to="/blog" className="text-sm text-muted-foreground hover:text-foreground">Blog</Link>
            <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground">About Us</Link>
            <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground">Contact</Link>
          </div>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-foreground">Support</h4>
          <div className="flex flex-col gap-2">
            <Link to="/shipping" className="text-sm text-muted-foreground hover:text-foreground">Shipping</Link>
            <Link to="/returns" className="text-sm text-muted-foreground hover:text-foreground">Returns</Link>
            <Link to="/privacy-policy" className="text-sm text-muted-foreground hover:text-foreground">Privacy Policy</Link>
          </div>
        </div>
      </div>
      <div className="mt-10 border-t border-border pt-6 text-center">
        <p className="text-xs text-muted-foreground">© 2026 Radiant Glow. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
