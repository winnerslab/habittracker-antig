"use client"

import Link, { LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface NavLinkInfoProps extends Omit<LinkProps, "className" | "href"> {
  className?: string;
  activeClassName?: string;
  children?: React.ReactNode;
  to: string; // Compatibility with legacy prop
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkInfoProps>(
  ({ className, activeClassName, to, ...props }, ref) => {
    const pathname = usePathname();
    const isActive = pathname === to;

    return (
      <Link
        ref={ref}
        href={to}
        className={cn(className, isActive && activeClassName)}
        {...props}
      />
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };
