import React, { useState } from 'react';
import { Activity, Calendar, Sparkles } from 'lucide-react';
import type { Patient, Measurement } from '../types/database';
import { dbService } from '../lib/supabase';

interface AnthropometryProps {
  patients: Patient[];
  selectedPatientId: string;
  onSelectPatient: (patientId: string) => void;
  onRefreshData: () => Promise<void>;
}

export const Anthropometry: React.FC<AnthropometryProps> = ({
  patients,
  selectedPatientId,
  onSelectPatient,
  onRefreshData
}) => {
  const patient = patients.find(p => p.id === selectedPatientId) || patients[0];

  // Estado do formulário de nova medição
  const [weight, setWeight] = useState<number>(patient?.weight || 78);
  const [height, setHeight] = useState<number>(patient?.height || 175);
  const [age, setAge] = useState<number>(patient?.age || 29);
  const [gender, setGender] = useState<'M' | 'F'>(patient?.gender || 'M');
  const [activityLevel, setActivityLevel] = useState<'sedentario' | 'leve' | 'moderado' | 'intenso' | 'atleta'>(patient?.activity_level || 'moderado');
  const [bodyFat, setBodyFat] = useState<number>(14.5);
  const [waist, setWaist] = useState<number>(82);
  const [hip, setHip] = useState<number>(98);
  const [arm, setArm] = useState<number>(36);
  const [notes, setNotes] = useState('Boa adesão ao plano de treino e redução de retenção hídrica.');
  const [saving, setSaving] = useState(false);

  // Cálculos Científicos
  const heightM = height / 100;
  const imc = Number((weight / (heightM * heightM)).toFixed(1));

  let imcClass = 'Eutrofia (Peso Normal)';
  let imcBadgeClass = 'badge-cal';
  if (imc < 18.5) { imcClass = 'Baixo Peso'; imcBadgeClass = 'badge-c'; }
  else if (imc >= 25 && imc < 30) { imcClass = 'Sobrepeso'; imcBadgeClass = 'badge-f'; }
  else if (imc >= 30) { imcClass = 'Obesidade'; imcBadgeClass = 'badge-f'; }

  // TMB por Mifflin-St Jeor
  const tmb = Math.round(
    gender === 'M'
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161
  );

  // Fator de Atividade
  const activityFactors = {
    sedentario: 1.2,
    leve: 1.375,
    moderado: 1.55,
    intenso: 1.725,
    atleta: 1.9
  };
  const get = Math.round(tmb * activityFactors[activityLevel]);

  // RCQ
  const rcq = waist && hip ? Number((waist / hip).toFixed(2)) : null;

  // Medições históricas do paciente
  const measurements: Measurement[] = patient?.measurements || [];

  const handleSaveMeasurement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) return;
    setSaving(true);
    try {
      await dbService.createMeasurement({
        patient_id: patient.id,
        date: new Date().toISOString().split('T')[0],
        weight: Number(weight),
        body_fat: Number(bodyFat),
        waist: Number(waist),
        hip: Number(hip),
        arm: Number(arm),
        notes
      });
      await onRefreshData();
      alert('Medição salva no Supabase com sucesso!');
    } catch (err: any) {
      alert('Erro ao salvar medição: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="anthro-container">
      {/* Topo: Seleção de Paciente */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--cold-neutral-900)', margin: 0 }}>
            Antropometria & Metabolismo Científico
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--cold-neutral-600)', margin: 0 }}>
            Fórmulas oficiais OMS, Mifflin-St Jeor e Composição Corporal
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label className="form-label" style={{ margin: 0, fontWeight: 700 }}>Paciente:</label>
          <select
            className="db-input-field"
            value={patient?.id || ''}
            onChange={(e) => onSelectPatient(e.target.value)}
            style={{ fontWeight: 700, minWidth: '240px' }}
          >
            {patients.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Cards de Índices Metabólicos Instantâneos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="stat-card" style={{ borderLeft: '4px solid var(--greenbox-500)' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--cold-neutral-500)', textTransform: 'uppercase' }}>
              Índice de Massa Corporal (IMC)
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--cold-neutral-900)', marginTop: 4 }}>
              {imc} <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>kg/m²</span>
            </div>
            <span className={`badge ${imcBadgeClass}`} style={{ marginTop: 6, display: 'inline-block' }}>
              {imcClass}
            </span>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid var(--carb-color)' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--cold-neutral-500)', textTransform: 'uppercase' }}>
              Taxa Metabólica Basal (TMB)
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--carb-color)', marginTop: 4 }}>
              {tmb} <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>kcal/dia</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--cold-neutral-600)' }}>Mifflin-St Jeor</span>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid var(--prot-color)' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--cold-neutral-500)', textTransform: 'uppercase' }}>
              Gasto Energético Total (GET)
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--prot-color)', marginTop: 4 }}>
              {get} <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>kcal/dia</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--cold-neutral-600)' }}>Atividade: {activityLevel}</span>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid var(--fat-color)' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--cold-neutral-500)', textTransform: 'uppercase' }}>
              Gordura Corporal & RCQ
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--fat-color)', marginTop: 4 }}>
              {bodyFat}% <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Gordura</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--cold-neutral-600)' }}>RCQ: {rcq || '--'}</span>
          </div>
        </div>
      </div>

      <div className="anthro-main-grid">
        {/* Formulário de Registro de Nova Avaliação */}
        <div style={{ background: 'var(--white)', padding: '24px', borderRadius: '12px', border: '1px solid var(--cold-neutral-300)', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: 800, color: 'var(--cold-neutral-900)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} className="text-emerald" /> Registrar Nova Medição
          </h3>

          <form onSubmit={handleSaveMeasurement}>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Peso Corporal (kg) *</label>
                <input
                  type="number"
                  step="0.1"
                  className="db-input-field"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Altura (cm) *</label>
                <input
                  type="number"
                  className="db-input-field"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  required
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Percentual de Gordura (%)</label>
                <input
                  type="number"
                  step="0.1"
                  className="db-input-field"
                  value={bodyFat}
                  onChange={(e) => setBodyFat(Number(e.target.value))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Nível de Atividade</label>
                <select
                  className="db-input-field"
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value as any)}
                >
                  <option value="sedentario">Sedentário (1.2)</option>
                  <option value="leve">Leve (1.375)</option>
                  <option value="moderado">Moderado (1.55)</option>
                  <option value="intenso">Intenso (1.725)</option>
                  <option value="atleta">Atleta (1.9)</option>
                </select>
              </div>
            </div>

            <div className="form-grid-3">
              <div className="form-group">
                <label className="form-label">Cintura (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  className="db-input-field"
                  value={waist}
                  onChange={(e) => setWaist(Number(e.target.value))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Quadril (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  className="db-input-field"
                  value={hip}
                  onChange={(e) => setHip(Number(e.target.value))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Braço (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  className="db-input-field"
                  value={arm}
                  onChange={(e) => setArm(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Observações Clínicas</label>
              <textarea
                className="db-input-field"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <button type="submit" className="db-btn db-btn--primary" style={{ width: '100%', marginTop: '12px' }} disabled={saving}>
              <Sparkles size={16} /> {saving ? 'Salvando...' : 'Salvar Medição no Supabase'}
            </button>
          </form>
        </div>

        {/* Histórico de Medições do Paciente */}
        <div style={{ background: 'var(--white)', padding: '24px', borderRadius: '12px', border: '1px solid var(--cold-neutral-300)', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: 800, color: 'var(--cold-neutral-900)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} className="text-blue" /> Evolução Histórica no Banco de Dados
          </h3>

          <div style={{ overflowX: 'auto' }}>
            <table className="db-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Peso</th>
                  <th>% Gordura</th>
                  <th>Cintura</th>
                  <th>Quadril</th>
                  <th>Obs</th>
                </tr>
              </thead>
              <tbody>
                {measurements.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--cold-neutral-500)' }}>
                      Nenhuma medição anterior registrada no banco.
                    </td>
                  </tr>
                ) : (
                  measurements.map(m => (
                    <tr key={m.id}>
                      <td style={{ fontWeight: 600 }}>{new Date(m.date).toLocaleDateString('pt-BR')}</td>
                      <td><b>{m.weight} kg</b></td>
                      <td>{m.body_fat ? `${m.body_fat}%` : '--'}</td>
                      <td>{m.waist ? `${m.waist} cm` : '--'}</td>
                      <td>{m.hip ? `${m.hip} cm` : '--'}</td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--cold-neutral-600)' }}>{m.notes || '--'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
