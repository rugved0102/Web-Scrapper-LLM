import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, Plus, LogOut, Trash2, ChevronLeft, ChevronRight, 
  Search, Star, SortAsc, Filter, Pencil, Check, X, Archive,
  Briefcase, FlaskConical, Target, TrendingUp, Lightbulb, Globe, Clock,
  AlertTriangle, TrendingDown, ArrowUpDown
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InsightData } from "@/components/InsightEngine/InsightDisplay";
import { PurposeMode } from "@/components/InsightEngine/PurposeSelector";

interface HistoryItem {
  id: string;
  url: string;
  urls?: string[];
  title?: string;
  result: InsightData;
  purpose: PurposeMode;
  starred?: boolean;
  archived?: boolean;
  tags?: string[];
  created_at: string;
  updated_at?: string;
  has_changes?: boolean;
  change_magnitude?: 'none' | 'minor' | 'moderate' | 'major' | 'critical';
  changes_count?: number;
}

interface ScheduledTask {
  id: string;
  urls: string[];
  purpose: string;
  domain: string;
  frequency: string;
  next_run: string;
  enabled: boolean;
  created_at: string;
}

interface HistorySidebarProps {
  onSelectHistory: (item: HistoryItem) => void;
  onNewAnalysis: () => void;
}

export const HistorySidebar = ({ onSelectHistory, onNewAnalysis }: HistorySidebarProps) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [scheduledTasks, setScheduledTasks] = useState<ScheduledTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "starred">("date");
  const [filterPurpose, setFilterPurpose] = useState<string>("all");
  const [showStarredOnly, setShowStarredOnly] = useState(false);
  const [showArchivedOnly, setShowArchivedOnly] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
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

  const fetchScheduledTasks = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await (supabase as any)
        .from("scheduled_tasks")
        .select("*")
        .eq("enabled", true)
        .order("next_run", { ascending: true });

      if (error) throw error;
      setScheduledTasks((data as unknown as ScheduledTask[]) || []);
    } catch (error) {
      console.error("Error fetching scheduled tasks:", error);
    }
  };

  useEffect(() => {
    fetchHistory();
    fetchScheduledTasks();

    // Subscribe to real-time updates
    const historySubscription = supabase
      .channel("analysis_history_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "analysis_history",
          filter: `user_id=eq.${user?.id}`,
        },
        () => {
          fetchHistory();
        }
      )
      .subscribe();

    const scheduleSubscription = supabase
      .channel("scheduled_tasks_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "scheduled_tasks",
          filter: `user_id=eq.${user?.id}`,
        },
        () => {
          fetchScheduledTasks();
        }
      )
      .subscribe();

    return () => {
      historySubscription.unsubscribe();
      scheduleSubscription.unsubscribe();
    };
  }, [user]);

  // Filter and sort history
  const filteredHistory = useMemo(() => {
    let filtered = history;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((item) => {
        const urls = item.urls || (item.url ? [item.url] : []);
        const urlMatch = urls.some((url) => url?.toLowerCase().includes(query));
        const titleMatch = item.title?.toLowerCase().includes(query);
        const tagMatch = item.tags?.some((tag) => tag?.toLowerCase().includes(query));
        const purposeMatch = item.purpose?.toLowerCase().includes(query);
        
        return urlMatch || titleMatch || tagMatch || purposeMatch;
      });
    }

    // Purpose filter
    if (filterPurpose !== "all") {
      filtered = filtered.filter((item) => item.purpose === filterPurpose);
    }

    // Starred filter
    if (showStarredOnly) {
      filtered = filtered.filter((item) => item.starred);
    }

    // Archived filter
    if (showArchivedOnly) {
      filtered = filtered.filter((item) => item.archived);
    } else {
      // By default, hide archived items unless explicitly showing them
      filtered = filtered.filter((item) => !item.archived);
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === "starred") {
        if (a.starred && !b.starred) return -1;
        if (!a.starred && b.starred) return 1;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return filtered;
  }, [history, searchQuery, filterPurpose, showStarredOnly, sortBy]);

  // Get unique purposes for filter
  const uniquePurposes = useMemo(() => {
    return Array.from(new Set(history.map((item) => item.purpose)));
  }, [history]);

  // Toggle star
  const handleToggleStar = async (id: string, currentStarred: boolean, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      const { error } = await supabase
        .from("analysis_history")
        .update({ starred: !currentStarred })
        .eq("id", id);

      if (error) {
        console.error("Star error:", error);
        throw error;
      }

      setHistory((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, starred: !currentStarred } : item
        )
      );

      toast({
        title: !currentStarred ? "Starred" : "Unstarred",
        description: !currentStarred ? "Added to favorites" : "Removed from favorites",
      });
    } catch (error) {
      console.error("Failed to toggle star:", error);
      toast({
        title: "Error",
        description: "Failed to update. Make sure the database migration is applied.",
        variant: "destructive",
      });
    }
  };

  // Toggle archive
  const handleToggleArchive = async (id: string, currentArchived: boolean, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      const { error } = await supabase
        .from("analysis_history")
        .update({ archived: !currentArchived })
        .eq("id", id);

      if (error) {
        console.error("Archive error:", error);
        throw error;
      }

      setHistory((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, archived: !currentArchived } : item
        )
      );

      toast({
        title: !currentArchived ? "Archived" : "Unarchived",
        description: !currentArchived ? "Moved to archive" : "Restored from archive",
      });
    } catch (error) {
      console.error("Failed to toggle archive:", error);
      toast({
        title: "Error",
        description: "Failed to update. Make sure the database migration is applied.",
        variant: "destructive",
      });
    }
  };

  // Start editing title
  const handleStartEdit = (item: HistoryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(item.id);
    setEditingTitle(item.title || truncateUrl(item));
  };

  // Cancel editing
  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
    setEditingTitle("");
  };

  // Save edited title
  const handleSaveEdit = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!editingTitle.trim()) {
      toast({
        title: "Error",
        description: "Title cannot be empty",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("analysis_history")
        .update({ title: editingTitle.trim() })
        .eq("id", id);

      if (error) {
        console.error("Update error:", error);
        throw error;
      }

      setHistory((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, title: editingTitle.trim() } : item
        )
      );

      setEditingId(null);
      setEditingTitle("");

      toast({
        title: "Renamed",
        description: "History item renamed successfully",
      });
    } catch (error) {
      console.error("Failed to rename:", error);
      toast({
        title: "Error",
        description: "Failed to rename. Make sure the database migration is applied.",
        variant: "destructive",
      });
    }
  };

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
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const truncateUrl = (item: HistoryItem) => {
    const urls = item.urls || [item.url];
    const url = urls[0];
    
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname.replace("www.", "");
      return urls.length > 1 ? `${domain} +${urls.length - 1}` : domain;
    } catch {
      return url.length > 25 ? url.substring(0, 25) + "..." : url;
    }
  };

  const getPurposeIcon = (purpose: string) => {
    const iconProps = { className: "h-4 w-4 text-muted-foreground shrink-0" };
    
    switch (purpose) {
      case "business":
        return <Briefcase {...iconProps} />;
      case "research":
        return <FlaskConical {...iconProps} />;
      case "competitive":
        return <Target {...iconProps} />;
      case "trends":
        return <TrendingUp {...iconProps} />;
      case "content":
        return <Lightbulb {...iconProps} />;
      case "general":
        return <Globe {...iconProps} />;
      default:
        return <Brain {...iconProps} />;
    }
  };

  const getChangeMagnitudeBadge = (magnitude?: string, count?: number) => {
    if (!magnitude || magnitude === 'none' || !count || count === 0) return null;

    const config = {
      critical: { variant: 'destructive' as const, icon: <AlertTriangle className="h-3 w-3" />, color: 'text-red-600' },
      major: { variant: 'destructive' as const, icon: <TrendingDown className="h-3 w-3" />, color: 'text-orange-600' },
      moderate: { variant: 'secondary' as const, icon: <ArrowUpDown className="h-3 w-3" />, color: 'text-yellow-600' },
      minor: { variant: 'outline' as const, icon: <TrendingUp className="h-3 w-3" />, color: 'text-blue-600' },
    };

    const cfg = config[magnitude as keyof typeof config];
    if (!cfg) return null;

    return (
      <Badge variant={cfg.variant} className="text-xs gap-1">
        {cfg.icon}
        {count}
      </Badge>
    );
  };

  if (collapsed) {
    return (
      <div className="sticky top-0 h-screen border-r border-border bg-card flex flex-col items-center py-4 w-14">
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
    <div className="sticky top-0 h-screen border-r border-border bg-card flex flex-col" style={{ width: '300px' }}>
      {/* Header */}
      <div className="shrink-0">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">History</span>
            {history.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {history.length}
              </Badge>
            )}
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

        {/* New Analysis Button */}
        <div className="p-3 border-b border-border">
          <Button onClick={onNewAnalysis} className="w-full justify-start gap-2">
            <Plus className="h-4 w-4" />
            New Analysis
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="p-3 space-y-2 border-b border-border">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex gap-2">
            {/* Purpose Filter */}
            <Select value={filterPurpose} onValueChange={setFilterPurpose}>
              <SelectTrigger className="h-8 flex-1 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {uniquePurposes.map((purpose) => (
                  <SelectItem key={purpose} value={purpose}>
                    {purpose}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setSortBy(sortBy === "date" ? "starred" : "date")}
              title={sortBy === "date" ? "Sort by starred" : "Sort by date"}
            >
              <SortAsc className="h-4 w-4" />
            </Button>

            {/* Star Filter */}
            <Button
              variant={showStarredOnly ? "default" : "outline"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setShowStarredOnly(!showStarredOnly)}
              title="Show starred only"
            >
              <Star className={`h-4 w-4 ${showStarredOnly ? "fill-current" : ""}`} />
            </Button>

            {/* Archive Filter */}
            <Button
              variant={showArchivedOnly ? "default" : "outline"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setShowArchivedOnly(!showArchivedOnly)}
              title="Show archived only"
            >
              <Archive className={`h-4 w-4 ${showArchivedOnly ? "fill-current" : ""}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* Scheduled Tasks Section */}
      {scheduledTasks.length > 0 && (
        <div className="px-2 py-3 border-b border-border">
          <div className="flex items-center gap-2 mb-2 px-1">
            <Clock className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-semibold text-foreground">Scheduled Tasks</span>
            <Badge variant="secondary" className="ml-auto text-xs">
              {scheduledTasks.length}
            </Badge>
          </div>
          <div className="space-y-1">
            {scheduledTasks.slice(0, 3).map((task) => (
              <div
                key={task.id}
                className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs">
                    {task.frequency}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {task.urls.length} URL{task.urls.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Next run: {new Date(task.next_run).toLocaleDateString()} at{" "}
                  {new Date(task.next_run).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History List */}
      <ScrollArea className="flex-1">
        <div className="p-2 pr-2 space-y-1">
          {loading ? (
            <div className="text-sm text-muted-foreground text-center py-8">
              Loading...
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-8">
              <Brain className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                {searchQuery || filterPurpose !== "all" || showStarredOnly || showArchivedOnly
                  ? "No results found"
                  : "No history yet"}
              </p>
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectHistory(item)}
                className="group relative p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
              >
                {editingId === item.id ? (
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    {getPurposeIcon(item.purpose)}
                    <Input
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveEdit(item.id, e as any);
                        if (e.key === "Escape") handleCancelEdit(e as any);
                      }}
                      className="h-7 text-sm flex-1"
                      autoFocus
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleSaveEdit(item.id, e)}
                      className="h-7 w-7 shrink-0"
                    >
                      <Check className="h-3.5 w-3.5 text-green-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleCancelEdit}
                      className="h-7 w-7 shrink-0"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-start gap-1">
                    {/* Purpose Icon */}
                    <div className="shrink-0 mt-0.5">
                      {getPurposeIcon(item.purpose)}
                    </div>
                    
                    {/* Content - flexible but leaves room for buttons */}
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium text-foreground truncate pr-2">
                          {item.title || truncateUrl(item)}
                        </div>
                        {getChangeMagnitudeBadge(item.change_magnitude, item.changes_count)}
                      </div>
                      <div className="text-xs text-muted-foreground truncate pr-2">
                        {formatDate(item.created_at)}
                        {item.tags && item.tags.length > 0 && (
                          <span className="ml-2">
                            {item.tags.slice(0, 2).map((tag, i) => (
                              <span key={i} className="text-xs">
                                #{tag}{i < Math.min(item.tags!.length, 2) - 1 ? ", " : ""}
                              </span>
                            ))}
                            {item.tags.length > 2 && ` +${item.tags.length - 2}`}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions - always reserve space */}
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-auto">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleStartEdit(item, e)}
                        className="h-6 w-6 hover:bg-accent p-0"
                        title="Rename"
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleToggleStar(item.id, item.starred || false, e)}
                        className="h-6 w-6 hover:bg-accent p-0"
                        title={item.starred ? "Unstar" : "Star"}
                      >
                        <Star
                          className={`h-3 w-3 ${
                            item.starred
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground"
                          }`}
                        />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleToggleArchive(item.id, item.archived || false, e)}
                        className="h-6 w-6 hover:bg-accent p-0"
                        title={item.archived ? "Unarchive" : "Archive"}
                      >
                        <Archive
                          className={`h-3 w-3 ${
                            item.archived
                              ? "text-blue-500"
                              : "text-muted-foreground"
                          }`}
                        />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleDelete(item.id, e)}
                        className="h-6 w-6 hover:bg-accent p-0"
                        title="Delete"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
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
