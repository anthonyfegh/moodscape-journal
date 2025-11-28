import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

export const ProblemSlide = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-25%" });

  const stats = [
    { text: "1 in 4 adults reports feeling emotionally overwhelmed daily.", color: "from-red-500 to-orange-500" },
    { text: "66% say they don't know what they feel until it becomes unmanageable.", color: "from-orange-500 to-yellow-500" },
    { text: "Traditional journals fail because they rely entirely on self‑direction.", color: "from-yellow-500 to-green-500" },
    { text: "AI journaling apps only analyze text — they don't respond to it emotionally.", color: "from-green-500 to-blue-500" }
  ];

  return (
    <section ref={ref} className="min-h-screen flex items-center justify-center px-6 py-32 relative">
      <div className="max-w-6xl w-full space-y-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="text-center space-y-6"
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.9, delay: 0.1, ease: "easeOut" }}
            className="text-4xl md:text-6xl font-bold text-foreground leading-tight"
          >
            People aren't processing emotions —
          </motion.h2>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.9, delay: 0.3, ease: "easeOut" }}
            className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent"
          >
            they're drowning in them.
          </motion.h2>
        </motion.div>

        <div className="space-y-6">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -50, scale: 0.95 }}
              animate={isInView ? { opacity: 1, x: 0, scale: 1 } : { opacity: 0, x: -50, scale: 0.95 }}
              transition={{ 
                duration: 0.8, 
                delay: 0.5 + index * 0.12, 
                ease: [0.22, 1, 0.36, 1]
              }}
              whileHover={{ scale: 1.02, x: 10 }}
              className="relative group"
            >
              <motion.div
                animate={isInView ? {
                  opacity: [0.5, 0.8, 0.5]
                } : {}}
                transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 }}
                className={`absolute -inset-1 bg-gradient-to-r ${stat.color} rounded-2xl blur-xl opacity-0 group-hover:opacity-70 transition-opacity`}
              />
              <div className="relative backdrop-blur-sm bg-background/40 rounded-2xl p-8 border-l-4 border-transparent group-hover:border-gradient">
                <motion.div
                  className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${stat.color} rounded-l-2xl`}
                  initial={{ scaleY: 0 }}
                  animate={isInView ? { scaleY: 1 } : { scaleY: 0 }}
                  transition={{ duration: 0.6, delay: 0.7 + index * 0.12 }}
                />
                <p className="text-foreground/90 text-lg md:text-xl leading-relaxed pl-4">
                  {stat.text}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
