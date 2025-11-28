import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

export const ProblemSlide = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-20%" });

  const stats = [
    "1 in 4 adults reports feeling emotionally overwhelmed daily.",
    "66% say they don't know what they feel until it becomes unmanageable.",
    "Traditional journals fail because they rely entirely on self‑direction.",
    "AI journaling apps only analyze text — they don't respond to it emotionally."
  ];

  return (
    <section ref={ref} className="min-h-screen flex items-center justify-center px-6 py-24">
      <div className="max-w-5xl w-full space-y-16">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-4xl md:text-5xl font-semibold text-foreground/90 text-center mb-16"
        >
          People aren't processing emotions —<br />they're drowning in them.
        </motion.h2>

        <div className="grid gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -30 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
              transition={{ duration: 0.8, delay: 0.2 + index * 0.15, ease: "easeOut" }}
              className="backdrop-blur-xl bg-background/20 border border-border/20 rounded-2xl p-8 text-foreground/80 text-lg md:text-xl leading-relaxed"
            >
              {stat}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
