import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Zap, CheckCircle2, ShieldCheck, Smartphone, AlertCircle } from 'lucide-react';

interface AuthScreenProps {
  onLogin: (email: string, password: string, role: string) => Promise<boolean> | boolean;
  onOpenNewUserModal: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, onOpenNewUserModal }) => {
  const [role, setRole] = useState<'nutricionista' | 'paciente'>('nutricionista');
  const [email, setEmail] = useState('camila.nutri@nutricore.com.br');
  const [password, setPassword] = useState('NutriCore@2026');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);
    try {
      const success = await onLogin(email, password, role);
      if (!success) {
        setErrorMsg('E-mail ou senha incorretos. Verifique suas credenciais.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao realizar login.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Banner Promocional Lateral Esquerda */}
      <div className="auth-banner-side">
        <div className="auth-banner-header">
          <div className="auth-logo">
            <svg className="auth-logo-svg" viewBox="0 0 200 200">
              <defs>
                <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00D285"/>
                  <stop offset="100%" stopColor="#10B981"/>
                </linearGradient>
              </defs>
              <path fill="url(#logoGrad)" d="m86.55,181.66v-67.23c0-4.42,2.36-8.5,6.18-10.71l58.23-33.62c3.33-1.92,7.34-2.17,10.85-.74-.44-.34-.91-.66-1.4-.94l-58.23-33.62c-3.83-2.21-8.54-2.21-12.36,0l-58.23,33.62c-3.83,2.21-6.18,6.29-6.18,10.71v67.23c0,4.42,2.36,8.5,6.18,10.71l58.23,33.62c.49.28,1,.53,1.52.74-2.99-2.32-4.78-5.91-4.78-9.76Z"/>
              <circle cx="130" cy="32" r="24" fill="#00D285"/>
            </svg>
            <span className="auth-logo-text">nutri<span>core</span></span>
          </div>
        </div>

        <div className="auth-banner-content">
          <div className="auth-banner-badge">
            <ShieldCheck size={15} /> Plataforma Clínica Certificada
          </div>
          <h2 className="auth-banner-title">
            Prescrição precisa de dietas e <b>gestão completa</b> para nutricionistas.
          </h2>
          <p className="auth-banner-description">
            Plataforma moderna com banco relacional de alta segurança, Tabela TACO oficial, cálculos metabólicos automáticos e aplicativo do paciente integrado.
          </p>

          <div className="auth-features-pills">
            <div className="auth-feature-item">
              <CheckCircle2 size={16} className="text-emerald" />
              <span>Cálculo Automático TACO</span>
            </div>
            <div className="auth-feature-item">
              <ShieldCheck size={16} className="text-emerald" />
              <span>Níveis de Acesso & Perfis</span>
            </div>
            <div className="auth-feature-item">
              <Smartphone size={16} className="text-emerald" />
              <span>App do Paciente Integrado</span>
            </div>
            <div className="auth-feature-item">
              <Zap size={16} className="text-emerald" />
              <span>Sincronização Instantânea</span>
            </div>
          </div>
        </div>

        <div className="auth-banner-footer">
          © 2026 NutriCore Tecnologia em Nutrição e Saúde. Todos os direitos reservados.
        </div>
      </div>

      {/* Formulário de Autenticação */}
      <div className="auth-form-side">
        <div className="auth-card">
          <div className="auth-role-tabs">
            <button
              type="button"
              className={`auth-role-tab ${role === 'nutricionista' ? 'active' : ''}`}
              onClick={() => {
                setRole('nutricionista');
                setEmail('camila.nutri@nutricore.com.br');
                setPassword('NutriCore@2026');
                setErrorMsg('');
              }}
            >
              Nutricionista
            </button>
            <button
              type="button"
              className={`auth-role-tab ${role === 'paciente' ? 'active' : ''}`}
              onClick={() => {
                setRole('paciente');
                setEmail('rodrigo.silveira@email.com');
                setPassword('NutriCore@2026');
                setErrorMsg('');
              }}
            >
              Paciente
            </button>
          </div>

          <div className="auth-title-box">
            <h1>Para acessar o <b>NutriCore</b>,<br/>realize o login abaixo</h1>
            <p>
              {role === 'nutricionista'
                ? 'Acesso profissional à prescrição e consultório.'
                : 'Acesso do paciente ao plano alimentar e metas.'}
            </p>
          </div>

          {errorMsg && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="auth-field">
              <label className="auth-label">E-mail de acesso</label>
              <div className="auth-input-wrapper">
                <Mail size={16} className="input-icon" style={{ position: 'absolute', left: 14, color: 'var(--cold-neutral-500)' }} />
                <input
                  type="email"
                  className="auth-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seuemail@aqui.com"
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label">Senha</label>
              <div className="auth-input-wrapper">
                <Lock size={16} className="input-icon" style={{ position: 'absolute', left: 14, color: 'var(--cold-neutral-500)' }} />
                <input
                  type="password"
                  className="auth-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                />
              </div>
            </div>

            <div className="auth-options-row">
              <label className="auth-remember">
                <input type="checkbox" defaultChecked />
                <span>Lembrar meu acesso</span>
              </label>
              <a href="#" className="auth-forgot-link" onClick={(e) => { e.preventDefault(); alert('Link de recuperação enviado para seu e-mail!'); }}>
                Esqueci minha senha
              </a>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={submitting}>
              <span>{submitting ? 'Verificando...' : 'Entrar no NutriCore'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          <div className="auth-demo-shortcut">
            <p><Zap size={14} className="text-emerald" style={{ display: 'inline', verticalAlign: 'middle' }} /> Acesso rápido pré-configurado:</p>
            <button
              type="button"
              className="auth-demo-btn"
              onClick={() => {
                setEmail('camila.nutri@nutricore.com.br');
                setPassword('NutriCore@2026');
                onLogin('camila.nutri@nutricore.com.br', 'NutriCore@2026', 'nutricionista');
              }}
            >
              Entrar como Dra. Camila (CRN-3 48.291)
            </button>
          </div>

          <div className="auth-register-footer">
            Novo usuário na clínica?{' '}
            <a href="#" onClick={(e) => { e.preventDefault(); onOpenNewUserModal(); }}>
              Cadastrar usuário & nível
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
