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

  useEffect(() => {
    // Get current week (Monday to Sunday)
    const today = new Date();
    const currentDay = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1));

    const week: Array<{ date: Date; logged: boolean }> = [];
    
    // Get all moments for this journal
    const subJournals = journalStorage.getSubJournals(journalId);
    const allMoments = subJournals.flatMap(sj => journalStorage.getMoments(sj.id));

    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      
      // Check if there's a log for this date
      const dateStr = date.toISOString().split('T')[0];
      const hasLog = allMoments.some(moment => {
        const momentDate = new Date(moment.timestamp).toISOString().split('T')[0];
        return momentDate === dateStr;
      });

      week.push({ date, logged: hasLog });
    }

    setWeekDays(week);

    // Check if today is logged
    const todayStr = today.toISOString().split('T')[0];
    const isTodayLogged = allMoments.some(moment => {
      const momentDate = new Date(moment.timestamp).toISOString().split('T')[0];
      return momentDate === todayStr;
    });
    setTodayLogged(isTodayLogged);
  }, [journalId]);

  const getDayName = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const getDayNumber = (date: Date) => {
    return date.getDate();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toISOString().split('T')[0] === today.toISOString().split('T')[0];
  };

  return (
    <Card className="p-6 bg-background/60 backdrop-blur-md border-border/10 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">This Week</h3>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-6">
        {weekDays.map((day, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.05 }}
            className={`flex flex-col items-center p-3 rounded-lg transition-colors ${
              isToday(day.date)
                ? 'bg-primary/20 border-2 border-primary'
                : 'bg-background/40 border border-border/20'
            }`}
          >
            <span className="text-xs font-medium text-muted-foreground mb-1">
              {getDayName(day.date)}
            </span>
            <span className="text-lg font-semibold text-foreground mb-2">
              {getDayNumber(day.date)}
            </span>
            {day.logged ? (
              <CheckCircle2 className="h-5 w-5 text-primary" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground/30" />
            )}
          </motion.div>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <Button
          onClick={onLogToday}
          className="flex-1"
          size="lg"
          variant={todayLogged ? "outline" : "default"}
        >
          {todayLogged ? "Continue Today's Log" : "Log Today"}
        </Button>
        {todayLogged && (
          <div className="flex items-center gap-2 text-sm text-primary">
            <CheckCircle2 className="h-4 w-4" />
            <span>Logged</span>
          </div>
        )}
      </div>
    </Card>
  );
};
