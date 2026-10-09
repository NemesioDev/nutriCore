import React, { useState } from 'react';
import { X, ShieldPlus, Sparkles, Lock } from 'lucide-react';
import type { Profile, UserRole } from '../../types/database';

interface NewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: Partial<Profile>) => Promise<void>;
}

export const NewUserModal: React.FC<NewUserModalProps> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('nutricionista');
  const [title, setTitle] = useState('Nutricionista Clínico');
  const [crn, setCrn] = useState('');
  const [clinic, setClinic] = useState('NutriCore Saúde Integrada');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return alert('Preencha os campos obrigatórios (Nome e E-mail)');
    if (!password) return alert('Por favor, informe uma senha de acesso.');
    if (password.length < 6) return alert('A senha deve conter no mínimo 6 caracteres.');
    if (password !== confirmPassword) return alert('As senhas digitadas não coincidem.');

    setLoading(true);
    try {
      await onSave({
        name,
        email,
        password,
        role,
        title,
        crn: role === 'nutricionista' || role === 'admin' ? crn : undefined,
        clinic,
        phone,
        avatar_url: `https://images.unsplash.com/photo-${role === 'paciente' ? '1534528741775-53994a69daeb' : '1594824813589-3221b659c256'}?auto=format&fit=crop&w=200&q=80`
      });
      alert(`Usuário "${name}" cadastrado com sucesso! Já pode realizar login com o e-mail e a senha criados.`);
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setCrn('');
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
              <label className="form-label">E-mail de Acesso (Login) *</label>
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
                  else setTitle('Paciente');
                }}
              >
                <option value="nutricionista">Nutricionista (Prescrições & Prontuários)</option>
                <option value="admin">Administrador (Acesso Total à Clínica)</option>
                <option value="recepcionista">Recepcionista (Agendamentos & Check-in)</option>
                <option value="paciente">Paciente (Visualizador de Dieta & App)</option>
              </select>
            </div>
          </div>

          {/* Campos de Senha Obrigatórios */}
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Senha de Acesso (mín. 6 dígitos) *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="db-input-field"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Confirmar Senha *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="db-input-field"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                />
              </div>
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
              <Sparkles size={16} /> {loading ? 'Cadastrando...' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
