export default function TabelaGastos({ gastos = [] }) {
  if (gastos.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4">
        Nenhum gasto registrado ainda.
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="text-left p-3 border-b">Categoria</th>
            <th className="text-right p-3 border-b">Valor</th>
          </tr>
        </thead>
        <tbody>
          {gastos.map((gasto, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="p-3 border-b">{gasto.categoria}</td>
              <td className="p-3 border-b text-right">
                R$ {gasto.valor.toFixed(2)}
              </td>
            </tr>
          ))}
          <tr className="bg-gray-100 font-semibold">
            <td className="p-3">Total</td>
            <td className="p-3 text-right">
              R$ {gastos.reduce((total, gasto) => total + gasto.valor, 0).toFixed(2)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}