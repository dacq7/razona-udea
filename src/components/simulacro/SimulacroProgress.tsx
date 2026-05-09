interface Props {
  actual: number
  total: number
}

export function SimulacroProgress({ actual, total }: Props) {
  return (
    <p className="text-xs font-medium text-muted-foreground">
      Pregunta {actual} de {total}
    </p>
  )
}
