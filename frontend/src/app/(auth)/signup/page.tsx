"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, AlertCircle, Eye, EyeOff, ChevronRight, ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { authService } from "@/services/auth.service";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const signupSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    countryCode: z.string().min(1, "Country code is required"),
    phoneNumber: z.string().regex(/^\d{10,15}$/, "Phone number must be 10-15 digits"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof signupSchema>;

const COUNTRY_CODES = ["+1", "+44", "+91", "+61", "+81", "+49", "+33", "+86"];

export default function SignupPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const [step, setStep] = useState<1 | 2>(1);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
        register,
        handleSubmit,
        trigger,
        setValue,
        formState: { errors },
    } = useForm<SignupFormValues>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            countryCode: "+1",
        },
    });

    const handleNextStep = async () => {
        const isValid = await trigger(["name", "email", "countryCode", "phoneNumber"]);
        if (isValid) {
            setStep(2);
        }
    };

    const handlePrevStep = () => {
        setStep(1);
    };

    const onSubmit = async (data: SignupFormValues) => {
        // Double check step validation just in case
        if (step === 1) {
            await handleNextStep();
            return;
        }

        setIsLoading(true);
        setServerError(null);
        try {
            const { user } = await authService.signup({
                email: data.email,
                password: data.password,
                name: data.name,
                phoneNumber: data.phoneNumber,
                countryCode: data.countryCode
            });

            console.log("Signup response:", user);

            if (user) {
                toast.success("Account created successfully!");
                router.push("/"); // Redirect to dashboard
            } else {
                // If no user returned but no error, it means email verification is required
                toast.success("Account created! Please check your email for verification.");
                router.push("/login?message=" + encodeURIComponent("Account created! Please check your email."));
            }
        } catch (error: any) {
            console.error("Signup failed", error);
            setServerError(error.message || "Signup failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full bg-surface border-border shadow-xl overflow-hidden">
            <CardHeader className="space-y-1 relative">
                {step === 2 && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handlePrevStep}
                        className="absolute left-4 top-4 h-8 w-8 text-muted-foreground hover:text-foreground"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                )}
                <CardTitle className="text-2xl font-bold tracking-tight text-center">Create Account</CardTitle>
                <CardDescription className="text-center">
                    {step === 1 ? "Start with your contact details" : "Secure your account"}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {serverError && (
                    <div className="mb-4 flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-xs font-bold text-destructive animate-in fade-in slide-in-from-top-1">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <p>{serverError}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="overflow-hidden">
                    <div
                        className={cn(
                            "flex w-[200%] transition-transform duration-500 ease-in-out",
                            step === 2 ? "-translate-x-1/2" : "translate-x-0"
                        )}
                    >
                        {/* Step 1: Contact Info */}
                        <div className="w-1/2 space-y-4 px-1">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    placeholder="John Doe"
                                    className="bg-background border-border"
                                    {...register("name")}
                                />
                                {errors.name && (
                                    <p className="text-[10px] font-black uppercase text-destructive tracking-widest mt-1">
                                        {errors.name.message}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-4 gap-2">
                                <div className="col-span-1 space-y-2">
                                    <Label>Code</Label>
                                    <Select
                                        onValueChange={(val) => setValue("countryCode", val)}
                                        defaultValue="+1"
                                    >
                                        <SelectTrigger className="bg-background border-border">
                                            <SelectValue placeholder="+1" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {COUNTRY_CODES.map((code) => (
                                                <SelectItem key={code} value={code}>
                                                    {code}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="col-span-3 space-y-2">
                                    <Label htmlFor="phoneNumber">Phone Number</Label>
                                    <Input
                                        id="phoneNumber"
                                        placeholder="1234567890"
                                        type="tel"
                                        className="bg-background border-border"
                                        {...register("phoneNumber")}
                                    />
                                    {errors.phoneNumber && (
                                        <p className="text-[10px] font-black uppercase text-destructive tracking-widest mt-1">
                                            {errors.phoneNumber.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    placeholder="name@example.com"
                                    type="email"
                                    className="bg-background border-border"
                                    {...register("email")}
                                />
                                {errors.email && (
                                    <p className="text-[10px] font-black uppercase text-destructive tracking-widest mt-1">
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Step 2: Security */}
                        <div className="w-1/2 space-y-4 px-1">
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        className="bg-background border-border pr-10"
                                        {...register("password")}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                        )}
                                    </Button>
                                </div>
                                {errors.password && (
                                    <p className="text-[10px] font-black uppercase text-destructive tracking-widest mt-1">
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <div className="relative">
                                    <Input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        className="bg-background border-border pr-10"
                                        {...register("confirmPassword")}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                        )}
                                    </Button>
                                </div>
                                {errors.confirmPassword && (
                                    <p className="text-[10px] font-black uppercase text-destructive tracking-widest mt-1">
                                        {errors.confirmPassword.message}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <Button
                        type="button"
                        className="w-full font-bold uppercase tracking-widest mt-6"
                        disabled={isLoading}
                        onClick={step === 1 ? handleNextStep : handleSubmit(onSubmit)}
                    >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {step === 1 ? "Next" : "Sign Up"}
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 text-center text-sm text-muted-foreground">
                <p className="text-center text-xs text-muted-foreground">
                    Already have an account?{" "}
                    <button
                        onClick={() => router.push("/login")}
                        className="underline underline-offset-4 hover:text-primary font-bold text-foreground"
                    >
                        Sign In
                    </button>
                </p>
            </CardFooter>
        </Card>
    );
}
