"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { db } from "@/lib/firebase-config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import type { TeacherAccount } from "@/lib/types";

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

// A simple (non-cryptographic) hash function for the access code
const simpleHash = async (text: string) => {
    const buffer = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const PhoneSchema = z.object({
  phone: z.string().min(10, "Please enter a valid phone number."),
});

const CodeSchema = z.object({
  code: z.string().length(4, "Access code must be 4 digits."),
});

type Step = "phone" | "enter_code" | "create_code";

interface CustomAuthProps {
    onLoginSuccess: (account: TeacherAccount) => void;
}

export function CustomAuth({ onLoginSuccess }: CustomAuthProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<Step>("phone");
  const [phoneNumber, setPhoneNumber] = useState("");

  const phoneForm = useForm<z.infer<typeof PhoneSchema>>({
    resolver: zodResolver(PhoneSchema),
    defaultValues: { phone: "" },
  });

  const codeForm = useForm<z.infer<typeof CodeSchema>>({
    resolver: zodResolver(CodeSchema),
    defaultValues: { code: "" },
  });

  const resetToPhoneStep = () => {
    setStep('phone');
    phoneForm.reset({ phone: '' });
    codeForm.reset({ code: '' });
    setPhoneNumber('');
  }

  const onCheckPhone = async (data: z.infer<typeof PhoneSchema>) => {
    setIsLoading(true);
    try {
      const teacherDocRef = doc(db, "teachers", data.phone);
      const docSnap = await getDoc(teacherDocRef);

      setPhoneNumber(data.phone);
      codeForm.reset({ code: '' }); // Clear code field before moving to next step

      if (docSnap.exists()) {
        setStep("enter_code");
      } else {
        setStep("create_code");
      }
    } catch (error) {
      console.error("Error checking phone number:", error);
      toast({ variant: "destructive", title: "Error", description: "An error occurred. Please try again." });
    }
    setIsLoading(false);
  };

  const onVerifyCode = async (data: z.infer<typeof CodeSchema>) => {
    setIsLoading(true);
    try {
        const teacherDocRef = doc(db, "teachers", phoneNumber);
        const docSnap = await getDoc(teacherDocRef);

        if(!docSnap.exists()) {
            throw new Error("Account not found during verification.");
        }
        
        const account = { id: docSnap.id, ...docSnap.data() } as TeacherAccount;
        const enteredCodeHash = await simpleHash(data.code);

        if (enteredCodeHash === account.accessCodeHash) {
            toast({ title: "Success!", description: "You are now signed in." });
            onLoginSuccess(account);
        } else {
            codeForm.setError("code", { type: "manual", message: "The access code is incorrect." });
            toast({ variant: "destructive", title: "Incorrect Code", description: "The access code is incorrect. Please try again." });
        }

    } catch (error) {
        console.error("Sign in error", error);
        toast({ variant: "destructive", title: "Verification Failed", description: "An error occurred during verification." });
    }
    setIsLoading(false);
  };

  const onCreateCode = async (data: z.infer<typeof CodeSchema>) => {
    setIsLoading(true);
    try {
        const accessCodeHash = await simpleHash(data.code);
        const newAccountData = { accessCodeHash: accessCodeHash };

        await setDoc(doc(db, "teachers", phoneNumber), newAccountData);
        
        const newAccount: TeacherAccount = {
            id: phoneNumber,
            ...newAccountData
        };
        
        toast({ title: "Account Created!", description: "You are now signed in." });
        onLoginSuccess(newAccount);

    } catch (error) {
        console.error("Account creation error", error);
        toast({ variant: "destructive", title: "Creation Failed", description: "Could not create the account." });
    }
    setIsLoading(false);
  };

  const renderStep = () => {
    switch (step) {
      case "phone":
        return (
          <>
            <CardHeader>
              <CardTitle>Sign In or Sign Up</CardTitle>
              <CardDescription>Enter your phone number to begin.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...phoneForm}>
                <form onSubmit={phoneForm.handleSubmit(onCheckPhone)} className="space-y-6">
                  <FormField
                    control={phoneForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 555 123 4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <LoaderCircle className="animate-spin mr-2" />}
                    Continue
                  </Button>
                </form>
              </Form>
            </CardContent>
          </>
        );
      case "enter_code":
        return (
            <>
              <CardHeader>
                <CardTitle>Enter Access Code</CardTitle>
                <CardDescription>Enter the 4-digit code for {phoneNumber}.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...codeForm}>
                  <form onSubmit={codeForm.handleSubmit(onVerifyCode)} className="space-y-6">
                    <FormField
                      control={codeForm.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>4-Digit Code</FormLabel>
                          <FormControl>
                            <Input type="text" inputMode="numeric" maxLength={4} placeholder="1234" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading && <LoaderCircle className="animate-spin mr-2" />}
                      Sign In
                    </Button>
                    <Button variant="link" onClick={resetToPhoneStep} className="w-full">
                        Use a different number
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </>
          );
      case "create_code":
        return (
            <>
              <CardHeader>
                <CardTitle>Create an Access Code</CardTitle>
                <CardDescription>Create a 4-digit code for your new account ({phoneNumber}). Your assistants will use this code to log in.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...codeForm}>
                  <form onSubmit={codeForm.handleSubmit(onCreateCode)} className="space-y-6">
                    <FormField
                      control={codeForm.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New 4-Digit Code</FormLabel>
                          <FormControl>
                            <Input type="text" inputMode="numeric" maxLength={4} placeholder="e.g., 1234" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading && <LoaderCircle className="animate-spin mr-2" />}
                      Create Account and Sign In
                    </Button>
                     <Button variant="link" onClick={resetToPhoneStep} className="w-full">
                        Use a different number
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </>
          );
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      {renderStep()}
    </Card>
  );
}
