export function formatQuantidade(value: number | null | undefined, sigla?: string): string {
  if (value === null || value === undefined) return '—'
  const formatted = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  }).format(value)
  return sigla ? `${formatted} ${sigla}` : formatted
}

export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`
}
