import Image from "next/image";
import Link from "next/link";
import { SITE_TAGLINE } from "@/lib/site-sections";
import styles from "./site-header.module.css";

export type SiteSection = "home" | "learn" | "practice" | "prevent";

interface SiteHeaderProps {
  active?: SiteSection;
}

const NAV: { id: SiteSection; label: string; href: string }[] = [
  { id: "learn", label: "Learn", href: "/learn" },
  { id: "practice", label: "Practice", href: "/practice" },
  { id: "prevent", label: "Prevent", href: "/prevent" },
];

export function SiteHeader({ active = "home" }: SiteHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <Link href="/" className={styles.logoLink} aria-label="academAI home">
            <Image
              src="/brand/academai-logo.png"
              alt="academAI"
              width={240}
              height={72}
              className={styles.logo}
              priority
            />
          </Link>
          <span className={styles.tagline}>{SITE_TAGLINE}</span>
        </div>
        <nav className={styles.nav} aria-label="Main">
          {NAV.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={`${styles.navLink} ${active === item.id ? styles.navLinkActive : ""}`}
              aria-current={active === item.id ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
          <Link href="/support" className={styles.navLink}>
            Support
          </Link>
        </nav>
      </div>
    </header>
  );
}
