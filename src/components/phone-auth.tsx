"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase-config";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

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

// Add a global declaration for window.recaptchaVerifier
declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

const phoneSchema = z.object({
  phone: z.string().min(10, "Please enter a valid phone number with country code."),
});

const codeSchema = z.object({
  code: z.string().min(6, "Verification code must be 6 digits.").max(6),
});

export function PhoneAuth() {
  const { toast } = useToast();
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [step, setStep] = useState<"phone" | "code">("phone");

  const phoneForm = useForm<z.infer<typeof phoneSchema>>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: "" },
  });

  const codeForm = useForm<z.infer<typeof codeSchema>>({
    resolver: zodResolver(codeSchema),
    defaultValues: { code: "" },
  });
  
  // Setup reCAPTCHA
  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        'size': 'invisible',
        'callback': () => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        }
      });
    }
  }, []);

  const onSendCode = async (data: z.infer<typeof phoneSchema>) => {
    setIsSendingCode(true);
    try {
      const verifier = window.recaptchaVerifier;
      const confirmationResult = await signInWithPhoneNumber(auth, data.phone, verifier);
      window.confirmationResult = confirmationResult;
      setStep("code");
      toast({ title: "Verification Code Sent", description: `A code has been sent to ${data.phone}` });
    } catch (error) {
      console.error("SMS not sent", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to send verification code. Please check the number and try again." });
    }
    setIsSendingCode(false);
  };

  const onVerifyCode = async (data: z.infer<typeof codeSchema>) => {
    setIsVerifyingCode(true);
    try {
      if(window.confirmationResult) {
        await window.confirmationResult.confirm(data.code);
        toast({ title: "Success!", description: "You are now signed in." });
        // The main component will handle the redirect via onAuthStateChanged
      } else {
        throw new Error("No confirmation result found.");
      }
    } catch (error) {
      console.error("Sign in error", error);
      toast({ variant: "destructive", title: "Verification Failed", description: "The code you entered is incorrect. Please try again." });
    }
    setIsVerifyingCode(false);
  };


  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{step === 'phone' ? 'Sign In with Phone' : 'Enter Verification Code'}</CardTitle>
        <CardDescription>
            {step === 'phone' 
                ? 'Please enter your phone number including the country code (e.g., +1...)' 
                : 'Check your SMS messages for the 6-digit code.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === 'phone' ? (
          <Form {...phoneForm}>
            <form onSubmit={phoneForm.handleSubmit(onSendCode)} className="space-y-6">
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
              <Button type="submit" className="w-full" disabled={isSendingCode}>
                {isSendingCode && <LoaderCircle className="animate-spin mr-2" />}
                Send Verification Code
              </Button>
            </form>
          </Form>
        ) : (
          <Form {...codeForm}>
            <form onSubmit={codeForm.handleSubmit(onVerifyCode)} className="space-y-6">
              <FormField
                control={codeForm.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>6-Digit Code</FormLabel>
                    <FormControl>
                      <Input placeholder="123456" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isVerifyingCode}>
                {isVerifyingCode && <LoaderCircle className="animate-spin mr-2" />}
                Verify and Sign In
              </Button>
               <Button variant="link" onClick={() => setStep('phone')} className="w-full">
                Use a different phone number
              </Button>
            </form>
          </Form>
        )}
        <div id="recaptcha-container" className="mt-4"></div>
      </CardContent>
    </Card>
  );
}
