"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const linkClassName =
  "rounded-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50";

type HomeSectionLinkProps = {
  anchorId: string;
  children: React.ReactNode;
  className?: string;
  onNavigate?: () => void;
};

export function HomeSectionLink({
  anchorId,
  children,
  className = "",
  onNavigate,
}: HomeSectionLinkProps) {
  const pathname = usePathname();
  const href = `/#${anchorId}`;

  return (
    <Link
      href={href}
      className={`${linkClassName} ${className}`.trim()}
      onClick={(event) => {
        if (pathname === "/") {
          event.preventDefault();
          document.getElementById(anchorId)?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
          window.history.pushState(null, "", href);
        }
        onNavigate?.();
      }}
    >
      {children}
    </Link>
  );
}

export { linkClassName as siteLinkClassName };
