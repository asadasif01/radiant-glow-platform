import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { contactContent } from "@/data/staticPages";

const infoItems = [
  { icon: Mail, label: "Email", value: contactContent.email },
  { icon: Phone, label: "Phone", value: contactContent.phone },
  { icon: MapPin, label: "Address", value: contactContent.address },
  { icon: Clock, label: "Business Hours", value: contactContent.hours },
];

const Contact = () => (
  <Layout>
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-heading text-3xl font-bold text-foreground md:text-4xl">
          {contactContent.title}
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">{contactContent.subtitle}</p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {infoItems.map((item) => (
            <div
              key={item.label}
              className="flex gap-4 rounded-2xl border border-border bg-card p-6 shadow-soft"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-light">
                <item.icon size={20} className="text-primary" />
              </div>
              <div>
                <h3 className="font-heading text-sm font-semibold text-foreground">{item.label}</h3>
                <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <h2 className="font-heading text-xl font-semibold text-foreground">Follow Us</h2>
          <div className="mt-3 flex gap-4">
            {contactContent.socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                className="text-sm text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.name}
              </a>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  </Layout>
);

export default Contact;
