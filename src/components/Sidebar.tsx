import React from 'react';
import {
  Home, Utensils, Users, Scale, Calendar, Users2, BookOpen, Smartphone,
  LogOut, ChevronLeft, ChevronRight, X
} from 'lucide-react';
import type { Profile } from '../types/database';

interface SidebarProps {
  currentView: string;
  onSelectView: (view: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  currentUser: Profile | null;
  onLogout: () => void;
  realtimeConnected: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  currentUser,
  onLogout,
  realtimeConnected
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'diet-builder', label: 'Plano Alimentar', icon: Utensils },
    { id: 'patients', label: 'Pacientes', icon: Users },
    { id: 'anthro', label: 'Antropometria', icon: Scale },
    { id: 'appointments', label: 'Consultas', icon: Calendar },
    { id: 'users', label: 'Usuários & Níveis', icon: Users2 },
    { id: 'recipes', label: 'Receitas & Compras', icon: BookOpen },
    { id: 'patient-app', label: 'App do Paciente', icon: Smartphone },
  ];

  const handleItemClick = (id: string) => {
    onSelectView(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Backdrop para mobile quando a barra lateral estiver aberta */}
      {isMobileOpen && (
        <div className="sidebar-mobile-backdrop" onClick={onCloseMobile} />
      )}

      <aside className={`nutricore-sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
        {/* Topo da Sidebar: Brand e Botão de Recolher */}
        <div className="sidebar-header">
          <div className="sidebar-brand" onClick={() => handleItemClick('dashboard')}>
            <svg width="32" height="32" viewBox="0 0 200 200" style={{ flexShrink: 0 }}>
              <path fill="#00D285" d="m86.55,181.66v-67.23c0-4.42,2.36-8.5,6.18-10.71l58.23-33.62c3.33-1.92,7.34-2.17,10.85-.74-.44-.34-.91-.66-1.4-.94l-58.23-33.62c-3.83-2.21-8.54-2.21-12.36,0l-58.23,33.62c-3.83,2.21-6.18,6.29-6.18,10.71v67.23c0,4.42,2.36,8.5,6.18,10.71l58.23,33.62c.49.28,1,.53,1.52.74-2.99-2.32-4.78-5.91-4.78-9.76Z"/>
              <circle cx="130" cy="32" r="24" fill="#00D285"/>
            </svg>
            {!isCollapsed && (
              <span className="brand-text">nutri<span>core</span></span>
            )}
          </div>

          {/* Botão recolher no desktop */}
          <button
            className="sidebar-collapse-btn desktop-only"
            onClick={onToggleCollapse}
            title={isCollapsed ? "Expandir Menu" : "Recolher Menu"}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>

          {/* Botão fechar no mobile */}
          <button
            className="sidebar-close-mobile-btn mobile-only"
            onClick={onCloseMobile}
            title="Fechar Menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Lista de Navegação Principal */}
        <nav className="sidebar-nav">
          <ul className="sidebar-nav-list">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <li key={item.id}>
                  <button
                    className={`sidebar-nav-link ${isActive ? 'active' : ''}`}
                    onClick={() => handleItemClick(item.id)}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <div className="sidebar-icon-wrapper">
                      <Icon size={19} />
                    </div>
                    {!isCollapsed && <span className="sidebar-link-text">{item.label}</span>}
                    {isActive && <div className="sidebar-active-indicator" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Rodapé da Sidebar: Usuário Conectado e Logout */}
        <div className="sidebar-footer">
          {/* Status Realtime */}
          <div className={`sidebar-realtime-badge ${realtimeConnected ? 'online' : 'connecting'}`} title={realtimeConnected ? 'Supabase Realtime Ativo' : 'Conectando ao Banco...'}>
            <span className={`pulse-dot ${realtimeConnected ? 'online' : 'connecting'}`}></span>
            {!isCollapsed && (
              <span className="realtime-badge-label">
                {realtimeConnected ? 'Supabase Realtime' : 'Conectando...'}
              </span>
            )}
          </div>

          {/* Card do Usuário */}
          <div className="sidebar-user-card" title={currentUser?.name || "Usuário"}>
            <img
              src={currentUser?.avatar_url || "https://images.unsplash.com/photo-1594824813589-3221b659c256?auto=format&fit=crop&w=200&q=80"}
              alt={currentUser?.name || "Usuário"}
              className="sidebar-user-avatar"
            />
            {!isCollapsed && (
              <div className="sidebar-user-info">
                <span className="sidebar-user-name">{currentUser?.name || "Dra. Camila"}</span>
                <span className="sidebar-user-role">{currentUser?.crn || currentUser?.role?.toUpperCase()}</span>
              </div>
            )}
            <button
              className="sidebar-logout-btn"
              onClick={onLogout}
              title="Sair da Plataforma"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
