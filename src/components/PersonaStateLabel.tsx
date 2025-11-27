interface PersonaStateLabelProps {
  state: string;
}

export const PersonaStateLabel = ({ state }: PersonaStateLabelProps) => {
  return (
    <div className="px-6 pb-4">
      <div className="text-center">
        <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium transition-all duration-300">
          {state}
        </span>
      </div>
    </div>
  );
};
