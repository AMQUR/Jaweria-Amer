import { contact } from "@/lib/contact";
import { cn } from "@/lib/utils";

const variants = {
  default:
    "text-[#0B1D3A] hover:text-[#c62839] transition-colors duration-200 hover:underline underline-offset-4",
  onDark:
    "text-white/75 hover:text-[#c62839] transition-colors duration-200 hover:underline underline-offset-4",
};

type ContactEmailLinkProps = {
  variant?: keyof typeof variants;
  className?: string;
};

/**
 * Clickable public contact email (single source: {@link contact.email}).
 */
export function ContactEmailLink({ variant = "default", className }: ContactEmailLinkProps) {
  return (
    <a
      href={`mailto:${contact.email}`}
      className={cn(variants[variant], className)}
    >
      {contact.email}
    </a>
  );
}
