import { useEffect, useState } from "react";

interface MicroCommentsProps {
  comments: string[];
}

export const MicroComments = ({ comments }: MicroCommentsProps) => {
  const [visibleComment, setVisibleComment] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (comments.length === 0) return;

    const latestComment = comments[comments.length - 1];
    setVisibleComment(latestComment);
    setIsAnimating(true);

    const timeout = setTimeout(() => {
      setIsAnimating(false);
    }, 4000);

    return () => clearTimeout(timeout);
  }, [comments]);

  if (!visibleComment) return null;

  return (
    <div className="absolute top-4 right-4 max-w-xs">
      <div
        className={`
          bg-card/90 backdrop-blur-sm border border-primary/20 rounded-lg p-3 shadow-lg
          transition-all duration-300 ease-in-out
          ${isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
        `}
      >
        <p className="text-sm text-card-foreground italic">"{visibleComment}"</p>
      </div>
    </div>
  );
};
