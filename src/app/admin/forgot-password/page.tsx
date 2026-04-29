"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { toast } from "sonner";
import { requestPasswordResetAction } from "@/lib/admin/actions";
import { contact } from "@/lib/contact";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type ForgotState = { error?: string; success?: true } | null;

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState(requestPasswordResetAction, null as ForgotState);

  useEffect(() => {
    if (state?.success) {
      toast.success("If that email is the admin account, a reset link was sent. Check your inbox.", {
        id: "admin-forgot-password-sent",
      });
    }
  }, [state]);

  return (
    <div className="min-h-screen bg-crimson flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-serif text-2xl font-bold text-white">Forgot password</h1>
          <p className="text-white/50 text-sm mt-1">We will email a reset link if the address matches the admin account.</p>
        </div>

        <form action={action} className="bg-white rounded-xl p-6 shadow-xl space-y-4">
          {state?.error && (
            <div className="rounded-xl border border-brand/25 bg-brand-soft px-4 py-2.5 text-sm text-brand shadow-sm">
              {state.error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium text-ink">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-light" />
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder={contact.email}
                required
                className="pl-10"
              />
            </div>
          </div>

          <Button type="submit" disabled={pending} className="w-full shadow-sm">
            {pending ? "Sending…" : "Send reset link"}
          </Button>

          <p className="text-center">
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-brand-accent"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
