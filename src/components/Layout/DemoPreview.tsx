import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const DemoPreview = () => {
  return (
    <section id="demo" className="w-full py-20 md:py-32 bg-muted/30">
      <div className="container max-w-7xl">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            See It In Action
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Real-time analysis of website content with AI-powered insights.
          </p>
        </div>

        <Card className="max-w-4xl mx-auto p-8 space-y-6 border border-border/50 shadow-elegant">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                AI
              </div>
              <div className="flex-1 space-y-2">
                <div className="rounded-xl bg-muted p-4">
                  <p className="text-sm">
                    I've analyzed the websites you provided. Here's a comprehensive summary:
                  </p>
                </div>
              </div>
            </div>

            <div className="pl-11 space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">TL;DR</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  The content focuses on AI-powered website analysis with emphasis on speed, accuracy, and actionable insights.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Key Points</Badge>
                </div>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  <li>Uses advanced LLM technology for content processing</li>
                  <li>Provides multi-dimensional analysis across sources</li>
                  <li>Identifies opportunities and potential conflicts</li>
                </ul>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Recommendations</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Consider implementing batch analysis for efficiency and adding export functionality for reports.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};
