import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

export function AdminTopbar() {
  return (
    <header className="h-14 shrink-0 flex items-center justify-between border-b border-blush bg-white px-4 sm:px-6 lg:px-8">
      <div className="lg:hidden w-10" />
      <div className="flex items-center gap-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-1 text-xs text-slate transition-colors hover:text-rose"
        >
          View Site
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-crimson">Jaweria Amer</p>
          <p className="text-xs text-slate-light">Administrator</p>
        </div>
        <Avatar className="w-8 h-8 bg-crimson text-white">
          <AvatarFallback className="bg-crimson text-white text-xs font-semibold">JA</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
