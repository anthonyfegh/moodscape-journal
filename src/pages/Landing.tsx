import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { SharedNavigation } from "@/components/SharedNavigation";
import { LivingBackground } from "@/components/LivingBackground";
import { Button } from "@/components/ui/button";

const Landing = () => {
  return (
    <div className="min-h-screen w-full">
      <LivingBackground moodColor="#FFD966" isTyping={false} />
      <SharedNavigation />

      <main className="pt-16 min-h-screen flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl w-full backdrop-blur-2xl bg-background/20 border border-border/10 rounded-3xl shadow-lg p-12 text-center"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-foreground/90 mb-6">MoodScape</h1>

          <p className="text-xl md:text-2xl text-foreground/70 mb-4 leading-relaxed">
            A journal that doesn't just store your thoughts — it feels them with you.
          </p>

          <p className="text-base md:text-lg text-foreground/60 mb-12 max-w-2xl mx-auto">
            As you write, Yuri / Riyu responds in real time — colors shift, the page breathes, and your emotional
            patterns become visible. The more you log the more your AI gets personal.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button
              asChild
              size="lg"
              className="bg-primary/20 hover:bg-primary/30 text-foreground border border-primary/30 shadow-[0_0_20px_rgba(var(--primary),0.15)] hover:shadow-[0_0_30px_rgba(var(--primary),0.25)] transition-all text-lg px-8 py-6 rounded-2xl"
            >
              <Link to="/journals">Start journaling</Link>
            </Button>

            <Button
              asChild
              variant="ghost"
              size="lg"
              className="text-foreground/80 hover:text-foreground hover:bg-background/20 border border-border/20 text-lg px-8 py-6 rounded-2xl"
            >
              <Link to="/login">Log in</Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="backdrop-blur-xl bg-background/10 border border-border/10 rounded-2xl p-6 text-left"
            >
              <h3 className="text-lg font-semibold text-foreground/90 mb-3">Alive while you write</h3>
              <p className="text-foreground/60 text-sm leading-relaxed">
                The page responds to your emotions in real time — colors, motion, and subtle reactions as you type.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="backdrop-blur-xl bg-background/10 border border-border/10 rounded-2xl p-6 text-left"
            >
              <h3 className="text-lg font-semibold text-foreground/90 mb-3">Emotionally aware, not judgmental</h3>
              <p className="text-foreground/60 text-sm leading-relaxed">
                MoodScape notices patterns, repetition, and shifts in tone — and reflects them back without labels or
                scores.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="backdrop-blur-xl bg-background/10 border border-border/10 rounded-2xl p-6 text-left"
            >
              <h3 className="text-lg font-semibold text-foreground/90 mb-3">Built to grow with you</h3>
              <p className="text-foreground/60 text-sm leading-relaxed">
                Over time, your journal becomes a living mirror of your inner world, evolving with your story.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Landing;
