import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ROLE_LABELS } from '../../utils/constants'

const COLORS = {
  ADMIN: '#A78BFA',
  NORMAL_USER: '#35C6E8',
  STORE_OWNER: '#F4B860',
}

export default function RoleChart({ usersByRole }) {
  const data = Object.entries(ROLE_LABELS).map(([role, label]) => ({
    role,
    label,
    count: usersByRole?.[role] || 0,
    fill: COLORS[role],
  }))

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barSize={36}>
          <CartesianGrid stroke="#2A2D3F" vertical={false} />
          <XAxis dataKey="label" stroke="#9295A9" tickLine={false} axisLine={false} />
          <YAxis allowDecimals={false} stroke="#9295A9" tickLine={false} axisLine={false} width={32} />
          <Tooltip
            cursor={{ fill: 'rgba(255,255,255,0.03)' }}
            contentStyle={{
              background: '#1D2031',
              border: '1px solid #2A2D3F',
              borderRadius: 12,
              color: '#F5F5FA',
            }}
            formatter={(value) => [value, 'Users']}
          />
          <Bar dataKey="count" radius={[8, 8, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.role} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
