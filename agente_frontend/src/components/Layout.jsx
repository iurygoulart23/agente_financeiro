import {
    ArrowLeftOnRectangleIcon,
    ChartBarIcon,
    ClipboardDocumentListIcon,
    Cog6ToothIcon,
    UserCircleIcon
  } from "@heroicons/react/24/outline";
  
  export default function Layout({ username, onLogout, children }) {
    return (
      <div className="min-h-screen flex bg-gray-100 text-gray-800">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-md flex flex-col justify-between">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-blue-600 mb-8">💸 Agente</h1>
            <nav className="space-y-4">
            <MenuItem icon={<UserCircleIcon />} label={`Olá, ${username}`} />
              <MenuItem icon={<ClipboardDocumentListIcon className="h-5 w-5" />} label="Gastos" />
              <MenuItem icon={<ChartBarIcon className="h-5 w-5" />} label="Relatórios" />
              <MenuItem icon={<Cog6ToothIcon className="h-5 w-5" />} label="Configurações" />
            </nav>
          </div>
  
          <div className="p-6 border-t">
            <button
              onClick={onLogout}
              className="flex items-center gap-2 text-red-600 hover:text-red-800 transition text-sm"
            >
              <ArrowLeftOnRectangleIcon className="h-5 w-5" />
              Sair
            </button>
          </div>
        </aside>
  
        {/* Conteúdo principal */}
        <main className="flex-1 p-8">
          <div className="bg-white rounded-lg shadow p-6 space-y-6">
            {children}
          </div>
        </main>
      </div>
    );
  }
  
  function MenuItem({ icon, label }) {
    return (
      <div className="flex items-center gap-3 text-gray-700 hover:text-blue-600 cursor-pointer transition text-sm">
        <div className="h-5 w-5 text-gray-500">
          {icon}
        </div>
        <span className="font-medium">{label}</span>
      </div>
    );
  }
  