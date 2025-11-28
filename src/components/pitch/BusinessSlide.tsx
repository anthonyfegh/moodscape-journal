import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

export const BusinessSlide = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-20%" });

  const tiers = [
    {
      name: "Free",
      description: "Limited entries"
    },
    {
      name: "Plus",
      description: "Core features"
    },
    {
      name: "Pro",
      description: "AI memory, evolving persona, unlimited logs"
    }
  ];

  return (
    <section ref={ref} className="min-h-screen flex items-center justify-center px-6 py-24">
      <div className="max-w-5xl w-full space-y-16">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-4xl md:text-5xl font-semibold text-foreground/90 text-center"
        >
          Simple, global subscription model.
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-8">
          {tiers.map((tier, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.8, delay: 0.2 + index * 0.15, ease: "easeOut" }}
              className="backdrop-blur-2xl bg-background/20 border border-border/20 rounded-3xl p-10 space-y-6 text-center hover:bg-background/30 transition-all duration-300"
            >
              <h3 className="text-3xl font-bold text-foreground/95">{tier.name}</h3>
              <p className="text-lg text-foreground/75 leading-relaxed">{tier.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
