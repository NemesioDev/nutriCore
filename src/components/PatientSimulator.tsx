import React, { useState, useEffect } from 'react';
import { Droplets, CheckCircle, Send, MessageSquare, Utensils, Plus } from 'lucide-react';
import type { Patient, DietPlan, ChatMessage } from '../types/database';
import { dbService, supabase } from '../lib/supabase';

interface PatientSimulatorProps {
  patients: Patient[];
  dietPlans: DietPlan[];
  selectedPatientId: string;
  onSelectPatient: (patientId: string) => void;
}

export const PatientSimulator: React.FC<PatientSimulatorProps> = ({
  patients,
  dietPlans,
  selectedPatientId,
  onSelectPatient
}) => {
  const patient = patients.find(p => p.id === selectedPatientId) || patients[0];
  const activePlan = dietPlans.find(d => d.patient_id === patient?.id) || dietPlans[0];

  const [waterMl, setWaterMl] = useState<number>(1500);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'diet' | 'chat'>('diet');
  const [isAddingWater, setIsAddingWater] = useState(false);

  // Carrega hidratação e chat do Supabase
  useEffect(() => {
    if (!patient?.id) return;

    dbService.getTodayWater(patient.id).then(ml => setWaterMl(ml || 1500));
    dbService.getChatMessages(patient.id).then(msgs => setMessages(msgs));

    // Escuta novas mensagens no Supabase Realtime
    const chatSubscription = supabase
      .channel(`chat-patient-${patient.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `patient_id=eq.${patient.id}` },
        (payload) => {
          setMessages(prev => [...prev, payload.new as ChatMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(chatSubscription);
    };
  }, [patient?.id]);

  const handleAddWater = async () => {
    if (!patient?.id) return;
    setIsAddingWater(true);
    try {
      const updated = await dbService.addWater(patient.id, 250);
      setWaterMl(updated);
    } catch (err: any) {
      alert('Erro ao registrar água: ' + err.message);
    } finally {
      setIsAddingWater(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !patient?.id) return;
    try {
      const msg = await dbService.sendChatMessage(patient.id, 'paciente', newMessage);
      setMessages(prev => [...prev, msg]);
      setNewMessage('');
    } catch (err: any) {
      alert('Erro ao enviar mensagem: ' + err.message);
    }
  };

  const waterTarget = activePlan?.water_target_ml || 2800;
  const waterPercent = Math.min(100, Math.round((waterMl / waterTarget) * 100));

  return (
    <div className="patient-simulator-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Topo: Seleção de Paciente e Explicação */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--cold-neutral-900)', margin: '0 0 6px' }}>
          Simulador Oficial • Aplicativo do Paciente (Mobile)
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--cold-neutral-600)', margin: '0 0 16px' }}>
          Visualização instantânea com sincronização bidirecional em tempo real no Supabase
        </p>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'var(--white)', padding: '6px 14px', borderRadius: '30px', border: '1px solid var(--cold-neutral-300)' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Simulando paciente:</span>
          <select
            className="db-input-field"
            value={patient?.id || ''}
            onChange={(e) => onSelectPatient(e.target.value)}
            style={{ border: 'none', background: 'none', fontWeight: 800, color: 'var(--greenbox-700)', cursor: 'pointer' }}
          >
            {patients.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Mockup do Smartphone (Bezel Frame) */}
      <div
        className="phone-bezel"
        style={{
          width: 'min(380px, 94vw)',
          maxWidth: '100%',
          height: 'min(760px, 85vh)',
          background: '#0F172A',
          borderRadius: '44px',
          padding: '12px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Notch / Dynamic Island */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
          <div style={{ width: '110px', height: '22px', background: '#000', borderRadius: '20px' }} />
        </div>

        {/* Tela do Aplicativo */}
        <div
          style={{
            flex: 1,
            background: 'var(--cold-neutral-100)',
            borderRadius: '34px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Header do App do Paciente */}
          <div style={{ background: 'var(--greenbox-600)', padding: '16px 18px', color: 'var(--white)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img
                  src={patient?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"}
                  alt={patient?.name}
                  style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.4)' }}
                />
                <div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>Bem-vindo(a),</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800 }}>{patient?.name?.split(' ')[0]}</div>
                </div>
              </div>
              <div style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.2)', padding: '4px 8px', borderRadius: '12px' }}>
                Dra. Camila
              </div>
            </div>
          </div>

          {/* Abas do App: Dieta x Chat */}
          <div style={{ display: 'flex', background: 'var(--white)', borderBottom: '1px solid var(--cold-neutral-200)' }}>
            <button
              type="button"
              onClick={() => setActiveTab('diet')}
              style={{
                flex: 1,
                padding: '10px',
                border: 'none',
                background: 'none',
                fontWeight: 700,
                fontSize: '0.85rem',
                color: activeTab === 'diet' ? 'var(--greenbox-600)' : 'var(--cold-neutral-600)',
                borderBottom: activeTab === 'diet' ? '3px solid var(--greenbox-600)' : 'none',
                cursor: 'pointer'
              }}
            >
              <Utensils size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} /> Dieta de Hoje
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('chat')}
              style={{
                flex: 1,
                padding: '10px',
                border: 'none',
                background: 'none',
                fontWeight: 700,
                fontSize: '0.85rem',
                color: activeTab === 'chat' ? 'var(--greenbox-600)' : 'var(--cold-neutral-600)',
                borderBottom: activeTab === 'chat' ? '3px solid var(--greenbox-600)' : 'none',
                cursor: 'pointer'
              }}
            >
              <MessageSquare size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} /> Chat Nutricional
            </button>
          </div>

          {/* Conteúdo da Tela do App */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px' }}>
            {activeTab === 'diet' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Card de Hidratação Diária */}
                <div style={{ background: 'var(--white)', padding: '14px', borderRadius: '14px', border: '1px solid var(--cold-neutral-200)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, fontSize: '0.9rem', color: '#0284c7' }}>
                      <Droplets size={16} /> Meta de Hidratação
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--cold-neutral-700)' }}>
                      {waterMl} / {waterTarget} ml
                    </span>
                  </div>

                  <div style={{ width: '100%', height: '8px', background: '#e0f2fe', borderRadius: '99px', overflow: 'hidden', marginBottom: '10px' }}>
                    <div style={{ width: `${waterPercent}%`, height: '100%', background: '#0284c7', borderRadius: '99px', transition: 'width 0.3s ease' }} />
                  </div>

                  <button
                    type="button"
                    onClick={handleAddWater}
                    disabled={isAddingWater}
                    className="db-btn db-btn--primary"
                    style={{ width: '100%', padding: '8px', fontSize: '0.8rem', background: '#0284c7' }}
                  >
                    <Plus size={14} /> +250ml (1 Copo de Água)
                  </button>
                </div>

                {/* Refeições do Paciente */}
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--cold-neutral-600)', textTransform: 'uppercase' }}>
                  Suas Refeições Prescritas
                </div>

                {(activePlan?.diet_meals || []).map(m => (
                  <div key={m.id} style={{ background: 'var(--white)', borderRadius: '12px', padding: '12px', border: '1px solid var(--cold-neutral-200)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.875rem', color: 'var(--cold-neutral-900)' }}>
                        {m.name}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--cold-neutral-500)' }}>{m.time}</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {(m.diet_meal_items || []).map(i => (
                        <div key={i.id} style={{ fontSize: '0.775rem', color: 'var(--cold-neutral-700)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <CheckCircle size={13} className="text-emerald" />
                          <span>{i.food_name} ({i.portion_name || `${i.grams}g`})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Chat Realtime */
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingBottom: '10px' }}>
                  {messages.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--cold-neutral-500)', fontSize: '0.8rem', padding: '20px' }}>
                      Inicie uma conversa direta com sua nutricionista!
                    </div>
                  ) : (
                    messages.map(m => {
                      const isMe = m.sender_role === 'paciente';
                      return (
                        <div
                          key={m.id}
                          style={{
                            alignSelf: isMe ? 'flex-end' : 'flex-start',
                            maxWidth: '82%',
                            padding: '8px 12px',
                            borderRadius: '12px',
                            background: isMe ? 'var(--greenbox-600)' : 'var(--white)',
                            color: isMe ? 'var(--white)' : 'var(--cold-neutral-900)',
                            border: isMe ? 'none' : '1px solid var(--cold-neutral-200)',
                            fontSize: '0.8rem'
                          }}
                        >
                          <div>{m.message}</div>
                          <div style={{ fontSize: '0.65rem', opacity: 0.7, textAlign: 'right', marginTop: '2px' }}>
                            {new Date(m.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '6px', paddingTop: '8px', borderTop: '1px solid var(--cold-neutral-200)' }}>
                  <input
                    type="text"
                    className="db-input-field"
                    style={{ padding: '8px 12px', fontSize: '0.8rem' }}
                    placeholder="Escreva sua dúvida..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <button type="submit" className="db-btn db-btn--primary db-btn--sm" style={{ padding: '8px 12px' }}>
                    <Send size={14} />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
