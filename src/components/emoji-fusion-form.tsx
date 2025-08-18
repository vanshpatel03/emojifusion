"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, Share2, Wand2, Plus, RefreshCw } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const emojiRegex = /^(\p{Emoji_Presentation}|\p{Extended_Pictographic})$/u;

const formSchema = z.object({
  emoji1: z.string().regex(emojiRegex, { message: "Single emoji" }),
  emoji2: z.string().regex(emojiRegex, { message: "Single emoji" }),
});

type FormValues = z.infer<typeof formSchema>;

export function EmojiFusionForm() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<GenerateEmojiFusionOutput | null>(null);
  const [submittedEmojis, setSubmittedEmojis] = useState<FormValues | null>(
    null
  );
  const { toast } = useToast();

  const isLoading = isPending;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      emoji1: "🚀",
      emoji2: "🐸",
    },
  });

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      setResult(null);
      setSubmittedEmojis(values);
      try {
        const fusionResult = await generateEmojiFusion(values);
        setResult(fusionResult);
      } catch (error) {
        console.error("Emoji fusion failed:", error);
        toast({
          title: "Oh no! Something went wrong.",
          description: "We couldn't generate your emoji. Please try again.",
          variant: "destructive",
        });
        setSubmittedEmojis(null);
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
            "Your browser doesn't support sharing. The image will be downloaded instead.",
        });
        handleDownload();
      }
    } catch (error) {
      console.error("Sharing failed:", error);
      toast({
        title: "Sharing failed",
        description:
          "An error occurred while trying to share. The image will be downloaded instead.",
        variant: "destructive",
      });
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
    setSubmittedEmojis(null);
    form.reset({
      emoji1: "🚀",
      emoji2: "🐸",
    });
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <Card className="overflow-hidden shadow-lg transition-all duration-300">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">
                Create your Emoji
              </CardTitle>
              <CardDescription>
                Pick two emojis to begin the fusion.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-start justify-center gap-4">
                <FormField
                  control={form.control}
                  name="emoji1"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="🚀"
                          maxLength={2}
                          className="text-4xl text-center h-20 p-0 bg-background border-2 border-dashed focus-visible:ring-primary"
                        />
                      </FormControl>
                      <FormMessage className="text-center text-xs" />
                    </FormItem>
                  )}
                />
                <div className="pt-6">
                  <Plus className="h-8 w-8 text-muted-foreground" />
                </div>
                <FormField
                  control={form.control}
                  name="emoji2"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="🐸"
                          maxLength={2}
                          className="text-4xl text-center h-20 p-0 bg-background border-2 border-dashed focus-visible:ring-primary"
                        />
                      </FormControl>
                      <FormMessage className="text-center text-xs" />
                    </FormItem>
                  )}
                />
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
          (isLoading || result) && submittedEmojis
            ? "opacity-100 max-h-[1000px]"
            : "opacity-0 max-h-0 overflow-hidden"
        )}
      >
        {(isLoading || result) && submittedEmojis && (
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
            <CardContent className="grid grid-cols-3 items-center justify-items-center gap-4">
              <div className="flex flex-col items-center gap-2">
                <div className="text-6xl animate-in fade-in zoom-in-50 duration-500">
                  {submittedEmojis?.emoji1}
                </div>
                <span className="text-sm text-muted-foreground">Source 1</span>
              </div>
              <Plus className="h-8 w-8 text-muted-foreground" />
              <div className="flex flex-col items-center gap-2">
                <div className="text-6xl animate-in fade-in zoom-in-50 duration-500 delay-100">
                  {submittedEmojis?.emoji2}
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
  );
}
