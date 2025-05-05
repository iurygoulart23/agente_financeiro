import {
  ArrowLeftOnRectangleIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  UserCircleIcon
} from "@heroicons/react/24/outline";

function MenuItem({ icon, onClick, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="text-gray-600 hover:text-blue-600 transition"
    >
      {icon}
    </button>
  );
}

export default function Layout({ username, onLogout, children }) {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 flex flex-col items-center">

      {/* Top bar com ícones */}
      <div className="w-full bg-white shadow-md p-3 flex justify-center gap-6 sticky top-0 z-10">
        <MenuItem icon={<UserCircleIcon className="h-6 w-6" />} title={`Olá, ${username}`} />
        <MenuItem icon={<ClipboardDocumentListIcon className="h-6 w-6" />} title="Gastos" />
        <MenuItem icon={<ChartBarIcon className="h-6 w-6" />} title="Relatórios" />
        <MenuItem icon={<Cog6ToothIcon className="h-6 w-6" />} title="Configurações" />
        <MenuItem icon={<ArrowLeftOnRectangleIcon className="h-6 w-6" />} title="Sair" onClick={onLogout} />
      </div>

      {/* Título abaixo da barra de ícones */}
      <div className="text-center mt-4 mb-2 w-full max-w-5xl px-4">
        <h1 className="text-2xl font-bold text-blue-600">💸 Agente</h1>
      </div>

      {/* Conteúdo centralizado */}
      <main className="w-full flex justify-center items-start">
        <div className="w-full max-w-4xl px-4 sm:px-6 md:px-8 lg:px-12">{children}</div>
      </main>
    </div>
  );
}
