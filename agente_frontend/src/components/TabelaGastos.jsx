const gastos = [
    { categoria: 'Transporte', valor: 450 },
    { categoria: 'Comida', valor: 780 },
    { categoria: 'Viagem', valor: 1200 },
  ];
  
  export default function TabelaGastos({ gastos }) {
    return (
      <table>
        <thead>
          <tr><th>Categoria</th><th>Valor</th></tr>
        </thead>
        <tbody>
          {gastos.map((g, i) => (
            <tr key={i}>
              <td>{g.categoria}</td>
              <td>R$ {g.valor.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }