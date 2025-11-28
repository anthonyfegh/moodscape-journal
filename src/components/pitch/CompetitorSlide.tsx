import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

export const CompetitorSlide = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-20%" });

  const competitors = ["Reflectly", "Stoic", "Journey", "Wysa", "Replika"];
  
  const differentiators = [
    "They analyze text → Yuri reacts to emotion",
    "They offer templates → Yuri guides dynamically",
    "They are static → Yuri is alive"
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
          Competitor Analysis
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="backdrop-blur-xl bg-background/15 border border-border/20 rounded-3xl p-8 space-y-6"
        >
          <h3 className="text-xl font-semibold text-foreground/80 text-center">Competitors:</h3>
          <div className="flex flex-wrap justify-center gap-4">
            {competitors.map((comp, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.1, ease: "easeOut" }}
                className="px-6 py-3 bg-background/30 rounded-full text-foreground/70 text-lg"
              >
                {comp}
              </motion.span>
            ))}
          </div>
        </motion.div>

        <div className="space-y-6">
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
            className="text-2xl font-semibold text-foreground/90 text-center"
          >
            Yuri Differentiation
          </motion.h3>
          {differentiators.map((diff, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -30 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
              transition={{ duration: 0.7, delay: 0.8 + index * 0.15, ease: "easeOut" }}
              className="backdrop-blur-xl bg-background/20 border border-border/20 rounded-2xl p-6 text-foreground/80 text-lg text-center"
            >
              {diff}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
