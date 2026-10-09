// Dados Iniciais e Estrutura de Pacientes e Dietas
window.APP_DATA = {
  currentNutri: {
    name: "Dra. Camila Monteiro",
    title: "Nutricionista Clínica & Esportiva",
    crn: "CRN-3 48.291",
    email: "camila.nutri@nutricore.com.br",
    avatar: "https://images.unsplash.com/photo-1594824813589-3221b659c256?auto=format&fit=crop&w=200&q=80",
    clinic: "Clínica Vida & Nutrição",
    phone: "(11) 98765-4321"
  },
  
  patients: [
    {
      id: "paciente_1",
      name: "Rodrigo Almeida Silveira",
      email: "rodrigo.silveira@email.com",
      phone: "(11) 99123-4567",
      age: 29,
      gender: "M",
      weight: 82.5,
      height: 178,
      objective: "Hipertrofia & Definição Muscular",
      activityLevel: "moderado", // 1.55
      lastVisit: "02/10/2026",
      status: "Ativo",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      notes: "Pratica musculação 5x/semana. Boa adesão à dieta anterior. Sem intolerâncias alimentares conhecidas.",
      measurements: [
        { date: "01/08/2026", weight: 85.0, bodyFat: 21.0, waist: 88, hip: 102, arm: 36.0 },
        { date: "01/09/2026", weight: 83.8, bodyFat: 19.5, waist: 86, hip: 101, arm: 36.8 },
        { date: "02/10/2026", weight: 82.5, bodyFat: 17.8, waist: 83, hip: 100, arm: 37.5 }
      ],
      currentDietId: "dieta_rodrigo"
    },
    {
      id: "paciente_2",
      name: "Mariana Costa Prado",
      email: "mariana.prado@email.com",
      phone: "(11) 98234-5678",
      age: 34,
      gender: "F",
      weight: 68.2,
      height: 165,
      objective: "Emagrecimento Saudável & Disposição",
      activityLevel: "leve", // 1.375
      lastVisit: "28/09/2026",
      status: "Ativo",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
      notes: "Intolerância leve à lactose. Busca reduzir gordura abdominal e melhorar exames de perfil lipídico.",
      measurements: [
        { date: "15/07/2026", weight: 73.5, bodyFat: 32.5, waist: 82, hip: 106, arm: 29.5 },
        { date: "20/08/2026", weight: 70.8, bodyFat: 30.1, waist: 78, hip: 104, arm: 28.8 },
        { date: "28/09/2026", weight: 68.2, bodyFat: 27.8, waist: 74, hip: 101, arm: 28.0 }
      ],
      currentDietId: "dieta_mariana"
    },
    {
      id: "paciente_3",
      name: "Lucas Mendes Ferreira",
      email: "lucas.ferreira@email.com",
      phone: "(21) 97654-3210",
      age: 41,
      gender: "M",
      weight: 94.0,
      height: 182,
      objective: "Controle Glicêmico & Reeducação",
      activityLevel: "sedentario", // 1.2
      lastVisit: "05/10/2026",
      status: "Em Acompanhamento",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
      notes: "Pré-diabético. Foco em alimentos de baixo índice glicêmico e aumento substancial de fibras alimentares.",
      measurements: [
        { date: "05/10/2026", weight: 94.0, bodyFat: 28.0, waist: 98, hip: 108, arm: 34.0 }
      ],
      currentDietId: null
    }
  ],

  // Planos de Dieta pré-configurados com refeições completas
  diets: [
    {
      id: "dieta_rodrigo",
      patientId: "paciente_1",
      title: "Plano Hipertrofia & Definição (Fase 2)",
      targetCalories: 2450,
      targetCarbs: 275, // g (45%)
      targetProtein: 165, // g (27%) ~ 2.0g/kg
      targetFats: 75, // g (28%)
      waterTargetMl: 3300,
      notes: "Consumir no mínimo 3.3L de água diariamente. Fazer refeição pré-treino 1h30 antes do treino de força. Creatina 5g diária no pós-treino.",
      meals: [
        {
          id: "m_1",
          name: "Café da Manhã",
          time: "07:30",
          icon: "fa-coffee",
          items: [
            { foodId: "ovo_mexido", grams: 150, portionName: "3 ovos mexidos" },
            { foodId: "pao_integral", grams: 50, portionName: "2 fatias (50g)" },
            { foodId: "banana_prata", grams: 80, portionName: "1 unidade média" },
            { foodId: "aveia_flocos", grams: 30, portionName: "2 colheres de sopa" }
          ]
        },
        {
          id: "m_2",
          name: "Lanche da Manhã",
          time: "10:30",
          icon: "fa-apple-whole",
          items: [
            { foodId: "iogurte_grego", grams: 150, portionName: "1 pote e meio" },
            { foodId: "morango", grams: 100, portionName: "6 unidades médias" },
            { foodId: "chia", grams: 15, portionName: "1 colher de sopa" }
          ]
        },
        {
          id: "m_3",
          name: "Almoço",
          time: "13:00",
          icon: "fa-utensils",
          items: [
            { foodId: "arroz_integral", grams: 150, portionName: "5 colheres de sopa" },
            { foodId: "feijao_carioca", grams: 100, portionName: "1 concha média" },
            { foodId: "frango_peito", grams: 160, portionName: "1 filé grande grelhado" },
            { foodId: "brocolis", grams: 100, portionName: "1 prato raso no vapor" },
            { foodId: "azeite_oliva", grams: 10, portionName: "1 colher de sobremesa" }
          ]
        },
        {
          id: "m_4",
          name: "Lanche da Tarde (Pré-Treino)",
          time: "16:30",
          icon: "fa-dumbbell",
          items: [
            { foodId: "batata_doce", grams: 150, portionName: "1 unidade média cozida" },
            { foodId: "atum_lata", grams: 80, portionName: "3/4 de lata ao natural" },
            { foodId: "castanha_para", grams: 10, portionName: "2 castanhas" }
          ]
        },
        {
          id: "m_5",
          name: "Jantar",
          time: "20:00",
          icon: "fa-bowl-food",
          items: [
            { foodId: "patinho_moido", grams: 150, portionName: "1 porção farta refogada" },
            { foodId: "mandioca", grams: 120, portionName: "1 pedaço médio cozido" },
            { foodId: "abobrinha", grams: 100, portionName: "Grelhada com ervas" },
            { foodId: "tomate", grams: 90, portionName: "1 tomate em rodelas" },
            { foodId: "alface", grams: 50, portionName: "Salada à vontade" }
          ]
        },
        {
          id: "m_6",
          name: "Ceia",
          time: "22:30",
          icon: "fa-moon",
          items: [
            { foodId: "whey_isolado", grams: 30, portionName: "1 scoop com água gelada" },
            { foodId: "pasta_amendoim", grams: 15, portionName: "1 colher de sopa rasa" }
          ]
        }
      ]
    },
    {
      id: "dieta_mariana",
      title: "Plano Reeducação & Déficit Calórico Moderado",
      patientId: "paciente_2",
      targetCalories: 1650,
      targetCarbs: 165, // g (40%)
      targetProtein: 115, // g (28%) ~ 1.7g/kg
      targetFats: 58, // g (32%)
      waterTargetMl: 2600,
      notes: "Priorizar mastigação lenta. Consumir saladas com azeite extravirgem no almoço e jantar. Beber água entre as refeições.",
      meals: [
        {
          id: "mm_1",
          name: "Café da Manhã",
          time: "07:00",
          icon: "fa-coffee",
          items: [
            { foodId: "tapioca", grams: 50, portionName: "2 colheres de sopa cheias" },
            { foodId: "ovo_mexido", grams: 100, portionName: "2 ovos mexidos" },
            { foodId: "mamao", grams: 140, portionName: "1/2 unidade pequena" },
            { foodId: "chia", grams: 10, portionName: "1 colher de sobremesa" }
          ]
        },
        {
          id: "mm_2",
          name: "Lanche da Manhã",
          time: "10:00",
          icon: "fa-apple-whole",
          items: [
            { foodId: "maca", grams: 130, portionName: "1 unidade média com casca" },
            { foodId: "castanha_para", grams: 10, portionName: "2 unidades" }
          ]
        },
        {
          id: "mm_3",
          name: "Almoço",
          time: "12:30",
          icon: "fa-utensils",
          items: [
            { foodId: "tilapia", grams: 140, portionName: "1 filé grelhado com limão" },
            { foodId: "arroz_integral", grams: 100, portionName: "3 colheres de sopa" },
            { foodId: "feijao_preto", grams: 80, portionName: "1 concha pequena" },
            { foodId: "brocolis", grams: 100, portionName: "No vapor" },
            { foodId: "alface", grams: 50, portionName: "Salada verde" },
            { foodId: "azeite_oliva", grams: 10, portionName: "1 colher de sobremesa" }
          ]
        },
        {
          id: "mm_4",
          name: "Lanche da Tarde",
          time: "16:00",
          icon: "fa-mug-hot",
          items: [
            { foodId: "iogurte_desnatado", grams: 170, portionName: "1 pote natural" },
            { foodId: "morango", grams: 120, portionName: "8 unidades" },
            { foodId: "aveia_flocos", grams: 20, portionName: "1 colher de sopa cheia" }
          ]
        },
        {
          id: "mm_5",
          name: "Jantar",
          time: "19:30",
          icon: "fa-bowl-food",
          items: [
            { foodId: "frango_peito", grams: 130, portionName: "1 filé médio desfiado/grelhado" },
            { foodId: "abobrinha", grams: 100, portionName: "Grelhada com azeite e ervas" },
            { foodId: "tomate", grams: 90, portionName: "1 tomate maduro em rodelas" },
            { foodId: "azeite_oliva", grams: 10, portionName: "1 colher de sobremesa" }
          ]
        }
      ]
    }
  ],

  // Consultas agendadas
  appointments: [
    {
      id: "app_1",
      patientName: "Rodrigo Almeida Silveira",
      patientId: "paciente_1",
      date: "Hoje, 14:30",
      type: "Online (Vídeo NutriCore)",
      status: "Confirmado",
      objective: "Reavaliação 30 dias & Ajuste de Cargas"
    },
    {
      id: "app_2",
      patientName: "Mariana Costa Prado",
      patientId: "paciente_2",
      date: "Amanhã, 10:00",
      type: "Presencial (Consultório)",
      status: "Agendado",
      objective: "Avaliação Antropométrica de Retorno"
    },
    {
      id: "app_3",
      patientName: "Lucas Mendes Ferreira",
      patientId: "paciente_3",
      date: "Sex, 16:00",
      type: "Online (Vídeo NutriCore)",
      status: "Agendado",
      objective: "Entrega do Plano Alimentar e Orientações"
    }
  ],

  // Receitas saudáveis integradas
  recipes: [
    {
      id: "rec_1",
      name: "Panqueca Fit de Aveia e Banana",
      time: "10 min",
      calories: 285,
      carbs: 42,
      protein: 16,
      fats: 6,
      ingredients: [
        "1 banana madura amassada",
        "2 ovos inteiros",
        "2 colheres de sopa de aveia em flocos",
        "1 pitada de canela em pó"
      ],
      instructions: "Misture tudo em um bowl com garfo. Despeje em frigideira antiaderente pré-aquecida. Doure dos dois lados em fogo baixo."
    },
    {
      id: "rec_2",
      name: "Creme Proteico de Frutas Vermelhas",
      time: "5 min",
      calories: 210,
      carbs: 18,
      protein: 27,
      fats: 3,
      ingredients: [
        "1 pote de iogurte grego natural",
        "1 scoop de whey protein de baunilha ou morango",
        "100g de morangos congelados",
        "1 colher de chá de sementes de chia"
      ],
      instructions: "Bata o iogurte, whey e morangos no mixer ou liquidificador até obter textura de mousse consistente. Finalize com chia por cima."
    },
    {
      id: "rec_3",
      name: "Bowl de Tilápia com Purê de Mandioca e Brócolis",
      time: "25 min",
      calories: 390,
      carbs: 38,
      protein: 36,
      fats: 10,
      ingredients: [
        "1 filé grande de tilápia grelhado (140g)",
        "1 pedaço de mandioca cozida e amassada com ervas (120g)",
        "1 xícara de brócolis no vapor",
        "1 colher de sobremesa de azeite extravirgem"
      ],
      instructions: "Tempere a tilápia com limão, sal rosa e páprica. Grelhe no azeite. Monte o prato com o purê de mandioca e o brócolis fresco."
    }
  ]
};
