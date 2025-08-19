import { EmojiFusionForm } from "@/components/emoji-fusion-form";
import { Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* 🔹 Header */}
      <header className="w-full p-2 space-y-2 bg-background/80 backdrop-blur-sm">
        <h1 className="text-2xl font-bold text-center">Emoji Alchemist</h1>
      </header>

      {/* 🔹 Main Content */}
      <main className="flex flex-1 w-full flex-col items-center justify-center p-4 sm:p-8">
        <div className="flex flex-col items-center justify-center space-y-2 text-center mb-8">
          <div className="p-3 rounded-full bg-primary/10 border border-primary/20">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tighter text-foreground font-headline">
            Emoji Alchemist
          </h1>
          <p className="max-w-xl text-muted-foreground sm:text-lg">
            What happens when you mix a 🚀 with a 🐸? Or your dog with a 🍩?  
            Choose two emojis, and let our AI forge a brand new creation!
          </p>
        </div>
        <EmojiFusionForm />
      </main>

      {/* 🔹 Footer */}
      <footer className="w-full p-2 bg-background/80 backdrop-blur-sm text-center text-muted-foreground text-sm">
        © {new Date().getFullYear()} Emoji Alchemist. All rights reserved.
      </footer>
    </div>
  );
}

