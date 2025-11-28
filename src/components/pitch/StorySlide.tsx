import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

export const StorySlide = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-20%" });

  return (
    <section ref={ref} className="min-h-screen flex items-center justify-center px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="max-w-4xl text-center space-y-12"
      >
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className="text-4xl md:text-6xl font-light text-foreground/90 leading-tight"
        >
          Most of us don't lack self-awareness —<br />
          we lack the space to understand what we feel.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
          className="text-2xl md:text-3xl font-light text-foreground/70 leading-relaxed"
        >
          Emotions don't sit still.<br />
          They shift, move, contradict, collide…<br />
          and traditional journaling treats them like static text.
        </motion.p>
      </motion.div>
    </section>
  );
};
