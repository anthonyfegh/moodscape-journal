import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface SummarizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: string;
  onInsert: () => void;
}

export const SummarizeModal = ({ isOpen, onClose, summary, onInsert }: SummarizeModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-background/20 backdrop-blur-2xl border border-border/20 rounded-2xl shadow-2xl">
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute -top-2 -right-2 p-2 rounded-full bg-background/30 backdrop-blur-sm hover:bg-background/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="space-y-6 p-6">
            <h3 className="text-xl font-medium text-foreground/90">Entry Summary</h3>
            
            <div className="prose prose-sm max-w-none">
              <p className="text-foreground/80 leading-relaxed italic">
                {summary}
              </p>
            </div>
            
            <div className="flex gap-3 justify-end pt-4">
              <Button
                variant="ghost"
                onClick={onClose}
                className="bg-background/20 hover:bg-background/30 backdrop-blur-sm"
              >
                Close
              </Button>
              <Button
                onClick={onInsert}
                className="bg-primary/80 hover:bg-primary backdrop-blur-sm"
              >
                Insert into Journal
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
