import React, { useState } from 'react';
import { X, UserPlus, Sparkles } from 'lucide-react';
import type { Patient } from '../../types/database';

interface NewPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (patient: Partial<Patient>) => Promise<void>;
}

export const NewPatientModal: React.FC<NewPatientModalProps> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState<number>(28);
  const [gender, setGender] = useState<'M' | 'F'>('M');
  const [weight, setWeight] = useState<number>(75);
  const [height, setHeight] = useState<number>(175);
  const [objective, setObjective] = useState('Hipertrofia Limpa');
  const [activityLevel, setActivityLevel] = useState<'sedentario' | 'leve' | 'moderado' | 'intenso' | 'atleta'>('moderado');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert('Informe o nome do paciente');
    setLoading(true);
    try {
      await onSave({
        name,
        email: email || undefined,
        phone: phone || undefined,
        age: Number(age),
        gender,
        weight: Number(weight),
        height: Number(height),
        objective,
        activity_level: activityLevel,
        status: 'Ativo',
        avatar_url: `https://images.unsplash.com/photo-${gender === 'F' ? '1544005313-94ddf0286df2' : '1507003211169-0a1dd7228f2d'}?auto=format&fit=crop&w=200&q=80`
      });
      onClose();
    } catch (err: any) {
      alert('Erro ao cadastrar paciente: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <div className="modal-title">
            <UserPlus size={20} className="text-emerald" />
            <h3>Cadastrar Novo Paciente</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label className="form-label">Nome Completo *</label>
            <input
              type="text"
              className="db-input-field"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Lucas Gabriel Silveira"
              required
            />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">E-mail</label>
              <input
                type="email"
                className="db-input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="paciente@email.com"
              />
            </div>
            <div className="form-group">
              <label className="form-label">WhatsApp</label>
              <input
                type="text"
                className="db-input-field"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(11) 99888-7766"
              />
            </div>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label">Idade (anos)</label>
              <input
                type="number"
                className="db-input-field"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                min={1}
                max={120}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Sexo</label>
              <select className="db-input-field" value={gender} onChange={(e) => setGender(e.target.value as 'M' | 'F')}>
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Objetivo Principal</label>
              <select className="db-input-field" value={objective} onChange={(e) => setObjective(e.target.value)}>
                <option value="Hipertrofia Limpa">Hipertrofia</option>
                <option value="Emagrecimento Saudável">Emagrecimento</option>
                <option value="Definição & Performance">Definição / Performance</option>
                <option value="Reeducação Alimentar">Reeducação Alimentar</option>
                <option value="Controle de Diabetes/Hipertensão">Saúde / Patologias</option>
              </select>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Peso Atual (kg) *</label>
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

          <div className="form-group">
            <label className="form-label">Nível de Atividade Física</label>
            <select
              className="db-input-field"
              value={activityLevel}
              onChange={(e) => setActivityLevel(e.target.value as any)}
            >
              <option value="sedentario">Sedentário (pouco ou nenhum exercício)</option>
              <option value="leve">Leve (exercício 1-3 dias/semana)</option>
              <option value="moderado">Moderado (exercício 3-5 dias/semana)</option>
              <option value="intenso">Intenso (exercício 6-7 dias/semana)</option>
              <option value="atleta">Atleta (2x treinos diários)</option>
            </select>
          </div>

          <div className="modal-footer">
            <button type="button" className="db-btn db-btn--outline" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="db-btn db-btn--primary" disabled={loading}>
              <Sparkles size={16} /> {loading ? 'Cadastrando...' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
