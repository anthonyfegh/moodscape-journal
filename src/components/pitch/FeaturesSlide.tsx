import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

export const FeaturesSlide = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-20%" });

  const features = [
    {
      title: "Living Background",
      description: "Colors, motion, and energy adapt to your emotional tone"
    },
    {
      title: "Typing Trails",
      description: "Expressive ink-like movement that reflects intensity"
    },
    {
      title: "Emotional Highlights",
      description: "Key recurring words pulse gently as patterns form"
    },
    {
      title: "Journal Types",
      description: "Daily, People, Events, Creative, Themes"
    },
    {
      title: "Interactive Persona",
      description: "Asks questions, remembers patterns, evolves with you"
    }
  ];

  return (
    <section ref={ref} className="min-h-screen flex items-center justify-center px-6 py-24">
      <div className="max-w-6xl w-full space-y-16">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-4xl md:text-5xl font-semibold text-foreground/90 text-center"
        >
          Features
        </motion.h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
              transition={{ duration: 0.7, delay: 0.1 + index * 0.1, ease: "easeOut" }}
              className="backdrop-blur-2xl bg-background/20 border border-border/20 rounded-3xl p-8 space-y-4 hover:bg-background/30 transition-all duration-300"
            >
              <h3 className="text-xl font-semibold text-foreground/90">{feature.title}</h3>
              <p className="text-foreground/70 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
