import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { TrendingUp } from "lucide-react";

export const ValueSlide = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-25%" });

  const markets = [
    { 
      label: "TAM", 
      value: "$150B+", 
      description: "Wellness + AI",
      gradient: "from-purple-600 to-blue-600"
    },
    { 
      label: "SAM", 
      value: "$10B", 
      description: "Digital journaling + self-help AI",
      gradient: "from-blue-600 to-cyan-600"
    },
    { 
      label: "SOM", 
      value: "$300M", 
      description: "AI wellness early adopters",
      gradient: "from-cyan-600 to-green-600"
    }
  ];

  return (
    <section ref={ref} className="min-h-screen flex items-center justify-center px-6 py-32 relative overflow-hidden">
      {/* Animated background gradient */}
      <motion.div
        animate={isInView ? {
          scale: [1, 1.3, 1],
          opacity: [0.15, 0.25, 0.15]
        } : {}}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-green-500/20 to-blue-500/20 blur-3xl"
      />

      <div className="max-w-6xl w-full space-y-24 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="text-center space-y-8"
        >
          <motion.h2
            className="text-3xl md:text-5xl font-bold text-foreground leading-tight"
          >
            Emotional clarity is a{" "}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              universal need
            </span>{" "}
            —
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.9, delay: 0.3, ease: "easeOut" }}
            className="text-2xl md:text-4xl font-light text-foreground/70"
          >
            but emotional infrastructure barely exists.
          </motion.p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-10">
          {markets.map((market, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.9 }}
              transition={{ 
                duration: 0.8, 
                delay: 0.5 + index * 0.15, 
                ease: [0.22, 1, 0.36, 1]
              }}
              whileHover={{ y: -15 }}
              className="group relative"
            >
              <motion.div
                animate={isInView ? {
                  rotate: [0, 360],
                  scale: [1, 1.2, 1]
                } : {}}
                transition={{ duration: 8, repeat: Infinity, ease: "linear", delay: index * 1 }}
                className={`absolute -inset-2 bg-gradient-to-r ${market.gradient} rounded-3xl blur-2xl opacity-20 group-hover:opacity-40 transition-opacity`}
              />
              <div className="relative space-y-6 p-10 backdrop-blur-sm bg-background/30 rounded-3xl border border-border/20">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-foreground/80">{market.label}</h3>
                  <motion.div
                    animate={isInView ? {
                      rotate: [0, 10, 0],
                      scale: [1, 1.1, 1]
                    } : {}}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                  >
                    <TrendingUp className={`w-8 h-8 bg-gradient-to-r ${market.gradient} bg-clip-text text-transparent`} />
                  </motion.div>
                </div>
                <motion.p
                  animate={isInView ? {
                    scale: [1, 1.05, 1]
                  } : {}}
                  transition={{ duration: 3, repeat: Infinity, delay: index * 0.7 }}
                  className={`text-5xl md:text-6xl font-bold bg-gradient-to-r ${market.gradient} bg-clip-text text-transparent`}
                >
                  {market.value}
                </motion.p>
                <p className="text-foreground/70 text-lg leading-relaxed">{market.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.9, delay: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="text-center space-y-4"
        >
          <p className="text-xl md:text-3xl text-foreground/80 leading-relaxed font-light">
            Zero marginal cost · Highly scalable · Deeply personal
          </p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.8, delay: 1.5, ease: "easeOut" }}
            className="text-2xl md:text-4xl font-semibold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent"
          >
            Subscription-ready
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
};
