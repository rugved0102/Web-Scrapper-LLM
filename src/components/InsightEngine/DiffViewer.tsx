import { InsightData } from "./InsightDisplay";
import { DetectedChange } from "@/lib/changeDetection";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ArrowRight, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Plus,
  ArrowUpDown
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface DiffViewerProps {
  previousData: InsightData;
  currentData: InsightData;
  changes: DetectedChange[];
  changeSummary: string;
  similarity: number;
}

export const DiffViewer = ({ 
  previousData, 
  currentData, 
  changes, 
  changeSummary,
  similarity 
}: DiffViewerProps) => {
  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="h-4 w-4" />;
      case 'medium':
        return <ArrowUpDown className="h-4 w-4" />;
      default:
        return <Minus className="h-4 w-4" />;
    }
  };

  const renderStringDiff = (oldValue: string, newValue: string, label: string) => {
    if (!oldValue && !newValue) return null;
    
    return (
      <div className="space-y-2">
        <h4 className="text-sm font-semibold">{label}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Old Value */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400">
                Previous
              </Badge>
            </div>
            <div className="p-3 rounded-lg border border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/10">
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {oldValue || <em className="text-muted-foreground/50">No previous value</em>}
              </p>
            </div>
          </div>

          {/* Arrow */}
          <div className="hidden md:flex items-center justify-center">
            <ArrowRight className="h-6 w-6 text-muted-foreground" />
          </div>

          {/* New Value */}
          <div className="space-y-1 md:col-start-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400">
                Current
              </Badge>
            </div>
            <div className="p-3 rounded-lg border border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/10">
              <p className="text-sm text-foreground whitespace-pre-wrap">
                {newValue || <em className="text-muted-foreground/50">No current value</em>}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderArrayDiff = (oldArray: string[], newArray: string[], label: string) => {
    // Find items that were added, removed, or unchanged
    const removed = oldArray.filter(item => 
      !newArray.some(newItem => newItem.toLowerCase().includes(item.toLowerCase().substring(0, 30)))
    );
    const added = newArray.filter(item =>
      !oldArray.some(oldItem => oldItem.toLowerCase().includes(item.toLowerCase().substring(0, 30)))
    );
    const unchanged = newArray.filter(item =>
      oldArray.some(oldItem => oldItem.toLowerCase().includes(item.toLowerCase().substring(0, 30)))
    );

    return (
      <div className="space-y-2">
        <h4 className="text-sm font-semibold">{label}</h4>
        
        {/* Removed items */}
        {removed.length > 0 && (
          <div className="space-y-2">
            <Badge variant="outline" className="bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400">
              <Minus className="h-3 w-3 mr-1" />
              {removed.length} Removed
            </Badge>
            {removed.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2 p-2 rounded border border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/10">
                <Minus className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground line-through">{item}</p>
              </div>
            ))}
          </div>
        )}

        {/* Added items */}
        {added.length > 0 && (
          <div className="space-y-2">
            <Badge variant="outline" className="bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400">
              <Plus className="h-3 w-3 mr-1" />
              {added.length} Added
            </Badge>
            {added.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2 p-2 rounded border border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/10">
                <Plus className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                <p className="text-sm text-foreground font-medium">{item}</p>
              </div>
            ))}
          </div>
        )}

        {/* Unchanged items (collapsed) */}
        {unchanged.length > 0 && (
          <details className="group">
            <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
              {unchanged.length} unchanged items (click to expand)
            </summary>
            <div className="mt-2 space-y-1">
              {unchanged.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 p-2 rounded border bg-muted/30">
                  <p className="text-sm text-muted-foreground">{item}</p>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>
    );
  };

  const groupedChanges = changes.reduce((acc, change) => {
    if (!acc[change.type]) acc[change.type] = [];
    acc[change.type].push(change);
    return acc;
  }, {} as Record<string, DetectedChange[]>);

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUpDown className="h-5 w-5" />
            Change Analysis
          </CardTitle>
          <CardDescription>{changeSummary}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Similarity:</span>
              <Badge variant={similarity > 80 ? "secondary" : "destructive"}>
                {similarity.toFixed(1)}%
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Total Changes:</span>
              <Badge>{changes.length}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Critical:</span>
              <Badge variant="destructive">
                {changes.filter(c => c.severity === 'critical' || c.severity === 'high').length}
              </Badge>
            </div>
          </div>

          {/* Change type breakdown */}
          <div className="flex flex-wrap gap-2">
            {Object.entries(groupedChanges).map(([type, typeChanges]) => (
              <Badge key={type} variant="outline">
                {type}: {typeChanges.length}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Changes List */}
      <Card>
        <CardHeader>
          <CardTitle>Detected Changes</CardTitle>
          <CardDescription>Individual changes detected between analyses</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <div className="space-y-3">
              {changes.map((change, idx) => (
                <div 
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="shrink-0 mt-0.5">
                    {getSeverityIcon(change.severity)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={getSeverityColor(change.severity) as any} className="text-xs">
                        {change.severity}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {change.type}
                      </Badge>
                      {change.changePercentage && (
                        <Badge variant="secondary" className="text-xs">
                          {change.changePercentage.toFixed(1)}% change
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm font-medium">{change.description}</p>
                    {(change.oldValue || change.newValue) && (
                      <div className="text-xs text-muted-foreground">
                        <span className="line-through text-red-600 dark:text-red-400">
                          {change.oldValue?.substring(0, 60)}{change.oldValue?.length > 60 ? '...' : ''}
                        </span>
                        {change.oldValue && change.newValue && <span className="mx-2">→</span>}
                        <span className="text-green-600 dark:text-green-400">
                          {change.newValue?.substring(0, 60)}{change.newValue?.length > 60 ? '...' : ''}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Detailed Diff Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Comparison</CardTitle>
          <CardDescription>Side-by-side view of old vs new content</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="summary" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="keypoints">Key Points</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              <TabsTrigger value="domain">Domain</TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="space-y-4">
              {renderStringDiff(previousData.tldr, currentData.tldr, "Executive Summary")}
            </TabsContent>

            <TabsContent value="keypoints" className="space-y-4">
              {renderArrayDiff(previousData.key_points, currentData.key_points, "Key Points")}
            </TabsContent>

            <TabsContent value="insights" className="space-y-4">
              {renderArrayDiff(previousData.deep_insights, currentData.deep_insights, "Deep Insights")}
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-4">
              {renderArrayDiff(previousData.recommendations, currentData.recommendations, "Recommendations")}
            </TabsContent>

            <TabsContent value="domain" className="space-y-4">
              {previousData.domain_specific_insights && currentData.domain_specific_insights ? (
                renderArrayDiff(
                  previousData.domain_specific_insights,
                  currentData.domain_specific_insights,
                  "Domain-Specific Insights"
                )
              ) : (
                <p className="text-sm text-muted-foreground">No domain-specific insights available</p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
