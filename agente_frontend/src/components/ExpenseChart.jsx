import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { mes: 'Jan', gastos: 1200 },
  { mes: 'Fev', gastos: 800 },
  { mes: 'Mar', gastos: 1450 },
];

export default function ExpenseChart() {
  return (
    <div className="w-full max-w-2xl bg-white p-4 rounded-xl shadow-md">
      <h2 className="text-lg font-semibold mb-4">Gastos Mensais</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="mes" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="gastos" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
      </div>
  );
}
