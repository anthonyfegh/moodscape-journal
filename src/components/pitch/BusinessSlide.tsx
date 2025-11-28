import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Sparkles, Zap, Crown } from "lucide-react";

export const BusinessSlide = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-25%" });

  const tiers = [
    {
      name: "Free",
      description: "Limited entries",
      icon: Sparkles,
      gradient: "from-gray-500 to-gray-600",
      scale: 0.95
    },
    {
      name: "Plus",
      description: "Core features",
      icon: Zap,
      gradient: "from-blue-500 to-purple-600",
      scale: 1
    },
    {
      name: "Pro",
      description: "AI memory, evolving persona, unlimited logs",
      icon: Crown,
      gradient: "from-purple-600 to-pink-600",
      scale: 1.05
    }
  ];

  return (
    <section ref={ref} className="min-h-screen flex items-center justify-center px-6 py-32 relative overflow-hidden">
      {/* Floating gradient orbs */}
      <motion.div
        animate={isInView ? {
          x: [0, 100, 0],
          y: [0, -50, 0],
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.3, 0.2]
        } : {}}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 left-20 w-96 h-96 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 blur-3xl"
      />
      <motion.div
        animate={isInView ? {
          x: [0, -80, 0],
          y: [0, 60, 0],
          scale: [1, 1.4, 1],
          opacity: [0.15, 0.25, 0.15]
        } : {}}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-20 right-20 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-blue-500/30 to-cyan-500/30 blur-3xl"
      />

      <div className="max-w-6xl w-full space-y-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="text-center space-y-4"
        >
          <motion.h2
            className="text-4xl md:text-6xl font-bold text-foreground"
          >
            Simple, global{" "}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              subscription model
            </span>
          </motion.h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 items-end">
          {tiers.map((tier, index) => {
            const Icon = tier.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 60, scale: 0.9 }}
                animate={isInView ? { 
                  opacity: 1, 
                  y: 0, 
                  scale: tier.scale 
                } : { 
                  opacity: 0, 
                  y: 60, 
                  scale: 0.9 
                }}
                transition={{ 
                  duration: 0.9, 
                  delay: 0.3 + index * 0.15, 
                  ease: [0.22, 1, 0.36, 1]
                }}
                whileHover={{ 
                  scale: tier.scale * 1.05,
                  y: -15
                }}
                className="group relative"
              >
                <motion.div
                  animate={isInView ? {
                    rotate: [0, 360],
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3]
                  } : {}}
                  transition={{ 
                    duration: 8, 
                    repeat: Infinity, 
                    ease: "linear",
                    delay: index * 1.5 
                  }}
                  className={`absolute -inset-3 bg-gradient-to-r ${tier.gradient} rounded-3xl blur-2xl opacity-0 group-hover:opacity-60 transition-opacity`}
                />
                <div className="relative space-y-8 p-10 backdrop-blur-md bg-background/40 rounded-3xl border border-border/30">
                  <motion.div
                    animate={isInView ? {
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1]
                    } : {}}
                    transition={{ 
                      duration: 4, 
                      repeat: Infinity, 
                      ease: "easeInOut",
                      delay: index * 0.5
                    }}
                    className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br ${tier.gradient} flex items-center justify-center shadow-2xl`}
                  >
                    <Icon className="w-10 h-10 text-white" />
                  </motion.div>
                  <h3 className="text-4xl font-bold text-foreground text-center">{tier.name}</h3>
                  <p className="text-foreground/70 text-lg leading-relaxed text-center min-h-[80px] flex items-center justify-center">
                    {tier.description}
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
