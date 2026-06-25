import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { RecebidoPorMes } from '@/types'
import { formatMonthYear } from '@/utils/formatDate'
import { formatQuantidade as fq } from '@/utils/formatNumber'

interface ChartReceivedProps {
  data: RecebidoPorMes[]
}

export function ChartReceived({ data }: ChartReceivedProps) {
  const chartData = data.map((d) => ({
    mes: formatMonthYear(d.mes),
    quantidade: Number(d.quantidade),
  }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={(v) => fq(v as number)} width={50} />
        <Tooltip
          formatter={(value) => [fq(value as number), 'Quantidade']}
          contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
        />
        <Bar dataKey="quantidade" fill="#1a5e8a" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
