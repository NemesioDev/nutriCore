import React, { useState, useMemo } from 'react';
import { Search, UserPlus, Utensils, Scale, Phone, Mail } from 'lucide-react';
import type { Patient } from '../types/database';

interface PatientsProps {
  patients: Patient[];
  onOpenNewPatientModal: () => void;
  onSelectPatientDiet: (patientId: string) => void;
  onSelectPatientAnthro: (patientId: string) => void;
}

export const Patients: React.FC<PatientsProps> = ({
  patients,
  onOpenNewPatientModal,
  onSelectPatientDiet,
  onSelectPatientAnthro
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedObjective, setSelectedObjective] = useState('Todos');

  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.email && p.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.phone && p.phone.includes(searchTerm));
      const matchObj = selectedObjective === 'Todos' || p.objective === selectedObjective;
      return matchSearch && matchObj;
    });
  }, [patients, searchTerm, selectedObjective]);

  return (
    <div className="patients-container">
      {/* Topo: Título e Botão Novo Paciente */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--cold-neutral-900)', margin: 0 }}>
            Gestão de Pacientes Cadastrados
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--cold-neutral-600)', margin: 0 }}>
            Registros sincronizados em tempo real no Supabase PostgreSQL ({patients.length} pacientes ativos)
          </p>
        </div>

        <button className="db-btn db-btn--primary" onClick={onOpenNewPatientModal}>
          <UserPlus size={16} /> Novo Paciente
        </button>
      </div>

      {/* Barra de Filtros e Busca */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div className="search-bar" style={{ flex: 1, minWidth: '280px' }}>
          <Search size={16} />
          <input
            type="text"
            placeholder="Buscar por nome, e-mail ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="db-input-field"
          style={{ width: '220px' }}
          value={selectedObjective}
          onChange={(e) => setSelectedObjective(e.target.value)}
        >
          <option value="Todos">Todos os Objetivos</option>
          <option value="Hipertrofia Limpa">Hipertrofia Limpa</option>
          <option value="Emagrecimento Saudável">Emagrecimento Saudável</option>
          <option value="Definição & Performance">Definição & Performance</option>
          <option value="Reeducação Alimentar">Reeducação Alimentar</option>
        </select>
      </div>

      {/* Grid de Cards de Pacientes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {filteredPatients.length === 0 ? (
          <div className="empty-state" style={{ gridColumn: '1 / -1', padding: '3rem', background: 'var(--white)', borderRadius: '12px', textAlign: 'center' }}>
            Nenhum paciente encontrado com os filtros atuais.
          </div>
        ) : (
          filteredPatients.map((patient) => (
            <div
              key={patient.id}
              className="patient-card"
              style={{
                background: 'var(--white)',
                borderRadius: '12px',
                border: '1px solid var(--cold-neutral-300)',
                boxShadow: 'var(--shadow-sm)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.15s ease'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                  <img
                    src={patient.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"}
                    alt={patient.name}
                    style={{ width: 54, height: 54, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--greenbox-500)' }}
                  />
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--cold-neutral-900)' }}>
                      {patient.name}
                    </h3>
                    <span className="badge badge-cal" style={{ marginTop: '4px', display: 'inline-block' }}>
                      {patient.objective || 'Saúde Geral'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', background: 'var(--cold-neutral-50)', padding: '10px', borderRadius: '8px', marginBottom: '14px', textAlign: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--cold-neutral-500)', textTransform: 'uppercase' }}>Idade</div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--cold-neutral-800)' }}>{patient.age || '--'} anos</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--cold-neutral-500)', textTransform: 'uppercase' }}>Peso</div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--cold-neutral-800)' }}>{patient.weight} kg</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--cold-neutral-500)', textTransform: 'uppercase' }}>Altura</div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--cold-neutral-800)' }}>{patient.height} cm</div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem', color: 'var(--cold-neutral-600)', marginBottom: '16px' }}>
                  {patient.email && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Mail size={13} /> {patient.email}
                    </div>
                  )}
                  {patient.phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Phone size={13} /> {patient.phone}
                    </div>
                  )}
                </div>
              </div>

              {/* Botões de Ação Rápida */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', borderTop: '1px solid var(--cold-neutral-200)', paddingTop: '12px' }}>
                <button
                  className="db-btn db-btn--outline db-btn--sm"
                  onClick={() => onSelectPatientDiet(patient.id)}
                  title="Abrir ou prescrever plano alimentar"
                >
                  <Utensils size={14} className="text-emerald" /> Dieta
                </button>
                <button
                  className="db-btn db-btn--outline db-btn--sm"
                  onClick={() => onSelectPatientAnthro(patient.id)}
                  title="Calcular IMC, TMB e Antropometria"
                >
                  <Scale size={14} className="text-blue" /> Medições
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
