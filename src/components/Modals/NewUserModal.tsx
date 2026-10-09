import React, { useState } from 'react';
import { X, ShieldPlus, Sparkles } from 'lucide-react';
import type { Profile, UserRole } from '../../types/database';

interface NewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: Partial<Profile>) => Promise<void>;
}

export const NewUserModal: React.FC<NewUserModalProps> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('nutricionista');
  const [title, setTitle] = useState('Nutricionista Clínico');
  const [crn, setCrn] = useState('CRN-3 48.291');
  const [clinic, setClinic] = useState('NutriCore Saúde Integrada');
  const [phone, setPhone] = useState('(11) 98765-4321');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return alert('Preencha os campos obrigatórios');
    setLoading(true);
    try {
      await onSave({
        name,
        email,
        role,
        title,
        crn: role === 'nutricionista' ? crn : undefined,
        clinic,
        phone,
        avatar_url: `https://images.unsplash.com/photo-1594824813589-3221b659c256?auto=format&fit=crop&w=200&q=80`
      });
      onClose();
    } catch (err: any) {
      alert('Erro ao cadastrar perfil: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <div className="modal-title">
            <ShieldPlus size={20} className="text-emerald" />
            <h3>Cadastrar Novo Usuário & Nível de Acesso</h3>
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
              placeholder="Ex: Dra. Mariana Costa"
              required
            />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">E-mail Corporativo *</label>
              <input
                type="email"
                className="db-input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="mariana@clinica.com.br"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Nível de Permissão (Role) *</label>
              <select
                className="db-input-field"
                value={role}
                onChange={(e) => {
                  const r = e.target.value as UserRole;
                  setRole(r);
                  if (r === 'admin') setTitle('Diretor Clínico / Gestor');
                  else if (r === 'nutricionista') setTitle('Nutricionista Clínico');
                  else if (r === 'recepcionista') setTitle('Secretaria & Atendimento');
                  else setTitle('Paciente Convidado');
                }}
              >
                <option value="admin">Administrador (Acesso Total)</option>
                <option value="nutricionista">Nutricionista (Prescrições & Prontuários)</option>
                <option value="recepcionista">Recepcionista (Agendamentos & Check-in)</option>
                <option value="paciente">Paciente (Visualizador de Dieta & App)</option>
              </select>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Cargo / Especialidade</label>
              <input
                type="text"
                className="db-input-field"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Nutricionista Esportivo"
              />
            </div>
            <div className="form-group">
              <label className="form-label">CRN (Conselho Regional)</label>
              <input
                type="text"
                className="db-input-field"
                value={crn}
                onChange={(e) => setCrn(e.target.value)}
                placeholder="CRN-3 12.345"
                disabled={role !== 'nutricionista' && role !== 'admin'}
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Clínica / Unidade</label>
              <input
                type="text"
                className="db-input-field"
                value={clinic}
                onChange={(e) => setClinic(e.target.value)}
                placeholder="NutriCore Matriz"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Telefone / WhatsApp</label>
              <input
                type="text"
                className="db-input-field"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(11) 99999-0000"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="db-btn db-btn--outline" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="db-btn db-btn--primary" disabled={loading}>
              <Sparkles size={16} /> {loading ? 'Criando no Banco...' : 'Criar Perfil no Supabase'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
