import React from 'react';
import { UserPlus, Trash2, Shield, Stethoscope, PhoneCall, User } from 'lucide-react';
import type { Profile, UserRole } from '../types/database';
import { dbService } from '../lib/supabase';

interface UserRolesProps {
  profiles: Profile[];
  onOpenNewUserModal: () => void;
  onRefreshData: () => Promise<void>;
}

export const UserRoles: React.FC<UserRolesProps> = ({
  profiles,
  onOpenNewUserModal,
  onRefreshData
}) => {
  const handleRoleChange = async (profileId: string, newRole: UserRole) => {
    try {
      await dbService.updateProfileRole(profileId, newRole);
      await onRefreshData();
    } catch (err: any) {
      alert('Erro ao alterar nível de acesso: ' + err.message);
    }
  };

  const handleDeleteProfile = async (profileId: string, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir o usuário "${name}" do banco de dados?`)) return;
    try {
      await dbService.deleteProfile(profileId);
      await onRefreshData();
    } catch (err: any) {
      alert('Erro ao excluir usuário: ' + err.message);
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin': return <Shield size={16} className="text-emerald" />;
      case 'nutricionista': return <Stethoscope size={16} className="text-blue" />;
      case 'recepcionista': return <PhoneCall size={16} style={{ color: '#f59e0b' }} />;
      case 'paciente': return <User size={16} style={{ color: '#8b5cf6' }} />;
    }
  };

  return (
    <div className="users-roles-container">
      {/* Topo */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--cold-neutral-900)', margin: 0 }}>
            Usuários & Níveis de Acesso da Clínica
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--cold-neutral-600)', margin: 0 }}>
            Gerencie perfis, permissões e papéis sincronizados em tempo real no Supabase PostgreSQL
          </p>
        </div>

        <button className="db-btn db-btn--primary" onClick={onOpenNewUserModal}>
          <UserPlus size={16} /> Novo Usuário & Nível
        </button>
      </div>

      {/* Matriz de Níveis Informativa */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: 'var(--white)', padding: '16px', borderRadius: '10px', border: '1px solid var(--cold-neutral-300)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: 'var(--greenbox-700)', marginBottom: '4px' }}>
            <Shield size={16} /> Administrador (Admin)
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--cold-neutral-600)', margin: 0 }}>
            Acesso irrestrito a configurações, relatórios financeiros, gestão de equipe e todas as dietas.
          </p>
        </div>

        <div style={{ background: 'var(--white)', padding: '16px', borderRadius: '10px', border: '1px solid var(--cold-neutral-300)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: 'var(--carb-color)', marginBottom: '4px' }}>
            <Stethoscope size={16} /> Nutricionista
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--cold-neutral-600)', margin: 0 }}>
            Prescrição com Tabela TACO, avaliação antropométrica, histórico de pacientes e prontuários.
          </p>
        </div>

        <div style={{ background: 'var(--white)', padding: '16px', borderRadius: '10px', border: '1px solid var(--cold-neutral-300)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: '#f59e0b', marginBottom: '4px' }}>
            <PhoneCall size={16} /> Recepcionista
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--cold-neutral-600)', margin: 0 }}>
            Gerenciamento de agenda de consultas, cadastro inicial de pacientes e confirmação de horários.
          </p>
        </div>

        <div style={{ background: 'var(--white)', padding: '16px', borderRadius: '10px', border: '1px solid var(--cold-neutral-300)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: '#8b5cf6', marginBottom: '4px' }}>
            <User size={16} /> Paciente
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--cold-neutral-600)', margin: 0 }}>
            Acesso ao aplicativo mobile, registro de água em tempo real, chat e plano prescrito.
          </p>
        </div>
      </div>

      {/* Tabela de Usuários no Banco */}
      <div style={{ background: 'var(--white)', borderRadius: '12px', border: '1px solid var(--cold-neutral-300)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
        <table className="db-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Usuário</th>
              <th>E-mail</th>
              <th>Cargo / CRN</th>
              <th>Nível de Permissão (Role)</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {profiles.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: 'var(--cold-neutral-500)' }}>
                  Nenhum usuário cadastrado no banco de dados.
                </td>
              </tr>
            ) : (
              profiles.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img
                        src={p.avatar_url || "https://images.unsplash.com/photo-1594824813589-3221b659c256?auto=format&fit=crop&w=200&q=80"}
                        alt={p.name}
                        style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--cold-neutral-900)' }}>{p.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--cold-neutral-500)' }}>{p.clinic || 'NutriCore'}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: 'var(--cold-neutral-700)' }}>{p.email}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{p.title || 'Profissional'}</div>
                    {p.crn && <div style={{ fontSize: '0.75rem', color: 'var(--greenbox-700)' }}>{p.crn}</div>}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {getRoleIcon(p.role)}
                      <select
                        className="db-input-field"
                        style={{ width: '150px', padding: '6px 10px', fontSize: '0.85rem', fontWeight: 700 }}
                        value={p.role}
                        onChange={(e) => handleRoleChange(p.id, e.target.value as UserRole)}
                      >
                        <option value="admin">Admin</option>
                        <option value="nutricionista">Nutricionista</option>
                        <option value="recepcionista">Recepcionista</option>
                        <option value="paciente">Paciente</option>
                      </select>
                    </div>
                  </td>
                  <td>
                    <button
                      className="modal-close-btn"
                      onClick={() => handleDeleteProfile(p.id, p.name)}
                      title="Excluir perfil do banco"
                      style={{ color: 'var(--error-500)' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
