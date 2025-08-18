import { EmojiFusionForm } from "@/components/emoji-fusion-form";
import { Sparkles } from "lucide-react";

const adCode = `<div style="width:100%;margin: auto;position: relative; z-index: 10;"><iframe data-aa=2407156 src=//acceptable.a-ads.com/2407156/?size=Adaptive style='border:0; padding:0; width:100%; height:auto; overflow:hidden; margin: auto'></iframe></div>`;

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="w-full p-2 space-y-2 bg-background/80 backdrop-blur-sm">
        <div dangerouslySetInnerHTML={{ __html: adCode }} />
      </header>
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
            Choose two emojis, and let our AI forge a
            brand new creation!
          </p>
        </div>
        <EmojiFusionForm />
      </main>
      <footer className="w-full p-2 bg-background/80 backdrop-blur-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
            <div dangerouslySetInnerHTML={{ __html: adCode }} />
            <div dangerouslySetInnerHTML={{ __html: adCode }} />
            <div dangerouslySetInnerHTML={{ __html: adCode }} />
            <div dangerouslySetInnerHTML={{ __html: adCode }} />
        </div>
      </footer>
    </div>
  );
}
