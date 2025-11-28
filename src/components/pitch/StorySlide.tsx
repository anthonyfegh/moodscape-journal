import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

export const StorySlide = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-30%" });

  return (
    <section ref={ref} className="min-h-screen flex items-center justify-center px-6 py-32 relative overflow-hidden">
      {/* Floating ambient orbs */}
      <motion.div
        animate={isInView ? {
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.25, 0.15],
          x: [0, 50, 0],
          y: [0, -30, 0]
        } : {}}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 right-10 w-96 h-96 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-3xl"
      />
      <motion.div
        animate={isInView ? {
          scale: [1, 1.3, 1],
          opacity: [0.1, 0.2, 0.1],
          x: [0, -40, 0],
          y: [0, 40, 0]
        } : {}}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-20 left-10 w-80 h-80 rounded-full bg-gradient-to-tr from-blue-500/20 to-cyan-500/20 blur-3xl"
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="max-w-5xl text-center space-y-16 relative z-10"
      >
        <motion.h2
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 30, scale: 0.95 }}
          transition={{ duration: 1.2, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="text-4xl md:text-7xl font-light text-foreground leading-tight"
        >
          Most of us don't lack{" "}
          <span className="font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            self-awareness
          </span>{" "}
          —<br />
          we lack the space to understand what we feel.
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 1.2, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-6"
        >
          <p className="text-2xl md:text-4xl font-light text-foreground/80 leading-relaxed">
            Emotions don't sit still.
          </p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 1, delay: 1, ease: "easeOut" }}
            className="text-xl md:text-3xl font-light text-foreground/60 leading-relaxed"
          >
            They shift, move, contradict, collide…<br />
            and traditional journaling treats them like{" "}
            <span className="text-foreground/40 line-through">static text</span>.
          </motion.p>
        </motion.div>
      </motion.div>
    </section>
  );
};
