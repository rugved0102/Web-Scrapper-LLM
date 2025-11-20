import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface ChangeAlert {
  id: string;
  user_id: string;
  snapshot_id: string;
  recipient_email: string;
  subject: string;
  message: string;
  changes_summary: any;
}

serve(async (req) => {
  try {
    // Only allow POST requests
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get pending alerts
    const { data: pendingAlerts, error: fetchError } = await supabase
      .from("change_alerts")
      .select("*")
      .eq("status", "pending")
      .eq("alert_type", "email")
      .limit(50); // Process 50 at a time

    if (fetchError) {
      console.error("Error fetching alerts:", fetchError);
      throw fetchError;
    }

    if (!pendingAlerts || pendingAlerts.length === 0) {
      return new Response(
        JSON.stringify({ message: "No pending alerts", count: 0 }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing ${pendingAlerts.length} pending alerts`);

    const results = [];

    // Process each alert
    for (const alert of pendingAlerts as ChangeAlert[]) {
      try {
        // Check if Resend API key is configured
        if (!RESEND_API_KEY) {
          console.error("RESEND_API_KEY not configured");
          await supabase
            .from("change_alerts")
            .update({
              status: "failed",
              error_message: "Email service not configured",
            })
            .eq("id", alert.id);
          continue;
        }

        // Generate HTML email
        const html = generateEmailHTML(alert);

        // Send email via Resend
        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "Web Scraper <notifications@yourdomain.com>", // Update with your domain
            to: [alert.recipient_email],
            subject: alert.subject,
            html: html,
          }),
        });

        const emailResult = await emailResponse.json();

        if (emailResponse.ok) {
          // Mark as sent
          await supabase
            .from("change_alerts")
            .update({
              status: "sent",
              sent_at: new Date().toISOString(),
            })
            .eq("id", alert.id);

          results.push({ alert_id: alert.id, status: "sent", email_id: emailResult.id });
          console.log(`Alert ${alert.id} sent successfully`);
        } else {
          // Mark as failed
          await supabase
            .from("change_alerts")
            .update({
              status: "failed",
              error_message: JSON.stringify(emailResult),
              retry_count: alert.retry_count + 1,
            })
            .eq("id", alert.id);

          results.push({ alert_id: alert.id, status: "failed", error: emailResult });
          console.error(`Failed to send alert ${alert.id}:`, emailResult);
        }
      } catch (error) {
        console.error(`Error processing alert ${alert.id}:`, error);
        
        // Update error status
        await supabase
          .from("change_alerts")
          .update({
            status: "failed",
            error_message: error.message,
            retry_count: alert.retry_count + 1,
          })
          .eq("id", alert.id);

        results.push({ alert_id: alert.id, status: "failed", error: error.message });
      }
    }

    return new Response(
      JSON.stringify({
        message: "Alerts processed",
        total: pendingAlerts.length,
        results,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Function error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

/**
 * Generate HTML email template
 */
function generateEmailHTML(alert: ChangeAlert): string {
  const { subject, message, changes_summary } = alert;
  
  const changes = changes_summary?.changes || [];
  const magnitude = changes_summary?.magnitude || "unknown";
  const similarity = changes_summary?.similarity || 0;

  // Color based on magnitude
  const magnitudeColors: Record<string, string> = {
    critical: "#dc2626",
    major: "#ea580c",
    moderate: "#ca8a04",
    minor: "#2563eb",
  };

  const magnitudeColor = magnitudeColors[magnitude] || "#6b7280";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px;">
                🔔 Change Detected
              </h1>
              <p style="margin: 10px 0 0 0; color: #e0e7ff; font-size: 14px;">
                Web Scraper Monitoring Alert
              </p>
            </td>
          </tr>

          <!-- Summary -->
          <tr>
            <td style="padding: 30px;">
              <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; border-left: 4px solid ${magnitudeColor};">
                <h2 style="margin: 0 0 10px 0; font-size: 18px; color: #111827;">
                  ${message}
                </h2>
                <p style="margin: 0; color: #6b7280; font-size: 14px;">
                  Severity: <strong style="color: ${magnitudeColor}; text-transform: capitalize;">${magnitude}</strong> | 
                  Similarity: <strong>${similarity.toFixed(1)}%</strong>
                </p>
              </div>
            </td>
          </tr>

          <!-- Changes List -->
          ${changes.length > 0 ? `
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <h3 style="margin: 0 0 15px 0; font-size: 16px; color: #111827;">
                Detected Changes (${changes.length})
              </h3>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${changes.slice(0, 10).map((change: any, idx: number) => `
                  <tr>
                    <td style="padding: 12px; background-color: ${idx % 2 === 0 ? '#f9fafb' : '#ffffff'}; border-radius: 4px;">
                      <div style="display: flex; align-items: flex-start; gap: 10px;">
                        <span style="display: inline-block; padding: 2px 8px; background-color: ${getSeverityColor(change.severity)}; color: white; border-radius: 4px; font-size: 11px; font-weight: bold; text-transform: uppercase;">
                          ${change.severity}
                        </span>
                        <div style="flex: 1;">
                          <p style="margin: 0; font-weight: 600; color: #111827; font-size: 14px;">
                            ${change.description}
                          </p>
                          <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 12px;">
                            Type: ${change.type}
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </table>
              ${changes.length > 10 ? `
                <p style="margin: 15px 0 0 0; color: #6b7280; font-size: 12px; text-align: center;">
                  + ${changes.length - 10} more changes
                </p>
              ` : ''}
            </td>
          </tr>
          ` : ''}

          <!-- Call to Action -->
          <tr>
            <td style="padding: 0 30px 30px 30px; text-align: center;">
              <a href="${SUPABASE_URL.replace('supabase.co', 'supabase.co')}" 
                 style="display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">
                View Full Comparison
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 30px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 12px; text-align: center;">
                You're receiving this because you have notifications enabled for change detection.
                <br>
                <a href="#" style="color: #667eea; text-decoration: none;">Manage Preferences</a> | 
                <a href="#" style="color: #667eea; text-decoration: none;">Unsubscribe</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Get color for severity badge
 */
function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'critical':
    case 'high':
      return '#dc2626';
    case 'medium':
      return '#ca8a04';
    case 'low':
      return '#2563eb';
    default:
      return '#6b7280';
  }
}
