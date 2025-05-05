import React, { useState } from 'react';

export default function ExpenseForm({ onAddExpense }) {
  const [categoria, setCategoria] = useState('');
  const [valor, setValor] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!categoria || !valor) return;
    onAddExpense({ categoria, valor: parseFloat(valor) });
    setCategoria('');
    setValor('');
  };

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col sm:flex-row gap-4">
      <input
        type="text"
        placeholder="Categoria"
        value={categoria}
        onChange={(e) => setCategoria(e.target.value)}
        className="p-2 border rounded-md flex-1"
      />
      <input
        type="number"
        placeholder="Valor"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        className="p-2 border rounded-md flex-1"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
      >
        Adicionar Gasto
      </button>
    </form>
  );
}