import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ScheduledTask {
  id: string;
  user_id: string;
  urls: string[];
  purpose: string;
  domain: string;
  frequency: "daily" | "weekly" | "monthly";
  next_run: string;
  enabled: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all enabled scheduled tasks that are due to run
    const now = new Date().toISOString();
    const { data: tasks, error: fetchError } = await supabase
      .from("scheduled_tasks")
      .select("*")
      .eq("enabled", true)
      .lte("next_run", now);

    if (fetchError) {
      throw fetchError;
    }

    if (!tasks || tasks.length === 0) {
      return new Response(
        JSON.stringify({ message: "No scheduled tasks to run", processed: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results = [];

    // Process each scheduled task
    for (const task of tasks as ScheduledTask[]) {
      try {
        // Call the analyze-websites function
        const analyzeResponse = await fetch(`${supabaseUrl}/functions/v1/analyze-websites`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({
            urls: task.urls,
            purpose: task.purpose,
            domain: task.domain,
            userId: task.user_id,
          }),
        });

        if (!analyzeResponse.ok) {
          throw new Error(`Analysis failed: ${analyzeResponse.statusText}`);
        }

        const analysisResult = await analyzeResponse.json();

        // Calculate next run time based on frequency
        const currentNextRun = new Date(task.next_run);
        let newNextRun: Date;

        switch (task.frequency) {
          case "daily":
            newNextRun = new Date(currentNextRun.getTime() + 24 * 60 * 60 * 1000);
            break;
          case "weekly":
            newNextRun = new Date(currentNextRun.getTime() + 7 * 24 * 60 * 60 * 1000);
            break;
          case "monthly":
            newNextRun = new Date(currentNextRun);
            newNextRun.setMonth(newNextRun.getMonth() + 1);
            break;
        }

        // Update the scheduled task with new next_run time
        const { error: updateError } = await supabase
          .from("scheduled_tasks")
          .update({ next_run: newNextRun.toISOString() })
          .eq("id", task.id);

        if (updateError) {
          console.error(`Failed to update task ${task.id}:`, updateError);
        }

        results.push({
          task_id: task.id,
          status: "success",
          analysis_id: analysisResult.historyId,
          next_run: newNextRun.toISOString(),
        });
      } catch (error) {
        console.error(`Error processing task ${task.id}:`, error);
        results.push({
          task_id: task.id,
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return new Response(
      JSON.stringify({
        message: "Scheduled tasks processed",
        processed: results.length,
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in scheduled-scraper:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
