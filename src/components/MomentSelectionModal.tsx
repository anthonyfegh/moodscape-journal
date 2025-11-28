import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock } from "lucide-react";

interface LogEntry {
  id: string;
  text: string;
  emotion: string;
  color: string;
  timestamp: Date;
}

interface MomentSelectionModalProps {
  open: boolean;
  onClose: () => void;
  moments: LogEntry[];
  onSelectMoment: (moment: LogEntry) => void;
}

export const MomentSelectionModal = ({
  open,
  onClose,
  moments,
  onSelectMoment,
}: MomentSelectionModalProps) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card/95 backdrop-blur-xl border-border/30 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Select a Moment to Reflect On</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[400px] pr-4">
          <div className="space-y-3">
            {moments.map((moment) => (
              <button
                key={moment.id}
                onClick={() => {
                  onSelectMoment(moment);
                  onClose();
                }}
                className="w-full text-left p-3 rounded-lg bg-background/40 hover:bg-background/60 border border-border/20 transition-all group"
              >
                <div
                  className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
                  style={{ backgroundColor: moment.color }}
                />
                <div className="ml-3">
                  <div className="flex items-center gap-2 mb-1 text-xs text-muted-foreground">
                    <span className="capitalize font-medium">{moment.emotion}</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatTime(moment.timestamp)}</span>
                    </div>
                  </div>
                  <p className="text-sm text-foreground line-clamp-2 group-hover:line-clamp-none transition-all">
                    {moment.text}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};