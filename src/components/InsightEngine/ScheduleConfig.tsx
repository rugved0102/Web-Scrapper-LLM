import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarIcon, Clock, Info } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ScheduleConfigProps {
  urls: string[];
  purpose: string;
  domain: string;
}

type Frequency = "daily" | "weekly" | "monthly";

export function ScheduleConfig({ urls, purpose, domain }: ScheduleConfigProps) {
  const [frequency, setFrequency] = useState<Frequency>("weekly");
  const [nextRun, setNextRun] = useState<Date>();
  const [enabled, setEnabled] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSchedule = async () => {
    if (!nextRun) {
      toast({
        title: "Date Required",
        description: "Please select a date for the first scheduled run.",
        variant: "destructive",
      });
      return;
    }

    if (urls.length === 0) {
      toast({
        title: "URLs Required",
        description: "Please enter at least one URL to analyze.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to schedule analyses.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await (supabase as any)
        .from("scheduled_tasks")
        .insert({
          user_id: user.id,
          urls,
          purpose,
          domain,
          frequency,
          next_run: nextRun.toISOString(),
          enabled,
        });

      if (error) throw error;

      toast({
        title: "Schedule Created",
        description: `Analysis will run ${frequency} starting ${format(nextRun, "PPP")}`,
      });

      // Reset form
      setNextRun(undefined);
      setFrequency("weekly");
      setEnabled(true);
    } catch (error) {
      console.error("Error scheduling task:", error);
      toast({
        title: "Scheduling Failed",
        description: error instanceof Error ? error.message : "Failed to create schedule",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getNextRunInfo = () => {
    if (!nextRun) return null;

    const frequencyInfo = {
      daily: "This analysis will run every day",
      weekly: "This analysis will run every week",
      monthly: "This analysis will run every month",
    };

    return frequencyInfo[frequency];
  };

  return (
    <Card className="mt-4 border-blue-200 bg-blue-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Schedule Recurring Analysis
        </CardTitle>
        <CardDescription>
          Automatically analyze these URLs on a regular schedule
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Frequency Selector */}
        <div className="space-y-2">
          <Label htmlFor="frequency">Frequency</Label>
          <Select value={frequency} onValueChange={(value) => setFrequency(value as Frequency)}>
            <SelectTrigger id="frequency">
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Next Run Date Picker */}
        <div className="space-y-2">
          <Label htmlFor="next-run">First Run Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="next-run"
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !nextRun && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {nextRun ? format(nextRun, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={nextRun}
                onSelect={setNextRun}
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Info Box */}
        {nextRun && (
          <div className="flex items-start gap-2 rounded-lg border border-blue-300 bg-blue-100 p-3 text-sm">
            <Info className="h-4 w-4 mt-0.5 text-blue-600 flex-shrink-0" />
            <div className="space-y-1">
              <p className="font-medium text-blue-900">{getNextRunInfo()}</p>
              <p className="text-blue-700">
                First run: {format(nextRun, "PPP 'at' p")}
              </p>
              <p className="text-blue-600 text-xs">
                Analyzing {urls.length} URL{urls.length !== 1 ? "s" : ""} with purpose: "{purpose}"
              </p>
            </div>
          </div>
        )}

        {/* Enable/Disable Toggle */}
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div className="space-y-0.5">
            <Label htmlFor="enabled" className="text-base">
              Enable Schedule
            </Label>
            <p className="text-sm text-muted-foreground">
              You can pause this schedule at any time
            </p>
          </div>
          <Switch
            id="enabled"
            checked={enabled}
            onCheckedChange={setEnabled}
          />
        </div>

        {/* Submit Button */}
        <Button 
          onClick={handleSchedule} 
          disabled={isSubmitting || !nextRun}
          className="w-full"
        >
          {isSubmitting ? "Creating Schedule..." : "Create Schedule"}
        </Button>
      </CardContent>
    </Card>
  );
}
