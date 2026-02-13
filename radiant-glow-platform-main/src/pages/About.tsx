import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import { aboutUsContent } from "@/data/staticPages";

const About = () => (
  <Layout>
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-heading text-3xl font-bold text-foreground md:text-4xl">
          {aboutUsContent.title}
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">{aboutUsContent.heroText}</p>
        <div className="mt-10 space-y-8">
          {aboutUsContent.sections.map((s) => (
            <section key={s.heading}>
              <h2 className="font-heading text-xl font-semibold text-foreground">{s.heading}</h2>
              <p className="mt-2 whitespace-pre-line text-muted-foreground leading-relaxed">{s.content}</p>
            </section>
          ))}
        </div>
      </motion.div>
    </div>
  </Layout>
);

export default About;
