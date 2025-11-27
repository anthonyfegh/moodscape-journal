interface MoodGradientProps {
  moodColor: string;
}

export const MoodGradient = ({ moodColor }: MoodGradientProps) => {
  return (
    <div className="px-6 pb-4">
      <div 
        className="h-20 rounded-lg transition-all duration-500 ease-in-out backdrop-blur-sm"
        style={{ 
          background: `linear-gradient(135deg, ${moodColor}40, ${moodColor}90)`,
        }}
      />
    </div>
  );
};
