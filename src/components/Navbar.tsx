import React, { useState } from 'react';
import {
  Home, Utensils, Users, Scale, Calendar, Users2, BookOpen, Smartphone, LogOut, Menu, X, Shield
} from 'lucide-react';
import type { Profile } from '../types/database';

interface NavbarProps {
  currentView: string;
  onSelectView: (view: string) => void;
  currentUser: Profile | null;
  onLogout: () => void;
  realtimeConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onSelectView,
  currentUser,
  onLogout,
  realtimeConnected
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const handleNavigate = (viewId: string) => {
    onSelectView(viewId);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="db-navbar">
        <div className="db-navbar-inner">
          {/* Brand */}
          <div className="db-nav-brand" onClick={() => handleNavigate('dashboard')}>
            <svg width="32" height="32" viewBox="0 0 200 200" style={{ flexShrink: 0 }}>
              <path fill="#00D285" d="m86.55,181.66v-67.23c0-4.42,2.36-8.5,6.18-10.71l58.23-33.62c3.33-1.92,7.34-2.17,10.85-.74-.44-.34-.91-.66-1.4-.94l-58.23-33.62c-3.83-2.21-8.54-2.21-12.36,0l-58.23,33.62c-3.83,2.21-6.18,6.29-6.18,10.71v67.23c0,4.42,2.36,8.5,6.18,10.71l58.23,33.62c.49.28,1,.53,1.52.74-2.99-2.32-4.78-5.91-4.78-9.76Z"/>
              <circle cx="130" cy="32" r="24" fill="#00D285"/>
            </svg>
            <span className="brand-text">nutri<span>core</span></span>
          </div>

          {/* Links Desktop (visíveis em telas largas) */}
          <ul className="db-nav-links desktop-only-nav">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <li key={item.id}>
                  <button
                    className={`nav-link ${isActive ? 'active' : ''}`}
                    onClick={() => handleNavigate(item.id)}
                    title={item.label}
                  >
                    <Icon size={15} style={{ flexShrink: 0 }} />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Ações do Usuário & Status */}
          <div className="db-nav-user-actions">
            <div className={`realtime-badge ${realtimeConnected ? 'online' : 'connecting'}`}>
              <span className={`pulse-dot ${realtimeConnected ? 'online' : 'connecting'}`}></span>
              <span className="realtime-text">{realtimeConnected ? 'Realtime' : 'Conectando'}</span>
            </div>

            <div className="user-profile-pill">
              <img
                src={currentUser?.avatar_url || "https://images.unsplash.com/photo-1594824813589-3221b659c256?auto=format&fit=crop&w=200&q=80"}
                alt={currentUser?.name || "Usuário"}
                className="user-avatar-sm"
              />
              <div className="user-meta-info">
                <span className="user-name" title={currentUser?.name || "Dra. Camila"}>
                  {currentUser?.name || "Dra. Camila"}
                </span>
                <span className="user-crn">
                  {currentUser?.crn || currentUser?.role?.toUpperCase()}
                </span>
              </div>
            </div>

            <button
              className="db-btn db-btn--outline db-btn--sm logout-desktop-btn"
              onClick={onLogout}
              title="Sair da Plataforma"
            >
              <LogOut size={14} />
              <span className="logout-text">Sair</span>
            </button>

            {/* Botão Hambúrguer Mobile / Tablet */}
            <button
              className="mobile-hamburger-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Abrir Menu de Navegação"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* Menu Gaveta Mobile / Tablet (Drawer / Off-canvas) */}
      {mobileMenuOpen && (
        <div className="mobile-drawer-backdrop" onClick={() => setMobileMenuOpen(false)}>
          <div className="mobile-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-drawer-header">
              <div className="db-nav-brand">
                <svg width="28" height="28" viewBox="0 0 200 200">
                  <path fill="#00D285" d="m86.55,181.66v-67.23c0-4.42,2.36-8.5,6.18-10.71l58.23-33.62c3.33-1.92,7.34-2.17,10.85-.74-.44-.34-.91-.66-1.4-.94l-58.23-33.62c-3.83-2.21-8.54-2.21-12.36,0l-58.23,33.62c-3.83,2.21-6.18,6.29-6.18,10.71v67.23c0,4.42,2.36,8.5,6.18,10.71l58.23,33.62c.49.28,1,.53,1.52.74-2.99-2.32-4.78-5.91-4.78-9.76Z"/>
                  <circle cx="130" cy="32" r="24" fill="#00D285"/>
                </svg>
                <span className="brand-text">nutri<span>core</span></span>
              </div>
              <button className="mobile-drawer-close" onClick={() => setMobileMenuOpen(false)}>
                <X size={20} />
              </button>
            </div>

            {/* Perfil no Menu Mobile */}
            <div className="mobile-user-card">
              <img
                src={currentUser?.avatar_url || "https://images.unsplash.com/photo-1594824813589-3221b659c256?auto=format&fit=crop&w=200&q=80"}
                alt={currentUser?.name || "Usuário"}
                className="user-avatar-md"
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="mobile-user-name">{currentUser?.name || "Dra. Camila"}</div>
                <div className="mobile-user-role">
                  <Shield size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                  {currentUser?.role?.toUpperCase()} • {currentUser?.crn || 'Ativo'}
                </div>
              </div>
            </div>

            {/* Links de Navegação Mobile */}
            <nav className="mobile-nav-list">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    className={`mobile-nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => handleNavigate(item.id)}
                  >
                    <div className="mobile-nav-icon-box">
                      <Icon size={18} />
                    </div>
                    <span className="mobile-nav-label">{item.label}</span>
                    {isActive && <span className="mobile-nav-active-dot" />}
                  </button>
                );
              })}
            </nav>

            {/* Rodapé Mobile Drawer */}
            <div className="mobile-drawer-footer">
              <div className={`realtime-badge ${realtimeConnected ? 'online' : 'connecting'}`} style={{ width: '100%', justifyContent: 'center' }}>
                <span className={`pulse-dot ${realtimeConnected ? 'online' : 'connecting'}`}></span>
                {realtimeConnected ? 'Supabase Realtime Ativo' : 'Conectando ao Banco...'}
              </div>

              <button
                className="db-btn db-btn--outline"
                style={{ width: '100%', marginTop: '10px', color: 'var(--error-500)', borderColor: 'var(--error-500)' }}
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLogout();
                }}
              >
                <LogOut size={16} /> Sair da Plataforma
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
