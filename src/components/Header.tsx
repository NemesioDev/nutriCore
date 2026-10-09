import React from 'react';
import { Menu, UserPlus, LogOut } from 'lucide-react';
import type { Profile } from '../types/database';

interface HeaderProps {
  currentView: string;
  onToggleSidebar: () => void;
  currentUser: Profile | null;
  onLogout: () => void;
  onOpenNewPatientModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onToggleSidebar,
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

  const getInitials = (name?: string) => {
    if (!name) return 'NC';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <header className="nutricore-top-header">
      <div className="header-left">
        <button
          className="header-toggle-sidebar-btn"
          onClick={onToggleSidebar}
          title="Abrir ou recolher menu lateral"
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
        {/* Botão Novo Paciente Rápido */}
        <button
          className="db-btn db-btn--primary db-btn--sm header-action-btn"
          onClick={onOpenNewPatientModal}
        >
          <UserPlus size={15} />
          <span className="btn-text">Novo Paciente</span>
        </button>

        {/* Mini perfil com avatar de iniciais garantido */}
        <div className="header-user-pill">
          <div className="avatar-initials-circle sm">
            {getInitials(currentUser?.name)}
          </div>
          <div className="header-user-meta">
            <span className="user-name">{currentUser?.name?.split(' ')[0] || "Nutricionista"}</span>
            <span className="user-crn">{currentUser?.crn || currentUser?.role?.toUpperCase()}</span>
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
