import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, X, Check } from "lucide-react";

export const CompetitorSlide = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-25%" });

  const competitors = ["Reflectly", "Stoic", "Journey", "Wysa", "Replika"];
  
  const differentiators = [
    { 
      them: "They analyze text", 
      us: "Yuri reacts to emotion",
      color: "from-red-500 to-orange-500"
    },
    { 
      them: "They offer templates", 
      us: "Yuri guides dynamically",
      color: "from-purple-500 to-pink-500"
    },
    { 
      them: "They are static", 
      us: "Yuri is alive",
      color: "from-green-500 to-cyan-500"
    }
  ];

  return (
    <section ref={ref} className="min-h-screen flex items-center justify-center px-6 py-32">
      <div className="max-w-6xl w-full space-y-20">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="text-4xl md:text-6xl font-bold text-center text-foreground"
        >
          What makes us{" "}
          <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            different
          </span>
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-center space-y-6"
        >
          <h3 className="text-xl md:text-2xl font-semibold text-foreground/70">Others:</h3>
          <div className="flex flex-wrap justify-center gap-4">
            {competitors.map((comp, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={isInView ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.8, y: 20 }}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="px-6 py-3 bg-background/20 backdrop-blur-sm rounded-full text-foreground/60 text-lg border border-border/20"
              >
                {comp}
              </motion.span>
            ))}
          </div>
        </motion.div>

        <div className="space-y-8">
          {differentiators.map((diff, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
              transition={{ duration: 0.8, delay: 0.7 + index * 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="group"
            >
              <div className="grid md:grid-cols-[1fr,auto,1fr] gap-6 items-center">
                {/* Them */}
                <motion.div
                  whileHover={{ scale: 0.98, opacity: 0.7 }}
                  className="relative p-6 rounded-2xl bg-background/10 backdrop-blur-sm border border-border/10 text-center"
                >
                  <div className="flex items-center justify-center gap-2 text-foreground/50">
                    <X className="w-5 h-5 text-red-500/70" />
                    <p className="text-lg">{diff.them}</p>
                  </div>
                </motion.div>

                {/* Arrow */}
                <motion.div
                  animate={isInView ? {
                    x: [0, 10, 0],
                    scale: [1, 1.2, 1]
                  } : {}}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                  className={`w-12 h-12 rounded-full bg-gradient-to-r ${diff.color} flex items-center justify-center shadow-lg`}
                >
                  <ArrowRight className="w-6 h-6 text-white" />
                </motion.div>

                {/* Us */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative group/card"
                >
                  <motion.div
                    animate={isInView ? {
                      opacity: [0.3, 0.6, 0.3]
                    } : {}}
                    transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 }}
                    className={`absolute -inset-1 bg-gradient-to-r ${diff.color} rounded-2xl blur-xl opacity-0 group-hover/card:opacity-50 transition-opacity`}
                  />
                  <div className="relative p-6 rounded-2xl bg-background/30 backdrop-blur-md border border-border/30 text-center">
                    <div className="flex items-center justify-center gap-2 text-foreground/90">
                      <Check className="w-5 h-5 text-green-500" />
                      <p className="text-lg font-semibold">{diff.us}</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
