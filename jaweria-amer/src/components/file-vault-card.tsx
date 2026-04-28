import { ArrowRight, FolderOpen } from "lucide-react";

const DRIVE_URL = "https://drive.google.com/drive/folders/1B3MN_5TiHfknp6Ao4BwlFRlmc89F1AHF";

export function FileVaultCard() {
  return (
    <a
      href={DRIVE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-2xl border border-[#fecdd3]/20 bg-gradient-to-br from-[#7f1d1d] via-[#9f1239] to-[#be123c] p-8 shadow-xl transition-all duration-300 ease-out hover:brightness-110 hover:scale-[1.02] hover:shadow-2xl sm:p-10 md:p-10"
    >
      <div className="flex flex-col justify-between gap-8 md:flex-row md:items-center md:gap-12">
        <div className="min-w-0 flex-1">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white transition-transform duration-300 group-hover:scale-110">
            <FolderOpen className="h-7 w-7" aria-hidden />
          </div>
          <p className="text-sm font-semibold uppercase tracking-wide text-white/60">
            Vault
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            File Vault
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base">
            Access all notes, solved papers, and exam resources in one place.
          </p>
        </div>
        <div className="shrink-0">
          <span className="inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-white px-6 py-3 text-base font-medium text-[#7f1d1d] transition-all duration-200 hover:bg-[#ffe4e6] hover:scale-[1.03] active:scale-[0.98] sm:w-auto">
            Open Full Vault
            <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
          </span>
        </div>
      </div>
    </a>
  );
}
