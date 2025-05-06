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
      className="text-gray-300 hover:text-blue-400 transition"
    >
      {icon}
    </button>
  );
}

export default function Layout({ username, onLogout, navegarPara, paginaAtual, children }) {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col items-center">
      {/* Top bar com ícones de texto em vez de ícones svg */}
      <div className="w-full bg-gray-800 shadow-md p-3 flex justify-center gap-8 sticky top-0 z-10">
        <button
          title={username ? `Usuário: ${username}` : "Perfil"}
          className="text-gray-300 hover:text-blue-400 transition flex items-center"
        >
          <span className="material-icons">person</span>
        </button>
        
        <button
          title="Gastos"
          className="text-gray-300 hover:text-blue-400 transition flex items-center"
          onClick={() => navegarPara('home')}
        >
          <span className="material-icons">receipt_long</span>
        </button>
        
        <button
          title="Relatórios"
          className="text-gray-300 hover:text-blue-400 transition flex items-center"
        >
          <span className="material-icons">bar_chart</span>
        </button>
        
        <button
          onClick={() => navegarPara('config')}
          title="Configurações"
          className={`text-gray-300 hover:text-blue-400 transition flex items-center ${
            paginaAtual === 'config' ? 'text-blue-400' : ''
          }`}
        >
          <span className="material-icons">settings</span>
        </button>
        
        <button
          onClick={onLogout}
          title="Sair"
          className="text-gray-300 hover:text-blue-400 transition flex items-center"
        >
          <span className="material-icons">logout</span>
        </button>
      </div>

      {/* Logo e Título */}
      <div className="flex items-center justify-center mt-8 mb-6">
        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mr-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-white">Agente</h1>
      </div>

      {/* Conteúdo centralizado */}
      <main className="w-full flex-1 flex justify-center px-4">
        {children}
      </main>
    </div>
  );
}