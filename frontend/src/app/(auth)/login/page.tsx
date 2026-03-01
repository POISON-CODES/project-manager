"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { authService } from "@/services/auth.service";
import { toast } from "sonner";

const loginSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        const error = searchParams.get("error");
        if (error) {
            setServerError(decodeURIComponent(error));
        }
    }, [searchParams]);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormValues) => {
        setIsLoading(true);
        setServerError(null);
        try {
            const response = await authService.login({
                email: data.email,
                password: data.password
            });

            console.log(` Auth Service Login Response: ${JSON.stringify(response)}`);

            if (response.user) {
                toast.success("Successfully signed in");
                router.push("/dashboard");
            }
        } catch (error: any) {
            console.error("Login failed", error);
            setServerError(error.message || "Login failed. Please check your credentials.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full bg-surface border-border shadow-xl">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold tracking-tight">Sign in</CardTitle>
                <CardDescription>
                    Enter your email and password to access your account
                </CardDescription>
            </CardHeader>
            <CardContent>
                {serverError && (
                    <div className="mb-4 flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-xs font-bold text-destructive animate-in fade-in slide-in-from-top-1">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <p>{serverError}</p>
                    </div>
                )}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Password</Label>
                        </div>
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
                    <Button className="w-full font-bold uppercase tracking-widest mt-4" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Sign In
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 text-center text-sm text-muted-foreground">
                <p className="text-center text-xs text-muted-foreground">
                    Don't have an account?{" "}
                    <button
                        onClick={() => router.push("/signup")}
                        className="underline underline-offset-4 hover:text-primary font-bold text-foreground"
                    >
                        Sign Up
                    </button>
                </p>
            </CardFooter>
        </Card>
    );
}
