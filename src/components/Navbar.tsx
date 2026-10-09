import React from 'react';
import { Home, Utensils, Users, Scale, Calendar, Users2, BookOpen, Smartphone, LogOut } from 'lucide-react';
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
  return (
    <header className="db-navbar">
      <div className="db-navbar-inner">
        <div className="db-nav-brand" onClick={() => onSelectView('dashboard')}>
          <svg width="34" height="34" viewBox="0 0 200 200">
            <path fill="#00D285" d="m86.55,181.66v-67.23c0-4.42,2.36-8.5,6.18-10.71l58.23-33.62c3.33-1.92,7.34-2.17,10.85-.74-.44-.34-.91-.66-1.4-.94l-58.23-33.62c-3.83-2.21-8.54-2.21-12.36,0l-58.23,33.62c-3.83,2.21-6.18,6.29-6.18,10.71v67.23c0,4.42,2.36,8.5,6.18,10.71l58.23,33.62c.49.28,1,.53,1.52.74-2.99-2.32-4.78-5.91-4.78-9.76Z"/>
            <circle cx="130" cy="32" r="24" fill="#00D285"/>
          </svg>
          <span className="brand-text">nutri<span>core</span></span>
        </div>

        <ul className="db-nav-links">
          <li>
            <button className={`nav-link ${currentView === 'dashboard' ? 'active' : ''}`} onClick={() => onSelectView('dashboard')}>
              <Home size={16} /> <span>Dashboard</span>
            </button>
          </li>
          <li>
            <button className={`nav-link ${currentView === 'diet-builder' ? 'active' : ''}`} onClick={() => onSelectView('diet-builder')}>
              <Utensils size={16} /> <span>Plano Alimentar</span>
            </button>
          </li>
          <li>
            <button className={`nav-link ${currentView === 'patients' ? 'active' : ''}`} onClick={() => onSelectView('patients')}>
              <Users size={16} /> <span>Pacientes</span>
            </button>
          </li>
          <li>
            <button className={`nav-link ${currentView === 'anthro' ? 'active' : ''}`} onClick={() => onSelectView('anthro')}>
              <Scale size={16} /> <span>Antropometria</span>
            </button>
          </li>
          <li>
            <button className={`nav-link ${currentView === 'appointments' ? 'active' : ''}`} onClick={() => onSelectView('appointments')}>
              <Calendar size={16} /> <span>Consultas</span>
            </button>
          </li>
          <li>
            <button className={`nav-link ${currentView === 'users' ? 'active' : ''}`} onClick={() => onSelectView('users')}>
              <Users2 size={16} className="text-emerald" /> <span>Usuários & Níveis</span>
            </button>
          </li>
          <li>
            <button className={`nav-link ${currentView === 'recipes' ? 'active' : ''}`} onClick={() => onSelectView('recipes')}>
              <BookOpen size={16} /> <span>Receitas & Compras</span>
            </button>
          </li>
          <li>
            <button className={`nav-link ${currentView === 'patient-app' ? 'active' : ''}`} onClick={() => onSelectView('patient-app')}>
              <Smartphone size={16} className="text-emerald" /> <span>App do Paciente</span>
            </button>
          </li>
        </ul>

        <div className="db-nav-user-actions">
          <div className={`realtime-badge ${realtimeConnected ? 'online' : 'connecting'}`}>
            <span className={`pulse-dot ${realtimeConnected ? 'online' : 'connecting'}`}></span>
            {realtimeConnected ? 'Supabase Realtime' : 'Conectando BD...'}
          </div>

          <div className="user-profile-pill">
            <img src={currentUser?.avatar_url || "https://images.unsplash.com/photo-1594824813589-3221b659c256?auto=format&fit=crop&w=200&q=80"} alt={currentUser?.name || "Usuário"} className="user-avatar-sm" />
            <div className="user-meta-info">
              <span className="user-name">{currentUser?.name || "Dra. Camila"}</span>
              <span className="user-crn">{currentUser?.crn || currentUser?.role?.toUpperCase()}</span>
            </div>
          </div>

          <button className="db-btn db-btn--outline db-btn--sm" onClick={onLogout} title="Sair da Plataforma">
            <LogOut size={14} /> Sair
          </button>
        </div>
      </div>
    </header>
  );
};
