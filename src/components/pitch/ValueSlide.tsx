import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

export const ValueSlide = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-20%" });

  return (
    <section ref={ref} className="min-h-screen flex items-center justify-center px-6 py-24">
      <div className="max-w-5xl w-full space-y-16">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-4xl md:text-6xl font-bold text-foreground/95 text-center leading-tight"
        >
          Emotional clarity is a universal need —<br />
          but emotional infrastructure barely exists.
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="backdrop-blur-2xl bg-background/20 border border-border/20 rounded-3xl p-8 space-y-4"
          >
            <h3 className="text-xl font-semibold text-foreground/90">TAM</h3>
            <p className="text-3xl font-bold text-foreground/95">$150B+</p>
            <p className="text-foreground/70">Wellness + AI</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
            className="backdrop-blur-2xl bg-background/20 border border-border/20 rounded-3xl p-8 space-y-4"
          >
            <h3 className="text-xl font-semibold text-foreground/90">SAM</h3>
            <p className="text-3xl font-bold text-foreground/95">$10B</p>
            <p className="text-foreground/70">Digital journaling + self-help AI</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ duration: 0.8, delay: 0.7, ease: "easeOut" }}
            className="backdrop-blur-2xl bg-background/20 border border-border/20 rounded-3xl p-8 space-y-4"
          >
            <h3 className="text-xl font-semibold text-foreground/90">SOM</h3>
            <p className="text-3xl font-bold text-foreground/95">$300M</p>
            <p className="text-foreground/70">AI wellness early adopters</p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.9, ease: "easeOut" }}
          className="backdrop-blur-xl bg-background/15 border border-border/20 rounded-2xl p-8 text-center"
        >
          <p className="text-xl md:text-2xl text-foreground/80 leading-relaxed">
            Zero marginal cost, highly scalable, deeply personal, subscription-ready.
          </p>
        </motion.div>
      </div>
    </section>
  );
};
