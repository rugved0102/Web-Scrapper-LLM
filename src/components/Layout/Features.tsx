import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Zap, Code, BarChart3 } from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Content Summarization",
    description: "Extract key insights and TL;DR from any website instantly.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Powered by Groq's LLM for blazing-fast analysis and results.",
  },
  {
    icon: Code,
    title: "Developer Friendly",
    description: "Run locally with full control. Open source and customizable.",
  },
  {
    icon: BarChart3,
    title: "Deep Analysis",
    description: "Get actionable insights, conflicts, opportunities, and recommendations.",
  },
];

export const Features = () => {
  return (
    <section id="features" className="w-full py-20 md:py-32 bg-muted/30">
      <div className="container max-w-7xl">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Powerful Features
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Everything you need to analyze and understand web content at scale.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border border-border/50 hover:border-border transition-all hover:shadow-elegant">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
