import { useState, useEffect } from 'react';
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

  // Direct state update
  const updateState = (key: keyof BeingState, value: number) => {
    setBeingState(prev => ({ ...prev, [key]: value }));
  };

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
      experience: { novelty: 0.8, mood: 0.6 },
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
      experience: { reflection: 0.8, consistency: 0.6 },
      color: "bg-blue-500/20 hover:bg-blue-500/30 border-blue-500/50"
    },
    {
      name: "Connection",
      icon: Heart,
      experience: { vulnerability: 0.7, consistency: 0.8, mood: 0.5 },
      color: "bg-pink-500/20 hover:bg-pink-500/30 border-pink-500/50"
    },
  ];

  // State slider config
  const stateSliders = [
    { key: 'K' as const, label: 'Knowledge', icon: Brain, min: 0, max: 1, color: 'bg-blue-500' },
    { key: 'V' as const, label: 'Valence', icon: beingState.V >= 0 ? Smile : Frown, min: -1, max: 1, color: beingState.V >= 0 ? 'bg-green-500' : 'bg-red-500' },
    { key: 'A' as const, label: 'Arousal', icon: Zap, min: 0, max: 1, color: 'bg-yellow-500' },
    { key: 'H' as const, label: 'Entropy', icon: AlertCircle, min: 0, max: 1, color: 'bg-orange-500' },
    { key: 'I' as const, label: 'Integration', icon: Activity, min: 0, max: 1, color: 'bg-purple-500' },
    { key: 'C' as const, label: 'Curiosity', icon: Lightbulb, min: 0, max: 1, color: 'bg-pink-500' },
    { key: 'U' as const, label: 'Attachment', icon: Link2, min: 0, max: 1, color: 'bg-teal-500' },
  ];

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
                {autoMode ? "Auto On" : "Auto Off"}
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
                  Adjust state variables directly or apply experiences to see the being evolve.
                </p>
              </div>
              
              {/* Dark background container for the Being */}
              <div className="aspect-square w-full rounded-lg overflow-hidden bg-[#0a0a0f]">
                <BeingCanvas renderState={renderState} enableControls={true} />
              </div>

              {/* Render State Display */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/50">
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
            {/* Internal State Sliders */}
            <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
              <h2 className="text-lg font-semibold mb-4">Internal State</h2>
              <div className="space-y-5">
                {stateSliders.map(({ key, label, icon: Icon, min, max, color }) => (
                  <div key={key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        <Icon className="w-4 h-4 text-muted-foreground" />
                        <span>{label} ({key})</span>
                      </div>
                      <span className="text-sm font-mono">{beingState[key].toFixed(2)}</span>
                    </div>
                    <Slider
                      min={min}
                      max={max}
                      step={0.01}
                      value={[beingState[key]]}
                      onValueChange={(value) => updateState(key, value[0])}
                      className="w-full"
                    />
                  </div>
                ))}
              </div>
            </Card>

            {/* Experience Buttons */}
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
          </div>
        </div>
      </div>
    </div>
  );
}
