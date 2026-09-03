import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Kanban, LogOut, Search, Plus, Menu, X } from 'lucide-react';
import CustomSelect from './CustomSelect';
import logo from '../assets/logo.png';


interface AppLayoutProps {
  children: React.ReactNode;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  categoryFilter: string;
  onCategoryChange: (c: string) => void;
  priorityFilter: string;
  onPriorityChange: (p: string) => void;
  onOpenCreate: () => void;
  activeTab: 'kanban' | 'metrics';
  onTabChange: (tab: 'kanban' | 'metrics') => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  priorityFilter,
  onPriorityChange,
  onOpenCreate,
  activeTab,
  onTabChange,
}) => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const categoryOptions = [
    { value: 'technical', label: 'Técnica' },
    { value: 'billing', label: 'Facturación' },
    { value: 'account', label: 'Cuenta' },
    { value: 'other', label: 'Otro' },
  ];

  const priorityOptions = [
    { value: 'urgent', label: 'Urgente' },
    { value: 'high', label: 'Alta' },
    { value: 'medium', label: 'Media' },
    { value: 'low', label: 'Baja' },
  ];

  const sidebarContent = (
    <>
      <div className="flex h-16 items-center justify-between px-6 border-b border-[#232F48]">
        <div className="flex items-center space-x-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#161F30] border border-[#232F48]">
            <img src={logo} alt="Crazy Imagine Logo" className="h-6 w-6 object-contain" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white">Crazy Imagine</h1>
            <p className="text-xs text-[#94A3B8]">SupportHub</p>
          </div>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="lg:hidden rounded-lg p-1.5 text-[#94A3B8] hover:bg-[#161F30] hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-2 px-4 py-6">
        <div className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]">
          Principal
        </div>
        <button
          onClick={() => {
            onTabChange('kanban');
            setIsMobileMenuOpen(false);
          }}
          className={`w-full flex items-center space-x-3 rounded-xl px-3.5 py-2.5 text-sm font-medium border transition-colors ${
            activeTab === 'kanban'
              ? 'bg-[#161F30] text-[#C6FF00] border-[#C6FF00]/40 shadow-sm'
              : 'text-[#94A3B8] border-transparent hover:bg-[#161F30]/50 hover:text-white'
          }`}
        >
          <Kanban className={`h-4 w-4 ${activeTab === 'kanban' ? 'text-[#C6FF00]' : 'text-[#94A3B8]'}`} />
          <span>Tablero Kanban</span>
        </button>
        
        <button
          onClick={() => {
            onTabChange('metrics');
            setIsMobileMenuOpen(false);
          }}
          className={`w-full flex items-center space-x-3 rounded-xl px-3.5 py-2.5 text-sm font-medium border transition-colors ${
            activeTab === 'metrics'
              ? 'bg-[#161F30] text-[#C6FF00] border-[#C6FF00]/40 shadow-sm'
              : 'text-[#94A3B8] border-transparent hover:bg-[#161F30]/50 hover:text-white'
          }`}
        >
          <LayoutDashboard className={`h-4 w-4 ${activeTab === 'metrics' ? 'text-[#C6FF00]' : 'text-[#94A3B8]'}`} />
          <span>Dashboard / Métricas</span>
        </button>
      </nav>

      <div className="border-t border-[#232F48] p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#161F30] border border-[#232F48] text-[#C6FF00] font-bold text-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="truncate text-sm font-medium text-white">{user?.name || 'Usuario'}</p>
              <span className="inline-flex items-center rounded-md bg-[#161F30] px-2 py-0.5 text-[10px] font-semibold text-[#00E5FF] border border-[#232F48]">
                {user?.role ? user.role.toUpperCase() : 'AGENT'}
              </span>
            </div>
          </div>
          <button onClick={logout} title="Salir" className="rounded-lg p-2 text-[#94A3B8] hover:bg-[#161F30] hover:text-[#FF3B5C]">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0B0F19] text-white">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-[#232F48] bg-[#0E1422] select-none shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar / Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsMobileMenuOpen(false)}
          />
          {/* Drawer Panel */}
          <aside className="relative flex w-64 flex-col border-r border-[#232F48] bg-[#0E1422] select-none z-10 h-full shadow-2xl">
            {sidebarContent}
          </aside>
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-[#232F48] bg-[#0E1422] px-4 lg:px-6">
          <div className="flex items-center space-x-3 flex-1 max-w-xl">
            {/* Hamburger menu button for small and medium screens */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden rounded-xl p-2 text-[#94A3B8] hover:bg-[#161F30] hover:text-white border border-[#232F48]"
              title="Abrir menú"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar tickets..."
                className="w-full rounded-xl border border-[#232F48] bg-[#161F30] pl-10 pr-4 py-2 text-sm text-white placeholder-[#94A3B8] focus:border-[#C6FF00] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <CustomSelect
              value={categoryFilter}
              onChange={onCategoryChange}
              options={categoryOptions}
              placeholder="Categorías"
              className="w-36 hidden sm:block"
            />

            <CustomSelect
              value={priorityFilter}
              onChange={onPriorityChange}
              options={priorityOptions}
              placeholder="Prioridades"
              className="w-36 hidden sm:block"
            />

            <button
              onClick={onOpenCreate}
              className="inline-flex items-center rounded-xl bg-[#C6FF00] px-4 py-2 text-sm font-bold text-[#0B0F19] hover:bg-[#b0e000]"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              <span className="hidden sm:inline">Nuevo Ticket</span>
              <span className="sm:hidden">Nuevo</span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-x-auto overflow-y-auto bg-[#0B0F19] p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
