import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import { blogArticles } from "@/data/blogArticles";

const Blog = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-10">
        <h1 className="font-heading text-3xl font-bold text-foreground">Skincare Tips & Blog</h1>
        <p className="mt-2 text-muted-foreground">Expert advice for your healthiest, most radiant skin</p>

        <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {blogArticles.map((article, i) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Link to={`/blog/${article.slug}`}>
                <div className="group overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-shadow hover:shadow-card">
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-5">
                    <span className="text-xs text-muted-foreground">
                      {new Date(article.publishDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </span>
                    <h3 className="mt-2 font-heading text-lg font-semibold text-card-foreground line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{article.summary}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Blog;
