// Lógica do Criador de Dietas (NutriCore Planos Alimentares - Banco de Dados Supabase em Tempo Real)
window.DietManager = {
  currentDiet: null,
  allDiets: [],

  async init(dietId) {
    await this.loadDietPlans(dietId);
  },

  async loadDietPlans(targetDietId = null) {
    try {
      if (window.DBService && window.DBService.client) {
        const plans = await window.DBService.getDietPlans();
        this.allDiets = plans || [];
        
        if (this.allDiets.length > 0) {
          if (targetDietId) {
            this.currentDiet = this.allDiets.find(d => d.id === targetDietId) || this.allDiets[0];
          } else if (!this.currentDiet) {
            this.currentDiet = this.allDiets[0];
          } else {
            // Atualiza com dados frescos do banco
            this.currentDiet = this.allDiets.find(d => d.id === this.currentDiet.id) || this.allDiets[0];
          }
        }
      }
    } catch (err) {
      console.warn("Erro ao carregar dietas do Supabase, usando cache:", err);
    }
    this.render();
  },

  async reloadCurrentDiet() {
    if (!this.currentDiet) return;
    try {
      const freshDiet = await window.DBService.getDietPlanDetails(this.currentDiet.id);
      if (freshDiet) {
        this.currentDiet = freshDiet;
        this.render();
      }
    } catch (err) {
      console.error("Erro ao recarregar dieta atual:", err);
    }
  },

  async setDiet(dietId) {
    const found = this.allDiets.find(d => d.id === dietId);
    if (found) {
      this.currentDiet = found;
      this.render();
    } else {
      await this.loadDietPlans(dietId);
    }
  },

  getMealTotals(meal) {
    let calories = 0;
    let carbs = 0;
    let protein = 0;
    let fats = 0;
    let fiber = 0;

    const items = meal.diet_meal_items || meal.items || [];
    items.forEach(item => {
      // Se tiver nutrientes gravados no banco, usa eles; senão calcula via TACO
      if (item.calories) {
        calories += item.calories;
        carbs += parseFloat(item.carbs) || 0;
        protein += parseFloat(item.protein) || 0;
        fats += parseFloat(item.fats) || 0;
        fiber += parseFloat(item.fiber) || 0;
      } else {
        const nutrients = window.calculateNutrients(item.food_id || item.foodId, item.grams);
        calories += nutrients.calories;
        carbs += nutrients.carbs;
        protein += nutrients.protein;
        fats += nutrients.fats;
        fiber += nutrients.fiber;
      }
    });

    return {
      calories: Math.round(calories),
      carbs: +carbs.toFixed(1),
      protein: +protein.toFixed(1),
      fats: +fats.toFixed(1),
      fiber: +fiber.toFixed(1)
    };
  },

  getDailyTotals() {
    if (!this.currentDiet) return { calories: 0, carbs: 0, protein: 0, fats: 0, fiber: 0 };
    let calories = 0;
    let carbs = 0;
    let protein = 0;
    let fats = 0;
    let fiber = 0;

    const meals = this.currentDiet.diet_meals || this.currentDiet.meals || [];
    meals.forEach(m => {
      const mealTotals = this.getMealTotals(m);
      calories += mealTotals.calories;
      carbs += mealTotals.carbs;
      protein += mealTotals.protein;
      fats += mealTotals.fats;
      fiber += mealTotals.fiber;
    });

    return {
      calories: Math.round(calories),
      carbs: +carbs.toFixed(1),
      protein: +protein.toFixed(1),
      fats: +fats.toFixed(1),
      fiber: +fiber.toFixed(1)
    };
  },

  async addMeal(name, time, icon = "fa-utensils") {
    if (!this.currentDiet) return;
    try {
      const newMeal = {
        diet_id: this.currentDiet.id,
        name: name || "Nova Refeição",
        time: time || "12:00",
        icon: icon,
        order_index: (this.currentDiet.diet_meals || []).length + 1
      };

      const created = await window.DBService.createDietMeal(newMeal);
      await this.reloadCurrentDiet();
      window.showToast("Refeição salva no banco de dados!", "success");
    } catch (err) {
      console.error("Erro ao adicionar refeição no banco:", err);
      window.showToast("Erro ao salvar refeição no banco de dados.", "error");
    }
  },

  async removeMeal(mealId) {
    if (!this.currentDiet) return;
    if (confirm("Tem certeza que deseja remover esta refeição do plano no banco de dados?")) {
      try {
        await window.DBService.deleteDietMeal(mealId);
        await this.reloadCurrentDiet();
        window.showToast("Refeição excluída do banco com sucesso.", "info");
      } catch (err) {
        console.error("Erro ao remover refeição:", err);
        window.showToast("Erro ao excluir refeição do banco.", "error");
      }
    }
  },

  async addFoodToMeal(mealId, foodId, grams, portionName) {
    if (!this.currentDiet) return;
    const food = window.FOOD_DATABASE.find(f => f.id === foodId);
    if (!food) return;

    const finalGrams = parseFloat(grams) || food.standardGrams;
    const finalPortion = portionName || `${finalGrams}g`;
    const nutrients = window.calculateNutrients(food.id, finalGrams);

    try {
      const itemData = {
        meal_id: mealId,
        food_id: food.id,
        food_name: food.name,
        grams: finalGrams,
        portion_name: finalPortion,
        calories: nutrients.calories,
        carbs: nutrients.carbs,
        protein: nutrients.protein,
        fats: nutrients.fats,
        fiber: nutrients.fiber
      };

      await window.DBService.createDietMealItem(itemData);
      await this.reloadCurrentDiet();
      window.showToast(`${food.name} gravado no banco de dados!`, "success");
    } catch (err) {
      console.error("Erro ao inserir alimento no banco:", err);
      window.showToast("Erro ao salvar alimento no banco.", "error");
    }
  },

  async removeFoodFromMeal(mealId, itemId) {
    if (!this.currentDiet) return;
    try {
      await window.DBService.deleteDietMealItem(itemId);
      await this.reloadCurrentDiet();
      window.showToast("Alimento removido do banco de dados.", "info");
    } catch (err) {
      console.error("Erro ao excluir item do banco:", err);
      window.showToast("Erro ao remover alimento.", "error");
    }
  },

  async updateFoodGrams(mealId, itemId, newGrams, foodId) {
    if (!this.currentDiet) return;
    const grams = Math.max(1, parseFloat(newGrams) || 100);
    const food = window.FOOD_DATABASE.find(f => f.id === foodId);
    const nutrients = food ? window.calculateNutrients(food.id, grams) : { calories: 0, carbs: 0, protein: 0, fats: 0, fiber: 0 };

    try {
      await window.DBService.updateDietMealItem(itemId, {
        grams: grams,
        portion_name: `${grams}g`,
        calories: nutrients.calories,
        carbs: nutrients.carbs,
        protein: nutrients.protein,
        fats: nutrients.fats,
        fiber: nutrients.fiber
      });
      await this.reloadCurrentDiet();
    } catch (err) {
      console.error("Erro ao atualizar gramagem no banco:", err);
    }
  },

  // Substituição inteligente: Assistente NutriCore
  async substituteFood(mealId, itemId, newFoodId, currentGrams, currentFoodId) {
    if (!this.currentDiet) return;
    const oldFood = window.FOOD_DATABASE.find(f => f.id === currentFoodId);
    const newFood = window.FOOD_DATABASE.find(f => f.id === newFoodId);
    if (!oldFood || !newFood) return;

    // Calcula calorias do item antigo
    const oldCalories = (oldFood.calories * currentGrams) / 100;
    // Quantidade equivalente em calorias do novo alimento
    const equivalentGrams = newFood.calories > 0 
      ? Math.round((oldCalories / newFood.calories) * 100)
      : newFood.standardGrams;

    const nutrients = window.calculateNutrients(newFood.id, equivalentGrams);

    try {
      await window.DBService.updateDietMealItem(itemId, {
        food_id: newFood.id,
        food_name: newFood.name,
        grams: equivalentGrams,
        portion_name: `${equivalentGrams}g (substituição equivalente)`,
        calories: nutrients.calories,
        carbs: nutrients.carbs,
        protein: nutrients.protein,
        fats: nutrients.fats,
        fiber: nutrients.fiber
      });

      await this.reloadCurrentDiet();
      window.showToast(`Substituído no banco por ${newFood.name} (${equivalentGrams}g)`, "success");
    } catch (err) {
      console.error("Erro ao substituir alimento no banco:", err);
      window.showToast("Erro ao processar substituição.", "error");
    }
  },

  openSubstitutionModal(mealId, itemId, currentFoodId, currentGrams) {
    const food = window.FOOD_DATABASE.find(f => f.id === currentFoodId);
    if (!food) return;

    const modalTitle = document.getElementById("subModalTitle");
    const modalBody = document.getElementById("subModalBody");
    if (!modalTitle || !modalBody) return;

    modalTitle.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles text-emerald"></i> Assistente NutriCore: Substituir "${food.name}"`;

    let html = `
      <div class="sub-current-card">
        <div class="sub-current-info">
          <strong>Alimento Atual:</strong> ${food.name} (${currentGrams}g)
          <div class="sub-current-tags">
            <span class="badge badge-cal">${Math.round((food.calories * currentGrams)/100)} kcal</span>
            <span class="badge badge-c">${+((food.carbs * currentGrams)/100).toFixed(1)}g C</span>
            <span class="badge badge-p">${+((food.protein * currentGrams)/100).toFixed(1)}g P</span>
            <span class="badge badge-f">${+((food.fats * currentGrams)/100).toFixed(1)}g G</span>
          </div>
        </div>
      </div>
      <h4 style="margin: 1.25rem 0 0.5rem; font-size: 0.95rem; color: var(--cold-neutral-800);">
        Sugestões equivalentes recomendadas na mesma categoria (${food.category}):
      </h4>
      <div class="sub-list">
    `;

    let candidates = (food.substitutes || [])
      .map(id => window.FOOD_DATABASE.find(f => f.id === id))
      .filter(Boolean);

    if (candidates.length === 0) {
      candidates = window.FOOD_DATABASE.filter(f => f.category === food.category && f.id !== food.id);
    }

    if (candidates.length === 0) {
      html += `<p class="empty-state">Nenhum substituto direto cadastrado para este item.</p>`;
    } else {
      candidates.forEach(cand => {
        const oldCal = (food.calories * currentGrams) / 100;
        const eqGrams = cand.calories > 0 ? Math.round((oldCal / cand.calories) * 100) : cand.standardGrams;
        const newNutri = window.calculateNutrients(cand.id, eqGrams);

        html += `
          <div class="sub-item-card">
            <div class="sub-item-details">
              <strong>${cand.name}</strong>
              <span class="sub-portion-calc">Porção equivalente calculada: <b>${eqGrams}g</b></span>
              <div class="sub-current-tags" style="margin-top: 4px;">
                <span class="badge badge-cal">${newNutri.calories} kcal</span>
                <span class="badge badge-c">${newNutri.carbs}g C</span>
                <span class="badge badge-p">${newNutri.protein}g P</span>
                <span class="badge badge-f">${newNutri.fats}g G</span>
              </div>
            </div>
            <button class="db-btn db-btn--primary db-btn--sm" onclick="DietManager.substituteFood('${mealId}', '${itemId}', '${cand.id}', ${currentGrams}, '${food.id}'); window.closeModal('subModal');">
              Selecionar
            </button>
          </div>
        `;
      });
    }

    html += `</div>`;
    modalBody.innerHTML = html;
    window.openModal("subModal");
  },

  openAddFoodModal(mealId) {
    const meals = this.currentDiet.diet_meals || this.currentDiet.meals || [];
    const meal = meals.find(m => m.id === mealId);
    if (!meal) return;

    window.currentTargetMealId = mealId;
    const modalTitle = document.getElementById("addFoodModalTitle");
    if (modalTitle) modalTitle.innerText = `Adicionar Alimento - ${meal.name}`;

    this.renderFoodSearchList();
    window.openModal("addFoodModal");
  },

  renderFoodSearchList(query = "", category = "") {
    const container = document.getElementById("foodSearchResults");
    if (!container) return;

    const q = (query || "").toLowerCase().trim();
    const cat = category || "";

    const filtered = window.FOOD_DATABASE.filter(f => {
      const matchName = f.name.toLowerCase().includes(q);
      const matchCat = cat ? f.category === cat : true;
      return matchName && matchCat;
    });

    if (filtered.length === 0) {
      container.innerHTML = `<div class="empty-state"><i class="fa-solid fa-magnifying-glass"></i><p>Nenhum alimento encontrado com o filtro atual.</p></div>`;
      return;
    }

    container.innerHTML = filtered.map(f => `
      <div class="food-search-card">
        <div class="food-search-info">
          <div class="food-search-title">
            <strong>${f.name}</strong>
            <span class="food-category-pill">${f.category}</span>
          </div>
          <span class="food-standard-desc">Padrão: ${f.standardPortion}</span>
          <div class="sub-current-tags">
            <span class="badge badge-cal">${f.calories} kcal/100g</span>
            <span class="badge badge-c">${f.carbs}g C</span>
            <span class="badge badge-p">${f.protein}g P</span>
            <span class="badge badge-f">${f.fats}g G</span>
          </div>
        </div>
        <div class="food-search-action">
          <div class="input-with-unit">
            <input type="number" id="grams_input_${f.id}" value="${f.standardGrams}" min="1" max="1000" class="db-input-field input-inline">
            <span class="unit-label">g</span>
          </div>
          <button class="db-btn db-btn--primary db-btn--sm" onclick="DietManager.handleAddFoodClick('${f.id}')">
            <i class="fa-solid fa-plus"></i> Inserir
          </button>
        </div>
      </div>
    `).join("");
  },

  handleAddFoodClick(foodId) {
    const input = document.getElementById(`grams_input_${foodId}`);
    const grams = input ? parseFloat(input.value) : 100;
    const food = window.FOOD_DATABASE.find(f => f.id === foodId);
    if (!food) return;

    this.addFoodToMeal(window.currentTargetMealId, foodId, grams, `${grams}g`);
    window.closeModal("addFoodModal");
  },

  printPlan() {
    window.print();
  },

  shareViaWhatsApp() {
    if (!this.currentDiet) return;
    const patient = this.currentDiet.patients || { name: "Paciente" };
    const totals = this.getDailyTotals();

    let text = `🍏 *PLANO ALIMENTAR NUTRICORE* 🍏\n`;
    text += `👤 *Paciente:* ${patient.name}\n`;
    text += `📋 *Plano:* ${this.currentDiet.title}\n`;
    text += `🎯 *Total Estimado:* ${totals.calories} kcal | ${totals.carbs}g Carboidratos | ${totals.protein}g Proteínas | ${totals.fats}g Gorduras\n`;
    text += `💧 *Meta de Hidratação:* ${((this.currentDiet.water_target_ml || 2500) / 1000).toFixed(1)}L por dia\n\n`;
    text += `─────────────\n`;

    const meals = this.currentDiet.diet_meals || this.currentDiet.meals || [];
    meals.forEach((meal) => {
      const mealTotals = this.getMealTotals(meal);
      text += `\n⏰ *${meal.name.toUpperCase()}* (${meal.time}) - _${mealTotals.calories} kcal_\n`;
      const items = meal.diet_meal_items || meal.items || [];
      items.forEach(item => {
        text += ` • ${item.food_name || item.foodId}: ${item.portion_name || item.grams + 'g'}\n`;
      });
    });

    if (this.currentDiet.notes) {
      text += `\n─────────────\n`;
      text += `📌 *Orientações da Nutricionista:*\n${this.currentDiet.notes}\n`;
    }

    text += `\n✨ _Elaborado via NutriCore (Banco de Dados em Tempo Real)_`;

    const encoded = encodeURIComponent(text);
    const cleanPhone = (patient.phone || "").replace(/\D/g, "");
    const url = cleanPhone ? `https://api.whatsapp.com/send?phone=55${cleanPhone}&text=${encoded}` : `https://api.whatsapp.com/send?text=${encoded}`;
    
    navigator.clipboard?.writeText(text).then(() => {
      window.showToast("Plano copiado para a área de transferência! Abrindo WhatsApp...", "success");
    }).catch(() => {});

    window.open(url, "_blank");
  },

  render() {
    const container = document.getElementById("dietBuilderContent");
    if (!container) return;

    if (!this.currentDiet) {
      container.innerHTML = `<div class="empty-state"><p>Carregando planos do banco de dados Supabase...</p></div>`;
      return;
    }

    const patient = this.currentDiet.patients || { name: "Paciente Não Vinculado" };
    const totals = this.getDailyTotals();

    const carbKcal = totals.carbs * 4;
    const protKcal = totals.protein * 4;
    const fatKcal = totals.fats * 9;
    const sumKcal = carbKcal + protKcal + fatKcal || 1;

    const carbPercent = Math.round((carbKcal / sumKcal) * 100);
    const protPercent = Math.round((protKcal / sumKcal) * 100);
    const fatPercent = Math.round((fatKcal / sumKcal) * 100);

    const targetCal = this.currentDiet.target_calories || this.currentDiet.targetCalories || 2000;
    const calDiff = totals.calories - targetCal;
    const calPercent = Math.min(100, Math.round((totals.calories / targetCal) * 100));

    const targetCarbs = this.currentDiet.target_carbs || this.currentDiet.targetCarbs || 250;
    const targetProt = this.currentDiet.target_protein || this.currentDiet.targetProtein || 150;
    const targetFats = this.currentDiet.target_fats || this.currentDiet.targetFats || 65;
    const waterTarget = this.currentDiet.water_target_ml || this.currentDiet.waterTargetMl || 2500;

    let html = `
      <!-- Cabeçalho do Plano -->
      <div class="diet-header-card">
        <div class="diet-header-main">
          <div class="diet-title-group">
            <span class="diet-badge-status"><i class="fa-solid fa-circle-check"></i> Plano Ativo no Supabase</span>
            <h2 class="diet-title">${this.currentDiet.title}</h2>
            <p class="diet-patient-meta">
              <i class="fa-solid fa-user-check text-emerald"></i> Paciente: <strong>${patient.name}</strong> 
              ${patient.age ? `• ${patient.age} anos` : ''} 
              ${patient.weight ? `• ${patient.weight} kg` : ''}
              ${patient.objective ? `• <span class="patient-obj-pill">${patient.objective}</span>` : ''}
            </p>
          </div>
          <div class="diet-header-actions">
            <button class="db-btn db-btn--outline" onclick="DietManager.shareViaWhatsApp()" title="Enviar para WhatsApp do Paciente">
              <i class="fa-brands fa-whatsapp text-emerald" style="font-size: 1.15rem;"></i> WhatsApp
            </button>
            <button class="db-btn db-btn--outline" onclick="DietManager.printPlan()" title="Exportar ou Imprimir em PDF">
              <i class="fa-solid fa-print"></i> Imprimir / PDF
            </button>
            <button class="db-btn db-btn--primary" onclick="DietManager.promptNewMeal()">
              <i class="fa-solid fa-plus"></i> Nova Refeição
            </button>
          </div>
        </div>

        <!-- Dashboard Nutricional de Metas em Tempo Real -->
        <div class="macro-dashboard-grid">
          <!-- Calorias Totais -->
          <div class="macro-card macro-calories">
            <div class="macro-header">
              <span class="macro-label"><i class="fa-solid fa-fire text-amber"></i> Calorias Diárias</span>
              <span class="macro-target">Meta: ${targetCal} kcal</span>
            </div>
            <div class="macro-value-group">
              <span class="macro-current-val">${totals.calories}</span>
              <span class="macro-unit">kcal</span>
              <span class="macro-diff ${calDiff > 0 ? 'text-amber' : 'text-emerald'}">
                (${calDiff > 0 ? '+' : ''}${calDiff} kcal)
              </span>
            </div>
            <div class="db-progress-bar">
              <div class="db-progress-fill bg-emerald" style="width: ${calPercent}%"></div>
            </div>
          </div>

          <!-- Carboidratos -->
          <div class="macro-card">
            <div class="macro-header">
              <span class="macro-label"><i class="fa-solid fa-wheat-awn text-blue"></i> Carboidratos</span>
              <span class="macro-target">Meta: ${targetCarbs}g</span>
            </div>
            <div class="macro-value-group">
              <span class="macro-current-val">${totals.carbs}g</span>
              <span class="macro-pct badge-c">${carbPercent}% VET</span>
            </div>
            <div class="db-progress-bar">
              <div class="db-progress-fill bg-blue" style="width: ${Math.min(100, Math.round((totals.carbs/targetCarbs)*100))}%"></div>
            </div>
          </div>

          <!-- Proteínas -->
          <div class="macro-card">
            <div class="macro-header">
              <span class="macro-label"><i class="fa-solid fa-drumstick-bite text-purple"></i> Proteínas</span>
              <span class="macro-target">Meta: ${targetProt}g</span>
            </div>
            <div class="macro-value-group">
              <span class="macro-current-val">${totals.protein}g</span>
              <span class="macro-pct badge-p">${protPercent}% VET</span>
            </div>
            <div class="db-progress-bar">
              <div class="db-progress-fill bg-purple" style="width: ${Math.min(100, Math.round((totals.protein/targetProt)*100))}%"></div>
            </div>
          </div>

          <!-- Gorduras -->
          <div class="macro-card">
            <div class="macro-header">
              <span class="macro-label"><i class="fa-solid fa-droplet text-amber"></i> Gorduras</span>
              <span class="macro-target">Meta: ${targetFats}g</span>
            </div>
            <div class="macro-value-group">
              <span class="macro-current-val">${totals.fats}g</span>
              <span class="macro-pct badge-f">${fatPercent}% VET</span>
            </div>
            <div class="db-progress-bar">
              <div class="db-progress-fill bg-amber" style="width: ${Math.min(100, Math.round((totals.fats/targetFats)*100))}%"></div>
            </div>
          </div>

          <!-- Fibras & Hidratação -->
          <div class="macro-card">
            <div class="macro-header">
              <span class="macro-label"><i class="fa-solid fa-bottle-water text-cyan"></i> Água & Fibras</span>
              <span class="macro-target">Recomendado</span>
            </div>
            <div class="macro-value-group">
              <span class="macro-current-val" style="font-size: 1.25rem;">${(waterTarget/1000).toFixed(1)}L</span>
              <span class="macro-unit">água</span>
              <span class="macro-pct" style="background:#ecfdf5; color:#065f46; font-weight: 700;">${totals.fiber}g fibras</span>
            </div>
            <div class="db-progress-bar">
              <div class="db-progress-fill bg-cyan" style="width: 100%"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Lista de Refeições -->
      <div class="meals-container">
    `;

    const meals = this.currentDiet.diet_meals || this.currentDiet.meals || [];

    if (meals.length === 0) {
      html += `
        <div class="empty-state">
          <i class="fa-solid fa-utensils" style="font-size: 3rem; color: var(--cold-neutral-400);"></i>
          <h3>Nenhuma refeição adicionada ainda</h3>
          <p>Clique no botão acima para adicionar a primeira refeição do dia ao banco de dados.</p>
        </div>
      `;
    } else {
      meals.forEach((meal) => {
        const mealTotals = this.getMealTotals(meal);
        const items = meal.diet_meal_items || meal.items || [];

        html += `
          <div class="meal-card" id="meal_${meal.id}">
            <div class="meal-card-header">
              <div class="meal-header-title">
                <div class="meal-icon-box">
                  <i class="fa-solid ${meal.icon || 'fa-utensils'}"></i>
                </div>
                <div>
                  <h3 class="meal-name">${meal.name}</h3>
                  <span class="meal-time"><i class="fa-regular fa-clock"></i> ${meal.time}</span>
                </div>
              </div>

              <!-- Macros da Refeição -->
              <div class="meal-macros-badges">
                <span class="badge badge-cal"><i class="fa-solid fa-fire"></i> ${mealTotals.calories} kcal</span>
                <span class="badge badge-c">C: ${mealTotals.carbs}g</span>
                <span class="badge badge-p">P: ${mealTotals.protein}g</span>
                <span class="badge badge-f">G: ${mealTotals.fats}g</span>
                <span class="badge" style="background: #f1f5f9; color: #475569;">Fib: ${mealTotals.fiber}g</span>
              </div>

              <div class="meal-header-actions">
                <button class="db-btn db-btn--primary db-btn--sm" onclick="DietManager.openAddFoodModal('${meal.id}')">
                  <i class="fa-solid fa-plus"></i> Alimento
                </button>
                <button class="icon-btn-danger" onclick="DietManager.removeMeal('${meal.id}')" title="Excluir Refeição do Banco">
                  <i class="fa-regular fa-trash-can"></i>
                </button>
              </div>
            </div>

            <!-- Tabela de Alimentos da Refeição -->
            <div class="meal-items-list">
        `;

        if (items.length === 0) {
          html += `
            <div class="meal-empty-hint">
              <p>Nenhum alimento nesta refeição. Clique em <b>+ Alimento</b> para buscar na tabela TACO.</p>
            </div>
          `;
        } else {
          items.forEach((item) => {
            const foodId = item.food_id || item.foodId;
            const foodName = item.food_name || item.name;
            const food = window.FOOD_DATABASE.find(f => f.id === foodId);
            const foodCategory = food ? food.category : "Nutrição";

            const cal = item.calories || (food ? Math.round((food.calories * item.grams)/100) : 0);
            const carbs = item.carbs || (food ? +((food.carbs * item.grams)/100).toFixed(1) : 0);
            const prot = item.protein || (food ? +((food.protein * item.grams)/100).toFixed(1) : 0);
            const fats = item.fats || (food ? +((food.fats * item.grams)/100).toFixed(1) : 0);

            html += `
              <div class="food-row">
                <div class="food-row-name">
                  <span class="food-name-text">${foodName}</span>
                  <span class="food-category-pill-sm">${foodCategory}</span>
                </div>

                <div class="food-row-portion">
                  <div class="input-with-unit">
                    <input type="number" value="${item.grams}" min="1" max="1000" 
                      class="db-input-field input-inline input-grams"
                      onchange="DietManager.updateFoodGrams('${meal.id}', '${item.id}', this.value, '${foodId}')"
                      title="Alterar gramagem no banco de dados">
                    <span class="unit-label">g</span>
                  </div>
                  <span class="food-portion-desc">(${item.portion_name || item.portionName || item.grams + 'g'})</span>
                </div>

                <div class="food-row-nutrients">
                  <span class="val-cal"><b>${cal}</b> kcal</span>
                  <span class="val-c">${carbs}g C</span>
                  <span class="val-p">${prot}g P</span>
                  <span class="val-f">${fats}g G</span>
                </div>

                <div class="food-row-actions">
                  <button class="sub-btn" onclick="DietManager.openSubstitutionModal('${meal.id}', '${item.id}', '${foodId}', ${item.grams})" title="Substituição Inteligente (Assistente NutriCore)">
                    <i class="fa-solid fa-arrows-rotate text-emerald"></i> Substituir
                  </button>
                  <button class="icon-btn-danger-sm" onclick="DietManager.removeFoodFromMeal('${meal.id}', '${item.id}')" title="Remover Alimento do Banco">
                    <i class="fa-solid fa-xmark"></i>
                  </button>
                </div>
              </div>
            `;
          });
        }

        html += `
            </div>
          </div>
        `;
      });
    }

    html += `
      </div>

      <!-- Card de Orientações Gerais & Observações -->
      <div class="diet-notes-card">
        <div class="diet-notes-header">
          <i class="fa-solid fa-clipboard-list text-emerald" style="font-size: 1.25rem;"></i>
          <h3>Orientações & Recomendações da Nutricionista (Salvas no Banco)</h3>
        </div>
        <textarea id="dietNotesTextarea" class="db-input-field" rows="3" placeholder="Digite orientações gerais sobre suplementação, hidratação ou horários..." onchange="DietManager.updateNotes(this.value)">${this.currentDiet.notes || ''}</textarea>
      </div>
    `;

    container.innerHTML = html;
  },

  async updateNotes(newNotes) {
    if (this.currentDiet) {
      try {
        await window.DBService.updateDietNotes(this.currentDiet.id, newNotes);
        this.currentDiet.notes = newNotes;
        window.showToast("Orientações salvas no Supabase!", "success");
      } catch (err) {
        console.error("Erro ao salvar observações:", err);
      }
    }
  },

  promptNewMeal() {
    const name = prompt("Nome da refeição (ex: Lanche da Tarde, Ceia, Pré-treino):", "Lanche da Tarde");
    if (!name) return;
    const time = prompt("Horário da refeição (ex: 16:30):", "16:30") || "16:00";
    this.addMeal(name, time);
  }
};
