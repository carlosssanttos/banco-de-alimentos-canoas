import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { TopDoador } from '@/types'
import { formatQuantidade } from '@/utils/formatNumber'

interface ChartTopDonorsProps {
  data: TopDoador[]
}

export function ChartTopDonors({ data }: ChartTopDonorsProps) {
  const top5 = [...data].slice(0, 5).map((d) => ({
    parceiro: d.parceiro.length > 20 ? d.parceiro.slice(0, 20) + '…' : d.parceiro,
    total: Number(d.total),
  }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={top5} layout="vertical" margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={(v) => formatQuantidade(v as number)} />
        <YAxis dataKey="parceiro" type="category" tick={{ fontSize: 11, fill: '#475569' }} tickLine={false} axisLine={false} width={120} />
        <Tooltip
          formatter={(value) => [formatQuantidade(value as number), 'Total doado']}
          contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
        />
        <Bar dataKey="total" fill="#2b8bd4" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
