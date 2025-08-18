"use client";

import { useState, useTransition, useRef, useEffect } from "react";
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
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Download,
  Share2,
  Wand2,
  Plus,
  RefreshCw,
  Image as ImageIcon,
  Smile,
  UploadCloud,
  Clapperboard,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

const emojiRegex = /^(\p{Emoji_Presentation}|\p{Extended_Pictographic})$/u;
const dataUriRegex = /^data:image\/(png|jpeg|gif);base64,/;

const formSchema = z.object({
  emoji1: z.string().min(1, "Required"),
  emoji2: z.string().min(1, "Required"),
});

type FormValues = z.infer<typeof formSchema>;
type InputType = "emoji" | "image";

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

const ImageInput = ({
  field,
  error,
}: {
  field: any;
  error: any;
}) => {
  const [preview, setPreview] = useState<string | null>(field.value || null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setPreview(dataUri);
        field.onChange(dataUri);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full">
      <Label
        htmlFor={field.name}
        className={cn(
          "cursor-pointer flex flex-col items-center justify-center w-full h-32 sm:h-36 border-2 border-dashed rounded-lg transition-colors",
          "hover:border-primary hover:bg-accent/50",
          error && "border-destructive"
        )}
      >
        {preview ? (
          <Image
            src={preview}
            alt="Uploaded image"
            width={100}
            height={100}
            className="object-contain h-full w-full p-2"
          />
        ) : (
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
            <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
            <p className="mb-1 text-sm text-muted-foreground">
              <span className="font-semibold">Click to upload</span>
            </p>
            <p className="text-xs text-muted-foreground/80">PNG, JPG, or GIF</p>
          </div>
        )}
      </Label>
      <Input
        id={field.name}
        ref={inputRef}
        type="file"
        className="hidden"
        accept="image/png, image/jpeg, image/gif"
        onChange={handleFileChange}
      />
      {error && (
        <p className="text-center text-xs text-destructive mt-1">
          An image upload is required.
        </p>
      )}
    </div>
  );
};

export function EmojiFusionForm() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<GenerateEmojiFusionOutput | null>(null);
  const [submittedData, setSubmittedData] = useState<FormValues | null>(null);
  const [inputType1, setInputType1] = useState<InputType>("emoji");
  const [inputType2, setInputType2] = useState<InputType>("emoji");
  const [usageCount, setUsageCount] = useState(0);
  const [showLimitDialog, setShowLimitDialog] = useState(false);
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
    
    // Custom validation
    let hasError = false;
    if (inputType1 === 'emoji' && !values.emoji1.match(emojiRegex)) {
      form.setError('emoji1', { type: 'manual', message: 'Invalid emoji' });
      hasError = true;
    }
    if (inputType1 === 'image' && !values.emoji1.match(dataUriRegex)) {
        form.setError('emoji1', { type: 'manual', message: 'Image required' });
        hasError = true;
    }
    if (inputType2 === 'emoji' && !values.emoji2.match(emojiRegex)) {
      form.setError('emoji2', { type: 'manual', message: 'Invalid emoji' });
      hasError = true;
    }
    if (inputType2 === 'image' && !values.emoji2.match(dataUriRegex)) {
        form.setError('emoji2', { type: 'manual', message: 'Image required' });
        hasError = true;
    }

    if(hasError) {
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
    setInputType1("emoji");
    setInputType2("emoji");
    form.reset({ emoji1: "🚀", emoji2: "🐸" });
  };
  
  const renderSubmittedItem = (item: string) => {
    if (item.startsWith("data:image/")) {
      return (
        <Image
          src={item}
          alt="Submitted item"
          width={64}
          height={64}
          className="object-contain"
        />
      );
    }
    return <div className="text-6xl">{item}</div>;
  };

  const renderInput = (
    name: "emoji1" | "emoji2",
    inputType: InputType
  ) => {
    return (
      <Controller
        name={name}
        control={form.control}
        render={({ field, fieldState: { error } }) => (
          <>
            {inputType === "emoji" ? (
              <EmojiInput field={field} error={error} />
            ) : (
              <ImageInput field={field} error={error} />
            )}
          </>
        )}
      />
    );
  };
  
  const createToggle = (inputType: InputType, setInputType: (type: InputType) => void, fieldName: 'emoji1' | 'emoji2') => (
    <div className="flex bg-muted p-1 rounded-lg">
      <Button
        type="button"
        onClick={() => {
          setInputType("emoji");
          form.resetField(fieldName, { defaultValue: '👍' });
          form.clearErrors(fieldName);
        }}
        variant={inputType === "emoji" ? "secondary" : "ghost"}
        className="flex-1 shadow-sm data-[variant=secondary]:bg-background"
        size="sm"
      >
        <Smile className="mr-2 h-4 w-4" /> Emoji
      </Button>
      <Button
        type="button"
        onClick={() => {
          setInputType("image");
          form.resetField(fieldName, { defaultValue: "" });
          form.clearErrors(fieldName);
        }}
        variant={inputType === "image" ? "secondary" : "ghost"}
        className="flex-1 shadow-sm data-[variant=secondary]:bg-background"
        size="sm"
      >
        <ImageIcon className="mr-2 h-4 w-4" /> Image
      </Button>
    </div>
  );

  return (
    <>
    <div className="w-full max-w-lg space-y-6">
      <Card className="overflow-hidden shadow-lg transition-all duration-300">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">
                Create your Emoji
              </CardTitle>
              <CardDescription>
                Pick two emojis, or upload your own images to fuse. You have {Math.max(0, DAILY_LIMIT - usageCount)} fusions left today.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-stretch justify-center gap-4">
                <div className="flex-1 space-y-2">
                  {createToggle(inputType1, setInputType1, 'emoji1')}
                  {renderInput("emoji1", inputType1)}
                </div>

                <div className="self-center pt-12 sm:pt-16">
                  <Plus className="h-8 w-8 text-muted-foreground" />
                </div>

                <div className="flex-1 space-y-2">
                  {createToggle(inputType2, setInputType2, 'emoji2')}
                  {renderInput("emoji2", inputType2)}
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
              toast({ title: "Sorry!", description: "Ad functionality is not implemented yet." });
              setShowLimitDialog(false);
            }}>
              Watch Ad
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

    