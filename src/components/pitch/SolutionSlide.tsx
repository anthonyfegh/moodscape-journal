import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

export const SolutionSlide = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-20%" });

  return (
    <section ref={ref} className="min-h-screen flex items-center justify-center px-6 py-24">
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="max-w-4xl text-center space-y-12"
      >
        <motion.h2
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className="text-5xl md:text-7xl font-bold text-foreground/95 leading-tight"
        >
          We built Yuri —<br />
          the first journal with Emotional UX.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
          className="text-2xl md:text-3xl font-light text-foreground/75 leading-relaxed"
        >
          Yuri reads not just your words,<br />
          but how you write them —<br />
          and visually responds in real time.
        </motion.p>
      </motion.div>
    </section>
  );
};
