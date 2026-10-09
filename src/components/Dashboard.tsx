import React from 'react';
import { Users, Salad, Video, ShieldCheck, UserPlus, CalendarPlus, Clock } from 'lucide-react';
import type { Patient, DietPlan, Appointment, Profile } from '../types/database';

interface DashboardProps {
  patients: Patient[];
  dietPlans: DietPlan[];
  appointments: Appointment[];
  profiles: Profile[];
  onOpenPatientDiet: (patientId: string) => void;
  onOpenNewPatientModal: () => void;
  onOpenNewUserModal: () => void;
  onOpenNewAppModal: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  patients,
  dietPlans,
  appointments,
  profiles,
  onOpenPatientDiet,
  onOpenNewPatientModal,
  onOpenNewUserModal,
  onOpenNewAppModal
}) => {
  return (
    <div>
      <div className="dash-welcome-banner">
        <div className="dash-welcome-text">
          <h1>Olá, Dra. Camila Monteiro! 🌿</h1>
          <p>Seja bem-vinda ao NutriCore. Sistema React + Supabase operando em tempo real.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="db-btn db-btn--primary" onClick={onOpenNewPatientModal} style={{ background: 'var(--white)', color: 'var(--greenbox-900)' }}>
            <UserPlus size={16} /> Novo Paciente
          </button>
          <button className="db-btn db-btn--outline" onClick={onOpenNewUserModal} style={{ background: 'rgba(255,255,255,0.15)', color: 'var(--white)', borderColor: 'rgba(255,255,255,0.3)' }}>
            <ShieldCheck size={16} /> Novo Usuário
          </button>
        </div>
      </div>

      <div className="dash-stats-row">
        <div className="stat-card">
          <div className="stat-icon green"><Users size={24} /></div>
          <div className="stat-info">
            <div className="stat-number">{patients.length}</div>
            <div className="stat-label">Pacientes Ativos (BD)</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue"><Salad size={24} /></div>
          <div className="stat-info">
            <div className="stat-number">{dietPlans.length}</div>
            <div className="stat-label">Planos Prescritos (BD)</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple"><Video size={24} /></div>
          <div className="stat-info">
            <div className="stat-number">{appointments.length}</div>
            <div className="stat-label">Consultas Agendadas</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#b45309' }}><ShieldCheck size={24} /></div>
          <div className="stat-info">
            <div className="stat-number">{profiles.length}</div>
            <div className="stat-label">Usuários da Clínica</div>
          </div>
        </div>
      </div>

      <div className="dash-sections-grid">
        {/* Próximas Consultas */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h3><CalendarPlus size={18} className="text-emerald" /> Consultas do Dia no Supabase</h3>
            <button className="db-btn db-btn--outline db-btn--sm" onClick={onOpenNewAppModal}>Agendar</button>
          </div>
          <div>
            {appointments.length === 0 ? (
              <p className="empty-state">Nenhum atendimento agendado no banco.</p>
            ) : (
              appointments.slice(0, 3).map((a) => (
                <div key={a.id} className="dash-item-row">
                  <div className="dash-item-avatar" style={{ width: 38, height: 38, borderRadius: 8, background: 'var(--greenbox-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Clock size={18} className="text-emerald" />
                  </div>
                  <div className="dash-item-info" style={{ flex: 1, display: 'flex', flexDirection: 'column', marginLeft: 10 }}>
                    <strong>{a.patients?.name || 'Paciente'}</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--cold-neutral-600)' }}>
                      {a.type} • {new Date(a.appointment_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <span className={`badge ${a.status === 'Confirmado' ? 'badge-p' : 'badge-cal'}`}>{a.status}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pacientes Recentes */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h3><Users size={18} className="text-blue" /> Pacientes Cadastrados</h3>
            <span className="text-muted" style={{ fontSize: '0.8rem' }}>Total: {patients.length}</span>
          </div>
          <div>
            {patients.slice(0, 3).map((p) => (
              <div key={p.id} className="dash-item-row">
                <img
                  src={p.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"}
                  alt={p.name}
                  style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
                />
                <div className="dash-item-info" style={{ flex: 1, display: 'flex', flexDirection: 'column', marginLeft: 10 }}>
                  <strong>{p.name}</strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--cold-neutral-600)' }}>{p.objective} • {p.weight} kg</span>
                </div>
                <button className="db-btn db-btn--outline db-btn--sm" onClick={() => onOpenPatientDiet(p.id)}>
                  Abrir Plano
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
