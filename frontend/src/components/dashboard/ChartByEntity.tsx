import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { PorEntidade } from '@/types'
import { formatQuantidade } from '@/utils/formatNumber'

const COLORS = ['#1a5e8a', '#2b8bd4', '#54a5e8', '#8dc4f0', '#154d72', '#1a72b8']

interface ChartByEntityProps {
  data: PorEntidade[]
}

export function ChartByEntity({ data }: ChartByEntityProps) {
  const chartData = data.map((d) => ({
    name: d.entidade.length > 18 ? d.entidade.slice(0, 18) + '…' : d.entidade,
    value: Number(d.total),
  }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="45%"
          outerRadius={75}
          dataKey="value"
          label={false}
        >
          {chartData.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => [formatQuantidade(value as number), 'Total']}
          contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => <span style={{ fontSize: 11, color: '#475569' }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
