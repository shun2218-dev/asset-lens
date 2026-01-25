"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Loader2, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { updateProfile } from "@/app/actions/user/update";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  type ProfileFormValues,
  profileSchema,
} from "@/lib/validators";

interface ProfileFormProps {
  initialData: {
    name: string;
    image?: string | null;
  };
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(
    initialData.image ?? null,
  );

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: initialData.name,
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("ファイルサイズは5MB以下にしてください");
        return;
      }
      const url = URL.createObjectURL(file);
      setPreviewImage(url);
      form.setValue("image", file); // Set file object to form state
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      if (data.image instanceof File) {
        formData.append("image", data.image);
      }

      const result = await updateProfile(formData);

      if (result.success) {
        toast.success("プロフィールを更新しました");
        router.refresh();
      } else {
        toast.error(result.error ?? "更新に失敗しました");
      }
    } catch (error) {
      toast.error("予期せぬエラーが発生しました");
      console.error(error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex flex-col items-center gap-4">
          <div className="relative group">
            <Avatar className="h-24 w-24 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <AvatarImage src={previewImage ?? ""} alt="Profile" className="object-cover" />
              <AvatarFallback>
                <User className="h-12 w-12 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
            <div 
              className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="h-6 w-6" />
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            プロフィール画像をクリックして変更
          </p>
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>名前</FormLabel>
              <FormControl>
                <Input placeholder="名前を入力" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            更新する
          </Button>
        </div>
      </form>
    </Form>
  );
}
