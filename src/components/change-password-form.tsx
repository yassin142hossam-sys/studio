"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { updatePassword } from "firebase/auth";
import { auth } from "@/lib/firebase-config";

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
import { useToast } from "@/hooks/use-toast";
import { LoaderCircle } from "lucide-react";
import { DialogFooter, DialogClose } from "@/components/ui/dialog";

const ChangePasswordSchema = z.object({
  newPassword: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match.",
  path: ["confirmPassword"],
});

type ChangePasswordFormData = z.infer<typeof ChangePasswordSchema>;

interface ChangePasswordFormProps {
  onPasswordChanged: () => void;
}

export function ChangePasswordForm({ onPasswordChanged }: ChangePasswordFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const handleChangePassword = async (data: ChangePasswordFormData) => {
    setIsLoading(true);
    const user = auth.currentUser;

    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to change your password.",
      });
      setIsLoading(false);
      return;
    }

    try {
      await updatePassword(user, data.newPassword);
      toast({
        title: "Success",
        description: "Your password has been updated successfully.",
      });
      onPasswordChanged();
    } catch (error: any) {
      console.error("Password update error:", error);
      toast({
        variant: "destructive",
        title: "Password Update Failed",
        description: "An error occurred. You may need to sign in again to update your password.",
      });
    }
    setIsLoading(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleChangePassword)} className="space-y-6">
        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="********" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm New Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="********" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="ghost">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
                {isLoading && <LoaderCircle className="animate-spin mr-2" />}
                Update Password
            </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
