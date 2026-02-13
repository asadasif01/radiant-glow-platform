import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Leaf, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import heroImage from "@/assets/hero-skincare.jpg";

const features = [
  {
    icon: Sparkles,
    title: "Premium Formulas",
    description: "Scientifically backed ingredients for visible results.",
  },
  {
    icon: Leaf,
    title: "Natural Ingredients",
    description: "Clean, plant-derived formulations for every skin type.",
  },
  {
    icon: Shield,
    title: "Dermatologist Tested",
    description: "Safe, gentle, and effective for sensitive skin.",
  },
];

const Index = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden gradient-hero">
        <div className="container mx-auto flex flex-col-reverse items-center gap-8 px-4 py-16 md:flex-row md:py-24 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="flex-1 text-center md:text-left"
          >
            <h1 className="font-heading text-4xl font-bold leading-tight text-foreground md:text-5xl lg:text-6xl">
              Reveal Your <br />
              <span className="text-primary">Natural Radiance</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted-foreground">
              Premium skincare crafted with nature's finest ingredients. Discover products that
              transform your daily routine into a luxurious ritual.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4 md:justify-start">
              <Link to="/shop">
                <Button size="lg" className="gradient-primary text-primary-foreground gap-2 shadow-soft">
                  Shop Now <ArrowRight size={18} />
                </Button>
              </Link>
              <Link to="/blog">
                <Button size="lg" variant="outline" className="border-border">
                  Skincare Tips
                </Button>
              </Link>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex-1"
          >
            <img
              src={heroImage}
              alt="Luxury skincare products"
              className="w-full max-w-xl rounded-2xl shadow-elevated"
            />
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-background py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-center font-heading text-3xl font-bold text-foreground">
            Why Radiant Glow?
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="flex flex-col items-center rounded-2xl border border-border bg-card p-8 text-center shadow-soft"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-light">
                  <f.icon size={24} className="text-primary" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-card-foreground">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="gradient-hero py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-heading text-3xl font-bold text-foreground">
            Start Your Skincare Journey
          </h2>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground">
            Join thousands who've transformed their skin with Radiant Glow's curated collection.
          </p>
          <Link to="/auth">
            <Button size="lg" className="mt-8 gradient-primary text-primary-foreground shadow-soft">
              Create Your Account
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
