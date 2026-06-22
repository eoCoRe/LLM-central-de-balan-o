/** Formata um valor em milhares de reais com separadores no padrão pt-BR (ex.: 148533 → "148.533"). */
export function formatThousandsValue(valueInThousands: number): string {
  return new Intl.NumberFormat('pt-BR').format(valueInThousands)
}
