import React, { useState } from 'react';
import { Plus, Video } from 'lucide-react';
import type { Appointment, Patient } from '../types/database';
import { dbService } from '../lib/supabase';

interface AppointmentsProps {
  appointments: Appointment[];
  patients: Patient[];
  onOpenNewAppModal: () => void;
  onRefreshData: () => Promise<void>;
}

export const Appointments: React.FC<AppointmentsProps> = ({
  appointments,
  patients,
  onOpenNewAppModal,
  onRefreshData
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('Todos');

  const filtered = appointments.filter(a => {
    if (filterStatus === 'Todos') return true;
    return a.status === filterStatus;
  });

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await dbService.updateAppointmentStatus(id, newStatus);
      await onRefreshData();
    } catch (err: any) {
      alert('Erro ao atualizar status da consulta: ' + err.message);
    }
  };

  return (
    <div className="appointments-container">
      {/* Topo */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--cold-neutral-900)', margin: 0 }}>
            Agenda de Atendimentos & Teleconsultas
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--cold-neutral-600)', margin: 0 }}>
            Sincronização em tempo real das consultas agendadas ({appointments.length} consultas)
          </p>
        </div>

        <button className="db-btn db-btn--primary" onClick={onOpenNewAppModal}>
          <Plus size={16} /> Nova Consulta
        </button>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {['Todos', 'Agendado', 'Confirmado', 'Realizado', 'Cancelado'].map(st => (
          <button
            key={st}
            className={`db-btn db-btn--sm ${filterStatus === st ? 'db-btn--primary' : 'db-btn--outline'}`}
            onClick={() => setFilterStatus(st)}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Lista de Consultas */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filtered.length === 0 ? (
          <div className="empty-state" style={{ padding: '3rem', background: 'var(--white)', borderRadius: '12px', textAlign: 'center' }}>
            Nenhuma consulta encontrada com o filtro selecionado.
          </div>
        ) : (
          filtered.map(a => {
            const dateObj = new Date(a.appointment_date);
            const dateFormatted = dateObj.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });
            const timeFormatted = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

            return (
              <div
                key={a.id}
                style={{
                  background: 'var(--white)',
                  borderRadius: '12px',
                  border: '1px solid var(--cold-neutral-300)',
                  boxShadow: 'var(--shadow-sm)',
                  padding: '16px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div
                    style={{
                      background: 'var(--greenbox-light)',
                      border: '1px solid var(--greenbox-500)',
                      borderRadius: '10px',
                      padding: '10px 14px',
                      textAlign: 'center',
                      minWidth: '70px'
                    }}
                  >
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--greenbox-800)', textTransform: 'uppercase' }}>
                      {dateFormatted}
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--cold-neutral-900)' }}>
                      {timeFormatted}
                    </div>
                  </div>

                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--cold-neutral-900)' }}>
                      {a.patients?.name || 'Paciente'}
                    </h3>
                    <div style={{ fontSize: '0.85rem', color: 'var(--cold-neutral-600)', marginTop: 2 }}>
                      {a.type} {a.objective ? `• ${a.objective}` : ''}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {a.meeting_link && (
                    <a
                      href={a.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="db-btn db-btn--outline db-btn--sm"
                      style={{ color: 'var(--carb-color)', borderColor: 'var(--carb-color)' }}
                    >
                      <Video size={14} /> Sala Online
                    </a>
                  )}

                  {/* Dropdown de Status */}
                  <select
                    className="db-input-field"
                    style={{ width: '140px', padding: '6px 10px', fontSize: '0.85rem', fontWeight: 700 }}
                    value={a.status}
                    onChange={(e) => handleUpdateStatus(a.id, e.target.value)}
                  >
                    <option value="Agendado">Agendado</option>
                    <option value="Confirmado">Confirmado</option>
                    <option value="Realizado">Realizado</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
