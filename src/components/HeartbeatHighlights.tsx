import { motion } from "framer-motion";

interface HeartbeatHighlightsProps {
  text: string;
  wordFrequency: Map<string, number>;
  moodColor: string;
  threshold?: number;
}

export const HeartbeatHighlights = ({ text, wordFrequency, moodColor, threshold = 2 }: HeartbeatHighlightsProps) => {
  // Convert hex to rgba with low opacity
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const highlightColor = hexToRgba(moodColor, 0.9);

  // Split text into words while preserving spaces and newlines
  const renderTextWithHighlights = () => {
    if (!text) return null;

    const parts: JSX.Element[] = [];
    let currentIndex = 0;

    // Match words and capture surrounding whitespace
    const regex = /(\S+)|(\s+)/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      const token = match[0];
      const isWord = match[1]; // Matched a word (non-whitespace)

      if (isWord) {
        const word = token.toLowerCase();
        const frequency = wordFrequency.get(word) || 0;
        const isSignificant = frequency >= threshold;

        if (isSignificant) {
          parts.push(
            <motion.span
              key={`word-${currentIndex}`}
              animate={{
                textShadow: [
                  `0 0 0px ${highlightColor}`,
                  `0 0 8px ${highlightColor}, 0 0 12px ${highlightColor}`,
                  `0 0 0px ${highlightColor}`,
                ],
                opacity: [1, 1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                color: "inherit",
              }}
            >
              {token}
            </motion.span>,
          );
        } else {
          parts.push(<span key={`word-${currentIndex}`}>{token}</span>);
        }
      } else {
        // Whitespace (spaces, newlines, tabs)
        parts.push(<span key={`space-${currentIndex}`}>{token}</span>);
      }

      currentIndex++;
    }

    return parts;
  };

  return (
    <div
      className="pointer-events-none absolute inset-0 p-2 text-lg leading-relaxed text-foreground whitespace-pre-wrap"
      style={{ lineHeight: "32px" }}
    >
      {renderTextWithHighlights()}
    </div>
  );
};
