import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

export const TechSlide = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-20%" });

  const techPoints = [
    "Supabase auth + user‑scoped journals",
    "Framer-motion powered emotional visuals",
    "Real-time local AI reflection",
    "Multi-type journal architecture",
    "Persona that evolves over time"
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
          Built end‑to‑end with Lovable +<br />a custom emotional inference engine.
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-6">
          {techPoints.map((point, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.1, ease: "easeOut" }}
              className="backdrop-blur-xl bg-background/15 border border-border/20 rounded-2xl p-6 text-center text-foreground/80 text-lg"
            >
              {point}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
