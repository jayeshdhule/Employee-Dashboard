import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardHeader, CardTitle } from '../ui/Card';
import type { AttendanceRecord } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface AttendanceChartProps {
  records: AttendanceRecord[];
}

export function AttendanceChart({ records }: AttendanceChartProps) {
  const { isDark } = useTheme();

  const weeklyData = records.slice(-7).map((r) => ({
    date: r.date.slice(5),
    hours: r.hoursWorked ?? 0,
  }));

  const tooltipStyle = {
    backgroundColor: isDark ? '#1e293b' : '#fff',
    border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
    borderRadius: '8px',
    fontSize: '12px',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Hours</CardTitle>
      </CardHeader>
      <div className="w-full min-h-[220px] sm:min-h-[260px]">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={weeklyData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
            <XAxis
              dataKey="date"
              tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11 }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={50}
            />
            <YAxis tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="hours" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Hours" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
