import React from 'react';
import type { Ticket } from '../pages/Dashboard';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface MetricsViewProps {
  tickets: Ticket[];
}

export const MetricsDashboardView: React.FC<MetricsViewProps> = ({ tickets }) => {
  const total = tickets.length;
  const active = tickets.filter((t) => t.status === 'open' || t.status === 'in_progress').length;
  const urgent = tickets.filter((t) => t.priority === 'urgent').length;
  const enriched = tickets.filter((t) => t.enrichmentStatus === 'done').length;
  const pct = total > 0 ? Math.round((enriched / total) * 100) : 0;

  const pData = [
    { name: 'Urgente', count: tickets.filter((t) => t.priority === 'urgent').length, fill: '#FF3B5C' },
    { name: 'Alta', count: tickets.filter((t) => t.priority === 'high').length, fill: '#FFA726' },
    { name: 'Media', count: tickets.filter((t) => t.priority === 'medium').length, fill: '#00E5FF' },
    { name: 'Baja', count: tickets.filter((t) => t.priority === 'low').length, fill: '#C6FF00' },
  ];

  const cData = [
    { name: 'Técnica', value: tickets.filter((t) => t.category === 'technical').length, color: '#C6FF00' },
    { name: 'Facturación', value: tickets.filter((t) => t.category === 'billing').length, color: '#00E5FF' },
    { name: 'Cuenta', value: tickets.filter((t) => t.category === 'account').length, color: '#FFA726' },
    { name: 'Otro', value: tickets.filter((t) => !t.category || t.category === 'other').length, color: '#94A3B8' },
  ].filter((i) => i.value > 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="rounded-2xl border border-[#232F48] bg-[#161F30] p-6 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">Total Tickets</span>
          <div className="text-3xl font-black text-white mt-2">{total}</div>
        </div>
        <div className="rounded-2xl border border-[#232F48] bg-[#161F30] p-6 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">Activos</span>
          <div className="text-3xl font-black text-white mt-2">{active}</div>
        </div>
        <div className="rounded-2xl border border-[#232F48] bg-[#161F30] p-6 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">Urgentes</span>
          <div className="text-3xl font-black text-[#FF3B5C] mt-2">{urgent}</div>
        </div>
        <div className="rounded-2xl border border-[#232F48] bg-[#161F30] p-6 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">IA Enriquecidos</span>
          <div className="text-3xl font-black text-[#C6FF00] mt-2">{pct}%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-[#232F48] bg-[#161F30] p-6 shadow-sm">
          <h3 className="text-base font-bold text-white mb-6">Distribución por Prioridad</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0E1422', borderColor: '#232F48', borderRadius: '0.75rem', color: '#fff' }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {pData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-[#232F48] bg-[#161F30] p-6 shadow-sm">
          <h3 className="text-base font-bold text-white mb-6">Tickets por Categoría</h3>
          <div className="h-72 w-full flex items-center justify-center">
            {cData.length === 0 ? (
              <p className="text-sm text-[#94A3B8]">No hay datos.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip contentStyle={{ backgroundColor: '#0E1422', borderColor: '#232F48', borderRadius: '0.75rem', color: '#fff' }} />
                  <Pie data={cData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={4} dataKey="value">
                    {cData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricsDashboardView;

