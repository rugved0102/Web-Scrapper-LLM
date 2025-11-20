import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, Plus, LogOut, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { InsightData } from "@/components/InsightEngine/InsightDisplay";
import { PurposeMode } from "@/components/InsightEngine/PurposeSelector";

interface HistoryItem {
  id: string;
  url: string;
  result: InsightData;
  purpose: PurposeMode;
  created_at: string;
}

interface HistorySidebarProps {
  onSelectHistory: (item: HistoryItem) => void;
  onNewAnalysis: () => void;
}

export const HistorySidebar = ({ onSelectHistory, onNewAnalysis }: HistorySidebarProps) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchHistory = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("analysis_history")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setHistory((data as unknown as HistoryItem[]) || []);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const { error } = await supabase
        .from("analysis_history")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setHistory(history.filter((item) => item.id !== id));
      toast({
        title: "Deleted",
        description: "Analysis removed from history",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete history item",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed Out",
      description: "You have been logged out successfully",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  const truncateUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace("www.", "");
    } catch {
      return url.length > 30 ? url.substring(0, 30) + "..." : url;
    }
  };

  if (collapsed) {
    return (
      <div className="h-screen border-r border-border bg-card flex flex-col items-center py-4 w-14">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(false)}
          className="mb-4"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Brain className="h-5 w-5 text-foreground" />
      </div>
    );
  }

  return (
    <div className="h-screen border-r border-border bg-card flex flex-col" style={{ width: '280px' }}>
      {/* Sidebar Top - Logo + New Analysis */}
      <div className="shrink-0">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-foreground" />
            <span className="font-semibold text-foreground">InsightEngine</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(true)}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-3">
          <Button
            onClick={onNewAnalysis}
            className="w-full justify-start"
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Analysis
          </Button>
        </div>
      </div>

      {/* Sidebar History - Scrollable */}
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1 pb-4">
          {loading ? (
            <div className="text-sm text-muted-foreground text-center py-8">
              Loading history...
            </div>
          ) : history.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-8">
              No analysis history yet
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectHistory(item)}
                className="group flex items-center justify-between p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-foreground truncate">
                    {truncateUrl(item.url)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatDate(item.created_at)}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => handleDelete(item.id, e)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 shrink-0"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Sidebar Bottom - Logout */}
      <div className="shrink-0 p-3 border-t border-border">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
};
