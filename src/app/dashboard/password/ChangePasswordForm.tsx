"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { type ActionResult, changePassword } from "@/lib/actions/change-password";
import {
    Eye,
    EyeOff,
    KeyRound,
    Loader2,
    ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

// -- Password strength --------------------------------------------------------

function getStrength(password: string) {
    if (!password) return { score: 0, label: "", color: "" };
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 2) return { score, label: "Weak", color: "bg-red-500" };
    if (score <= 4) return { score, label: "Fair", color: "bg-yellow-500" };
    if (score <= 5) return { score, label: "Good", color: "bg-blue-500" };
    return { score, label: "Strong", color: "bg-emerald-500" };
}

// -- Types --------------------------------------------------------------------

interface PasswordInputProps {
    id: string;
    name: string;
    placeholder: string;
    autoComplete: string;
    onChange?: (value: string) => void;
}

// -- PasswordInput ------------------------------------------------------------

function PasswordInput({ id, name, placeholder, autoComplete, onChange }: PasswordInputProps) {
    const [show, setShow] = useState(false);
    const { pending } = useFormStatus();

    return (
        <div className="relative">
            <Input
                id={id}
                name={name}
                type={show ? "text" : "password"}
                placeholder={placeholder}
                autoComplete={autoComplete}
                className="pr-10"
                disabled={pending}
                onChange={(e) => onChange?.(e.target.value)}
            />
            <button
                type="button"
                onClick={() => setShow((s) => !s)}
                disabled={pending}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                aria-label={show ? "Hide password" : "Show password"}
            >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
        </div>
    );
}

// -- Requirements -------------------------------------------------------------

const requirements = [
    { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
    { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
    { label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
    { label: "One number", test: (p: string) => /[0-9]/.test(p) },
    { label: "One special character", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
] as const;

// -- SubmitButton (separate component so useFormStatus works) -----------------

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full gap-2" disabled={pending}>
            {pending ? (
                <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating...
                </>
            ) : (
                <>
                    <KeyRound className="h-4 w-4" />
                    Update Password
                </>
            )}
        </Button>
    );
}

// -- Main component -----------------------------------------------------------

export default function ChangePasswordForm() {
    const [newPassword, setNewPassword] = useState("");

    const [state, formAction] = useFormState<ActionResult | null, FormData>(
        changePassword,
        null
    );

    const fieldErrors =
        state && typeof state.errors === "object"
            ? (state.errors as Record<string, string[]>)
            : {};

    const globalError =
        state && typeof state.errors === "string" ? state.errors : null;

    return (
        <Card className="w-full max-w-lg shadow-lg border-border/60">
            <CardHeader className="space-y-1 pb-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                        <CardTitle className="text-xl">Change Password</CardTitle>
                        <CardDescription className="text-sm">
                            Keep your account secure with a strong password.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <form action={formAction}>
                <CardContent className="space-y-5">
                    {globalError && (
                        <Alert variant="destructive">
                            <AlertDescription>{globalError}</AlertDescription>
                        </Alert>
                    )}

                    {/* Current password */}
                    <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <PasswordInput
                            id="currentPassword"
                            name="currentPassword"
                            placeholder="Enter current password"
                            autoComplete="current-password"
                        />
                        {fieldErrors.currentPassword && (
                            <p className="text-xs text-destructive">
                                {fieldErrors.currentPassword[0]}
                            </p>
                        )}
                    </div>

                    {/* New password + strength meter */}
                    <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <PasswordInput
                            id="newPassword"
                            name="newPassword"
                            placeholder="Enter new password"
                            autoComplete="new-password"
                            onChange={setNewPassword}
                        />
                        {fieldErrors.newPassword && (
                            <p className="text-xs text-destructive">
                                {fieldErrors.newPassword[0]}
                            </p>
                        )}

                        {newPassword && (
                            <div className="space-y-2 pt-1">
                                <div className="flex items-center gap-2">
                                    <div className="flex flex-1 gap-1">
                                        {[1, 2, 3, 4, 5, 6].map((i) => (
                                            <div
                                                key={i}
                                                className={cn(
                                                    "h-1 flex-1 rounded-full transition-all duration-300",
                                                    i <= getStrength(newPassword).score
                                                        ? getStrength(newPassword).color
                                                        : "bg-muted"
                                                )}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-xs font-medium text-muted-foreground w-12 text-right">
                                        {getStrength(newPassword).label}
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 gap-1">
                                    {requirements.map((req) => {
                                        const met = req.test(newPassword);
                                        return (
                                            <div key={req.label} className="flex items-center gap-2">
                                                <div
                                                    className={cn(
                                                        "h-1.5 w-1.5 rounded-full transition-colors",
                                                        met ? "bg-emerald-500" : "bg-muted-foreground/40"
                                                    )}
                                                />
                                                <span
                                                    className={cn(
                                                        "text-xs transition-colors",
                                                        met
                                                            ? "text-emerald-600 dark:text-emerald-400"
                                                            : "text-muted-foreground"
                                                    )}
                                                >
                                                    {req.label}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Confirm password */}
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <PasswordInput
                            id="confirmPassword"
                            name="confirmPassword"
                            placeholder="Confirm new password"
                            autoComplete="new-password"
                        />
                        {fieldErrors.confirmPassword && (
                            <p className="text-xs text-destructive">
                                {fieldErrors.confirmPassword[0]}
                            </p>
                        )}
                    </div>
                </CardContent>

                <CardFooter className="pt-2">
                    <SubmitButton />
                </CardFooter>
            </form>
        </Card>
    );
}