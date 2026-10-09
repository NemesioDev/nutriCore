import React, { useState } from 'react';
import { X, CalendarPlus, Sparkles } from 'lucide-react';
import type { Patient, Appointment } from '../../types/database';

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  onSave: (appointment: Partial<Appointment>) => Promise<void>;
}

export const NewAppointmentModal: React.FC<NewAppointmentModalProps> = ({
  isOpen,
  onClose,
  patients,
  onSave
}) => {
  const [patientId, setPatientId] = useState(patients[0]?.id || '');
  const [appointmentDate, setAppointmentDate] = useState(
    new Date(Date.now() + 86400000).toISOString().slice(0, 16)
  );
  const [type, setType] = useState('Consulta de Retorno & Bioimpedância');
  const [objective, setObjective] = useState('Ajuste de macronutrientes e análise de medidas');
  const [status, setStatus] = useState<'Agendado' | 'Confirmado' | 'Realizado'>('Confirmado');
  const [meetingLink, setMeetingLink] = useState('https://meet.google.com/nutri-core-live');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) return alert('Selecione um paciente');
    setLoading(true);
    try {
      await onSave({
        patient_id: patientId,
        appointment_date: new Date(appointmentDate).toISOString(),
        type,
        objective,
        status,
        meeting_link: meetingLink
      });
      onClose();
    } catch (err: any) {
      alert('Erro ao agendar consulta: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <div className="modal-title">
            <CalendarPlus size={20} className="text-emerald" />
            <h3>Agendar Nova Consulta</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label className="form-label">Paciente *</label>
            <select
              className="db-input-field"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              required
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.objective || 'Geral'})
                </option>
              ))}
            </select>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Data & Horário *</label>
              <input
                type="datetime-local"
                className="db-input-field"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Status Inicial</label>
              <select
                className="db-input-field"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
              >
                <option value="Agendado">Agendado</option>
                <option value="Confirmado">Confirmado</option>
                <option value="Realizado">Realizado</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Tipo de Atendimento</label>
            <input
              type="text"
              className="db-input-field"
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="Ex: Primeira Consulta Presencial"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Objetivo da Sessão</label>
            <input
              type="text"
              className="db-input-field"
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="Ex: Avaliação de composição corporal e novo plano"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Link de Teleconsulta (opcional)</label>
            <input
              type="url"
              className="db-input-field"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              placeholder="https://meet.google.com/..."
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="db-btn db-btn--outline" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="db-btn db-btn--primary" disabled={loading}>
              <Sparkles size={16} /> {loading ? 'Agendando...' : 'Confirmar Agendamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
