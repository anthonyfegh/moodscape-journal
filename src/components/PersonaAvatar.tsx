import { useEffect, useState } from "react";
import personaImage from "@/assets/persona-avatar.png";

interface PersonaAvatarProps {
  moodColor: string;
}

export const PersonaAvatar = ({ moodColor }: PersonaAvatarProps) => {
  const [color, setColor] = useState(moodColor);

  useEffect(() => {
    setColor(moodColor);
  }, [moodColor]);

  return (
    <div className="flex justify-center p-6">
      <div 
        className="relative w-32 h-32 rounded-full overflow-hidden transition-all duration-500 ease-in-out"
        style={{ 
          boxShadow: `0 0 40px ${color}`,
          border: `3px solid ${color}`
        }}
      >
        <img 
          src={personaImage} 
          alt="Persona Avatar" 
          className="w-full h-full object-cover"
        />
        <div 
          className="absolute inset-0 mix-blend-overlay transition-colors duration-500"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
};
