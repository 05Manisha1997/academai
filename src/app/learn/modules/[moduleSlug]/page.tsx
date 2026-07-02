import { notFound } from "next/navigation";
import { EngagementProvider } from "@/components/shared/EngagementProvider";
import { ModuleRunner } from "@/components/learning/ModuleRunner";
import { ElderlyScriptRunner } from "@/components/learning/ElderlyScriptRunner";
import { getModule, isScriptModule } from "@/lib/modules";
import { getScript } from "@/lib/scripts";
import styles from "../../learn.module.css";

interface LearnModulePageProps {
  params: Promise<{ moduleSlug: string }>;
}

export default async function LearnModulePage({ params }: LearnModulePageProps) {
  const { moduleSlug } = await params;

  return (
    <div className={styles.page}>
      {isScriptModule(moduleSlug) ? (
        <ScriptModule slug={moduleSlug} />
      ) : (
        <StandardModule slug={moduleSlug} />
      )}
    </div>
  );
}

function ScriptModule({ slug }: { slug: string }) {
  const script = getScript(slug);
  if (!script) notFound();

  return (
    <EngagementProvider moduleId={script.moduleId}>
      <ElderlyScriptRunner script={script} profile="students-lecturers" />
    </EngagementProvider>
  );
}

function StandardModule({ slug }: { slug: string }) {
  const module = getModule(slug);
  if (!module) notFound();

  return (
    <EngagementProvider moduleId={module.id}>
      <ModuleRunner module={module} profile="students-lecturers" />
    </EngagementProvider>
  );
}
