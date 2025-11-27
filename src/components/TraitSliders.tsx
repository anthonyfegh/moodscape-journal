import { Slider } from "@/components/ui/slider";

export interface Traits {
  calm: number;
  open: number;
  confident: number;
  emotional: number;
}

interface TraitSlidersProps {
  traits: Traits;
}

export const TraitSliders = ({ traits }: TraitSlidersProps) => {
  const traitLabels = [
    { key: "calm", left: "Calm", right: "Turbulent" },
    { key: "open", left: "Open", right: "Guarded" },
    { key: "confident", left: "Confident", right: "Doubtful" },
    { key: "emotional", left: "Emotional", right: "Rational" },
  ];

  return (
    <div className="px-6 space-y-4">
      {traitLabels.map(({ key, left, right }) => (
        <div key={key} className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{left}</span>
            <span>{right}</span>
          </div>
          <Slider
            value={[traits[key as keyof Traits]]}
            max={100}
            step={1}
            disabled
            className="transition-all duration-300"
          />
        </div>
      ))}
    </div>
  );
};
