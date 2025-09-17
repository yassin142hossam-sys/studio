"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  type User,
} from "firebase/auth";
import { auth } from "@/lib/firebase-config";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AuthSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long." }),
});

type AuthFormData = z.infer<typeof AuthSchema>;

interface EmailPasswordAuthProps {
  onLoginSuccess: (user: User) => void;
}

export function EmailPasswordAuth({ onLoginSuccess }: EmailPasswordAuthProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<AuthFormData>({
    resolver: zodResolver(AuthSchema),
    defaultValues: { email: "", password: "" },
  });

  const handleAuth = async (data: AuthFormData, isSignUp: boolean) => {
    setIsLoading(true);
    try {
      let userCredential;
      if (isSignUp) {
        userCredential = await createUserWithEmailAndPassword(
          auth,
          data.email,
          data.password
        );
        toast({
          title: "Account Created!",
          description: "You have been successfully signed up and logged in.",
        });
      } else {
        userCredential = await signInWithEmailAndPassword(
          auth,
          data.email,
          data.password
        );
        toast({
          title: "Signed In",
          description: "You have successfully signed in.",
        });
      }
      onLoginSuccess(userCredential.user);
    } catch (error: any) {
      console.error("Authentication error:", error);
      let description = "An unexpected error occurred. Please try again.";
      if (error.code === "auth/email-already-in-use") {
        description = "This email is already in use. Please try signing in.";
      } else if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        description = "Invalid email or password. Please try again.";
      } else if (error.code === 'auth/invalid-credential') {
        description = "Invalid email or password. Please try again.";
      }
      toast({
        variant: "destructive",
        title: isSignUp ? "Sign Up Failed" : "Sign In Failed",
        description,
      });
    }
    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
        <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
                <CardHeader>
                    <CardTitle>Sign In</CardTitle>
                    <CardDescription>
                        Enter your credentials to access your account.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit((data) => handleAuth(data, false))} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                    <Input placeholder="teacher@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                    <Input type="password" placeholder="********" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading && <LoaderCircle className="animate-spin mr-2" />}
                                Sign In
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </TabsContent>
            <TabsContent value="signup">
            <CardHeader>
                    <CardTitle>Sign Up</CardTitle>
                    <CardDescription>
                       Create a new shared account for your team.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit((data) => handleAuth(data, true))} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                    <Input placeholder="teacher@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                    <Input type="password" placeholder="********" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading && <LoaderCircle className="animate-spin mr-2" />}
                                Create Account
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </TabsContent>
        </Tabs>
    </Card>
  );
}
