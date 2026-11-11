import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from 'recharts';
import type { ChartPoint } from '../types';

interface ProgressChartProps {
  title: string;
  kind: 'line' | 'bar';
  data: ChartPoint[];
  unit: string;
  labelHeading: string;
}

const AXIS = { fill: 'var(--muted)', fontSize: 12 };

export default function ProgressChart({ title, kind, data, unit, labelHeading }: ProgressChartProps) {
  const format = (value: number) => `${value.toLocaleString('pt-BR')} ${unit}`;

  function renderTooltip({ active, payload, label }: TooltipContentProps) {
    if (!active || !payload?.length) return null;
    return (
      <div className="chart-tooltip">
        <span className="muted">{label}</span>
        <strong>{format(Number(payload[0].value))}</strong>
      </div>
    );
  }

  const axes = (
    <>
      <CartesianGrid vertical={false} stroke="var(--line)" />
      <XAxis dataKey="label" tick={AXIS} tickLine={false} axisLine={{ stroke: 'var(--line)' }} minTickGap={16} />
      <YAxis
        tick={AXIS}
        tickLine={false}
        axisLine={false}
        width={52}
        tickFormatter={(value: number) => value.toLocaleString('pt-BR')}
      />
    </>
  );

  return (
    <section className="panel chart-card">
      <h2>{title}</h2>
      <div className="chart-area">
        <ResponsiveContainer width="100%" height="100%">
          {kind === 'line' ? (
            <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
              {axes}
              <Tooltip content={renderTooltip} cursor={{ stroke: 'var(--muted)', strokeDasharray: '3 3' }} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="var(--chart)"
                strokeWidth={2}
                dot={{ r: 4, fill: 'var(--chart)', stroke: 'var(--surface)', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: 'var(--chart)', stroke: 'var(--surface)', strokeWidth: 2 }}
                isAnimationActive={false}
              />
            </LineChart>
          ) : (
            <BarChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
              {axes}
              <Tooltip content={renderTooltip} cursor={{ fill: 'var(--surface-2)' }} />
              <Bar dataKey="value" fill="var(--chart)" radius={[4, 4, 0, 0]} maxBarSize={32} isAnimationActive={false} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
      <details className="chart-table">
        <summary>Ver dados em tabela</summary>
        <table>
          <thead>
            <tr>
              <th scope="col">{labelHeading}</th>
              <th scope="col">Valor</th>
            </tr>
          </thead>
          <tbody>
            {data.map((point) => (
              <tr key={point.label}>
                <td>{point.label}</td>
                <td>{format(point.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </section>
  );
}
