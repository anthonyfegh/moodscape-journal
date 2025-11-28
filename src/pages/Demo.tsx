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
            <div className="space-y-8">
              <div className="backdrop-blur-2xl bg-background/20 border border-border/10 rounded-3xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-foreground/90 mb-4">
                  The problem
                </h2>
                <p className="text-foreground/70 leading-relaxed">
                  Traditional journaling apps are static — they store your words but don't understand them. 
                  They lack emotional awareness and fail to create a sense of presence or connection with your inner world.
                </p>
              </div>
              
              <div className="backdrop-blur-2xl bg-background/20 border border-border/10 rounded-3xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-foreground/90 mb-4">
                  Our insight
                </h2>
                <p className="text-foreground/70 leading-relaxed">
                  Journaling becomes more meaningful when the interface itself responds to your emotional state. 
                  By making the page "alive" and emotionally aware, we create a space that feels less like a tool 
                  and more like a companion in your self-reflection journey.
                </p>
              </div>
              
              <div className="backdrop-blur-2xl bg-background/20 border border-border/10 rounded-3xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-foreground/90 mb-4">
                  What you'll see in this demo
                </h2>
                <ul className="space-y-3 text-foreground/70">
                  <li className="flex items-start gap-2">
                    <span className="text-foreground/90 mt-1">•</span>
                    <span>A living background that responds to your emotional state while you write</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-foreground/90 mt-1">•</span>
                    <span>AI-powered reflections that understand context and emotional patterns</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-foreground/90 mt-1">•</span>
                    <span>Subtle visual cues that make the interface feel emotionally present</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-foreground/90 mt-1">•</span>
                    <span>A continuous writing surface that feels like natural paper, not separate cards</span>
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
                  Live journal demo
                </h2>
                <p className="text-foreground/60 mb-8 leading-relaxed">
                  Experience the emotional, alive journaling interface in action. 
                  Watch as the page responds to mood, provides gentle guidance, and creates 
                  a space that feels truly connected to your inner world.
                </p>
                
                <Button
                  asChild
                  size="lg"
                  className="bg-foreground/10 hover:bg-foreground/20 text-foreground border border-border/20 text-lg px-8 py-6"
                >
                  <Link to="/journal">Open journal experience</Link>
                </Button>
                
                <p className="text-sm text-foreground/50 mt-6">
                  No login required for demo
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
