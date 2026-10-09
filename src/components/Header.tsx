import React from 'react';
import { Menu, UserPlus, LogOut, Shield } from 'lucide-react';
import type { Profile } from '../types/database';

interface HeaderProps {
  currentView: string;
  onToggleSidebar: () => void;
  realtimeConnected: boolean;
  currentUser: Profile | null;
  onLogout: () => void;
  onOpenNewPatientModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onToggleSidebar,
  realtimeConnected,
  currentUser,
  onLogout,
  onOpenNewPatientModal
}) => {
  const getPageTitle = (view: string) => {
    switch (view) {
      case 'dashboard': return 'Dashboard & Indicadores';
      case 'diet-builder': return 'Prescrição de Dieta • Tabela TACO';
      case 'patients': return 'Prontuário & Gestão de Pacientes';
      case 'anthro': return 'Antropometria & Metabolismo';
      case 'appointments': return 'Agenda de Consultas & Telemedicina';
      case 'users': return 'Usuários & Níveis de Acesso (RBAC)';
      case 'recipes': return 'Receitas & Lista de Compras';
      case 'patient-app': return 'Simulador • Aplicativo do Paciente';
      default: return 'NutriCore';
    }
  };

  return (
    <header className="nutricore-top-header">
      <div className="header-left">
        <button
          className="header-toggle-sidebar-btn"
          onClick={onToggleSidebar}
          title="Alternar Menu Lateral"
          aria-label="Abrir ou recolher menu lateral"
        >
          <Menu size={20} />
        </button>

        <div className="header-page-title-box">
          <h1 className="header-page-title">{getPageTitle(currentView)}</h1>
          <span className="header-subtitle">Clínica NutriCore Integrada</span>
        </div>
      </div>

      <div className="header-right">
        {/* Badge Realtime */}
        <div className={`realtime-badge ${realtimeConnected ? 'online' : 'connecting'}`}>
          <span className={`pulse-dot ${realtimeConnected ? 'online' : 'connecting'}`}></span>
          <span className="realtime-text">{realtimeConnected ? 'Supabase Realtime' : 'Conectando'}</span>
        </div>

        {/* Botão Novo Paciente Rápido */}
        <button
          className="db-btn db-btn--primary db-btn--sm header-action-btn"
          onClick={onOpenNewPatientModal}
        >
          <UserPlus size={15} />
          <span className="btn-text">Novo Paciente</span>
        </button>

        {/* Mini perfil */}
        <div className="header-user-pill">
          <img
            src={currentUser?.avatar_url || "https://images.unsplash.com/photo-1594824813589-3221b659c256?auto=format&fit=crop&w=200&q=80"}
            alt={currentUser?.name || "Usuário"}
            className="user-avatar-sm"
            style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1594824813589-3221b659c256?auto=format&fit=crop&w=200&q=80";
            }}
          />
          <div className="header-user-meta">
            <span className="user-name">{currentUser?.name?.split(' ')[0] || "Nutricionista"}</span>
            <span className="user-crn">{currentUser?.role?.toUpperCase()}</span>
          </div>
        </div>

        <button
          className="header-logout-btn"
          onClick={onLogout}
          title="Sair do NutriCore"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
};
