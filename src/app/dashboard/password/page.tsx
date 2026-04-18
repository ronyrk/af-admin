"use client";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// ✅ Lazy-load the heavy form bundle; SSR disabled because it uses useActionState
const ChangePasswordForm = dynamic(
    () => import("./ChangePasswordForm"),
    { ssr: false }
);

export default function Page() {
    return (
        <div className="flex justify-center items-center min-h-screen p-4">
            {/* ✅ Show a spinner while the client bundle loads */}
            <Suspense
                fallback={
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                }
            >
                <ChangePasswordForm />
            </Suspense>
        </div>
    );
}