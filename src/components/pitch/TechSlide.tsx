import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Database, Zap, Brain, Grid3x3, TrendingUp } from "lucide-react";

export const TechSlide = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-25%" });

  const techPoints = [
    { text: "Supabase auth + user‑scoped journals", icon: Database, color: "from-green-500 to-emerald-500" },
    { text: "Framer-motion powered emotional visuals", icon: Zap, color: "from-yellow-500 to-orange-500" },
    { text: "Real-time local AI reflection", icon: Brain, color: "from-purple-500 to-pink-500" },
    { text: "Multi-type journal architecture", icon: Grid3x3, color: "from-blue-500 to-cyan-500" },
    { text: "Persona that evolves over time", icon: TrendingUp, color: "from-pink-500 to-red-500" }
  ];

  return (
    <section ref={ref} className="min-h-screen flex items-center justify-center px-6 py-32 relative overflow-hidden">
      {/* Animated tech grid background */}
      <motion.div
        animate={isInView ? {
          opacity: [0.05, 0.15, 0.05]
        } : {}}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
                           linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      <div className="max-w-6xl w-full space-y-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="text-center space-y-6"
        >
          <motion.h2
            className="text-3xl md:text-5xl font-bold text-foreground leading-tight"
          >
            Built end‑to‑end with{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Lovable
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: "easeOut" }}
            className="text-xl md:text-2xl text-foreground/70"
          >
            + a custom emotional inference engine
          </motion.p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {techPoints.map((point, index) => {
            const Icon = point.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50, scale: 0.9 }}
                animate={isInView ? { opacity: 1, x: 0, scale: 1 } : { opacity: 0, x: index % 2 === 0 ? -50 : 50, scale: 0.9 }}
                transition={{ 
                  duration: 0.8, 
                  delay: 0.4 + index * 0.1, 
                  ease: [0.22, 1, 0.36, 1]
                }}
                whileHover={{ scale: 1.05 }}
                className="group relative"
              >
                <motion.div
                  animate={isInView ? {
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.5, 0.3]
                  } : {}}
                  transition={{ duration: 4, repeat: Infinity, delay: index * 0.4 }}
                  className={`absolute -inset-2 bg-gradient-to-r ${point.color} rounded-3xl blur-2xl opacity-0 group-hover:opacity-40 transition-opacity`}
                />
                <div className="relative flex items-center gap-6 p-6 backdrop-blur-sm bg-background/30 rounded-3xl border border-border/20">
                  <motion.div
                    animate={isInView ? {
                      rotate: [0, 360]
                    } : {}}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear", delay: index * 2 }}
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${point.color} flex items-center justify-center flex-shrink-0`}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </motion.div>
                  <p className="text-foreground/90 text-lg font-medium leading-relaxed">
                    {point.text}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
