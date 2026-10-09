// Lógica do Criador de Dietas (NutriCore Planos Alimentares)
window.DietManager = {
  currentDiet: null,

  init(dietId) {
    if (dietId) {
      this.currentDiet = window.APP_DATA.diets.find(d => d.id === dietId) || window.APP_DATA.diets[0];
    } else {
      this.currentDiet = window.APP_DATA.diets[0];
    }
    this.render();
  },

  setDiet(dietId) {
    const found = window.APP_DATA.diets.find(d => d.id === dietId);
    if (found) {
      this.currentDiet = found;
      this.render();
    }
  },

  getMealTotals(meal) {
    let calories = 0;
    let carbs = 0;
    let protein = 0;
    let fats = 0;
    let fiber = 0;

    meal.items.forEach(item => {
      const nutrients = window.calculateNutrients(item.foodId, item.grams);
      calories += nutrients.calories;
      carbs += nutrients.carbs;
      protein += nutrients.protein;
      fats += nutrients.fats;
      fiber += nutrients.fiber;
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

    this.currentDiet.meals.forEach(m => {
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

  addMeal(name, time, icon = "fa-utensils") {
    if (!this.currentDiet) return;
    const newMeal = {
      id: "m_" + Date.now(),
      name: name || "Nova Refeição",
      time: time || "12:00",
      icon: icon,
      items: []
    };
    this.currentDiet.meals.push(newMeal);
    this.render();
    window.showToast("Refeição adicionada ao plano!", "success");
  },

  removeMeal(mealId) {
    if (!this.currentDiet) return;
    if (confirm("Tem certeza que deseja remover esta refeição do plano?")) {
      this.currentDiet.meals = this.currentDiet.meals.filter(m => m.id !== mealId);
      this.render();
      window.showToast("Refeição removida.", "info");
    }
  },

  addFoodToMeal(mealId, foodId, grams, portionName) {
    if (!this.currentDiet) return;
    const meal = this.currentDiet.meals.find(m => m.id === mealId);
    if (!meal) return;

    const food = window.FOOD_DATABASE.find(f => f.id === foodId);
    if (!food) return;

    const finalGrams = parseFloat(grams) || food.standardGrams;
    const finalPortion = portionName || `${finalGrams}g`;

    meal.items.push({
      foodId: food.id,
      grams: finalGrams,
      portionName: finalPortion
    });

    this.render();
    window.showToast(`${food.name} adicionado à refeição!`, "success");
  },

  removeFoodFromMeal(mealId, foodIndex) {
    if (!this.currentDiet) return;
    const meal = this.currentDiet.meals.find(m => m.id === mealId);
    if (!meal) return;

    meal.items.splice(foodIndex, 1);
    this.render();
    window.showToast("Alimento removido.", "info");
  },

  updateFoodGrams(mealId, foodIndex, newGrams) {
    if (!this.currentDiet) return;
    const meal = this.currentDiet.meals.find(m => m.id === mealId);
    if (!meal || !meal.items[foodIndex]) return;

    meal.items[foodIndex].grams = Math.max(1, parseFloat(newGrams) || 100);
    meal.items[foodIndex].portionName = `${meal.items[foodIndex].grams}g`;
    this.render();
  },

  // Substituição inteligente: Assistente NutriCore
  substituteFood(mealId, foodIndex, newFoodId) {
    if (!this.currentDiet) return;
    const meal = this.currentDiet.meals.find(m => m.id === mealId);
    if (!meal || !meal.items[foodIndex]) return;

    const currentItem = meal.items[foodIndex];
    const oldFood = window.FOOD_DATABASE.find(f => f.id === currentItem.foodId);
    const newFood = window.FOOD_DATABASE.find(f => f.id === newFoodId);
    if (!oldFood || !newFood) return;

    // Calcula calorias do item antigo
    const oldCalories = (oldFood.calories * currentItem.grams) / 100;
    // Quantidade equivalente em calorias do novo alimento
    const equivalentGrams = newFood.calories > 0 
      ? Math.round((oldCalories / newFood.calories) * 100)
      : newFood.standardGrams;

    meal.items[foodIndex] = {
      foodId: newFood.id,
      grams: equivalentGrams,
      portionName: `${equivalentGrams}g (substituição equivalente)`
    };

    this.render();
    window.showToast(`Substituído por ${newFood.name} (${equivalentGrams}g)`, "success");
  },

  openSubstitutionModal(mealId, foodIndex) {
    const meal = this.currentDiet.meals.find(m => m.id === mealId);
    if (!meal || !meal.items[foodIndex]) return;

    const item = meal.items[foodIndex];
    const food = window.FOOD_DATABASE.find(f => f.id === item.foodId);
    if (!food) return;

    const modalTitle = document.getElementById("subModalTitle");
    const modalBody = document.getElementById("subModalBody");
    if (!modalTitle || !modalBody) return;

    modalTitle.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles text-emerald"></i> Assistente NutriCore: Substituir "${food.name}"`;

    let html = `
      <div class="sub-current-card">
        <div class="sub-current-info">
          <strong>Alimento Atual:</strong> ${food.name} (${item.grams}g)
          <div class="sub-current-tags">
            <span class="badge badge-cal">${Math.round((food.calories * item.grams)/100)} kcal</span>
            <span class="badge badge-c">${+((food.carbs * item.grams)/100).toFixed(1)}g C</span>
            <span class="badge badge-p">${+((food.protein * item.grams)/100).toFixed(1)}g P</span>
            <span class="badge badge-f">${+((food.fats * item.grams)/100).toFixed(1)}g G</span>
          </div>
        </div>
      </div>
      <h4 style="margin: 1.25rem 0 0.5rem; font-size: 0.95rem; color: var(--cold-neutral-800);">
        Sugestões equivalentes recomendadas na mesma categoria (${food.category}):
      </h4>
      <div class="sub-list">
    `;

    // Buscar sugestões da lista de substitutos ou mesma categoria
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
        const oldCal = (food.calories * item.grams) / 100;
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
            <button class="db-btn db-btn--primary db-btn--sm" onclick="DietManager.substituteFood('${mealId}', ${foodIndex}, '${cand.id}'); window.closeModal('subModal');">
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
    const meal = this.currentDiet.meals.find(m => m.id === mealId);
    if (!meal) return;

    window.currentTargetMealId = mealId;
    const modalTitle = document.getElementById("addFoodModalTitle");
    if (modalTitle) modalTitle.innerText = `Adicionar Alimento - ${meal.name}`;

    // Popula categorias e lista
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

  // Exportar / Imprimir Plano em PDF
  printPlan() {
    window.print();
  },

  // Compartilhar Plano por WhatsApp com formatação premium
  shareViaWhatsApp() {
    if (!this.currentDiet) return;
    const patient = window.APP_DATA.patients.find(p => p.id === this.currentDiet.patientId) || { name: "Paciente" };
    const totals = this.getDailyTotals();

    let text = `🍏 *PLANO ALIMENTAR NUTRICORE* 🍏\n`;
    text += `👤 *Paciente:* ${patient.name}\n`;
    text += `📋 *Plano:* ${this.currentDiet.title}\n`;
    text += `🎯 *Total Estimado:* ${totals.calories} kcal | ${totals.carbs}g Carboidratos | ${totals.protein}g Proteínas | ${totals.fats}g Gorduras\n`;
    text += `💧 *Meta de Hidratação:* ${(this.currentDiet.waterTargetMl / 1000).toFixed(1)}L por dia\n\n`;
    text += `─────────────\n`;

    this.currentDiet.meals.forEach((meal, i) => {
      const mealTotals = this.getMealTotals(meal);
      text += `\n⏰ *${meal.name.toUpperCase()}* (${meal.time}) - _${mealTotals.calories} kcal_\n`;
      meal.items.forEach(item => {
        const food = window.FOOD_DATABASE.find(f => f.id === item.foodId);
        if (food) {
          text += ` • ${food.name}: ${item.portionName || item.grams + 'g'}\n`;
        }
      });
    });

    if (this.currentDiet.notes) {
      text += `\n─────────────\n`;
      text += `📌 *Orientações da Nutricionista:*\n${this.currentDiet.notes}\n`;
    }

    text += `\n✨ _Elaborado por ${window.APP_DATA.currentNutri.name} (${window.APP_DATA.currentNutri.crn}) via NutriCore_`;

    const encoded = encodeURIComponent(text);
    const cleanPhone = (patient.phone || "").replace(/\D/g, "");
    
    // Tenta abrir WhatsApp Web ou app
    const url = cleanPhone ? `https://api.whatsapp.com/send?phone=55${cleanPhone}&text=${encoded}` : `https://api.whatsapp.com/send?text=${encoded}`;
    
    // Copia também para o clipboard
    navigator.clipboard?.writeText(text).then(() => {
      window.showToast("Plano copiado para a área de transferência! Abrindo WhatsApp...", "success");
    }).catch(() => {});

    window.open(url, "_blank");
  },

  // Render principal do criador de dietas
  render() {
    const container = document.getElementById("dietBuilderContent");
    if (!container) return;

    if (!this.currentDiet) {
      container.innerHTML = `<div class="empty-state"><p>Nenhum plano selecionado.</p></div>`;
      return;
    }

    const patient = window.APP_DATA.patients.find(p => p.id === this.currentDiet.patientId) || { name: "Paciente Não Vinculado" };
    const totals = this.getDailyTotals();

    // Cálculo das porcentagens de macronutrientes do VET (Valor Energético Total)
    const carbKcal = totals.carbs * 4;
    const protKcal = totals.protein * 4;
    const fatKcal = totals.fats * 9;
    const sumKcal = carbKcal + protKcal + fatKcal || 1;

    const carbPercent = Math.round((carbKcal / sumKcal) * 100);
    const protPercent = Math.round((protKcal / sumKcal) * 100);
    const fatPercent = Math.round((fatKcal / sumKcal) * 100);

    // Comparação com as metas planejadas
    const targetCal = this.currentDiet.targetCalories || 2000;
    const calDiff = totals.calories - targetCal;
    const calPercent = Math.min(100, Math.round((totals.calories / targetCal) * 100));

    let html = `
      <!-- Cabeçalho do Plano -->
      <div class="diet-header-card">
        <div class="diet-header-main">
          <div class="diet-title-group">
            <span class="diet-badge-status"><i class="fa-solid fa-circle-check"></i> Plano Ativo</span>
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
              <span class="macro-target">Meta: ${this.currentDiet.targetCarbs}g</span>
            </div>
            <div class="macro-value-group">
              <span class="macro-current-val">${totals.carbs}g</span>
              <span class="macro-pct badge-c">${carbPercent}% VET</span>
            </div>
            <div class="db-progress-bar">
              <div class="db-progress-fill bg-blue" style="width: ${Math.min(100, Math.round((totals.carbs/this.currentDiet.targetCarbs)*100))}%"></div>
            </div>
          </div>

          <!-- Proteínas -->
          <div class="macro-card">
            <div class="macro-header">
              <span class="macro-label"><i class="fa-solid fa-drumstick-bite text-purple"></i> Proteínas</span>
              <span class="macro-target">Meta: ${this.currentDiet.targetProtein}g</span>
            </div>
            <div class="macro-value-group">
              <span class="macro-current-val">${totals.protein}g</span>
              <span class="macro-pct badge-p">${protPercent}% VET</span>
            </div>
            <div class="db-progress-bar">
              <div class="db-progress-fill bg-purple" style="width: ${Math.min(100, Math.round((totals.protein/this.currentDiet.targetProtein)*100))}%"></div>
            </div>
          </div>

          <!-- Gorduras -->
          <div class="macro-card">
            <div class="macro-header">
              <span class="macro-label"><i class="fa-solid fa-droplet text-amber"></i> Gorduras</span>
              <span class="macro-target">Meta: ${this.currentDiet.targetFats}g</span>
            </div>
            <div class="macro-value-group">
              <span class="macro-current-val">${totals.fats}g</span>
              <span class="macro-pct badge-f">${fatPercent}% VET</span>
            </div>
            <div class="db-progress-bar">
              <div class="db-progress-fill bg-amber" style="width: ${Math.min(100, Math.round((totals.fats/this.currentDiet.targetFats)*100))}%"></div>
            </div>
          </div>

          <!-- Fibras & Hidratação -->
          <div class="macro-card">
            <div class="macro-header">
              <span class="macro-label"><i class="fa-solid fa-bottle-water text-cyan"></i> Água & Fibras</span>
              <span class="macro-target">Recomendado</span>
            </div>
            <div class="macro-value-group">
              <span class="macro-current-val" style="font-size: 1.25rem;">${(this.currentDiet.waterTargetMl/1000).toFixed(1)}L</span>
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

    if (!this.currentDiet.meals || this.currentDiet.meals.length === 0) {
      html += `
        <div class="empty-state">
          <i class="fa-solid fa-utensils" style="font-size: 3rem; color: var(--cold-neutral-400);"></i>
          <h3>Nenhuma refeição adicionada ainda</h3>
          <p>Clique no botão acima para adicionar a primeira refeição do dia.</p>
        </div>
      `;
    } else {
      this.currentDiet.meals.forEach((meal, mealIdx) => {
        const mealTotals = this.getMealTotals(meal);

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
                <button class="icon-btn-danger" onclick="DietManager.removeMeal('${meal.id}')" title="Excluir Refeição">
                  <i class="fa-regular fa-trash-can"></i>
                </button>
              </div>
            </div>

            <!-- Tabela de Alimentos da Refeição -->
            <div class="meal-items-list">
        `;

        if (meal.items.length === 0) {
          html += `
            <div class="meal-empty-hint">
              <p>Nenhum alimento nesta refeição. Clique em <b>+ Alimento</b> para buscar na tabela TACO.</p>
            </div>
          `;
        } else {
          meal.items.forEach((item, itemIdx) => {
            const food = window.FOOD_DATABASE.find(f => f.id === item.foodId);
            if (!food) return;

            const n = window.calculateNutrients(food.id, item.grams);

            html += `
              <div class="food-row">
                <div class="food-row-name">
                  <span class="food-name-text">${food.name}</span>
                  <span class="food-category-pill-sm">${food.category}</span>
                </div>

                <div class="food-row-portion">
                  <div class="input-with-unit">
                    <input type="number" value="${item.grams}" min="1" max="1000" 
                      class="db-input-field input-inline input-grams"
                      onchange="DietManager.updateFoodGrams('${meal.id}', ${itemIdx}, this.value)"
                      title="Alterar gramagem">
                    <span class="unit-label">g</span>
                  </div>
                  <span class="food-portion-desc">(${item.portionName || item.grams + 'g'})</span>
                </div>

                <div class="food-row-nutrients">
                  <span class="val-cal"><b>${n.calories}</b> kcal</span>
                  <span class="val-c">${n.carbs}g C</span>
                  <span class="val-p">${n.protein}g P</span>
                  <span class="val-f">${n.fats}g G</span>
                </div>

                <div class="food-row-actions">
                  <button class="sub-btn" onclick="DietManager.openSubstitutionModal('${meal.id}', ${itemIdx})" title="Substituição Inteligente (Assistente NutriCore)">
                    <i class="fa-solid fa-arrows-rotate text-emerald"></i> Substituir
                  </button>
                  <button class="icon-btn-danger-sm" onclick="DietManager.removeFoodFromMeal('${meal.id}', ${itemIdx})" title="Remover Alimento">
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
          <h3>Orientações & Recomendações da Nutricionista</h3>
        </div>
        <textarea id="dietNotesTextarea" class="db-input-field" rows="3" placeholder="Digite orientações gerais sobre suplementação, hidratação, horários ou substituições livres..." onchange="DietManager.updateNotes(this.value)">${this.currentDiet.notes || ''}</textarea>
      </div>
    `;

    container.innerHTML = html;
  },

  updateNotes(newNotes) {
    if (this.currentDiet) {
      this.currentDiet.notes = newNotes;
      window.showToast("Orientações salvas!", "success");
    }
  },

  promptNewMeal() {
    const name = prompt("Nome da refeição (ex: Lanche da Tarde, Ceia, Pré-treino):", "Lanche da Tarde");
    if (!name) return;
    const time = prompt("Horário da refeição (ex: 16:30):", "16:30") || "16:00";
    this.addMeal(name, time);
  }
};
