"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  generateEmojiFusion,
  type GenerateEmojiFusionOutput,
} from "@/ai/flows/generate-emoji-fusion";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Download,
  Share2,
  Wand2,
  Plus,
  RefreshCw,
  Clapperboard,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const emojiRegex = /^(\p{Emoji_Presentation}|\p{Extended_Pictographic})$/u;

const formSchema = z.object({
  emoji1: z.string().min(1, "Required").regex(emojiRegex, "Invalid emoji"),
  emoji2: z.string().min(1, "Required").regex(emojiRegex, "Invalid emoji"),
});

type FormValues = z.infer<typeof formSchema>;

const DAILY_LIMIT = 3;

const EmojiInput = ({
  field,
  error,
}: {
  field: any;
  error: any;
}) => {
  return (
    <>
      <Input
        {...field}
        placeholder="🚀"
        maxLength={2}
        className={cn(
          "text-6xl sm:text-7xl text-center h-32 sm:h-36 p-0 bg-transparent border-2 border-dashed focus-visible:ring-primary",
          error && "border-destructive"
        )}
      />
      {error && (
        <p className="text-center text-xs text-destructive mt-1">
          Please enter a valid emoji.
        </p>
      )}
    </>
  );
};

const adCode = `<div style="width:100%;margin: auto;position: relative; z-index: 99998;"><iframe data-aa=2407156 src=//acceptable.a-ads.com/2407156/?size=Adaptive style='border:0; padding:0; width:100%; height:auto; overflow:hidden; margin: auto'></iframe></div>`;

export function EmojiFusionForm() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<GenerateEmojiFusionOutput | null>(null);
  const [submittedData, setSubmittedData] = useState<FormValues | null>(null);
  const [usageCount, setUsageCount] = useState(0);
  const [showLimitDialog, setShowLimitDialog] = useState(false);
  const [showAd, setShowAd] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const lastUsageDate = localStorage.getItem("emojiFusionLastUsage");
    const currentCount = localStorage.getItem("emojiFusionCount");

    if (lastUsageDate === today) {
      setUsageCount(Number(currentCount) || 0);
    } else {
      localStorage.setItem("emojiFusionLastUsage", today);
      localStorage.setItem("emojiFusionCount", "0");
      setUsageCount(0);
    }
  }, []);

  const isLoading = isPending;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { emoji1: "🚀", emoji2: "🐸" },
  });

  const onSubmit = (values: FormValues) => {
    if (usageCount >= DAILY_LIMIT) {
      setShowLimitDialog(true);
      return;
    }

    startTransition(async () => {
      setResult(null);
      setSubmittedData(values);
      
      try {
        const fusionResult = await generateEmojiFusion(values);
        setResult(fusionResult);
        const newCount = usageCount + 1;
        setUsageCount(newCount);
        localStorage.setItem("emojiFusionCount", String(newCount));
      } catch (error) {
        console.error("Emoji fusion failed:", error);
        toast({
          title: "Oh no! Something went wrong.",
          description: "We couldn't generate your emoji. Please try again.",
          variant: "destructive",
        });
        setSubmittedData(null);
      }
    });
  };

  const handleShare = async () => {
    if (!result?.fusedEmojiDataUri) return;

    try {
      const response = await fetch(result.fusedEmojiDataUri);
      const blob = await response.blob();
      const file = new File([blob], "fused-emoji.png", { type: "image/png" });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "My Fused Emoji!",
          text: "Check out this emoji I made with Emoji Alchemist!",
          files: [file],
        });
      } else {
        toast({
          title: "Sharing not supported",
          description:
            "Your browser doesn't support this. The image will be downloaded instead.",
        });
        handleDownload();
      }
    } catch (error) {
      console.error("Sharing failed:", error);
      handleDownload();
    }
  };

  const handleDownload = () => {
    if (!result?.fusedEmojiDataUri) return;
    const link = document.createElement("a");
    link.href = result.fusedEmojiDataUri;
    link.download = "fused-emoji.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setResult(null);
    setSubmittedData(null);
    form.reset({ emoji1: "🚀", emoji2: "🐸" });
  };
  
  const handleAdClose = () => {
    setShowAd(false);
    // Decrease usage count by one to give user one more fusion
    const newCount = Math.max(0, usageCount - 1);
    setUsageCount(newCount); 
    localStorage.setItem("emojiFusionCount", String(newCount));
  };

  const renderSubmittedItem = (item: string) => {
    return <div className="text-6xl">{item}</div>;
  };

  return (
    <>
      <Dialog open={showAd} onOpenChange={handleAdClose}>
        <DialogContent className="p-0 border-0 bg-transparent shadow-none max-w-4xl">
          <DialogHeader>
            <DialogTitle className="sr-only">Advertisement</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 p-4 bg-background rounded-lg">
            <div dangerouslySetInnerHTML={{ __html: adCode }} />
            <div className="flex gap-4">
              <div className="flex-1" dangerouslySetInnerHTML={{ __html: adCode }} />
              <div className="flex-1" dangerouslySetInnerHTML={{ __html: adCode }} />
            </div>
            <div dangerouslySetInnerHTML={{ __html: adCode }} />
          </div>
        </DialogContent>
      </Dialog>
      <div className="w-full max-w-lg space-y-6">
        <Card className="overflow-hidden shadow-lg transition-all duration-300">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardHeader>
                <CardTitle className="font-headline text-2xl">
                  Create your Emoji
                </CardTitle>
                <CardDescription>
                  Pick two emojis to fuse. You have {Math.max(0, DAILY_LIMIT - usageCount)} fusions left today.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-row items-stretch justify-center gap-4">
                  <div className="flex-1 space-y-2">
                      <Controller
                          name="emoji1"
                          control={form.control}
                          render={({ field, fieldState: { error } }) => (
                              <EmojiInput field={field} error={error} />
                          )}
                      />
                  </div>

                  <div className="self-center pt-8">
                    <Plus className="h-8 w-8 text-muted-foreground" />
                  </div>

                  <div className="flex-1 space-y-2">
                      <Controller
                          name="emoji2"
                          control={form.control}
                          render={({ field, fieldState: { error } }) => (
                              <EmojiInput field={field} error={error} />
                          )}
                      />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                  disabled={isLoading}
                >
                  <Wand2 className="mr-2 h-5 w-5" />
                  {isLoading ? "Fusing..." : "Fuse Emojis"}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>

        <div
          className={cn(
            "transition-all duration-500 ease-in-out",
            (isLoading || result) && submittedData
              ? "opacity-100 max-h-[1000px]"
              : "opacity-0 max-h-0 overflow-hidden"
          )}
        >
          {(isLoading || result) && submittedData && (
            <Card className="shadow-lg animate-in fade-in-50">
              <CardHeader>
                <CardTitle className="font-headline text-2xl">
                  Your Creation
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleReset}
                  className="absolute top-3 right-3 text-muted-foreground hover:text-foreground h-8 w-8"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span className="sr-only">Start over</span>
                </Button>
              </CardHeader>
              <CardContent className="grid grid-cols-3 items-center justify-items-center gap-2 sm:gap-4">
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center justify-center h-20 w-20 animate-in fade-in zoom-in-50 duration-500">
                    {renderSubmittedItem(submittedData.emoji1)}
                  </div>
                  <span className="text-sm text-muted-foreground">Source 1</span>
                </div>
                <Plus className="h-8 w-8 text-muted-foreground" />
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center justify-center h-20 w-20 animate-in fade-in zoom-in-50 duration-500 delay-100">
                    {renderSubmittedItem(submittedData.emoji2)}
                  </div>
                  <span className="text-sm text-muted-foreground">Source 2</span>
                </div>
              </CardContent>
              <CardContent>
                <div className="relative flex flex-col items-center justify-center gap-4 p-6 bg-secondary rounded-lg">
                  <h3 className="text-lg font-medium text-foreground">
                    Fused Emoji
                  </h3>
                  {isLoading ? (
                    <Skeleton className="h-32 w-32 rounded-lg" />
                  ) : result?.fusedEmojiDataUri ? (
                    <Image
                      src={result.fusedEmojiDataUri}
                      alt="Fused Emoji"
                      width={128}
                      height={128}
                      className="rounded-lg object-contain animate-in fade-in zoom-in-75 duration-700"
                      unoptimized
                    />
                  ) : (
                    <div className="h-32 w-32 flex items-center justify-center bg-muted rounded-lg text-destructive text-sm p-4 text-center">
                      Generation Failed
                    </div>
                  )}
                </div>
              </CardContent>

              {!isLoading && result && (
                <CardFooter className="flex-col sm:flex-row gap-2 animate-in fade-in slide-in-from-bottom-5 duration-500">
                  <Button
                    onClick={handleDownload}
                    variant="outline"
                    className="w-full"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                  <Button onClick={handleShare} className="w-full">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                </CardFooter>
              )}
            </Card>
          )}
        </div>
      </div>
      <AlertDialog open={showLimitDialog} onOpenChange={setShowLimitDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <Clapperboard className="h-6 w-6 text-primary" />
                Daily Limit Reached
              </AlertDialogTitle>
              <AlertDialogDescription>
                You've used all your free emoji fusions for today. To create more, please watch a short ad.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <Button variant="outline" onClick={() => setShowLimitDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                setShowLimitDialog(false);
                setShowAd(true);
              }}>
                Watch Ad
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
    </>
  );
}
