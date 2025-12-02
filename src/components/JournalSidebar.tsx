import { Menu } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { motion } from "framer-motion";

interface LogEntry {
  id: string;
  text: string;
  emotion: string;
  color: string;
  timestamp: Date;
}

interface JournalSidebarProps {
  logEntries: LogEntry[];
  onMomentClick: (id: string) => void;
  onMomentHover?: (entry: LogEntry | null) => void;
}

export function JournalSidebar({ logEntries, onMomentClick, onMomentHover }: JournalSidebarProps) {
  const { open } = useSidebar();

  return (
    <Sidebar side="right" className={open ? "w-80" : "w-0"} collapsible="offcanvas">
      <SidebarTrigger className="m-2 self-start" />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-semibold">Past Moments</SidebarGroupLabel>

          <SidebarGroupContent>
            <div className="space-y-3 pr-2 overflow-y-auto max-h-[calc(100vh-8rem)]">
              {logEntries.map((entry) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className="p-3 rounded-lg cursor-pointer hover:opacity-90 transition-all duration-300 backdrop-blur-md"
                  style={{
                    border: `1px solid ${entry.color}40`,
                    background: `linear-gradient(135deg, rgba(255,255,255,0.1), ${entry.color}20)`,
                  }}
                  onClick={() => onMomentClick(entry.id)}
                  onMouseEnter={() => onMomentHover?.(entry)}
                  onMouseLeave={() => onMomentHover?.(null)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="text-xs font-medium capitalize px-2 py-1 rounded"
                      style={{
                        backgroundColor: entry.color,
                        color: "black",
                      }}
                    >
                      {entry.emotion}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {entry.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/80 line-clamp-3">{entry.text}</p>
                </motion.div>
              ))}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
