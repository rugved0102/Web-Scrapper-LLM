import { Link, Search, Sparkles } from "lucide-react";

const steps = [
  {
    icon: Link,
    title: "Enter URLs",
    description: "Paste one or multiple website URLs you want to analyze.",
  },
  {
    icon: Search,
    title: "AI Analysis",
    description: "Our AI processes the content and extracts meaningful insights.",
  },
  {
    icon: Sparkles,
    title: "Get Results",
    description: "Receive comprehensive analysis with key points and recommendations.",
  },
];

export const HowItWorks = () => {
  return (
    <section id="how-it-works" className="w-full py-20 md:py-32">
      <div className="container max-w-7xl">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            How It Works
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Three simple steps to unlock powerful insights.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <step.icon className="h-8 w-8 text-primary" />
                </div>
                <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
