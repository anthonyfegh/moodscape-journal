import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { SharedNavigation } from "@/components/SharedNavigation";
import { LivingBackground } from "@/components/LivingBackground";
import { Button } from "@/components/ui/button";

const Demo = () => {
  return (
    <div className="min-h-screen w-full">
      <LivingBackground moodColor="#FFD966" isTyping={false} />
      <SharedNavigation />
      
      <main className="pt-16 min-h-screen px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid lg:grid-cols-2 gap-8 items-start"
          >
            {/* Left Column - Context */}
            <div className="space-y-6">
              <div className="backdrop-blur-2xl bg-background/20 border border-border/10 rounded-3xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-foreground/90 mb-4">
                  The problem
                </h2>
                <p className="text-foreground/70 leading-relaxed text-sm">
                  Journaling today is often lonely, static, and abandoned. Most tools react only after you're done writing, 
                  not while you're feeling. The moment you need support most — during emotional expression — is when 
                  traditional journals are silent.
                </p>
              </div>
              
              <div className="backdrop-blur-2xl bg-background/20 border border-border/10 rounded-3xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-foreground/90 mb-4">
                  Our insight
                </h2>
                <p className="text-foreground/70 leading-relaxed text-sm">
                  The most meaningful moment for support is during emotional expression, not after. What if the "page" 
                  itself felt present and alive? By making the interface respond in real time, we create a space that 
                  feels less like a tool and more like a companion.
                </p>
              </div>
              
              <div className="backdrop-blur-2xl bg-background/20 border border-border/10 rounded-3xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-foreground/90 mb-4">
                  What Telos does
                </h2>
                <ul className="space-y-3 text-foreground/70 text-sm">
                  <li className="flex items-start gap-3">
                    <span className="text-foreground/90 mt-0.5 text-base">•</span>
                    <span>The background and "sky" react to your mood in real time</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-foreground/90 mt-0.5 text-base">•</span>
                    <span>The journal surface feels like a single living sheet of paper</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-foreground/90 mt-0.5 text-base">•</span>
                    <span>An avatar listens, reacts, and guides you with gentle questions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-foreground/90 mt-0.5 text-base">•</span>
                    <span>AI reflections understand your emotional patterns across time</span>
                  </li>
                </ul>
              </div>
              
              <div className="backdrop-blur-2xl bg-background/20 border border-border/10 rounded-3xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-foreground/90 mb-4">
                  What you'll see in this demo
                </h2>
                <ul className="space-y-3 text-foreground/70 text-sm">
                  <li className="flex items-start gap-3">
                    <span className="text-foreground/90 mt-0.5 text-base">•</span>
                    <span>Colors and motion responding to your writing</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-foreground/90 mt-0.5 text-base">•</span>
                    <span>Subtle micro-reactions as you type</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-foreground/90 mt-0.5 text-base">•</span>
                    <span>A journal that feels more like a presence than a tool</span>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Right Column - CTA */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="lg:sticky lg:top-24"
            >
              <div className="backdrop-blur-2xl bg-background/20 border border-border/10 rounded-3xl shadow-lg p-12 text-center">
                <h2 className="text-3xl font-bold text-foreground/90 mb-4">
                  Live journal experience
                </h2>
                <p className="text-foreground/60 mb-6 leading-relaxed text-sm">
                  Ready to feel how the page responds to you in real time?
                </p>
                
                <Button
                  asChild
                  size="lg"
                  className="bg-primary/20 hover:bg-primary/30 text-foreground border border-primary/30 shadow-[0_0_20px_rgba(var(--primary),0.15)] hover:shadow-[0_0_30px_rgba(var(--primary),0.25)] transition-all text-lg px-8 py-6 rounded-2xl mb-6"
                >
                  <Link to="/journals">Open the live journal</Link>
                </Button>
                
                <p className="text-xs text-foreground/50">
                  Notice how the background shifts and the page reacts as you write.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Demo;
