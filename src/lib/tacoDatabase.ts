import type { TacoFood } from '../types/database';

export const TACO_DATABASE: TacoFood[] = [
  // --- PROTEÍNAS & CARNES ---
  {
    id: "frango_peito",
    name: "Peito de Frango Grelhado",
    category: "Proteínas",
    calories: 165,
    carbs: 0,
    protein: 31.0,
    fats: 3.6,
    fiber: 0,
    standardPortion: "1 filé médio (120g)",
    standardGrams: 120,
    substitutes: ["tilapia", "patinho_moido", "ovo_cozido", "salmao"]
  },
  {
    id: "patinho_moido",
    name: "Carne Bovina (Patinho Moído Grelhado)",
    category: "Proteínas",
    calories: 219,
    carbs: 0,
    protein: 35.9,
    fats: 7.3,
    fiber: 0,
    standardPortion: "1 porção (120g)",
    standardGrams: 120,
    substitutes: ["frango_peito", "tilapia", "ovo_cozido"]
  },
  {
    id: "tilapia",
    name: "Filé de Tilápia Grelhado",
    category: "Proteínas",
    calories: 128,
    carbs: 0,
    protein: 26.2,
    fats: 2.7,
    fiber: 0,
    standardPortion: "1 filé grande (140g)",
    standardGrams: 140,
    substitutes: ["frango_peito", "salmao", "atum_lata"]
  },
  {
    id: "salmao",
    name: "Filé de Salmão Grelhado",
    category: "Proteínas",
    calories: 206,
    carbs: 0,
    protein: 22.1,
    fats: 12.4,
    fiber: 0,
    standardPortion: "1 filé médio (130g)",
    standardGrams: 130,
    substitutes: ["tilapia", "atum_lata", "frango_peito"]
  },
  {
    id: "atum_lata",
    name: "Atum em Pedaços ao Natural",
    category: "Proteínas",
    calories: 116,
    carbs: 0,
    protein: 25.5,
    fats: 0.8,
    fiber: 0,
    standardPortion: "1 lata escorrida (120g)",
    standardGrams: 120,
    substitutes: ["tilapia", "frango_peito", "ovo_cozido"]
  },
  {
    id: "ovo_cozido",
    name: "Ovo de Galinha Cozido Inteiro",
    category: "Proteínas",
    calories: 143,
    carbs: 0.8,
    protein: 13.0,
    fats: 9.5,
    fiber: 0,
    standardPortion: "2 unidades (100g)",
    standardGrams: 100,
    substitutes: ["ovo_mexido", "clara_ovo", "queijo_cottage", "frango_peito"]
  },
  {
    id: "ovo_mexido",
    name: "Ovos Mexidos (sem gordura)",
    category: "Proteínas",
    calories: 154,
    carbs: 1.2,
    protein: 12.6,
    fats: 10.6,
    fiber: 0,
    standardPortion: "2 unidades (100g)",
    standardGrams: 100,
    substitutes: ["ovo_cozido", "clara_ovo", "queijo_cottage"]
  },
  {
    id: "clara_ovo",
    name: "Clara de Ovo Cozida",
    category: "Proteínas",
    calories: 52,
    carbs: 0.7,
    protein: 11.0,
    fats: 0.2,
    fiber: 0,
    standardPortion: "3 claras (100g)",
    standardGrams: 100,
    substitutes: ["whey_isolado", "queijo_cottage", "frango_peito"]
  },

  // --- CARBOIDRATOS & TUBÉRCULOS & CEREAIS ---
  {
    id: "arroz_branco",
    name: "Arroz Branco Cozido",
    category: "Carboidratos",
    calories: 128,
    carbs: 28.1,
    protein: 2.5,
    fats: 0.2,
    fiber: 1.6,
    standardPortion: "4 colheres de sopa cheias (120g)",
    standardGrams: 120,
    substitutes: ["arroz_integral", "batata_doce", "mandioca"]
  },
  {
    id: "arroz_integral",
    name: "Arroz Integral Cozido",
    category: "Carboidratos",
    calories: 124,
    carbs: 25.8,
    protein: 2.6,
    fats: 1.0,
    fiber: 2.7,
    standardPortion: "4 colheres de sopa cheias (120g)",
    standardGrams: 120,
    substitutes: ["arroz_branco", "batata_doce"]
  },
  {
    id: "batata_doce",
    name: "Batata Doce Cozida / Assada",
    category: "Carboidratos",
    calories: 77,
    carbs: 18.4,
    protein: 0.6,
    fats: 0.1,
    fiber: 2.2,
    standardPortion: "1 unidade média (150g)",
    standardGrams: 150,
    substitutes: ["mandioca", "batata_inglesa", "arroz_integral", "aveia_flocos"]
  },
  {
    id: "batata_inglesa",
    name: "Batata Inglesa Cozida",
    category: "Carboidratos",
    calories: 52,
    carbs: 11.9,
    protein: 1.2,
    fats: 0.1,
    fiber: 1.3,
    standardPortion: "1 batata média (150g)",
    standardGrams: 150,
    substitutes: ["batata_doce", "mandioca", "arroz_branco"]
  },
  {
    id: "mandioca",
    name: "Mandioca (Aipim) Cozida",
    category: "Carboidratos",
    calories: 125,
    carbs: 30.1,
    protein: 0.6,
    fats: 0.3,
    fiber: 1.6,
    standardPortion: "1 pedaço médio (100g)",
    standardGrams: 100,
    substitutes: ["batata_doce", "arroz_branco", "tapioca"]
  },
  {
    id: "aveia_flocos",
    name: "Aveia em Flocos Finos",
    category: "Carboidratos",
    calories: 394,
    carbs: 66.6,
    protein: 13.9,
    fats: 8.5,
    fiber: 9.1,
    standardPortion: "2 colheres de sopa cheias (30g)",
    standardGrams: 30,
    substitutes: ["pao_integral", "tapioca"]
  },
  {
    id: "pao_integral",
    name: "Pão de Forma 100% Integral",
    category: "Carboidratos",
    calories: 247,
    carbs: 45.0,
    protein: 9.4,
    fats: 3.2,
    fiber: 6.9,
    standardPortion: "2 fatias (50g)",
    standardGrams: 50,
    substitutes: ["tapioca", "aveia_flocos", "cuscuz"]
  },
  {
    id: "tapioca",
    name: "Goma de Tapioca Hidratada",
    category: "Carboidratos",
    calories: 240,
    carbs: 60.0,
    protein: 0.0,
    fats: 0.0,
    fiber: 0.5,
    standardPortion: "3 colheres de sopa (60g)",
    standardGrams: 60,
    substitutes: ["pao_integral", "aveia_flocos"]
  },

  // --- LEGUMINOSAS ---
  {
    id: "feijao_carioca",
    name: "Feijão Carioca Cozido",
    category: "Leguminosas",
    calories: 76,
    carbs: 13.6,
    protein: 4.8,
    fats: 0.5,
    fiber: 8.5,
    standardPortion: "1 concha média (100g)",
    standardGrams: 100,
    substitutes: ["feijao_preto", "grao_bico", "lentilha"]
  },
  {
    id: "feijao_preto",
    name: "Feijão Preto Cozido",
    category: "Leguminosas",
    calories: 77,
    carbs: 14.0,
    protein: 4.5,
    fats: 0.5,
    fiber: 8.4,
    standardPortion: "1 concha média (100g)",
    standardGrams: 100,
    substitutes: ["feijao_carioca", "lentilha"]
  },

  // --- FRUTAS ---
  {
    id: "banana_prata",
    name: "Banana Prata",
    category: "Frutas",
    calories: 98,
    carbs: 26.0,
    protein: 1.3,
    fats: 0.1,
    fiber: 2.0,
    standardPortion: "1 unidade média (80g)",
    standardGrams: 80,
    substitutes: ["maca", "morango"]
  },
  {
    id: "maca",
    name: "Maçã Fuji com Casca",
    category: "Frutas",
    calories: 56,
    carbs: 15.2,
    protein: 0.3,
    fats: 0.2,
    fiber: 2.0,
    standardPortion: "1 unidade média (130g)",
    standardGrams: 130,
    substitutes: ["banana_prata", "morango"]
  },
  {
    id: "morango",
    name: "Morangos Frescos",
    category: "Frutas",
    calories: 30,
    carbs: 6.8,
    protein: 0.9,
    fats: 0.3,
    fiber: 1.7,
    standardPortion: "1 xícara (150g)",
    standardGrams: 150,
    substitutes: ["maca", "banana_prata"]
  },

  // --- LATICÍNIOS ---
  {
    id: "iogurte_grego",
    name: "Iogurte Grego Tradicional Zero",
    category: "Laticínios",
    calories: 59,
    carbs: 4.5,
    protein: 7.5,
    fats: 1.2,
    fiber: 0,
    standardPortion: "1 pote (100g)",
    standardGrams: 100,
    substitutes: ["queijo_cottage"]
  },
  {
    id: "queijo_cottage",
    name: "Queijo Cottage",
    category: "Laticínios",
    calories: 98,
    carbs: 3.4,
    protein: 11.1,
    fats: 4.3,
    fiber: 0,
    standardPortion: "2 colheres de sopa cheias (50g)",
    standardGrams: 50,
    substitutes: ["iogurte_grego", "ovo_mexido"]
  },

  // --- GORDURAS BOAS & SEMENTES ---
  {
    id: "azeite_oliva",
    name: "Azeite de Oliva Extravirgem",
    category: "Gorduras",
    calories: 884,
    carbs: 0,
    protein: 0,
    fats: 100.0,
    fiber: 0,
    standardPortion: "1 colher de sobremesa (10ml)",
    standardGrams: 10,
    substitutes: ["castanha_para", "pasta_amendoim"]
  },
  {
    id: "castanha_para",
    name: "Castanha-do-Pará",
    category: "Gorduras",
    calories: 656,
    carbs: 12.3,
    protein: 14.3,
    fats: 66.4,
    fiber: 7.5,
    standardPortion: "2 unidades (10g)",
    standardGrams: 10,
    substitutes: ["pasta_amendoim", "azeite_oliva"]
  },
  {
    id: "pasta_amendoim",
    name: "Pasta de Amendoim Integral 100%",
    category: "Gorduras",
    calories: 588,
    carbs: 20.0,
    protein: 25.0,
    fats: 50.0,
    fiber: 6.0,
    standardPortion: "1 colher de sopa (15g)",
    standardGrams: 15,
    substitutes: ["castanha_para", "azeite_oliva"]
  },
  {
    id: "chia",
    name: "Semente de Chia",
    category: "Gorduras",
    calories: 486,
    carbs: 42.1,
    protein: 16.5,
    fats: 30.7,
    fiber: 34.4,
    standardPortion: "1 colher de sopa (15g)",
    standardGrams: 15,
    substitutes: ["aveia_flocos"]
  },

  // --- VEGETAIS ---
  {
    id: "brocolis",
    name: "Brócolis Cozido no Vapor",
    category: "Vegetais",
    calories: 25,
    carbs: 4.4,
    protein: 2.1,
    fats: 0.5,
    fiber: 3.4,
    standardPortion: "4 ramos médios (100g)",
    standardGrams: 100,
    substitutes: ["abobrinha", "tomate"]
  },
  {
    id: "alface",
    name: "Alface Americana / Crespa",
    category: "Vegetais",
    calories: 14,
    carbs: 1.7,
    protein: 1.3,
    fats: 0.2,
    fiber: 1.3,
    standardPortion: "1 prato de sobremesa (50g)",
    standardGrams: 50,
    substitutes: ["tomate", "brocolis"]
  },
  {
    id: "tomate",
    name: "Tomate Italiano Saladete",
    category: "Vegetais",
    calories: 18,
    carbs: 3.9,
    protein: 0.9,
    fats: 0.2,
    fiber: 1.2,
    standardPortion: "1 unidade média (90g)",
    standardGrams: 90,
    substitutes: ["brocolis", "alface"]
  },
  {
    id: "abobrinha",
    name: "Abobrinha Menina Grelhada",
    category: "Vegetais",
    calories: 17,
    carbs: 3.1,
    protein: 1.2,
    fats: 0.3,
    fiber: 1.0,
    standardPortion: "3 fatias grossas (100g)",
    standardGrams: 100,
    substitutes: ["brocolis"]
  },

  // --- SUPLEMENTOS ---
  {
    id: "whey_isolado",
    name: "Whey Protein Isolado 90%",
    category: "Suplementos",
    calories: 370,
    carbs: 1.5,
    protein: 88.0,
    fats: 1.2,
    fiber: 0,
    standardPortion: "1 scoop (30g)",
    standardGrams: 30,
    substitutes: ["clara_ovo", "frango_peito"]
  }
];

export function calculateNutrients(foodId: string, grams: number) {
  const food = TACO_DATABASE.find(f => f.id === foodId);
  if (!food) return { calories: 0, carbs: 0, protein: 0, fats: 0, fiber: 0 };

  const factor = (parseFloat(grams.toString()) || 0) / 100;
  return {
    calories: Math.round(food.calories * factor),
    carbs: +(food.carbs * factor).toFixed(1),
    protein: +(food.protein * factor).toFixed(1),
    fats: +(food.fats * factor).toFixed(1),
    fiber: +(food.fiber * factor).toFixed(1)
  };
}
