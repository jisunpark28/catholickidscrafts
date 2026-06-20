import { HomeHubButtonLink } from "@/components/HomeHubButton";

type Props = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "outline";
  className?: string;
};

/** @deprecated Use HomeHubButtonLink — kept as alias for admin/docs references. */
export function HomeNavPill({ href, children, variant = "outline", className = "" }: Props) {
  return (
    <HomeHubButtonLink href={href} variant={variant} className={className}>
      {children}
    </HomeHubButtonLink>
  );
}
