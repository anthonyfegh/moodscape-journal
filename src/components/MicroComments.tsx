import { useEffect, useState } from "react";

interface MicroCommentsProps {
  comments: string[];
  isTyping: boolean;
}

export const MicroComments = ({ comments, isTyping }: MicroCommentsProps) => {
  const [visibleComment, setVisibleComment] = useState<string | null>(null);
  const [shouldShow, setShouldShow] = useState(false);
  const [typedText, setTypedText] = useState("");

  useEffect(() => {
    if (comments.length === 0) return;

    const latestComment = comments[comments.length - 1];
    setVisibleComment(latestComment);
    setShouldShow(true);
    setTypedText(""); // Reset typed text for new comment
  }, [comments]);

  // Typewriter effect
  useEffect(() => {
    if (!visibleComment || !shouldShow || isTyping) return;

    let currentIndex = 0;
    const typeInterval = setInterval(() => {
      if (currentIndex <= visibleComment.length) {
        setTypedText(visibleComment.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typeInterval);
      }
    }, 50); // 50ms per character

    return () => clearInterval(typeInterval);
  }, [visibleComment, shouldShow, isTyping]);

  // Hide when typing starts
  useEffect(() => {
    if (isTyping) {
      setShouldShow(false);
    } else {
      // Show after user stops typing
      const timeout = setTimeout(() => {
        if (visibleComment) {
          setShouldShow(true);
        }
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [isTyping, visibleComment]);

  if (!visibleComment || !shouldShow) return null;

  return (
    <div className="absolute top-2 left-2 pointer-events-none z-10">
      <div
        className="transition-all duration-500 ease-out"
        style={{
          opacity: shouldShow && !isTyping ? 1 : 0,
          transform: shouldShow && !isTyping ? 'translateY(0)' : 'translateY(-10px)',
        }}
      >
        <p className="text-lg text-muted-foreground/40 italic">"{typedText}"</p>
      </div>
    </div>
  );
};
