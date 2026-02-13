import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { blogArticles } from "@/data/blogArticles";

const BlogArticle = () => {
  const { slug } = useParams();
  const article = blogArticles.find((a) => a.slug === slug);

  if (!article) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">
          Article not found.
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <article className="container mx-auto max-w-3xl px-4 py-10">
        <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
          <ArrowLeft size={14} /> Back to Blog
        </Link>
        <img
          src={article.image}
          alt={article.title}
          className="mt-6 w-full rounded-2xl object-cover"
          style={{ maxHeight: 400 }}
        />
        <div className="mt-6">
          <span className="text-sm text-muted-foreground">
            {new Date(article.publishDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </span>
          <h1 className="mt-2 font-heading text-3xl font-bold text-foreground md:text-4xl">{article.title}</h1>
          <p className="mt-4 text-lg text-muted-foreground">{article.summary}</p>
          <div className="mt-8 space-y-4 text-foreground leading-relaxed whitespace-pre-line">
            {article.content}
          </div>
        </div>
      </article>
    </Layout>
  );
};

export default BlogArticle;
