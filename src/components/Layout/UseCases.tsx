import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, GraduationCap, TrendingUp, Users } from "lucide-react";

const useCases = [
  {
    icon: Building2,
    title: "Business Intelligence",
    description: "Analyze competitor websites, market trends, and industry insights.",
  },
  {
    icon: GraduationCap,
    title: "Research & Academia",
    description: "Extract and synthesize information from multiple research sources.",
  },
  {
    icon: TrendingUp,
    title: "Content Strategy",
    description: "Identify content gaps, opportunities, and optimization strategies.",
  },
  {
    icon: Users,
    title: "Due Diligence",
    description: "Comprehensive analysis for investment and partnership decisions.",
  },
];

export const UseCases = () => {
  return (
    <section id="use-cases" className="w-full py-20 md:py-32">
      <div className="container max-w-7xl">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Built For Everyone
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From researchers to business leaders, InsightEngine adapts to your needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {useCases.map((useCase, index) => (
            <Card key={index} className="border border-border/50 hover:border-border transition-all hover:shadow-elegant">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <useCase.icon className="h-6 w-6 text-accent" />
                </div>
                <CardTitle className="text-xl">{useCase.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {useCase.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
