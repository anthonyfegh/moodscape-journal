import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Sparkles, Brush, Heart, Book, Users } from "lucide-react";

export const FeaturesSlide = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-25%" });

  const features = [
    {
      title: "Living Background",
      description: "Colors, motion, and energy adapt to your emotional tone",
      icon: Sparkles,
      gradient: "from-purple-500 to-pink-500"
    },
    {
      title: "Typing Trails",
      description: "Expressive ink-like movement that reflects intensity",
      icon: Brush,
      gradient: "from-pink-500 to-orange-500"
    },
    {
      title: "Emotional Highlights",
      description: "Key recurring words pulse gently as patterns form",
      icon: Heart,
      gradient: "from-orange-500 to-yellow-500"
    },
    {
      title: "Journal Types",
      description: "Daily, People, Events, Creative, Themes",
      icon: Book,
      gradient: "from-green-500 to-cyan-500"
    },
    {
      title: "Interactive Persona",
      description: "Asks questions, remembers patterns, evolves with you",
      icon: Users,
      gradient: "from-cyan-500 to-blue-500"
    }
  ];

  return (
    <section ref={ref} className="min-h-screen flex items-center justify-center px-6 py-32">
      <div className="max-w-7xl w-full space-y-20">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="text-4xl md:text-6xl font-bold text-center bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent"
        >
          Features that feel alive
        </motion.h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 60, scale: 0.9 }}
                animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 60, scale: 0.9 }}
                transition={{ 
                  duration: 0.8, 
                  delay: 0.15 + index * 0.08, 
                  ease: [0.22, 1, 0.36, 1]
                }}
                whileHover={{ 
                  y: -10,
                  transition: { duration: 0.3 }
                }}
                className="relative group"
              >
                <motion.div
                  animate={isInView ? {
                    rotate: [0, 360],
                    opacity: [0.3, 0.6, 0.3]
                  } : {}}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear", delay: index * 0.5 }}
                  className={`absolute -inset-1 bg-gradient-to-r ${feature.gradient} rounded-3xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity`}
                />
                <div className="relative space-y-6 p-8">
                  <motion.div
                    animate={isInView ? { 
                      rotate: [0, 5, -5, 0],
                      scale: [1, 1.05, 1]
                    } : {}}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity, 
                      ease: "easeInOut",
                      delay: index * 0.3
                    }}
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-foreground/70 text-lg leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
