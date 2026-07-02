import { SITE_TAGLINE } from "@/lib/site-sections";
import styles from "./site-footer.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <strong>academAI</strong> — {SITE_TAGLINE} · Learn · Practice · Prevent
    </footer>
  );
}
