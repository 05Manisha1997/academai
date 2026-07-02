import Image from "next/image";

import Link from "next/link";

import { notFound } from "next/navigation";

import { DashboardResourceShell } from "@/components/layout/DashboardResourceShell";
import { PROFILE_LABELS, type AudienceProfile } from "@/types/profiles";

import styles from "@/components/layout/profile-shell.module.css";



const VALID: AudienceProfile[] = ["under-14", "students-lecturers", "elderly"];



interface ProfileLayoutProps {

  children: React.ReactNode;

  params: Promise<{ profile: string }>;

}



export default async function ProfileLayout({

  children,

  params,

}: ProfileLayoutProps) {

  const { profile } = await params;



  if (!VALID.includes(profile as AudienceProfile)) {

    notFound();

  }



  const p = profile as AudienceProfile;



  return (

    <div className={styles.profileShell} data-profile={p}>

      <header className={styles.header}>

        <div className={styles.brand}>

          <Link href="/" className={styles.logoLink}>

            <Image

              src="/brand/academai-logo.png"

              alt="academAI"

              width={200}
              height={60}

              className={styles.logo}

            />

          </Link>

          <span className={styles.profileLabel}>{PROFILE_LABELS[p]}</span>

        </div>

        <nav className={styles.nav} aria-label="Dashboard navigation">

          <Link href="/learn" className={styles.navLink}>

            Learn

          </Link>

          <Link href="/practice" className={styles.navLink}>

            Practice

          </Link>

          <Link href="/prevent" className={styles.navLink}>

            Prevent

          </Link>

          <Link href={`/dashboard/${p}`} className={styles.navLink}>

            Dashboard

          </Link>

        </nav>

      </header>

      <DashboardResourceShell>
        <div className={styles.main}>{children}</div>
      </DashboardResourceShell>

    </div>

  );

}


