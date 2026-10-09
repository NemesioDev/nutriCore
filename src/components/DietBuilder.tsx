import React, { useState } from 'react';
import {
  Utensils, Plus, Trash2, ArrowRightLeft, Share2, Printer, Clock, Droplets, Sparkles
} from 'lucide-react';
import type { Patient, DietPlan, DietMeal, DietMealItem } from '../types/database';
import { dbService } from '../lib/supabase';
import { AddFoodModal } from './Modals/AddFoodModal';
import { SubstitutionModal } from './Modals/SubstitutionModal';

interface DietBuilderProps {
  patients: Patient[];
  dietPlans: DietPlan[];
  selectedPatientId: string;
  onSelectPatient: (patientId: string) => void;
  onRefreshData: () => Promise<void>;
}

export const DietBuilder: React.FC<DietBuilderProps> = ({
  patients,
  dietPlans,
  selectedPatientId,
  onSelectPatient,
  onRefreshData
}) => {
  const [activeModal, setActiveModal] = useState<{
    type: 'add-food' | 'substitute' | 'new-meal' | null;
    mealId?: string;
    mealName?: string;
    item?: DietMealItem;
  }>({ type: null });

  const [newMealName, setNewMealName] = useState('Lanche da Tarde');
  const [newMealTime, setNewMealTime] = useState('16:00');
  const [isCreatingMeal, setIsCreatingMeal] = useState(false);

  // Encontra o paciente selecionado
  const patient = patients.find(p => p.id === selectedPatientId) || patients[0];

  // Encontra o plano alimentar ativo deste paciente
  const currentPlan = dietPlans.find(d => d.patient_id === patient?.id) || dietPlans[0];

  // Calcula totais reais somando todos os itens de todas as refeições do plano
  const meals: DietMeal[] = currentPlan?.diet_meals || [];
  let totalCalories = 0;
  let totalCarbs = 0;
  let totalProtein = 0;
  let totalFats = 0;

  meals.forEach(meal => {
    (meal.diet_meal_items || []).forEach(item => {
      totalCalories += Number(item.calories) || 0;
      totalCarbs += Number(item.carbs) || 0;
      totalProtein += Number(item.protein) || 0;
      totalFats += Number(item.fats) || 0;
    });
  });

  const targetCal = currentPlan?.target_calories || 2200;
  const targetCarb = currentPlan?.target_carbs || 250;
  const targetProt = currentPlan?.target_protein || 160;
  const targetFat = currentPlan?.target_fats || 60;
  const targetWater = currentPlan?.water_target_ml || 2800;

  const calPercent = Math.min(100, Math.round((totalCalories / targetCal) * 100));

  // Handler para adicionar refeição
  const handleCreateMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPlan) return;
    setIsCreatingMeal(true);
    try {
      await dbService.createDietMeal({
        diet_id: currentPlan.id,
        name: newMealName,
        time: newMealTime,
        order_index: meals.length + 1
      });
      await onRefreshData();
      setActiveModal({ type: null });
    } catch (err: any) {
      alert('Erro ao criar refeição: ' + err.message);
    } finally {
      setIsCreatingMeal(false);
    }
  };

  // Handler para excluir refeição
  const handleDeleteMeal = async (mealId: string, mealName: string) => {
    if (!confirm(`Tem certeza que deseja excluir a refeição "${mealName}"?`)) return;
    try {
      await dbService.deleteDietMeal(mealId);
      await onRefreshData();
    } catch (err: any) {
      alert('Erro ao remover refeição: ' + err.message);
    }
  };

  // Handler para adicionar alimento à refeição
  const handleAddFood = async (mealId: string, foodData: any) => {
    try {
      await dbService.createDietMealItem({
        meal_id: mealId,
        food_id: foodData.food_id,
        food_name: foodData.food_name,
        grams: foodData.grams,
        portion_name: foodData.portion_name,
        calories: foodData.calories,
        carbs: foodData.carbs,
        protein: foodData.protein,
        fats: foodData.fats,
        fiber: foodData.fiber,
      });
      await onRefreshData();
    } catch (err: any) {
      alert('Erro ao adicionar alimento: ' + err.message);
    }
  };

  // Handler para remover item da refeição
  const handleDeleteFoodItem = async (itemId: string) => {
    try {
      await dbService.deleteDietMealItem(itemId);
      await onRefreshData();
    } catch (err: any) {
      alert('Erro ao remover alimento: ' + err.message);
    }
  };

  // Handler para aplicar substituição
  const handleApplySubstitution = async (itemId: string, replacement: any) => {
    try {
      await dbService.updateDietMealItem(itemId, {
        food_id: replacement.food_id,
        food_name: replacement.food_name,
        grams: replacement.grams,
        portion_name: replacement.portion_name,
        calories: replacement.calories,
        carbs: replacement.carbs,
        protein: replacement.protein,
        fats: replacement.fats,
        fiber: replacement.fiber,
      });
      await onRefreshData();
    } catch (err: any) {
      alert('Erro ao substituir alimento: ' + err.message);
    }
  };

  // Compartilhar Dieta via WhatsApp
  const handleShareWhatsApp = () => {
    if (!currentPlan) return;
    let message = `*🌿 PLANO ALIMENTAR NUTRICORE*\n`;
    message += `*Paciente:* ${patient?.name || 'Cliente'}\n`;
    message += `*Meta Diária:* ${totalCalories} kcal (${calPercent}% da meta de ${targetCal} kcal)\n`;
    message += `*Hidratação:* ${targetWater}ml ao dia\n\n`;

    meals.forEach(m => {
      message += `⏰ *${m.name} (${m.time})*\n`;
      const items = m.diet_meal_items || [];
      if (items.length === 0) {
        message += `  - Nenhuma opção prescrita.\n`;
      } else {
        items.forEach(i => {
          message += `  • ${i.food_name} (${i.portion_name || `${i.grams}g`}) - ${i.calories} kcal\n`;
        });
      }
      message += `\n`;
    });

    message += `Dúvidas? Entre em contato pelo app NutriCore!`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // Imprimir ou Exportar PDF
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="diet-builder-container">
      {/* Barra Superior de Seleção de Paciente & Ações */}
      <div className="diet-builder-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div>
            <label className="form-label" style={{ marginBottom: 4, display: 'block' }}>Selecionar Paciente Ativo</label>
            <select
              className="db-input-field"
              value={patient?.id || ''}
              onChange={(e) => onSelectPatient(e.target.value)}
              style={{ fontWeight: 700, minWidth: '260px' }}
            >
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.objective || 'Sem objetivo'})
                </option>
              ))}
            </select>
          </div>
          {patient && (
            <div style={{ padding: '8px 14px', background: 'var(--white)', borderRadius: '8px', border: '1px solid var(--cold-neutral-300)', marginTop: '22px' }}>
              <span style={{ fontSize: '0.825rem', color: 'var(--cold-neutral-600)' }}>
                Peso: <b>{patient.weight}kg</b> • Altura: <b>{patient.height}cm</b> • Meta: <b>{patient.objective}</b>
              </span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
          <button
            className="db-btn db-btn--outline"
            onClick={() => setActiveModal({ type: 'new-meal' })}
          >
            <Plus size={16} /> Nova Refeição
          </button>
          <button
            className="db-btn db-btn--outline"
            onClick={handleShareWhatsApp}
            title="Enviar prescrição formatada via WhatsApp"
          >
            <Share2 size={16} className="text-emerald" /> WhatsApp
          </button>
          <button
            className="db-btn db-btn--primary"
            onClick={handlePrint}
            title="Imprimir ou Salvar em PDF"
          >
            <Printer size={16} /> Imprimir / PDF
          </button>
        </div>
      </div>

      {/* Barra de Resumo Nutricional e Metas em Tempo Real */}
      <div className="macro-bar-card" style={{ background: 'var(--white)', padding: '20px', borderRadius: '12px', border: '1px solid var(--cold-neutral-300)', boxShadow: 'var(--shadow-sm)', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--cold-neutral-900)' }}>
              {currentPlan?.title || `Plano Nutricional • ${patient?.name}`}
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--cold-neutral-600)' }}>
              Sincronizado em tempo real com o banco de dados Supabase
            </span>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span className="badge badge-cal" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
              {totalCalories} / {targetCal} kcal ({calPercent}%)
            </span>
            <span className="badge" style={{ background: '#e0f2fe', color: '#0284c7', padding: '6px 12px', fontSize: '0.85rem' }}>
              <Droplets size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
              {targetWater}ml Água
            </span>
          </div>
        </div>

        {/* Barra de Progresso de Calorias */}
        <div style={{ width: '100%', height: '10px', background: 'var(--cold-neutral-200)', borderRadius: '999px', overflow: 'hidden', marginBottom: '16px' }}>
          <div
            style={{
              height: '100%',
              width: `${calPercent}%`,
              background: calPercent > 105 ? '#ef4444' : 'var(--greenbox-500)',
              borderRadius: '999px',
              transition: 'width 0.3s ease'
            }}
          />
        </div>

        {/* 4 Cards de Macronutrientes */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
          <div style={{ padding: '12px', background: 'var(--cal-light)', borderRadius: '8px', borderLeft: '4px solid var(--cal-color)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--cold-neutral-600)' }}>CALORIAS TOTAIS</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--cal-color)' }}>{totalCalories} <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>/ {targetCal} kcal</span></div>
          </div>

          <div style={{ padding: '12px', background: 'var(--carb-light)', borderRadius: '8px', borderLeft: '4px solid var(--carb-color)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--cold-neutral-600)' }}>CARBOIDRATOS</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--carb-color)' }}>{Math.round(totalCarbs)}g <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>/ {targetCarb}g</span></div>
          </div>

          <div style={{ padding: '12px', background: 'var(--prot-light)', borderRadius: '8px', borderLeft: '4px solid var(--prot-color)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--cold-neutral-600)' }}>PROTEÍNAS</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--prot-color)' }}>{Math.round(totalProtein)}g <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>/ {targetProt}g</span></div>
          </div>

          <div style={{ padding: '12px', background: 'var(--fat-light)', borderRadius: '8px', borderLeft: '4px solid var(--fat-color)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--cold-neutral-600)' }}>GORDURAS (LIPÍDIOS)</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--fat-color)' }}>{Math.round(totalFats)}g <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>/ {targetFat}g</span></div>
          </div>
        </div>
      </div>

      {/* Lista de Refeições Prescritas */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {meals.length === 0 ? (
          <div className="empty-state" style={{ padding: '3rem', textAlign: 'center', background: 'var(--white)', borderRadius: '12px' }}>
            <Utensils size={40} style={{ color: 'var(--cold-neutral-400)', marginBottom: '12px' }} />
            <h3>Nenhuma refeição cadastrada para este paciente.</h3>
            <p style={{ color: 'var(--cold-neutral-600)', marginBottom: '1rem' }}>
              Adicione a primeira refeição para começar a prescrever pela Tabela TACO.
            </p>
            <button
              className="db-btn db-btn--primary"
              onClick={() => setActiveModal({ type: 'new-meal' })}
            >
              <Plus size={16} /> Adicionar Primeira Refeição
            </button>
          </div>
        ) : (
          meals.map((meal) => {
            const items = meal.diet_meal_items || [];
            let mealCal = 0;
            let mealCarb = 0;
            let mealProt = 0;
            let mealFat = 0;

            items.forEach(i => {
              mealCal += Number(i.calories) || 0;
              mealCarb += Number(i.carbs) || 0;
              mealProt += Number(i.protein) || 0;
              mealFat += Number(i.fats) || 0;
            });

            return (
              <div
                key={meal.id}
                className="meal-card"
                style={{
                  background: 'var(--white)',
                  borderRadius: '12px',
                  border: '1px solid var(--cold-neutral-300)',
                  boxShadow: 'var(--shadow-sm)',
                  overflow: 'hidden'
                }}
              >
                {/* Header da Refeição */}
                <div
                  style={{
                    padding: '14px 20px',
                    background: 'var(--cold-neutral-50)',
                    borderBottom: '1px solid var(--cold-neutral-200)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: 34, height: 34, borderRadius: '8px', background: 'var(--greenbox-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Clock size={16} className="text-emerald" />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--cold-neutral-900)' }}>
                        {meal.name}
                      </h4>
                      <span style={{ fontSize: '0.8rem', color: 'var(--cold-neutral-600)' }}>
                        Horário: <b>{meal.time}</b>
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ display: 'flex', gap: '6px', fontSize: '0.75rem' }}>
                      <span className="badge badge-cal">{mealCal} kcal</span>
                      <span className="badge badge-c">{Math.round(mealCarb)}g C</span>
                      <span className="badge badge-p">{Math.round(mealProt)}g P</span>
                      <span className="badge badge-f">{Math.round(mealFat)}g G</span>
                    </div>

                    <button
                      className="db-btn db-btn--outline db-btn--sm"
                      onClick={() => setActiveModal({ type: 'add-food', mealId: meal.id, mealName: meal.name })}
                      title="Adicionar alimento da Tabela TACO"
                    >
                      <Plus size={14} /> Alimento
                    </button>

                    <button
                      className="modal-close-btn"
                      onClick={() => handleDeleteMeal(meal.id, meal.name)}
                      title="Remover refeição"
                      style={{ color: 'var(--error-500)', padding: 6 }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Itens da Refeição */}
                <div style={{ padding: '14px 20px' }}>
                  {items.length === 0 ? (
                    <div style={{ padding: '16px', textAlign: 'center', color: 'var(--cold-neutral-500)', fontSize: '0.85rem' }}>
                      Nenhum alimento inserido nesta refeição. Clique em "+ Alimento" para buscar na Tabela TACO.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="diet-item-row"
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            background: 'var(--cold-neutral-50)',
                            border: '1px solid var(--cold-neutral-200)'
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--cold-neutral-900)' }}>
                              {item.food_name}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--cold-neutral-600)' }}>
                              Quantidade: <b>{item.portion_name || `${item.grams}g`}</b>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ display: 'flex', gap: '6px', fontSize: '0.75rem' }}>
                              <span className="badge badge-cal">{item.calories} kcal</span>
                              <span className="badge badge-c">{item.carbs}g C</span>
                              <span className="badge badge-p">{item.protein}g P</span>
                              <span className="badge badge-f">{item.fats}g G</span>
                            </div>

                            <button
                              type="button"
                              className="db-btn db-btn--outline db-btn--sm"
                              style={{ padding: '4px 8px', fontSize: '0.75rem', color: 'var(--cold-neutral-700)' }}
                              onClick={() => setActiveModal({ type: 'substitute', item })}
                              title="Substituições inteligentes TACO"
                            >
                              <ArrowRightLeft size={13} /> Substitutos
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteFoodItem(item.id)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--cold-neutral-400)', padding: 4 }}
                              title="Excluir item"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal de Adição de Alimento TACO */}
      <AddFoodModal
        isOpen={activeModal.type === 'add-food'}
        mealId={activeModal.mealId || null}
        mealName={activeModal.mealName || ''}
        onClose={() => setActiveModal({ type: null })}
        onAddFood={handleAddFood}
      />

      {/* Modal de Substituição Inteligente */}
      <SubstitutionModal
        isOpen={activeModal.type === 'substitute'}
        item={activeModal.item || null}
        onClose={() => setActiveModal({ type: null })}
        onApplySubstitution={handleApplySubstitution}
      />

      {/* Modal de Nova Refeição */}
      {activeModal.type === 'new-meal' && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <div className="modal-title">
                <Utensils size={20} className="text-emerald" />
                <h3>Adicionar Nova Refeição</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setActiveModal({ type: null })}>✕</button>
            </div>
            <form onSubmit={handleCreateMeal} className="modal-body">
              <div className="form-group">
                <label className="form-label">Nome da Refeição</label>
                <input
                  type="text"
                  className="db-input-field"
                  value={newMealName}
                  onChange={(e) => setNewMealName(e.target.value)}
                  placeholder="Ex: Café da Manhã, Pré-Treino, Jantar..."
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Horário Sugerido</label>
                <input
                  type="time"
                  className="db-input-field"
                  value={newMealTime}
                  onChange={(e) => setNewMealTime(e.target.value)}
                  required
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="db-btn db-btn--outline" onClick={() => setActiveModal({ type: null })}>
                  Cancelar
                </button>
                <button type="submit" className="db-btn db-btn--primary" disabled={isCreatingMeal}>
                  <Sparkles size={16} /> {isCreatingMeal ? 'Criando...' : 'Adicionar ao Plano'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
