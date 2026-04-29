import { ArrowRight, FolderOpen } from "lucide-react";

const DRIVE_URL = "https://drive.google.com/drive/folders/1B3MN_5TiHfknp6Ao4BwlFRlmc89F1AHF";

export function FileVaultCard() {
  return (
    <a
      href={DRIVE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] p-8 shadow-sm transition-all duration-200 ease-out hover:border-[#cbd5f5] hover:scale-[1.02] hover:shadow-md sm:p-10 md:p-10"
    >
      <div className="flex flex-col justify-between gap-8 md:flex-row md:items-center md:gap-12">
        <div className="min-w-0 flex-1">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#e2e8f0] text-[#475569] transition-transform duration-300 group-hover:scale-110">
            <FolderOpen className="h-7 w-7" aria-hidden />
          </div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[#64748b]">
            Vault
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-[#1e293b]">
            File Vault
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#475569] sm:text-base">
            Access all notes, solved papers, and exam resources in one place.
          </p>
        </div>
        <div className="shrink-0">
          <span className="inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-[#1e293b] px-6 py-3 text-base font-medium text-white transition-all duration-200 hover:bg-[#334155] hover:scale-[1.03] active:scale-[0.98] sm:w-auto">
            Open Full Vault
            <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
          </span>
        </div>
      </div>
    </a>
  );
}
