import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BeingCanvas } from '@/components/being/BeingCanvas';
import { 
  BeingState, 
  ExperienceVector, 
  createInitialState, 
  updateBeingState, 
  getRenderState 
} from '@/consciousness';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';
import { 
  Brain, 
  Sparkles, 
  Zap, 
  Heart, 
  Lightbulb, 
  Link2, 
  Activity,
  Home,
  RotateCcw,
  AlertCircle,
  Smile,
  Frown
} from 'lucide-react';

export default function BeingDemo() {
  const navigate = useNavigate();
  const [beingState, setBeingState] = useState<BeingState>(createInitialState());
  const [autoMode, setAutoMode] = useState(false);

  // Apply experience to the being
  const applyExperience = (experience: ExperienceVector) => {
    setBeingState(prev => updateBeingState(prev, experience));
  };

  // Auto-evolve mode: random experiences every 2 seconds
  useEffect(() => {
    if (!autoMode) return;

    const interval = setInterval(() => {
      const randomExperience: ExperienceVector = {
        novelty: Math.random() * 0.5,
        mood: (Math.random() - 0.5) * 2,
        stress: Math.random() * 0.3,
        reflection: Math.random() * 0.4,
        conflict: Math.random() * 0.2,
        vulnerability: Math.random() * 0.3,
        consistency: Math.random() * 0.5,
      };
      applyExperience(randomExperience);
    }, 2000);

    return () => clearInterval(interval);
  }, [autoMode]);

  const renderState = getRenderState(beingState);

  // Predefined experience buttons
  const experiences = [
    {
      name: "Discovery",
      icon: Sparkles,
      experience: { novelty: 0.8, mood: 0.6, curiosity: 0.7 },
      color: "bg-yellow-500/20 hover:bg-yellow-500/30 border-yellow-500/50"
    },
    {
      name: "Stress",
      icon: Zap,
      experience: { stress: 0.9, conflict: 0.7, mood: -0.4 },
      color: "bg-red-500/20 hover:bg-red-500/30 border-red-500/50"
    },
    {
      name: "Reflection",
      icon: Brain,
      experience: { reflection: 0.8, consistency: 0.6, stress: -0.3 },
      color: "bg-blue-500/20 hover:bg-blue-500/30 border-blue-500/50"
    },
    {
      name: "Connection",
      icon: Heart,
      experience: { vulnerability: 0.7, consistency: 0.8, mood: 0.5 },
      color: "bg-pink-500/20 hover:bg-pink-500/30 border-pink-500/50"
    },
    {
      name: "Curiosity",
      icon: Lightbulb,
      experience: { novelty: 0.7, reflection: 0.4 },
      color: "bg-purple-500/20 hover:bg-purple-500/30 border-purple-500/50"
    },
    {
      name: "Conflict",
      icon: AlertCircle,
      experience: { conflict: 0.8, stress: 0.6, mood: -0.6 },
      color: "bg-orange-500/20 hover:bg-orange-500/30 border-orange-500/50"
    },
  ];

  // State value display component
  const StateValue = ({ label, value, icon: Icon, color }: any) => (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="w-3 h-3" />
        <span>{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${color}`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.abs(value) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <span className="text-xs font-mono w-12 text-right">
          {value.toFixed(2)}
        </span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border/40 bg-background/50 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="gap-2"
              >
                <Home className="w-4 h-4" />
                Home
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <h1 className="text-2xl font-semibold font-serif">
                Conscious Being Engine
              </h1>
              <Badge variant="secondary" className="ml-2">Demo v1.0</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={autoMode ? "default" : "outline"}
                size="sm"
                onClick={() => setAutoMode(!autoMode)}
                className="gap-2"
              >
                <Activity className="w-4 h-4" />
                {autoMode ? "Auto Mode On" : "Auto Mode Off"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBeingState(createInitialState())}
                className="gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-[1fr,400px] gap-8">
          {/* Left: Being Visualization */}
          <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold mb-2">Visual Consciousness</h2>
                <p className="text-sm text-muted-foreground">
                  Watch the being respond to experiences in real-time. Colors, motion, and form express internal state.
                </p>
              </div>
              
              <div className="aspect-square w-full bg-background/50 rounded-lg overflow-hidden">
                <BeingCanvas renderState={renderState} enableControls={true} />
              </div>

              {/* Render State Display */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Core Radius</div>
                  <div className="text-sm font-mono">{renderState.coreRadius.toFixed(2)}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Color Hue</div>
                  <div className="text-sm font-mono">{renderState.colorHue.toFixed(0)}°</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Glow</div>
                  <div className="text-sm font-mono">{renderState.glow.toFixed(2)}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Entropy</div>
                  <div className="text-sm font-mono">{renderState.entropyLevel.toFixed(2)}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Particles</div>
                  <div className="text-sm font-mono">{renderState.particleActivity.toFixed(2)}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Connections</div>
                  <div className="text-sm font-mono">{renderState.connectionDensity.toFixed(2)}</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Right: Controls */}
          <div className="space-y-6">
            {/* Internal State */}
            <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
              <h2 className="text-lg font-semibold mb-4">Internal State</h2>
              <div className="space-y-4">
                <StateValue
                  label="Knowledge (K)"
                  value={beingState.K}
                  icon={Brain}
                  color="bg-blue-500"
                />
                <StateValue
                  label="Valence (V)"
                  value={beingState.V}
                  icon={beingState.V >= 0 ? Smile : Frown}
                  color={beingState.V >= 0 ? "bg-green-500" : "bg-red-500"}
                />
                <StateValue
                  label="Arousal (A)"
                  value={beingState.A}
                  icon={Zap}
                  color="bg-yellow-500"
                />
                <StateValue
                  label="Entropy (H)"
                  value={beingState.H}
                  icon={AlertCircle}
                  color="bg-orange-500"
                />
                <StateValue
                  label="Integration (I)"
                  value={beingState.I}
                  icon={Activity}
                  color="bg-purple-500"
                />
                <StateValue
                  label="Curiosity (C)"
                  value={beingState.C}
                  icon={Lightbulb}
                  color="bg-pink-500"
                />
                <StateValue
                  label="Attachment (U)"
                  value={beingState.U}
                  icon={Link2}
                  color="bg-teal-500"
                />
              </div>
            </Card>

            {/* Experience Controls */}
            <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
              <h2 className="text-lg font-semibold mb-4">Apply Experience</h2>
              <div className="grid grid-cols-2 gap-3">
                {experiences.map((exp) => (
                  <Button
                    key={exp.name}
                    variant="outline"
                    className={`flex flex-col items-center gap-2 h-auto py-4 ${exp.color}`}
                    onClick={() => applyExperience(exp.experience)}
                  >
                    <exp.icon className="w-5 h-5" />
                    <span className="text-xs">{exp.name}</span>
                  </Button>
                ))}
              </div>
            </Card>

            {/* Custom Experience */}
            <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
              <h2 className="text-lg font-semibold mb-4">Custom Experience</h2>
              <div className="space-y-4">
                {[
                  { key: 'novelty', label: 'Novelty', range: [0, 1] },
                  { key: 'mood', label: 'Mood', range: [-1, 1] },
                  { key: 'stress', label: 'Stress', range: [0, 1] },
                  { key: 'reflection', label: 'Reflection', range: [0, 1] },
                ].map(({ key, label, range }) => (
                  <div key={key} className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-mono">{range[0]} - {range[1]}</span>
                    </div>
                    <Slider
                      min={range[0]}
                      max={range[1]}
                      step={0.1}
                      defaultValue={[0]}
                      onValueChange={(value) => {
                        applyExperience({ [key]: value[0] });
                      }}
                    />
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Info Panel */}
        <Card className="mt-8 p-6 bg-card/50 backdrop-blur-sm border-border/50">
          <h2 className="text-lg font-semibold mb-3">About the Conscious Being Engine</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            This is a modular mathematical system representing the internal state, growth, emotional patterns, 
            and visual expression of Telos's evolving AI being. The engine accepts user experiences, updates 
            internal state deterministically, applies self-regulation behaviors, and outputs normalized values 
            for rendering. Try different experiences and watch how the being's consciousness evolves over time.
          </p>
        </Card>
      </div>
    </div>
  );
}
