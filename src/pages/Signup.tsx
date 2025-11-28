import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { SharedNavigation } from "@/components/SharedNavigation";
import { LivingBackground } from "@/components/LivingBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Signup = () => {
  return (
    <div className="min-h-screen w-full">
      <LivingBackground moodColor="#FFD966" isTyping={false} />
      <SharedNavigation />
      
      <main className="pt-16 min-h-screen flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full backdrop-blur-2xl bg-background/20 border border-border/10 rounded-3xl shadow-lg p-8"
        >
          <h1 className="text-3xl font-bold text-foreground/90 mb-2 text-center">
            Create your MoodScape account
          </h1>
          <p className="text-foreground/60 mb-8 text-center">
            Begin your journey of emotional discovery
          </p>
          
          <form className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground/80">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                className="bg-background/50 border-border/20 text-foreground placeholder:text-foreground/40"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground/80">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="bg-background/50 border-border/20 text-foreground placeholder:text-foreground/40"
              />
            </div>
            
            <Button
              type="submit"
              className="w-full bg-foreground/10 hover:bg-foreground/20 text-foreground border border-border/20"
            >
              Sign up
            </Button>
          </form>
          
          <p className="text-center text-foreground/60 mt-6">
            Already have an account?{" "}
            <Link 
              to="/login" 
              className="text-foreground/80 hover:text-foreground underline underline-offset-4"
            >
              Log in
            </Link>
          </p>
        </motion.div>
      </main>
    </div>
  );
};

export default Signup;
