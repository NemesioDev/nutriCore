import React, { useState } from 'react';
import { BookOpen, ShoppingBag, Copy, Check, Clock, Flame } from 'lucide-react';
import type { Recipe, DietPlan, Patient } from '../types/database';

interface RecipesShoppingProps {
  recipes: Recipe[];
  dietPlans: DietPlan[];
  patients: Patient[];
  selectedPatientId: string;
  onSelectPatient: (patientId: string) => void;
}

export const RecipesShopping: React.FC<RecipesShoppingProps> = ({
  recipes,
  dietPlans,
  patients,
  selectedPatientId,
  onSelectPatient
}) => {
  const [activeTab, setActiveTab] = useState<'shopping' | 'recipes'>('shopping');
  const [copied, setCopied] = useState(false);
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({});

  const patient = patients.find(p => p.id === selectedPatientId) || patients[0];
  const activePlan = dietPlans.find(d => d.patient_id === patient?.id) || dietPlans[0];

  // Agrega todos os alimentos prescritos no plano ativo do paciente
  const shoppingListMap: { [key: string]: { name: string; totalGrams: number; portionNames: string[] } } = {};

  (activePlan?.diet_meals || []).forEach(meal => {
    (meal.diet_meal_items || []).forEach(item => {
      const key = item.food_name;
      if (!shoppingListMap[key]) {
        shoppingListMap[key] = {
          name: item.food_name,
          totalGrams: 0,
          portionNames: []
        };
      }
      // Considera consumo semanal (multiplicado por 7 dias)
      shoppingListMap[key].totalGrams += (item.grams * 7);
      if (item.portion_name && !shoppingListMap[key].portionNames.includes(item.portion_name)) {
        shoppingListMap[key].portionNames.push(item.portion_name);
      }
    });
  });

  const shoppingItems = Object.values(shoppingListMap);

  const toggleCheck = (name: string) => {
    setCheckedItems(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const handleCopy = () => {
    let text = `🛒 LISTA DE COMPRAS SEMANAL NUTRICORE\n`;
    text += `Paciente: ${patient?.name || 'Cliente'}\n\n`;
    shoppingItems.forEach(item => {
      text += `[ ] ${item.name} - aprox. ${item.totalGrams >= 1000 ? `${(item.totalGrams / 1000).toFixed(1)}kg` : `${item.totalGrams}g`} (Semanal)\n`;
    });
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="recipes-shopping-container">
      {/* Topo e Alternador de Abas */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--cold-neutral-900)', margin: 0 }}>
            Receitas Saudáveis & Lista de Compras Inteligente
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--cold-neutral-600)', margin: 0 }}>
            Gerador automático baseado na dieta do paciente e acervo culinário
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className={`db-btn ${activeTab === 'shopping' ? 'db-btn--primary' : 'db-btn--outline'}`}
            onClick={() => setActiveTab('shopping')}
          >
            <ShoppingBag size={16} /> Lista de Compras
          </button>
          <button
            className={`db-btn ${activeTab === 'recipes' ? 'db-btn--primary' : 'db-btn--outline'}`}
            onClick={() => setActiveTab('recipes')}
          >
            <BookOpen size={16} /> Acervo de Receitas ({recipes.length})
          </button>
        </div>
      </div>

      {activeTab === 'shopping' ? (
        <div>
          {/* Seletor de Paciente e Ações da Lista */}
          <div style={{ background: 'var(--white)', padding: '16px 20px', borderRadius: '12px', border: '1px solid var(--cold-neutral-300)', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <label className="form-label" style={{ margin: 0, fontWeight: 700 }}>Gerar Lista para:</label>
              <select
                className="db-input-field"
                value={patient?.id || ''}
                onChange={(e) => onSelectPatient(e.target.value)}
                style={{ fontWeight: 700, minWidth: '240px' }}
              >
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <button className="db-btn db-btn--outline" onClick={handleCopy} disabled={shoppingItems.length === 0}>
              {copied ? <Check size={16} className="text-emerald" /> : <Copy size={16} />}
              {copied ? 'Copiado para Área de Transferência!' : 'Copiar Lista Completa'}
            </button>
          </div>

          {/* Grid de Itens da Lista de Compras */}
          {shoppingItems.length === 0 ? (
            <div className="empty-state" style={{ padding: '3rem', background: 'var(--white)', borderRadius: '12px', textAlign: 'center' }}>
              Nenhum alimento cadastrado na dieta deste paciente para gerar a lista.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '12px' }}>
              {shoppingItems.map(item => {
                const isChecked = !!checkedItems[item.name];
                return (
                  <div
                    key={item.name}
                    onClick={() => toggleCheck(item.name)}
                    style={{
                      background: isChecked ? 'var(--cold-neutral-100)' : 'var(--white)',
                      padding: '14px 18px',
                      borderRadius: '10px',
                      border: isChecked ? '1px solid var(--cold-neutral-300)' : '1px solid var(--cold-neutral-200)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      opacity: isChecked ? 0.6 : 1,
                      textDecoration: isChecked ? 'line-through' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--cold-neutral-900)', fontSize: '0.95rem' }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--greenbox-700)', fontWeight: 600 }}>
                        Estimativa 7 dias: {item.totalGrams >= 1000 ? `${(item.totalGrams / 1000).toFixed(1)} kg` : `${item.totalGrams} g`}
                      </div>
                    </div>

                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleCheck(item.name)}
                      style={{ width: 18, height: 18, accentColor: 'var(--greenbox-600)', cursor: 'pointer' }}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Acervo de Receitas */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
          {recipes.map(recipe => (
            <div
              key={recipe.id}
              style={{
                background: 'var(--white)',
                borderRadius: '12px',
                border: '1px solid var(--cold-neutral-300)',
                padding: '20px',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--cold-neutral-900)' }}>
                    {recipe.name}
                  </h3>
                  <span className="badge badge-cal">{recipe.calories} kcal</span>
                </div>

                <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem', color: 'var(--cold-neutral-600)', marginBottom: '14px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={14} /> {recipe.prep_time || '20 min'}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Flame size={14} className="text-emerald" /> {recipe.protein}g Prot • {recipe.carbs}g Carb
                  </span>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--cold-neutral-500)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Ingredientes Principais
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.825rem', color: 'var(--cold-neutral-700)' }}>
                    {recipe.ingredients.map((ing, idx) => (
                      <li key={idx}>{ing}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {recipe.instructions && (
                <div style={{ background: 'var(--cold-neutral-50)', padding: '10px 14px', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--cold-neutral-600)', borderLeft: '3px solid var(--greenbox-500)' }}>
                  {recipe.instructions}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
