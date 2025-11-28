import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { SharedNavigation } from "@/components/SharedNavigation";
import { LivingBackground } from "@/components/LivingBackground";
import { Button } from "@/components/ui/button";
import { StorySlide } from "@/components/pitch/StorySlide";
import { ProblemSlide } from "@/components/pitch/ProblemSlide";
import { SolutionSlide } from "@/components/pitch/SolutionSlide";
import { FeaturesSlide } from "@/components/pitch/FeaturesSlide";
import { TechSlide } from "@/components/pitch/TechSlide";
import { CompetitorSlide } from "@/components/pitch/CompetitorSlide";
import { ValueSlide } from "@/components/pitch/ValueSlide";
import { BusinessSlide } from "@/components/pitch/BusinessSlide";
import { Sparkles, Heart, Leaf } from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen w-full">
      <LivingBackground moodColor="#FFD966" isTyping={false} />
      <SharedNavigation />

      <main className="pt-16 min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
        {/* Floating Gradient Orbs */}
        <motion.div
          className="absolute top-20 left-10 w-96 h-96 rounded-full blur-3xl opacity-30"
          style={{
            background: "linear-gradient(135deg, hsl(280, 100%, 70%), hsl(340, 100%, 70%))",
          }}
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-40 right-20 w-80 h-80 rounded-full blur-3xl opacity-25"
          style={{
            background: "linear-gradient(135deg, hsl(200, 100%, 60%), hsl(180, 100%, 70%))",
          }}
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -40, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-40 left-1/4 w-72 h-72 rounded-full blur-3xl opacity-20"
          style={{
            background: "linear-gradient(135deg, hsl(30, 100%, 65%), hsl(50, 100%, 70%))",
          }}
          animate={{
            scale: [1, 1.4, 1],
            x: [0, 20, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Hero Content */}
        <div className="max-w-6xl w-full text-center relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-7xl md:text-8xl lg:text-9xl font-bold mb-8 bg-gradient-to-br from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent font-cormorant"
            style={{
              textShadow: "0 0 40px rgba(255, 255, 255, 0.1)",
            }}
          >
            Telos
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-3xl md:text-4xl lg:text-5xl text-foreground/80 mb-6 leading-tight font-light max-w-4xl mx-auto"
          >
            A journal that doesn't just store your thoughts — it{" "}
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent font-medium">
              feels them with you
            </span>
            .
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="text-xl md:text-2xl text-foreground/60 mb-16 max-w-3xl mx-auto leading-relaxed"
          >
            As you write, Yuri responds in real time — colors shift, the page breathes, and your emotional patterns
            become visible. The more you log the more your AI gets personal.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col sm:flex-row gap-6 justify-center mb-24"
          >
            <Button
              asChild
              size="lg"
              className="relative overflow-hidden group text-lg px-10 py-7 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/30 hover:from-primary/40 hover:to-accent/40 text-foreground border border-primary/30 shadow-[0_0_30px_rgba(var(--primary-rgb),0.2)] hover:shadow-[0_0_50px_rgba(var(--primary-rgb),0.35)] transition-all duration-300 hover:scale-105"
            >
              <Link to="/journals">Start journaling</Link>
            </Button>

            <Button
              asChild
              variant="ghost"
              size="lg"
              className="text-lg px-10 py-7 rounded-2xl text-foreground/80 hover:text-foreground hover:bg-background/30 backdrop-blur-sm border border-border/30 hover:border-border/50 transition-all duration-300 hover:scale-105"
            >
              <Link to="/login">Log in</Link>
            </Button>
          </motion.div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-12 mb-24">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="group text-center hover:scale-105 transition-all duration-500"
            >
              <motion.div
                className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur-xl"
                whileHover={{ rotate: 5, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Sparkles className="w-10 h-10 text-primary" />
              </motion.div>
              <h3 className="text-2xl font-semibold text-foreground/90 mb-4">Alive while you write</h3>
              <p className="text-foreground/60 text-base leading-relaxed">
                The page responds to your emotions in real time — colors, motion, and subtle reactions as you type.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="group text-center hover:scale-105 transition-all duration-500"
            >
              <motion.div
                className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br from-accent/20 to-secondary/20 backdrop-blur-xl"
                whileHover={{ rotate: -5, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Heart className="w-10 h-10 text-accent" />
              </motion.div>
              <h3 className="text-2xl font-semibold text-foreground/90 mb-4">Emotionally aware, not judgmental</h3>
              <p className="text-foreground/60 text-base leading-relaxed">
                Telos notices patterns, repetition, and shifts in tone — and reflects them back without labels or
                scores.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="group text-center hover:scale-105 transition-all duration-500"
            >
              <motion.div
                className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br from-secondary/20 to-primary/20 backdrop-blur-xl"
                whileHover={{ rotate: 5, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Leaf className="w-10 h-10 text-secondary" />
              </motion.div>
              <h3 className="text-2xl font-semibold text-foreground/90 mb-4">Built to grow with you</h3>
              <p className="text-foreground/60 text-base leading-relaxed">
                Over time, your journal becomes a living mirror of your inner world, evolving with your story.
              </p>
            </motion.div>
          </div>

          {/* Team Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-center"
          >
            <p className="text-sm text-foreground/40 mb-8 tracking-widest uppercase font-light">Built by</p>
            <div className="flex flex-wrap justify-center gap-x-12 gap-y-4">
              {["Kristina Verbova", "Anthony El Feghaly", "Katherine Orefice", "Rayan Yedaly", "Kevin León"].map(
                (name, index) => (
                  <motion.span
                    key={name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.6 + index * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="text-foreground/60 hover:text-foreground transition-all duration-300 text-lg font-light cursor-default hover:scale-110"
                    whileHover={{
                      textShadow: "0 0 20px rgba(255, 255, 255, 0.3)",
                    }}
                  >
                    {name}
                  </motion.span>
                ),
              )}
            </div>
          </motion.div>
        </div>

        {/* Scroll-driven pitch sections */}
        <StorySlide />
        <ProblemSlide />
        <SolutionSlide />
        <FeaturesSlide />
        <TechSlide />
        <CompetitorSlide />
        <ValueSlide />
        <BusinessSlide />
      </main>
    </div>
  );
};

export default Landing;
