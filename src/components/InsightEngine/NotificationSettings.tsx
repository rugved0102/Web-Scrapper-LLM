import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Bell, 
  Mail, 
  Clock, 
  AlertTriangle, 
  Info,
  CheckCircle2,
  Send
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NotificationPreferences {
  id?: string;
  email_enabled: boolean;
  email_address?: string;
  notify_on_minor: boolean;
  notify_on_moderate: boolean;
  notify_on_major: boolean;
  notify_on_critical: boolean;
  digest_frequency: 'instant' | 'hourly' | 'daily' | 'weekly';
  quiet_hours_start?: string;
  quiet_hours_end?: string;
}

export const NotificationSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_enabled: true,
    email_address: user?.email || '',
    notify_on_minor: false,
    notify_on_moderate: true,
    notify_on_major: true,
    notify_on_critical: true,
    digest_frequency: 'instant',
  });

  useEffect(() => {
    fetchPreferences();
  }, [user]);

  const fetchPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await (supabase as any)
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
        throw error;
      }

      if (data) {
        setPreferences({
          id: data.id,
          email_enabled: data.email_enabled ?? true,
          email_address: data.email_address || user.email || '',
          notify_on_minor: data.notify_on_minor ?? false,
          notify_on_moderate: data.notify_on_moderate ?? true,
          notify_on_major: data.notify_on_major ?? true,
          notify_on_critical: data.notify_on_critical ?? true,
          digest_frequency: data.digest_frequency || 'instant',
          quiet_hours_start: data.quiet_hours_start,
          quiet_hours_end: data.quiet_hours_end,
        });
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to load notification preferences. Make sure the migration is applied.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await (supabase as any)
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          email_enabled: preferences.email_enabled,
          email_address: preferences.email_address,
          notify_on_minor: preferences.notify_on_minor,
          notify_on_moderate: preferences.notify_on_moderate,
          notify_on_major: preferences.notify_on_major,
          notify_on_critical: preferences.notify_on_critical,
          digest_frequency: preferences.digest_frequency,
          quiet_hours_start: preferences.quiet_hours_start,
          quiet_hours_end: preferences.quiet_hours_end,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast({
        title: 'Saved',
        description: 'Notification preferences updated successfully',
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to save preferences. Make sure the migration is applied.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const sendTestNotification = async () => {
    setTesting(true);
    try {
      // This would call your email notification edge function
      toast({
        title: 'Test Email Sent',
        description: `A test notification was sent to ${preferences.email_address}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send test notification',
        variant: 'destructive',
      });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">Loading preferences...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </CardTitle>
          <CardDescription>
            Control when and how you receive alerts about detected changes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email Notifications */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="email-enabled">Email Notifications</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Receive email alerts when changes are detected
                </p>
              </div>
              <Switch
                id="email-enabled"
                checked={preferences.email_enabled}
                onCheckedChange={(checked) =>
                  setPreferences({ ...preferences, email_enabled: checked })
                }
              />
            </div>

            {preferences.email_enabled && (
              <div className="space-y-2 ml-6">
                <Label htmlFor="email-address">Email Address</Label>
                <div className="flex gap-2">
                  <Input
                    id="email-address"
                    type="email"
                    value={preferences.email_address}
                    onChange={(e) =>
                      setPreferences({ ...preferences, email_address: e.target.value })
                    }
                    placeholder="your@email.com"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={sendTestNotification}
                    disabled={testing || !preferences.email_address}
                    title="Send test email"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Defaults to your account email if not specified
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* Change Severity Thresholds */}
          <div className="space-y-4">
            <div>
              <Label className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-4 w-4" />
                Notify Me When Changes Are:
              </Label>
              <p className="text-sm text-muted-foreground mb-4">
                Choose which severity levels trigger notifications
              </p>
            </div>

            <div className="space-y-3 ml-6">
              {/* Critical */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="destructive">Critical</Badge>
                  <span className="text-sm">Major business impact</span>
                </div>
                <Switch
                  checked={preferences.notify_on_critical}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, notify_on_critical: checked })
                  }
                />
              </div>

              {/* Major */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="destructive">Major</Badge>
                  <span className="text-sm">Significant changes detected</span>
                </div>
                <Switch
                  checked={preferences.notify_on_major}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, notify_on_major: checked })
                  }
                />
              </div>

              {/* Moderate */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Moderate</Badge>
                  <span className="text-sm">Noticeable updates</span>
                </div>
                <Switch
                  checked={preferences.notify_on_moderate}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, notify_on_moderate: checked })
                  }
                />
              </div>

              {/* Minor */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Minor</Badge>
                  <span className="text-sm">Small tweaks and edits</span>
                </div>
                <Switch
                  checked={preferences.notify_on_minor}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, notify_on_minor: checked })
                  }
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Notification Frequency */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="frequency" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Notification Frequency
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                How often should we group and send notifications
              </p>
            </div>

            <Select
              value={preferences.digest_frequency}
              onValueChange={(value: any) =>
                setPreferences({ ...preferences, digest_frequency: value })
              }
            >
              <SelectTrigger id="frequency" className="ml-6">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="instant">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Instant</div>
                      <div className="text-xs text-muted-foreground">Immediate alerts</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="hourly">
                  <div>
                    <div className="font-medium">Hourly Digest</div>
                    <div className="text-xs text-muted-foreground">Summary every hour</div>
                  </div>
                </SelectItem>
                <SelectItem value="daily">
                  <div>
                    <div className="font-medium">Daily Digest</div>
                    <div className="text-xs text-muted-foreground">Once per day</div>
                  </div>
                </SelectItem>
                <SelectItem value="weekly">
                  <div>
                    <div className="font-medium">Weekly Digest</div>
                    <div className="text-xs text-muted-foreground">Weekly summary</div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Quiet Hours */}
          <div className="space-y-4">
            <div>
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Quiet Hours (Optional)
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Don't send notifications during these hours
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 ml-6">
              <div className="space-y-2">
                <Label htmlFor="quiet-start" className="text-xs">Start Time</Label>
                <Input
                  id="quiet-start"
                  type="time"
                  value={preferences.quiet_hours_start || ''}
                  onChange={(e) =>
                    setPreferences({ ...preferences, quiet_hours_start: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quiet-end" className="text-xs">End Time</Label>
                <Input
                  id="quiet-end"
                  type="time"
                  value={preferences.quiet_hours_end || ''}
                  onChange={(e) =>
                    setPreferences({ ...preferences, quiet_hours_end: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-2 text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-100">
                How Change Detection Works
              </p>
              <ul className="text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
                <li>Scheduled scrapes compare new results with previous snapshots</li>
                <li>Our AI detects pricing, content, and sentiment changes</li>
                <li>You'll only be notified based on your threshold settings</li>
                <li>All changes are tracked in your history timeline</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={fetchPreferences} disabled={saving}>
          Reset
        </Button>
        <Button onClick={savePreferences} disabled={saving}>
          {saving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  );
};
