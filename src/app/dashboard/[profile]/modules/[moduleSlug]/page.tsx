import { notFound } from "next/navigation";
import { getModule, isScriptModule } from "@/lib/modules";
import { getScript } from "@/lib/scripts";
import { isScamModule } from "@/lib/spot-the-scam";
import type { AudienceProfile } from "@/types/profiles";
import { EngagementProvider } from "@/components/shared/EngagementProvider";
import { ModuleRunner } from "@/components/learning/ModuleRunner";
import { ElderlyScriptRunner } from "@/components/learning/ElderlyScriptRunner";
import { SpotTheScamRunner } from "@/components/learning/spot-the-scam/SpotTheScamRunner";

interface ModulePageProps {
  params: Promise<{ profile: AudienceProfile; moduleSlug: string }>;
}

export default async function ModulePage({ params }: ModulePageProps) {
  const { profile, moduleSlug } = await params;

  if (isScamModule(moduleSlug)) {
    return (
      <div data-module="spot-the-scam" className="scam-theme">
        <EngagementProvider moduleId="spot-the-scam">
          <SpotTheScamRunner profile={profile} />
        </EngagementProvider>
      </div>
    );
  }

  if (isScriptModule(moduleSlug)) {
    const script = getScript(moduleSlug);
    if (!script) notFound();

    return (
      <EngagementProvider moduleId={script.moduleId}>
        <ElderlyScriptRunner script={script} profile={profile} />
      </EngagementProvider>
    );
  }

  const module = getModule(moduleSlug);
  if (!module) notFound();

  return (
    <EngagementProvider moduleId={module.id}>
      <ModuleRunner module={module} profile={profile} />
    </EngagementProvider>
  );
}
