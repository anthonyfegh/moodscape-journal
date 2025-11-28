import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Sparkles } from "lucide-react";

interface SummarizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: string;
  onInsert: () => void;
  moodColor?: string;
}

export const SummarizeModal = ({ isOpen, onClose, summary, onInsert, moodColor = "#fbbf24" }: SummarizeModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-3xl max-h-[85vh] overflow-y-auto bg-background/95 backdrop-blur-2xl rounded-2xl shadow-2xl border-2 fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] z-50"
        style={{ 
          borderColor: moodColor,
          boxShadow: `0 0 40px ${moodColor}40, 0 20px 60px rgba(0,0,0,0.3)`
        }}
      >
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute -top-3 -right-3 p-2 rounded-full backdrop-blur-sm transition-all hover:scale-110 z-10"
            style={{ 
              backgroundColor: `${moodColor}20`,
              border: `1px solid ${moodColor}40`
            }}
          >
            <X className="w-4 h-4" style={{ color: moodColor }} />
          </button>
          
          <div className="space-y-6 p-8">
            <div className="flex items-center gap-3 pb-4 border-b" style={{ borderColor: `${moodColor}30` }}>
              <div 
                className="p-2 rounded-lg"
                style={{ backgroundColor: `${moodColor}20` }}
              >
                <Sparkles className="w-5 h-5" style={{ color: moodColor }} />
              </div>
              <h3 className="text-2xl font-medium text-foreground">Journal Summary</h3>
            </div>
            
            <div 
              className="rounded-xl p-6 prose prose-sm max-w-none max-h-[50vh] overflow-y-auto"
              style={{ 
                backgroundColor: `${moodColor}10`,
                border: `1px solid ${moodColor}20`
              }}
            >
              <div 
                className="text-foreground/90 leading-relaxed whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ 
                  __html: summary.replace(/\*\*(.*?)\*\*/g, '<strong style="color: ' + moodColor + '">$1</strong>')
                }}
              />
            </div>
            
            <div className="flex gap-3 justify-end pt-2">
              <Button
                variant="ghost"
                onClick={onClose}
                className="backdrop-blur-sm hover:bg-background/40"
              >
                Close
              </Button>
              <Button
                onClick={onInsert}
                className="backdrop-blur-sm shadow-lg"
                style={{ 
                  backgroundColor: `${moodColor}90`,
                  color: '#ffffff'
                }}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Insert into Journal
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
