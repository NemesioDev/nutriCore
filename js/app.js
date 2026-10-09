// Aplicação Principal NutriCore Nutricionistas & Pacientes
window.App = {
  currentView: "view-diet-builder", // view inicial do app após login
  isLoggedIn: true, // Inicia autenticado para acesso imediato ao software, mas com toggle para a tela de login NutriCore
  currentRole: "Nutricionista",

  init() {
    this.setupEventListeners();
    this.checkAuthState();
    this.renderDashboard();
    this.renderPatientsList();
    this.renderAppointments();
    this.renderRecipes();
    this.renderPatientAppSimulator();
    
    // Inicia criador de dietas e antropometria
    window.DietManager.init("dieta_rodrigo");
    window.AnthroManager.init("paciente_1");
  },

  checkAuthState() {
    const authContainer = document.getElementById("authScreen");
    const appContainer = document.getElementById("appScreen");

    if (this.isLoggedIn) {
      if (authContainer) authContainer.style.display = "none";
      if (appContainer) appContainer.style.display = "flex";
      this.switchView(this.currentView);
    } else {
      if (authContainer) authContainer.style.display = "flex";
      if (appContainer) appContainer.style.display = "none";
    }
  },

  login(email, password, role = "Nutricionista") {
    this.isLoggedIn = true;
    this.currentRole = role;
    this.checkAuthState();
    window.showToast(`Bem-vinda de volta, ${window.APP_DATA.currentNutri.name}!`, "success");
  },

  logout() {
    this.isLoggedIn = false;
    this.checkAuthState();
    window.showToast("Sessão finalizada com sucesso.", "info");
  },

  switchView(viewId) {
    this.currentView = viewId;
    
    // Esconde todas as views
    document.querySelectorAll(".view-section").forEach(sec => {
      sec.classList.remove("active");
    });

    // Mostra a view alvo
    const target = document.getElementById(viewId);
    if (target) {
      target.classList.add("active");
    }

    // Atualiza classes ativas na navbar
    document.querySelectorAll(".nav-link").forEach(link => {
      link.classList.remove("active");
      if (link.getAttribute("data-view") === viewId) {
        link.classList.add("active");
      }
    });

    // Se mudou para a view de simulador do paciente, renderiza novamente
    if (viewId === "view-patient-app") {
      this.renderPatientAppSimulator();
    } else if (viewId === "view-recipes") {
      this.generateSmartShoppingList();
    } else if (viewId === "view-dashboard") {
      this.renderDashboard();
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  },

  setupEventListeners() {
    // Nav links
    document.querySelectorAll(".nav-link[data-view]").forEach(link => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const viewId = link.getAttribute("data-view");
        this.switchView(viewId);
      });
    });

    // Busca de alimentos no modal
    const foodSearchInput = document.getElementById("foodSearchInput");
    const foodCategorySelect = document.getElementById("foodCategorySelect");

    if (foodSearchInput) {
      foodSearchInput.addEventListener("input", (e) => {
        const cat = foodCategorySelect ? foodCategorySelect.value : "";
        window.DietManager.renderFoodSearchList(e.target.value, cat);
      });
    }

    if (foodCategorySelect) {
      foodCategorySelect.addEventListener("change", (e) => {
        const query = foodSearchInput ? foodSearchInput.value : "";
        window.DietManager.renderFoodSearchList(query, e.target.value);
      });
    }

    // Busca de pacientes
    const patientSearchInput = document.getElementById("patientSearchInput");
    if (patientSearchInput) {
      patientSearchInput.addEventListener("input", (e) => {
        this.renderPatientsList(e.target.value);
      });
    }
  },

  // Dashboard Nutricionista
  renderDashboard() {
    const totalPatients = window.APP_DATA.patients.length;
    const totalDiets = window.APP_DATA.diets.length;
    const todayAppointments = window.APP_DATA.appointments.length;

    const statPatients = document.getElementById("statTotalPatients");
    if (statPatients) statPatients.innerText = totalPatients;

    const statDiets = document.getElementById("statTotalDiets");
    if (statDiets) statDiets.innerText = totalDiets;

    const statApp = document.getElementById("statAppointments");
    if (statApp) statApp.innerText = todayAppointments;

    // Próximas consultas no dashboard
    const nextAppList = document.getElementById("dashNextAppointments");
    if (nextAppList) {
      nextAppList.innerHTML = window.APP_DATA.appointments.map(a => `
        <div class="dash-item-row">
          <div class="dash-item-avatar">
            <i class="fa-solid fa-calendar-check text-emerald"></i>
          </div>
          <div class="dash-item-info">
            <strong>${a.patientName}</strong>
            <span>${a.type} • <b>${a.date}</b></span>
          </div>
          <span class="badge ${a.status === 'Confirmado' ? 'badge-p' : 'badge-cal'}">${a.status}</span>
        </div>
      `).join('');
    }

    // Pacientes recentes
    const recentPatientsList = document.getElementById("dashRecentPatients");
    if (recentPatientsList) {
      recentPatientsList.innerHTML = window.APP_DATA.patients.map(p => `
        <div class="dash-item-row">
          <img src="${p.avatar}" class="dash-patient-avatar" alt="${p.name}">
          <div class="dash-item-info">
            <strong>${p.name}</strong>
            <span>${p.objective} • Última visita: ${p.lastVisit}</span>
          </div>
          <button class="db-btn db-btn--outline db-btn--sm" onclick="App.openPatientDiet('${p.id}')">
            Abrir Plano
          </button>
        </div>
      `).join('');
    }
  },

  openPatientDiet(patientId) {
    const patient = window.APP_DATA.patients.find(p => p.id === patientId);
    if (!patient) return;

    if (patient.currentDietId) {
      window.DietManager.setDiet(patient.currentDietId);
    } else {
      // Cria plano se não tiver
      const newDiet = {
        id: "dieta_" + patient.id,
        patientId: patient.id,
        title: `Plano Alimentar - ${patient.name}`,
        targetCalories: 2000,
        targetCarbs: 220,
        targetProtein: 140,
        targetFats: 60,
        waterTargetMl: 2800,
        notes: "Plano individualizado focado nas metas do paciente.",
        meals: [
          {
            id: "m_new_1",
            name: "Café da Manhã",
            time: "07:30",
            icon: "fa-coffee",
            items: [
              { foodId: "ovo_cozido", grams: 100, portionName: "2 ovos cozidos" },
              { foodId: "pao_integral", grams: 50, portionName: "2 fatias" },
              { foodId: "banana_prata", grams: 80, portionName: "1 banana prata" }
            ]
          },
          {
            id: "m_new_2",
            name: "Almoço",
            time: "12:30",
            icon: "fa-utensils",
            items: [
              { foodId: "frango_peito", grams: 140, portionName: "1 filé grelhado" },
              { foodId: "arroz_integral", grams: 120, portionName: "4 colheres de sopa" },
              { foodId: "feijao_carioca", grams: 100, portionName: "1 concha média" },
              { foodId: "brocolis", grams: 100, portionName: "No vapor" }
            ]
          }
        ]
      };
      window.APP_DATA.diets.push(newDiet);
      patient.currentDietId = newDiet.id;
      window.DietManager.setDiet(newDiet.id);
    }

    this.switchView("view-diet-builder");
  },

  // Gestão de Pacientes
  renderPatientsList(query = "") {
    const container = document.getElementById("patientsListGrid");
    if (!container) return;

    const q = (query || "").toLowerCase().trim();
    const filtered = window.APP_DATA.patients.filter(p => {
      return p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q);
    });

    if (filtered.length === 0) {
      container.innerHTML = `<div class="empty-state"><p>Nenhum paciente encontrado com essa busca.</p></div>`;
      return;
    }

    container.innerHTML = filtered.map(p => {
      const imcData = window.AnthroManager.calculateIMC(p.weight, p.height);
      return `
        <div class="patient-card">
          <div class="patient-card-header">
            <img src="${p.avatar}" class="patient-avatar-lg" alt="${p.name}">
            <div class="patient-card-title">
              <h3>${p.name}</h3>
              <span class="patient-email"><i class="fa-regular fa-envelope"></i> ${p.email}</span>
              <span class="patient-phone"><i class="fa-brands fa-whatsapp text-emerald"></i> ${p.phone}</span>
            </div>
            <span class="badge ${p.status === 'Ativo' ? 'badge-p' : 'badge-cal'}">${p.status}</span>
          </div>

          <div class="patient-meta-grid">
            <div class="patient-meta-item">
              <span class="p-meta-label">Idade</span>
              <span class="p-meta-val">${p.age} anos</span>
            </div>
            <div class="patient-meta-item">
              <span class="p-meta-label">Peso / Altura</span>
              <span class="p-meta-val">${p.weight}kg • ${p.height}cm</span>
            </div>
            <div class="patient-meta-item">
              <span class="p-meta-label">IMC</span>
              <span class="p-meta-val" style="color: ${imcData.color}">${imcData.imc}</span>
            </div>
            <div class="patient-meta-item">
              <span class="p-meta-label">Objetivo</span>
              <span class="p-meta-val">${p.objective}</span>
            </div>
          </div>

          <div class="patient-notes-snippet">
            <i class="fa-regular fa-clipboard"></i> <span>${p.notes}</span>
          </div>

          <div class="patient-card-footer">
            <button class="db-btn db-btn--primary db-btn--sm" onclick="App.openPatientDiet('${p.id}')">
              <i class="fa-solid fa-utensils"></i> Plano Alimentar
            </button>
            <button class="db-btn db-btn--outline db-btn--sm" onclick="window.AnthroManager.init('${p.id}'); App.switchView('view-anthro');">
              <i class="fa-solid fa-weight-scale"></i> Avaliação Antropo
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  openNewPatientModal() {
    window.openModal("newPatientModal");
  },

  saveNewPatient(e) {
    e.preventDefault();
    const form = e.target;
    const name = form.patientName.value;
    const email = form.patientEmail.value;
    const phone = form.patientPhone.value;
    const age = parseInt(form.patientAge.value) || 25;
    const gender = form.patientGender.value;
    const weight = parseFloat(form.patientWeight.value) || 70;
    const height = parseInt(form.patientHeight.value) || 170;
    const objective = form.patientObjective.value;
    const activityLevel = form.patientActivity.value;

    const newPatient = {
      id: "paciente_" + Date.now(),
      name: name,
      email: email,
      phone: phone,
      age: age,
      gender: gender,
      weight: weight,
      height: height,
      objective: objective,
      activityLevel: activityLevel,
      lastVisit: new Date().toLocaleDateString("pt-BR"),
      status: "Ativo",
      avatar: gender === "F" 
        ? "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80"
        : "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
      notes: "Paciente recém-cadastrado. Foco no objetivo estabelecido na anamnese.",
      measurements: [
        {
          date: new Date().toLocaleDateString("pt-BR"),
          weight: weight,
          bodyFat: gender === "F" ? 26.0 : 18.0,
          waist: 75,
          hip: 100,
          arm: 30
        }
      ],
      currentDietId: null
    };

    window.APP_DATA.patients.unshift(newPatient);
    this.renderPatientsList();
    this.renderDashboard();
    window.closeModal("newPatientModal");
    window.showToast(`Paciente ${name} cadastrado com sucesso!`, "success");
    form.reset();

    // Pergunta se deseja criar dieta agora
    if (confirm(`Deseja criar o plano alimentar para ${name} agora?`)) {
      this.openPatientDiet(newPatient.id);
    }
  },

  // Consultas
  renderAppointments() {
    const container = document.getElementById("appointmentsListGrid");
    if (!container) return;

    container.innerHTML = window.APP_DATA.appointments.map(a => `
      <div class="appointment-card">
        <div class="app-card-time">
          <i class="fa-regular fa-clock text-emerald"></i>
          <span>${a.date}</span>
        </div>
        <div class="app-card-body">
          <h3>${a.patientName}</h3>
          <p class="app-type"><i class="fa-solid fa-video text-blue"></i> ${a.type}</p>
          <p class="app-obj">Objetivo: <b>${a.objective}</b></p>
        </div>
        <div class="app-card-actions">
          <span class="badge ${a.status === 'Confirmado' ? 'badge-p' : 'badge-cal'}">${a.status}</span>
          <button class="db-btn db-btn--outline db-btn--sm" onclick="window.showToast('Link de videoconferência copiado!', 'success')">
            <i class="fa-solid fa-link"></i> Link Vídeo
          </button>
        </div>
      </div>
    `).join('');
  },

  openNewAppointmentModal() {
    const modalSelect = document.getElementById("appPatientSelect");
    if (modalSelect) {
      modalSelect.innerHTML = window.APP_DATA.patients.map(p => `
        <option value="${p.id}">${p.name}</option>
      `).join('');
    }
    window.openModal("newAppModal");
  },

  saveNewAppointment(e) {
    e.preventDefault();
    const form = e.target;
    const patientId = form.appPatientSelect.value;
    const patient = window.APP_DATA.patients.find(p => p.id === patientId);
    const date = form.appDate.value;
    const time = form.appTime.value;
    const type = form.appType.value;
    const obj = form.appObjective.value;

    window.APP_DATA.appointments.push({
      id: "app_" + Date.now(),
      patientName: patient ? patient.name : "Paciente",
      patientId: patientId,
      date: `${date}, ${time}`,
      type: type,
      status: "Agendado",
      objective: obj
    });

    this.renderAppointments();
    this.renderDashboard();
    window.closeModal("newAppModal");
    window.showToast("Consulta agendada no NutriCore!", "success");
    form.reset();
  },

  // Receitas & Lista de Compras
  renderRecipes() {
    const container = document.getElementById("recipesGrid");
    if (!container) return;

    container.innerHTML = window.APP_DATA.recipes.map(r => `
      <div class="recipe-card">
        <div class="recipe-card-header">
          <span class="recipe-badge"><i class="fa-regular fa-clock"></i> ${r.time}</span>
          <h3>${r.name}</h3>
          <div class="sub-current-tags" style="margin-top: 6px;">
            <span class="badge badge-cal">${r.calories} kcal</span>
            <span class="badge badge-c">${r.carbs}g C</span>
            <span class="badge badge-p">${r.protein}g P</span>
            <span class="badge badge-f">${r.fats}g G</span>
          </div>
        </div>
        <div class="recipe-ingredients">
          <strong>Ingredientes:</strong>
          <ul>
            ${r.ingredients.map(ing => `<li>${ing}</li>`).join('')}
          </ul>
        </div>
        <div class="recipe-instructions">
          <strong>Modo de preparo:</strong>
          <p>${r.instructions}</p>
        </div>
      </div>
    `).join('');
  },

  // Gerar Lista de Compras Inteligente a partir do plano atual
  generateSmartShoppingList() {
    const container = document.getElementById("shoppingListContent");
    if (!container) return;

    const currentDiet = window.DietManager.currentDiet;
    if (!currentDiet) {
      container.innerHTML = `<p class="empty-state">Nenhum plano alimentar selecionado.</p>`;
      return;
    }

    // Agrupa todos os alimentos do plano semanal (x7 dias)
    const foodMap = {};
    currentDiet.meals.forEach(m => {
      m.items.forEach(item => {
        if (!foodMap[item.foodId]) {
          foodMap[item.foodId] = 0;
        }
        foodMap[item.foodId] += item.grams;
      });
    });

    const items = Object.keys(foodMap).map(fId => {
      const food = window.FOOD_DATABASE.find(f => f.id === fId);
      const weeklyGrams = foodMap[fId] * 7;
      let displayWeight = `${weeklyGrams}g`;
      if (weeklyGrams >= 1000) {
        displayWeight = `${(weeklyGrams / 1000).toFixed(1)} kg`;
      }
      return {
        food: food || { name: fId, category: "Geral" },
        dailyGrams: foodMap[fId],
        weeklyWeight: displayWeight
      };
    });

    // Agrupa por categoria
    const categories = {};
    items.forEach(it => {
      const cat = it.food.category || "Outros";
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(it);
    });

    let html = `
      <div class="shopping-list-header">
        <div>
          <h3><i class="fa-solid fa-cart-shopping text-emerald"></i> Lista de Compras Semanal Automática</h3>
          <p class="text-muted">Calculada com base nas 7 semanas de adesão ao plano: <b>${currentDiet.title}</b></p>
        </div>
        <button class="db-btn db-btn--outline" onclick="window.print()">
          <i class="fa-solid fa-print"></i> Imprimir Lista
        </button>
      </div>
      <div class="shopping-category-grid">
    `;

    Object.keys(categories).forEach(cat => {
      html += `
        <div class="shopping-cat-card">
          <h4><i class="fa-solid fa-basket-shopping text-emerald"></i> ${cat}</h4>
          <ul class="shopping-items-checklist">
            ${categories[cat].map(it => `
              <li>
                <label class="custom-checkbox-item">
                  <input type="checkbox">
                  <span class="checkmark"></span>
                  <span class="item-name">${it.food.name}</span>
                  <span class="item-qty">${it.weeklyWeight}</span>
                </label>
              </li>
            `).join('')}
          </ul>
        </div>
      `;
    });

    html += `</div>`;
    container.innerHTML = html;
  },

  // Simulador do App do Paciente NutriCore
  patientWaterCount: 5, // copos de 250ml
  renderPatientAppSimulator() {
    const screen = document.getElementById("phoneScreenContent");
    if (!screen) return;

    const currentDiet = window.DietManager.currentDiet || window.APP_DATA.diets[0];
    const patient = window.APP_DATA.patients.find(p => p.id === currentDiet.patientId) || window.APP_DATA.patients[0];
    const totals = window.DietManager.getDailyTotals();
    const waterGoalGlasses = Math.round((currentDiet.waterTargetMl || 2500) / 250);
    const currentWaterMl = this.patientWaterCount * 250;
    const waterPct = Math.min(100, Math.round((currentWaterMl / (currentDiet.waterTargetMl || 2500)) * 100));

    screen.innerHTML = `
      <div class="phone-app-inner">
        <!-- App Header -->
        <div class="phone-header">
          <div class="phone-header-user">
            <img src="${patient.avatar}" class="phone-user-avatar" alt="${patient.name}">
            <div>
              <span class="phone-greeting">Olá, ${patient.name.split(' ')[0]} 👋</span>
              <span class="phone-sub">${patient.objective}</span>
            </div>
          </div>
          <div class="phone-header-nutri">
            <span class="nutri-badge"><i class="fa-solid fa-user-doctor text-emerald"></i> ${window.APP_DATA.currentNutri.name.split(' ')[1]}</span>
          </div>
        </div>

        <!-- Meta de Água Interativa -->
        <div class="phone-water-card">
          <div class="water-card-top">
            <div class="water-info">
              <span class="water-title"><i class="fa-solid fa-glass-water text-cyan"></i> Hidratação Diária</span>
              <span class="water-counter"><b>${(currentWaterMl / 1000).toFixed(2)}L</b> de ${(currentDiet.waterTargetMl/1000).toFixed(1)}L (${waterPct}%)</span>
            </div>
            <button class="water-add-btn" onclick="App.addWaterGlass()">
              <i class="fa-solid fa-plus"></i> +250ml
            </button>
          </div>
          <div class="db-progress-bar" style="margin-top: 8px;">
            <div class="db-progress-fill bg-cyan" style="width: ${waterPct}%"></div>
          </div>
        </div>

        <!-- Refeições de Hoje (Plano Alimentar no App) -->
        <div class="phone-section-title">
          <span>Refeições de Hoje</span>
          <span class="phone-date">${new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
        </div>

        <div class="phone-meals-list">
          ${currentDiet.meals.map((m, idx) => {
            const mTotals = window.DietManager.getMealTotals(m);
            return `
              <div class="phone-meal-item">
                <div class="phone-meal-header">
                  <div class="phone-meal-time-tag">
                    <i class="fa-solid ${m.icon || 'fa-utensils'} text-emerald"></i>
                    <span>${m.time}</span>
                  </div>
                  <strong>${m.name}</strong>
                  <span class="phone-meal-kcal">${mTotals.calories} kcal</span>
                </div>
                <div class="phone-meal-items-body">
                  ${m.items.map(it => {
                    const food = window.FOOD_DATABASE.find(f => f.id === it.foodId);
                    return `
                      <div class="phone-food-pill">
                        <i class="fa-regular fa-circle-check text-emerald"></i>
                        <span>${food ? food.name : ''} - <b>${it.portionName || it.grams + 'g'}</b></span>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Chat Rápido com Nutricionista -->
        <div class="phone-chat-preview">
          <div class="chat-top">
            <i class="fa-regular fa-comment-dots text-emerald"></i>
            <span>Dúvida sobre a dieta? Fale com ${window.APP_DATA.currentNutri.name.split(' ')[0]}</span>
          </div>
          <div class="chat-input-box">
            <input type="text" placeholder="Envie uma mensagem..." class="phone-chat-input" id="phoneChatInput">
            <button class="phone-send-btn" onclick="App.sendPatientChat()"><i class="fa-solid fa-paper-plane"></i></button>
          </div>
        </div>
      </div>
    `;
  },

  addWaterGlass() {
    this.patientWaterCount++;
    this.renderPatientAppSimulator();
    window.showToast("Copo de 250ml registrado com sucesso! 💧", "success");
  },

  sendPatientChat() {
    const input = document.getElementById("phoneChatInput");
    if (!input || !input.value.trim()) return;
    const msg = input.value;
    input.value = "";
    window.showToast(`Mensagem enviada para ${window.APP_DATA.currentNutri.name}: "${msg}"`, "success");
  }
};

// Modais Globais
window.openModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }
};

window.closeModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }
};

// Toast Notifications
window.showToast = function(message, type = "info") {
  let toastContainer = document.getElementById("toastContainer");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "toastContainer";
    toastContainer.className = "toast-container";
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  
  let icon = "fa-circle-info";
  if (type === "success") icon = "fa-circle-check";
  if (type === "warning") icon = "fa-triangle-exclamation";
  if (type === "error") icon = "fa-circle-exclamation";

  toast.innerHTML = `
    <i class="fa-solid ${icon}"></i>
    <span>${message}</span>
  `;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("fade-out");
    setTimeout(() => toast.remove(), 300);
  }, 3500);
};

// Inicialização após o DOM carregar
document.addEventListener("DOMContentLoaded", () => {
  window.App.init();
});
