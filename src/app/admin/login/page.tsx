"use client";

import { useActionState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Lock, Mail, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { loginAction } from "@/lib/admin/actions";
import { contact } from "@/lib/contact";
import { siteConfig } from "@/lib/data";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

function PasswordResetToast() {
  const searchParams = useSearchParams();
  useEffect(() => {
    if (searchParams.get("reset") === "1") {
      toast.success("Password updated. Sign in with your new password.", { id: "admin-password-reset-done" });
    }
  }, [searchParams]);
  return null;
}

export default function LoginPage() {
  const [state, action, pending] = useActionState(loginAction, null);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-crimson flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-rose/20 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7 text-rose" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-white">Admin Portal</h1>
          <p className="mx-auto mt-1 text-sm text-white/50">{siteConfig.name}</p>
        </div>

        <form action={action} className="bg-white rounded-xl p-6 shadow-xl space-y-4">
          {state?.error && (
            <div className="rounded-xl border border-brand/25 bg-brand-soft px-4 py-2.5 text-sm text-brand shadow-sm">
              {state.error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium text-ink">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-light" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder={contact.email}
                required
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm font-medium text-ink">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-light" />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                required
                className="pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-light hover:text-brand-accent"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex justify-end -mt-1">
            <Link
              href="/admin/forgot-password"
              className="text-xs font-medium text-ink-muted hover:text-brand-accent underline-offset-2 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <Button type="submit" disabled={pending} className="w-full shadow-sm">
            {pending ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <Suspense fallback={null}>
          <PasswordResetToast />
        </Suspense>

        <p className="text-center text-white/30 text-xs mt-6">
          Protected admin area. Unauthorized access is prohibited.
        </p>
      </div>
    </div>
  );
}
