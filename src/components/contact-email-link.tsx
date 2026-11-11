import { contact } from "@/lib/contact";
import { cn } from "@/lib/utils";

const variants = {
  default:
    "text-crimson underline underline-offset-4 transition-colors duration-200 hover:text-crimson-dark",
  onDark:
    "text-paper/80 underline decoration-paper/30 underline-offset-4 transition-colors duration-200 hover:text-paper hover:decoration-paper",
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
