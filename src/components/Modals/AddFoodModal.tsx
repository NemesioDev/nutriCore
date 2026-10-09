import React, { useState, useMemo } from 'react';
import { X, Search, Plus, Utensils } from 'lucide-react';
import { TACO_DATABASE } from '../../lib/tacoDatabase';
import type { TacoFood } from '../../types/database';

interface AddFoodModalProps {
  isOpen: boolean;
  mealId: string | null;
  mealName: string;
  onClose: () => void;
  onAddFood: (mealId: string, item: {
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

export const AddFoodModal: React.FC<AddFoodModalProps> = ({
  isOpen,
  mealId,
  mealName,
  onClose,
  onAddFood
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [selectedFood, setSelectedFood] = useState<TacoFood | null>(null);
  const [grams, setGrams] = useState<number>(100);
  const [loading, setLoading] = useState(false);

  const categories = useMemo(() => {
    const set = new Set(TACO_DATABASE.map(f => f.category));
    return ['Todas', ...Array.from(set)];
  }, []);

  const filteredFoods = useMemo(() => {
    return TACO_DATABASE.filter(f => {
      const matchSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = categoryFilter === 'Todas' || f.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [searchTerm, categoryFilter]);

  if (!isOpen || !mealId) return null;

  const handleSelectFood = (food: TacoFood) => {
    setSelectedFood(food);
    setGrams(food.standardGrams || 100);
  };

  // Calcula valores proporcionais aos gramas informados
  const calculatedMacros = selectedFood ? {
    calories: Math.round((selectedFood.calories * grams) / 100),
    carbs: Number(((selectedFood.carbs * grams) / 100).toFixed(1)),
    protein: Number(((selectedFood.protein * grams) / 100).toFixed(1)),
    fats: Number(((selectedFood.fats * grams) / 100).toFixed(1)),
    fiber: Number(((selectedFood.fiber * grams) / 100).toFixed(1)),
  } : null;

  const handleAdd = async () => {
    if (!selectedFood || !calculatedMacros) return;
    setLoading(true);
    try {
      await onAddFood(mealId, {
        food_id: selectedFood.id,
        food_name: selectedFood.name,
        grams,
        portion_name: `${grams}g (${selectedFood.standardPortion})`,
        calories: calculatedMacros.calories,
        carbs: calculatedMacros.carbs,
        protein: calculatedMacros.protein,
        fats: calculatedMacros.fats,
        fiber: calculatedMacros.fiber,
      });
      setSelectedFood(null);
      setSearchTerm('');
      onClose();
    } catch (err: any) {
      alert('Erro ao adicionar alimento: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card modal-card--lg">
        <div className="modal-header">
          <div className="modal-title">
            <Utensils size={20} className="text-emerald" />
            <div>
              <h3>Tabela TACO Oficial • Adicionar Alimento</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--cold-neutral-500)', margin: 0 }}>
                Adicionando para: <b>{mealName}</b>
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: selectedFood ? '1.4fr 1fr' : '1fr', gap: '20px' }}>
          {/* Lado Esquerdo: Busca e Lista de Alimentos */}
          <div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <div className="search-bar" style={{ flex: 1 }}>
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Buscar na Tabela TACO (ex: frango, arroz, aveia...)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />
              </div>
              <select
                className="db-input-field"
                style={{ width: '160px' }}
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div style={{ maxHeight: '380px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {filteredFoods.length === 0 ? (
                <div className="empty-state">Nenhum alimento encontrado na Tabela TACO.</div>
              ) : (
                filteredFoods.map(food => (
                  <div
                    key={food.id}
                    className={`taco-food-item ${selectedFood?.id === food.id ? 'selected' : ''}`}
                    onClick={() => handleSelectFood(food)}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: selectedFood?.id === food.id ? '2px solid var(--greenbox-600)' : '1px solid var(--cold-neutral-200)',
                      background: selectedFood?.id === food.id ? 'var(--greenbox-light)' : 'var(--white)',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--cold-neutral-900)' }}>
                        {food.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--cold-neutral-500)' }}>
                        {food.category} • {food.standardPortion}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', fontSize: '0.75rem' }}>
                      <span className="badge badge-cal">{food.calories} kcal/100g</span>
                      <span className="badge badge-p">{food.protein}g P</span>
                      <span className="badge badge-c">{food.carbs}g C</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Lado Direito: Ajuste de Porção e Prévia de Macros */}
          {selectedFood && calculatedMacros && (
            <div style={{ background: 'var(--cold-neutral-50)', padding: '16px', borderRadius: '12px', border: '1px solid var(--cold-neutral-200)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ margin: '0 0 12px', fontSize: '1rem', color: 'var(--cold-neutral-900)' }}>
                  Ajustar Porção Prescrita
                </h4>
                <div style={{ fontWeight: 600, color: 'var(--greenbox-700)', marginBottom: '4px' }}>
                  {selectedFood.name}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--cold-neutral-600)', marginBottom: '16px' }}>
                  Porção padrão: {selectedFood.standardPortion}
                </div>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label">Quantidade em Gramas (g)</label>
                  <input
                    type="number"
                    className="db-input-field"
                    value={grams}
                    onChange={(e) => setGrams(Math.max(1, Number(e.target.value)))}
                    min={1}
                    max={2000}
                  />
                  <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                    {[50, 100, 150, 200].map(g => (
                      <button
                        key={g}
                        type="button"
                        className="db-btn db-btn--outline db-btn--sm"
                        style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                        onClick={() => setGrams(g)}
                      >
                        {g}g
                      </button>
                    ))}
                    <button
                      type="button"
                      className="db-btn db-btn--outline db-btn--sm"
                      style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                      onClick={() => setGrams(selectedFood.standardGrams)}
                    >
                      Padrão ({selectedFood.standardGrams}g)
                    </button>
                  </div>
                </div>

                {/* Card de Nutrientes Calculados */}
                <div style={{ background: 'var(--white)', padding: '14px', borderRadius: '10px', border: '1px solid var(--cold-neutral-200)', marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--cold-neutral-600)', marginBottom: '8px', textTransform: 'uppercase' }}>
                    Nutrientes para {grams}g
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                    <div style={{ background: 'var(--cal-light)', padding: '8px 10px', borderRadius: '6px', borderLeft: '3px solid var(--cal-color)' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--cold-neutral-600)' }}>Calorias</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--cal-color)' }}>{calculatedMacros.calories} kcal</div>
                    </div>
                    <div style={{ background: 'var(--carb-light)', padding: '8px 10px', borderRadius: '6px', borderLeft: '3px solid var(--carb-color)' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--cold-neutral-600)' }}>Carboidratos</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--carb-color)' }}>{calculatedMacros.carbs} g</div>
                    </div>
                    <div style={{ background: 'var(--prot-light)', padding: '8px 10px', borderRadius: '6px', borderLeft: '3px solid var(--prot-color)' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--cold-neutral-600)' }}>Proteínas</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--prot-color)' }}>{calculatedMacros.protein} g</div>
                    </div>
                    <div style={{ background: 'var(--fat-light)', padding: '8px 10px', borderRadius: '6px', borderLeft: '3px solid var(--fat-color)' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--cold-neutral-600)' }}>Gorduras</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--fat-color)' }}>{calculatedMacros.fats} g</div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="db-btn db-btn--primary"
                style={{ width: '100%', padding: '12px' }}
                onClick={handleAdd}
                disabled={loading}
              >
                <Plus size={18} /> {loading ? 'Inserindo no BD...' : `Inserir em ${mealName}`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
