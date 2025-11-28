import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { journalStorage } from "@/lib/journalStorage";

interface DailyLogWeeklyProps {
  journalId: string;
  onLogToday: () => void;
}

export const DailyLogWeekly = ({ journalId, onLogToday }: DailyLogWeeklyProps) => {
  const [weekDays, setWeekDays] = useState<Array<{ date: Date; logged: boolean }>>([]);
  const [todayLogged, setTodayLogged] = useState(false);
  const [journalName, setJournalName] = useState("");

  useEffect(() => {
    const loadWeeklyData = async () => {
      // Get journal name
      const journal = await journalStorage.getJournal(journalId);
      if (journal) {
        setJournalName(journal.name);
      }

      // Get current week (Monday to Sunday)
      const today = new Date();
      const currentDay = today.getDay();
      const monday = new Date(today);
      monday.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1));

      const week: Array<{ date: Date; logged: boolean }> = [];

      // Get all moments for this journal
      const subJournals = await journalStorage.getSubJournals(journalId);
      const allMomentsPromises = subJournals.map((sj) => journalStorage.getMoments(sj.id));
      const allMomentsArrays = await Promise.all(allMomentsPromises);
      const allMoments = allMomentsArrays.flat();

      for (let i = 0; i < 7; i++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);

        // Check if there's a log for this date
        const dateStr = date.toISOString().split("T")[0];
        const hasLog = allMoments.some((moment) => {
          const momentDate = new Date(moment.timestamp).toISOString().split("T")[0];
          return momentDate === dateStr;
        });

        week.push({ date, logged: hasLog });
      }

      setWeekDays(week);

      // Check if today is logged
      const todayStr = today.toISOString().split("T")[0];
      const isTodayLogged = allMoments.some((moment) => {
        const momentDate = new Date(moment.timestamp).toISOString().split("T")[0];
        return momentDate === todayStr;
      });
      setTodayLogged(isTodayLogged);
    };

    loadWeeklyData();
  }, [journalId]);

  const getDayName = (date: Date) => {
    return date.toLocaleDateString("en-US", { weekday: "short" });
  };

  const getDayNumber = (date: Date) => {
    return date.getDate();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toISOString().split("T")[0] === today.toISOString().split("T")[0];
  };

  return (
    <Card className="p-6 bg-background/60 backdrop-blur-md border-border/10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Daily Tracking</h3>
        </div>
        {todayLogged && (
          <div className="flex items-center gap-2 text-sm text-primary">
            <CheckCircle2 className="h-4 w-4" />
            <span>Logged today</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-7 gap-2 mb-4">
        {weekDays.map((day, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.05 }}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              isToday(day.date) ? "bg-primary/20 border-2 border-primary" : "bg-background/40 border border-border/20"
            }`}
          >
            <span className="text-xs font-medium text-muted-foreground mb-1">{getDayName(day.date)}</span>
            <span className="text-sm font-semibold text-foreground mb-1">{getDayNumber(day.date)}</span>
            {day.logged ? (
              <CheckCircle2 className="h-4 w-4 text-primary" />
            ) : (
              <Circle className="h-4 w-4 text-muted-foreground/30" />
            )}
          </motion.div>
        ))}
      </div>

      <Button onClick={onLogToday} className="w-full" variant={todayLogged ? "outline" : "default"}>
        {todayLogged ? "Continue Today's Log" : "Log Today"}
      </Button>
    </Card>
  );
};
