import { ArrowRight, FolderOpen } from "lucide-react";

import { CARD_BASE, CARD_BUTTON, CARD_CONTENT, CARD_HOVER } from "@/components/resource-card-system";

const DRIVE_URL = "https://drive.google.com/drive/folders/1B3MN_5TiHfknp6Ao4BwlFRlmc89F1AHF";

export function FileVaultCard() {
  return (
    <a
      href={DRIVE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`${CARD_BASE} ${CARD_HOVER} group flex-col gap-5 bg-gradient-to-r from-slate-50 to-slate-100 text-slate-900 border border-slate-200 sm:flex-row sm:gap-6`}
    >
      <div className="min-w-0 flex-1 self-stretch sm:self-auto">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/70 text-slate-900 transition-transform duration-300 group-hover:scale-105">
          <FolderOpen className="h-6 w-6" aria-hidden />
        </div>
        <div className={CARD_CONTENT}>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
            Vault
          </p>
          <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">
            File Vault
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-slate-700 sm:text-base">
            Access all notes, solved papers, and exam resources in one place.
          </p>
        </div>
      </div>
      <span className={`${CARD_BUTTON} w-full shrink-0 justify-center bg-slate-900 text-white hover:bg-slate-800 sm:w-auto`}>
        Open Full Vault
        <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
      </span>
    </a>
  );
}
