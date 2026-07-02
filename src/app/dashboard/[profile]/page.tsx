import { Under14Dashboard } from "@/components/dashboard/Under14Dashboard";
import { StudentsDashboard } from "@/components/dashboard/StudentsDashboard";
import { ElderlyDashboard } from "@/components/dashboard/ElderlyDashboard";
import type { AudienceProfile } from "@/types/profiles";
import { notFound } from "next/navigation";

const VALID: AudienceProfile[] = ["under-14", "students-lecturers", "elderly"];

interface DashboardPageProps {
  params: Promise<{ profile: string }>;
}

export async function generateStaticParams() {
  return VALID.map((profile) => ({ profile }));
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { profile } = await params;

  if (!VALID.includes(profile as AudienceProfile)) {
    notFound();
  }

  const p = profile as AudienceProfile;

  return (
    <>
      {p === "under-14" && <Under14Dashboard />}
      {p === "students-lecturers" && <StudentsDashboard />}
      {p === "elderly" && <ElderlyDashboard />}
    </>
  );
}
