"use client";

import { Suspense, useActionState, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff, Lock } from "lucide-react";
import { resetPasswordAction } from "@/lib/admin/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ResetState = { error?: string } | null;

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";
  const [state, action, pending] = useActionState(resetPasswordAction, null as ResetState);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  if (!token) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-xl space-y-4 text-center">
        <p className="text-sm text-ink-muted">This reset link is missing a token. Request a new link from the sign-in page.</p>
        <Link
          href="/admin/forgot-password"
          className={cn(buttonVariants({ variant: "outline" }), "w-full justify-center")}
        >
          Request reset
        </Link>
        <p>
          <Link href="/admin/login" className="text-sm text-ink-muted hover:text-brand-accent">
            Back to sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="bg-white rounded-xl p-6 shadow-xl space-y-4">
      <input type="hidden" name="token" value={token} />

      {state?.error && (
        <div className="rounded-xl border border-brand/25 bg-brand-soft px-4 py-2.5 text-sm text-brand shadow-sm">
          {state.error}
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-sm font-medium text-ink">
          New password
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-light" />
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            required
            minLength={8}
            className="pl-10 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-light hover:text-brand-accent"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="confirm" className="text-sm font-medium text-ink">
          Confirm password
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-light" />
          <Input
            id="confirm"
            name="confirm"
            type={showConfirm ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Repeat password"
            required
            minLength={8}
            className="pl-10 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-light hover:text-brand-accent"
            aria-label={showConfirm ? "Hide password" : "Show password"}
          >
            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <Button type="submit" disabled={pending} className="w-full shadow-sm">
        {pending ? "Saving…" : "Update password"}
      </Button>

      <p className="text-center">
        <Link href="/admin/login" className="text-sm text-ink-muted hover:text-brand-accent">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-crimson flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-rose/20 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7 text-rose" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-white">Set new password</h1>
          <p className="text-white/50 text-sm mt-1">Choose a strong password for the admin portal.</p>
        </div>

        <Suspense
          fallback={
            <div className="bg-white rounded-xl p-6 shadow-xl text-center text-sm text-muted-foreground">Loading…</div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
