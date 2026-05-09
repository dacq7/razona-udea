import { MarkStageAsCompleted } from "@/components/ejercicios/MarkStageAsCompleted"

export function MarkAsReadButton({ slug }: { slug: string }) {
  return <MarkStageAsCompleted slug={slug} etapa="teoria" />
}
