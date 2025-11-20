import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertTriangle, 
  Clock,
  ZoomIn,
  ZoomOut,
  Filter
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TimelineSnapshot {
  id: string;
  timestamp: Date;
  url: string;
  changeMagnitude: 'none' | 'minor' | 'moderate' | 'major' | 'critical';
  changesCount: number;
  changeTypes: string[];
  similarity: number;
  summary: string;
}

interface HistoryTimelineProps {
  snapshots: TimelineSnapshot[];
  onSnapshotClick?: (snapshotId: string) => void;
}

export const HistoryTimeline = ({ snapshots, onSnapshotClick }: HistoryTimelineProps) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [filterType, setFilterType] = useState<string>('all');

  // Filter snapshots by time range
  const filteredSnapshots = useMemo(() => {
    const now = new Date();
    let cutoffDate = new Date();
    
    switch (timeRange) {
      case '7d':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        cutoffDate.setDate(now.getDate() - 90);
        break;
      case 'all':
        cutoffDate = new Date(0);
        break;
    }

    let filtered = snapshots.filter(s => s.timestamp >= cutoffDate);

    if (filterType !== 'all') {
      filtered = filtered.filter(s => s.changeTypes.includes(filterType));
    }

    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [snapshots, timeRange, filterType]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalChanges = filteredSnapshots.reduce((sum, s) => sum + s.changesCount, 0);
    const criticalCount = filteredSnapshots.filter(s => 
      s.changeMagnitude === 'critical' || s.changeMagnitude === 'major'
    ).length;
    const avgSimilarity = filteredSnapshots.length > 0
      ? filteredSnapshots.reduce((sum, s) => sum + s.similarity, 0) / filteredSnapshots.length
      : 0;

    return {
      totalSnapshots: filteredSnapshots.length,
      totalChanges,
      criticalCount,
      avgSimilarity: avgSimilarity.toFixed(1)
    };
  }, [filteredSnapshots]);

  const getMagnitudeColor = (magnitude: string) => {
    switch (magnitude) {
      case 'critical': return 'bg-red-500';
      case 'major': return 'bg-orange-500';
      case 'moderate': return 'bg-yellow-500';
      case 'minor': return 'bg-blue-500';
      default: return 'bg-gray-300';
    }
  };

  const getMagnitudeBadgeVariant = (magnitude: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (magnitude) {
      case 'critical':
      case 'major':
        return 'destructive';
      case 'moderate':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getMagnitudeIcon = (magnitude: string) => {
    switch (magnitude) {
      case 'critical':
      case 'major':
        return <AlertTriangle className="h-4 w-4" />;
      case 'moderate':
        return <TrendingDown className="h-4 w-4" />;
      case 'minor':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Minus className="h-4 w-4" />;
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const allChangeTypes = useMemo(() => {
    const types = new Set<string>();
    snapshots.forEach(s => s.changeTypes.forEach(t => types.add(t)));
    return Array.from(types);
  }, [snapshots]);

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <p className="text-2xl font-bold">{stats.totalSnapshots}</p>
              <p className="text-xs text-muted-foreground">Total Snapshots</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <p className="text-2xl font-bold">{stats.totalChanges}</p>
              <p className="text-xs text-muted-foreground">Total Changes</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <p className="text-2xl font-bold text-destructive">{stats.criticalCount}</p>
              <p className="text-xs text-muted-foreground">Critical/Major</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <p className="text-2xl font-bold">{stats.avgSimilarity}%</p>
              <p className="text-xs text-muted-foreground">Avg Similarity</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Change Timeline
              </CardTitle>
              <CardDescription>Track changes over time</CardDescription>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              {/* Time Range Selector */}
              <Select value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
                <SelectTrigger className="w-[120px] h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>

              {/* Change Type Filter */}
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[140px] h-9">
                  <SelectValue placeholder="Filter type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {allChangeTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Timeline */}
      <Card>
        <CardContent className="pt-6">
          <ScrollArea className="h-[600px]">
            <div className="relative pl-6">
              {/* Vertical line */}
              <div className="absolute left-[11px] top-0 bottom-0 w-0.5 bg-border" />

              {/* Timeline items */}
              <div className="space-y-6">
                {filteredSnapshots.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">No snapshots in this time range</p>
                  </div>
                ) : (
                  filteredSnapshots.map((snapshot, idx) => (
                    <div key={snapshot.id} className="relative">
                      {/* Timeline dot */}
                      <div className={`absolute -left-6 w-6 h-6 rounded-full ${getMagnitudeColor(snapshot.changeMagnitude)} flex items-center justify-center shadow-lg border-4 border-background`}>
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>

                      {/* Content card */}
                      <div 
                        className="ml-4 group cursor-pointer"
                        onClick={() => onSnapshotClick?.(snapshot.id)}
                      >
                        <Card className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              {/* Header */}
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge variant={getMagnitudeBadgeVariant(snapshot.changeMagnitude)}>
                                      {getMagnitudeIcon(snapshot.changeMagnitude)}
                                      <span className="ml-1">{snapshot.changeMagnitude}</span>
                                    </Badge>
                                    {snapshot.changesCount > 0 && (
                                      <Badge variant="outline">
                                        {snapshot.changesCount} change{snapshot.changesCount !== 1 ? 's' : ''}
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm font-medium truncate">{snapshot.url}</p>
                                  <p className="text-xs text-muted-foreground">{formatDate(snapshot.timestamp)}</p>
                                </div>

                                <div className="text-right shrink-0">
                                  <p className="text-xs text-muted-foreground">Similarity</p>
                                  <p className="text-lg font-semibold">{snapshot.similarity.toFixed(0)}%</p>
                                </div>
                              </div>

                              {/* Summary */}
                              {snapshot.summary && (
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {snapshot.summary}
                                </p>
                              )}

                              {/* Change types */}
                              {snapshot.changeTypes.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {snapshot.changeTypes.map(type => (
                                    <Badge key={type} variant="secondary" className="text-xs">
                                      {type}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Mini trend chart - simplified visualization */}
      {filteredSnapshots.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Change Frequency Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-24 flex items-end gap-1">
              {filteredSnapshots.slice(0, 30).reverse().map((snapshot, idx) => {
                const height = snapshot.changesCount === 0 ? 8 : Math.min(100, (snapshot.changesCount / 10) * 100);
                return (
                  <div
                    key={idx}
                    className="flex-1 relative group"
                    title={`${snapshot.changesCount} changes - ${formatDate(snapshot.timestamp)}`}
                  >
                    <div 
                      className={`${getMagnitudeColor(snapshot.changeMagnitude)} rounded-t transition-all hover:opacity-80`}
                      style={{ height: `${height}%` }}
                    />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                      <div className="bg-popover text-popover-foreground text-xs p-2 rounded shadow-lg whitespace-nowrap border">
                        {snapshot.changesCount} changes<br />
                        {formatDate(snapshot.timestamp)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>Oldest</span>
              <span>Latest</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
