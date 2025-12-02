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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

  // Auto-evolve mode
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

  // State slider config
  const stateSliders = [
    { key: 'K' as const, label: 'Knowledge', icon: Brain, min: 0, max: 1 },
    { key: 'V' as const, label: 'Valence', icon: beingState.V >= 0 ? Smile : Frown, min: -1, max: 1 },
    { key: 'A' as const, label: 'Arousal', icon: Zap, min: 0, max: 1 },
    { key: 'H' as const, label: 'Entropy', icon: AlertCircle, min: 0, max: 1 },
    { key: 'I' as const, label: 'Integration', icon: Activity, min: 0, max: 1 },
    { key: 'C' as const, label: 'Curiosity', icon: Lightbulb, min: 0, max: 1 },
    { key: 'U' as const, label: 'Attachment', icon: Link2, min: 0, max: 1 },
  ];

  // Experience sliders
  const experienceSliders = [
    { key: 'novelty', label: 'Novelty', min: 0, max: 1 },
    { key: 'mood', label: 'Mood', min: -1, max: 1 },
    { key: 'stress', label: 'Stress', min: 0, max: 1 },
    { key: 'reflection', label: 'Reflection', min: 0, max: 1 },
    { key: 'conflict', label: 'Conflict', min: 0, max: 1 },
    { key: 'vulnerability', label: 'Vulnerability', min: 0, max: 1 },
    { key: 'consistency', label: 'Consistency', min: 0, max: 1 },
  ];

  // Predefined experiences
  const experiences = [
    { name: "Discovery", icon: Sparkles, experience: { novelty: 0.8, mood: 0.6 }, color: "bg-yellow-500/20 hover:bg-yellow-500/30 border-yellow-500/50" },
    { name: "Stress", icon: Zap, experience: { stress: 0.9, conflict: 0.7, mood: -0.4 }, color: "bg-red-500/20 hover:bg-red-500/30 border-red-500/50" },
    { name: "Reflection", icon: Brain, experience: { reflection: 0.8, consistency: 0.6 }, color: "bg-blue-500/20 hover:bg-blue-500/30 border-blue-500/50" },
    { name: "Connection", icon: Heart, experience: { vulnerability: 0.7, consistency: 0.8, mood: 0.5 }, color: "bg-pink-500/20 hover:bg-pink-500/30 border-pink-500/50" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border/40 bg-background/50 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="gap-2">
                <Home className="w-4 h-4" />
                Home
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <h1 className="text-2xl font-semibold font-serif">Conscious Being Engine</h1>
              <Badge variant="secondary">Demo v1.0</Badge>
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
              <Button variant="outline" size="sm" onClick={() => setBeingState(createInitialState())} className="gap-2">
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-6">
        <div className="grid lg:grid-cols-[1fr,380px] gap-6">
          {/* Left: Being Visualization */}
          <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50">
            <div className="space-y-4">
              <div className="aspect-[4/3] w-full rounded-lg overflow-hidden bg-[#050508]">
                <BeingCanvas renderState={renderState} enableControls={true} />
              </div>

              {/* Render State Display */}
              <div className="grid grid-cols-6 gap-3 pt-3 border-t border-border/50">
                {[
                  { label: 'Radius', value: renderState.coreRadius },
                  { label: 'Hue', value: renderState.colorHue, suffix: '°' },
                  { label: 'Glow', value: renderState.glow },
                  { label: 'Entropy', value: renderState.entropyLevel },
                  { label: 'Particles', value: renderState.particleActivity },
                  { label: 'Connect', value: renderState.connectionDensity },
                ].map(({ label, value, suffix }) => (
                  <div key={label} className="text-center">
                    <div className="text-xs text-muted-foreground">{label}</div>
                    <div className="text-sm font-mono">{value.toFixed(2)}{suffix}</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Right: Controls */}
          <div className="space-y-4">
            <Tabs defaultValue="state" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="state">Internal State</TabsTrigger>
                <TabsTrigger value="experience">Experience</TabsTrigger>
              </TabsList>
              
              <TabsContent value="state" className="mt-4">
                <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50">
                  <div className="space-y-4">
                    {stateSliders.map(({ key, label, icon: Icon, min, max }) => (
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
                        />
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>
              
              <TabsContent value="experience" className="mt-4">
                <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50 space-y-4">
                  {/* Quick Experience Buttons */}
                  <div className="grid grid-cols-4 gap-2">
                    {experiences.map((exp) => (
                      <Button
                        key={exp.name}
                        variant="outline"
                        size="sm"
                        className={`flex flex-col items-center gap-1 h-auto py-2 ${exp.color}`}
                        onClick={() => applyExperience(exp.experience)}
                      >
                        <exp.icon className="w-4 h-4" />
                        <span className="text-[10px]">{exp.name}</span>
                      </Button>
                    ))}
                  </div>
                  
                  <Separator />
                  
                  {/* Experience Sliders */}
                  <div className="space-y-3">
                    {experienceSliders.map(({ key, label, min, max }) => (
                      <div key={key} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">{label}</span>
                          <span className="font-mono text-muted-foreground">{min} to {max}</span>
                        </div>
                        <Slider
                          min={min}
                          max={max}
                          step={0.1}
                          defaultValue={[0]}
                          onValueChange={(value) => applyExperience({ [key]: value[0] })}
                        />
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
