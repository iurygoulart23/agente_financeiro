import React, { useState } from 'react';

export default function ExpenseForm({ onAdd }) {
  const [categoria, setCategoria] = useState('');
  const [valor, setValor] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!categoria || !valor) return;
    onAdd({ categoria, valor: parseFloat(valor) });
    setCategoria('');
    setValor('');
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto flex flex-col sm:flex-row gap-4 items-center">
      <input
        type="text"
        placeholder="Categoria"
        value={categoria}
        onChange={(e) => setCategoria(e.target.value)}
        className="flex-1 p-2 border rounded-md"
      />
      <input
        type="number"
        placeholder="Valor"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        className="flex-1 p-2 border rounded-md"
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
