import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

// Dados de exemplo - estes podem ser substituídos pelos dados reais da aplicação
const dadosExemplo = [
  { mes: 'Jan', gastos: 1200 },
  { mes: 'Fev', gastos: 800 },
  { mes: 'Mar', gastos: 1450 },
  { mes: 'Abr', gastos: 1100 },
  { mes: 'Mai', gastos: 950 },
];

export default function ExpenseChart({ gastos = [] }) {
  // Use os dados de exemplo enquanto não houver dados reais
  const dadosParaExibir = gastos.length > 0 
    ? gastos.map(g => ({ categoria: g.categoria, gastos: g.valor }))
    : dadosExemplo;

  return (
    <div className="w-full">
      <h2 className="text-lg font-semibold mb-4">Resumo de Gastos</h2>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={dadosParaExibir} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey={gastos.length > 0 ? "categoria" : "mes"} 
            label={{ value: gastos.length > 0 ? "Categoria" : "Mês", position: "insideBottom", offset: -5 }} 
          />
          <YAxis 
            label={{ value: 'R$', angle: -90, position: 'insideLeft' }} 
          />
          <Tooltip formatter={(value) => [`R$ ${value.toFixed(2)}`, 'Valor']} />
          <Legend />
          <Bar 
            dataKey="gastos" 
            name="Valor" 
            fill="#8884d8" 
            radius={[4, 4, 0, 0]} 
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}