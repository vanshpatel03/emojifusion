import { EmojiFusionForm } from "@/components/emoji-fusion-form";
import { Sparkles } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-8">
      <div className="flex flex-col items-center justify-center space-y-2 text-center mb-8">
        <div className="p-3 rounded-full bg-primary/10 border border-primary/20">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tighter text-foreground font-headline">
          Emoji Alchemist
        </h1>
        <p className="max-w-xl text-muted-foreground">
          What happens when you mix a 🚀 with a 🐸? Choose two emojis, and let
          our AI forge a brand new creation for you to see and share!
        </p>
      </div>
      <EmojiFusionForm />
    </main>
  );
}
