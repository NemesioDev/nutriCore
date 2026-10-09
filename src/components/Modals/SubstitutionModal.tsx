import React from 'react';
import { X, ArrowRightLeft, Check } from 'lucide-react';
import { TACO_DATABASE } from '../../lib/tacoDatabase';
import type { DietMealItem } from '../../types/database';

interface SubstitutionModalProps {
  isOpen: boolean;
  item: DietMealItem | null;
  onClose: () => void;
  onApplySubstitution: (itemId: string, replacement: {
    food_id: string;
    food_name: string;
    grams: number;
    portion_name: string;
    calories: number;
    carbs: number;
    protein: number;
    fats: number;
    fiber: number;
  }) => Promise<void>;
}

export const SubstitutionModal: React.FC<SubstitutionModalProps> = ({
  isOpen,
  item,
  onClose,
  onApplySubstitution
}) => {
  if (!isOpen || !item) return null;

  // Encontra o alimento original na TACO
  const originalTaco = TACO_DATABASE.find(f => f.id === item.food_id || f.name === item.food_name);

  // Encontra substitutos cadastrados ou pelo menos da mesma categoria
  const substituteIds = originalTaco?.substitutes || [];
  const directSubstitutes = TACO_DATABASE.filter(f => substituteIds.includes(f.id));
  const categorySubstitutes = directSubstitutes.length > 0
    ? directSubstitutes
    : TACO_DATABASE.filter(f => f.category === originalTaco?.category && f.id !== originalTaco?.id).slice(0, 4);

  // Calcula porção equivalente para manter aproximadamente a mesma caloria
  const getEquivalent = (sub: typeof TACO_DATABASE[0]) => {
    const targetCalories = item.calories;
    const equivalentGrams = Math.round((targetCalories / sub.calories) * 100);
    const cal = Math.round((sub.calories * equivalentGrams) / 100);
    const carbs = Number(((sub.carbs * equivalentGrams) / 100).toFixed(1));
    const protein = Number(((sub.protein * equivalentGrams) / 100).toFixed(1));
    const fats = Number(((sub.fats * equivalentGrams) / 100).toFixed(1));
    const fiber = Number(((sub.fiber * equivalentGrams) / 100).toFixed(1));

    return {
      grams: equivalentGrams,
      portionName: `${equivalentGrams}g (${sub.name})`,
      calories: cal,
      carbs,
      protein,
      fats,
      fiber
    };
  };

  const handleSelect = async (sub: typeof TACO_DATABASE[0]) => {
    const eq = getEquivalent(sub);
    await onApplySubstitution(item.id, {
      food_id: sub.id,
      food_name: sub.name,
      grams: eq.grams,
      portion_name: eq.portionName,
      calories: eq.calories,
      carbs: eq.carbs,
      protein: eq.protein,
      fats: eq.fats,
      fiber: eq.fiber
    });
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <div className="modal-title">
            <ArrowRightLeft size={20} className="text-emerald" />
            <div>
              <h3>Lista de Substituições Inteligentes</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--cold-neutral-500)', margin: 0 }}>
                Baseado em equivalência isocalórica da Tabela TACO
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="modal-body">
          {/* Item Original */}
          <div style={{ background: 'var(--cold-neutral-100)', padding: '14px', borderRadius: '10px', marginBottom: '16px', borderLeft: '4px solid var(--greenbox-600)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--cold-neutral-600)', textTransform: 'uppercase' }}>
              Alimento Original Prescrito
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--cold-neutral-900)', marginTop: '2px' }}>
              {item.food_name} • {item.grams}g
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '6px', fontSize: '0.8rem' }}>
              <span className="badge badge-cal">{item.calories} kcal</span>
              <span className="badge badge-c">{item.carbs}g Carbs</span>
              <span className="badge badge-p">{item.protein}g Prot</span>
              <span className="badge badge-f">{item.fats}g Gord</span>
            </div>
          </div>

          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--cold-neutral-700)', marginBottom: '10px' }}>
            Opções Equivalentes Sugeridas:
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {categorySubstitutes.length === 0 ? (
              <div className="empty-state">Nenhum substituto correspondente cadastrado.</div>
            ) : (
              categorySubstitutes.map(sub => {
                const eq = getEquivalent(sub);
                return (
                  <div
                    key={sub.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      background: 'var(--white)',
                      border: '1px solid var(--cold-neutral-200)',
                      borderRadius: '10px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.925rem', color: 'var(--cold-neutral-900)' }}>
                        {sub.name}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--greenbox-700)', fontWeight: 600 }}>
                        Substituir por: {eq.grams}g (~{eq.calories} kcal)
                      </div>
                      <div style={{ display: 'flex', gap: '6px', marginTop: '4px', fontSize: '0.75rem' }}>
                        <span className="badge badge-c">{eq.carbs}g C</span>
                        <span className="badge badge-p">{eq.protein}g P</span>
                        <span className="badge badge-f">{eq.fats}g G</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="db-btn db-btn--outline db-btn--sm"
                      onClick={() => handleSelect(sub)}
                      style={{ borderColor: 'var(--greenbox-500)', color: 'var(--greenbox-700)' }}
                    >
                      <Check size={14} /> Aplicar
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="db-btn db-btn--outline" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
