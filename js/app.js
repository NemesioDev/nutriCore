// NutriCore - Aplicação Principal Integrada ao Banco de Dados Supabase (Tempo Real)
window.App = {
  currentView: "view-diet-builder",
  isLoggedIn: true,
  currentRole: "nutricionista",
  currentUser: null,

  patientsList: [],
  profilesList: [],
  appointmentsList: [],
  recipesList: [],
  currentSimulatorPatientId: null,

  async init() {
    this.setupEventListeners();
    
    // Inicializa o cliente do Supabase
    if (window.DBService) {
      window.DBService.init();
    }

    this.checkAuthState();

    // Carrega dados iniciais do Supabase
    await this.loadAllDatabaseData();

    // Inicia criador de dietas e antropometria
    if (window.DietManager) {
      await window.DietManager.init();
    }
    if (window.AnthroManager) {
      await window.AnthroManager.init();
    }
  },

  async loadAllDatabaseData() {
    await Promise.all([
      this.loadProfilesFromDatabase(),
      this.loadPatientsFromDatabase(),
      this.loadAppointmentsFromDatabase(),
      this.loadRecipesFromDatabase()
    ]);
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

  async login(email, password, role = "nutricionista") {
    this.isLoggedIn = true;
    this.currentRole = role.toLowerCase();

    // Busca perfil correspondente no banco
    if (this.profilesList.length > 0) {
      this.currentUser = this.profilesList.find(p => p.email === email) || this.profilesList[0];
    }

    this.checkAuthState();
    window.showToast(`Autenticado com sucesso no NutriCore!`, "success");
  },

  logout() {
    this.isLoggedIn = false;
    this.checkAuthState();
    window.showToast("Sessão finalizada com sucesso.", "info");
  },

  switchView(viewId) {
    this.currentView = viewId;
    
    document.querySelectorAll(".view-section").forEach(sec => {
      sec.classList.remove("active");
    });

    const target = document.getElementById(viewId);
    if (target) {
      target.classList.add("active");
    }

    document.querySelectorAll(".nav-link").forEach(link => {
      link.classList.remove("active");
      if (link.getAttribute("data-view") === viewId) {
        link.classList.add("active");
      }
    });

    if (viewId === "view-patient-app") {
      this.loadPatientSimulatorData();
    } else if (viewId === "view-recipes") {
      this.generateSmartShoppingList();
    } else if (viewId === "view-dashboard") {
      this.renderDashboard();
    } else if (viewId === "view-users") {
      this.renderProfilesList();
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  },

  setupEventListeners() {
    document.querySelectorAll(".nav-link[data-view]").forEach(link => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const viewId = link.getAttribute("data-view");
        this.switchView(viewId);
      });
    });

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

    const patientSearchInput = document.getElementById("patientSearchInput");
    if (patientSearchInput) {
      patientSearchInput.addEventListener("input", (e) => {
        this.renderPatientsList(e.target.value);
      });
    }

    const userSearchInput = document.getElementById("userSearchInput");
    if (userSearchInput) {
      userSearchInput.addEventListener("input", (e) => {
        this.renderProfilesList(e.target.value);
      });
    }
  },

  // ==========================================
  // USUÁRIOS & NÍVEIS DE ACESSO (SUPABASE)
  // ==========================================
  async loadProfilesFromDatabase() {
    try {
      if (window.DBService) {
        this.profilesList = await window.DBService.getProfiles();
        this.renderProfilesList();
      }
    } catch (err) {
      console.error("Erro ao carregar perfis do Supabase:", err);
    }
  },

  renderProfilesList(query = "") {
    const container = document.getElementById("usersListTableBody");
    if (!container) return;

    const q = (query || "").toLowerCase().trim();
    const filtered = this.profilesList.filter(p => {
      return p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q) || (p.role && p.role.toLowerCase().includes(q));
    });

    if (filtered.length === 0) {
      container.innerHTML = `<tr><td colspan="6" class="text-center" style="padding: 2rem;">Nenhum usuário encontrado.</td></tr>`;
      return;
    }

    container.innerHTML = filtered.map(p => {
      let roleBadgeClass = "badge-cal";
      let roleLabel = "Nutricionista";
      if (p.role === "admin") {
        roleBadgeClass = "badge-f";
        roleLabel = "Administrador";
      } else if (p.role === "recepcionista") {
        roleBadgeClass = "badge-c";
        roleLabel = "Recepcionista";
      } else if (p.role === "paciente") {
        roleBadgeClass = "badge-p";
        roleLabel = "Paciente";
      }

      return `
        <tr>
          <td>
            <div style="display: flex; align-items: center; gap: 10px;">
              <img src="${p.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover;">
              <div>
                <strong>${p.name}</strong>
                <span style="display: block; font-size: 0.775rem; color: var(--cold-neutral-600);">${p.title || p.clinic || ''}</span>
              </div>
            </div>
          </td>
          <td>${p.email}</td>
          <td>
            <span class="badge ${roleBadgeClass}">${roleLabel}</span>
          </td>
          <td>${p.crn || p.phone || '-'}</td>
          <td><span class="text-muted" style="font-size: 0.8rem;">${new Date(p.created_at).toLocaleDateString('pt-BR')}</span></td>
          <td>
            <div style="display: flex; gap: 6px;">
              <select class="db-input-field" style="width: auto; padding: 4px 8px; font-size: 0.775rem;" onchange="App.changeUserRole('${p.id}', this.value)">
                <option value="nutricionista" ${p.role === 'nutricionista' ? 'selected' : ''}>Nutricionista</option>
                <option value="admin" ${p.role === 'admin' ? 'selected' : ''}>Admin</option>
                <option value="recepcionista" ${p.role === 'recepcionista' ? 'selected' : ''}>Recepcionista</option>
                <option value="paciente" ${p.role === 'paciente' ? 'selected' : ''}>Paciente</option>
              </select>
              <button class="icon-btn-danger" onclick="App.deleteUser('${p.id}', '${p.name}')" title="Excluir Usuário">
                <i class="fa-regular fa-trash-can"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  openNewUserModal() {
    window.openModal("newUserModal");
  },

  async saveNewUser(e) {
    e.preventDefault();
    const form = e.target;
    const name = form.userName.value;
    const email = form.userEmail.value;
    const role = form.userRole.value;
    const title = form.userTitle.value;
    const crn = form.userCrn.value;
    const phone = form.userPhone.value;
    const clinic = form.userClinic.value;

    try {
      const newProfile = {
        name: name,
        email: email,
        role: role,
        title: title || (role === "nutricionista" ? "Nutricionista Clínica" : "Membro da Equipe"),
        crn: crn || "",
        phone: phone || "",
        clinic: clinic || "Clínica Vida & Nutrição",
        avatar_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80"
      };

      await window.DBService.createProfile(newProfile);
      await this.loadProfilesFromDatabase();
      window.closeModal("newUserModal");
      window.showToast(`Usuário ${name} cadastrado com nível ${role.toUpperCase()} no Supabase!`, "success");
      form.reset();
    } catch (err) {
      console.error("Erro ao cadastrar usuário:", err);
      window.showToast("Erro ao gravar usuário no banco de dados.", "error");
    }
  },

  async changeUserRole(profileId, newRole) {
    try {
      await window.DBService.updateProfileRole(profileId, newRole);
      await this.loadProfilesFromDatabase();
      window.showToast(`Nível de acesso alterado para ${newRole.toUpperCase()} no Supabase!`, "success");
    } catch (err) {
      console.error("Erro ao atualizar nível de acesso:", err);
      window.showToast("Erro ao alterar nível no banco.", "error");
    }
  },

  async deleteUser(profileId, userName) {
    if (confirm(`Deseja realmente remover o usuário ${userName} do banco de dados?`)) {
      try {
        await window.DBService.deleteProfile(profileId);
        await this.loadProfilesFromDatabase();
        window.showToast("Usuário removido do banco com sucesso.", "info");
      } catch (err) {
        console.error("Erro ao excluir usuário:", err);
        window.showToast("Erro ao excluir usuário do banco.", "error");
      }
    }
  },

  // ==========================================
  // PACIENTES (SUPABASE)
  // ==========================================
  async loadPatientsFromDatabase() {
    try {
      if (window.DBService) {
        this.patientsList = await window.DBService.getPatients();
        this.renderPatientsList();
        this.renderDashboard();
      }
    } catch (err) {
      console.error("Erro ao carregar pacientes do Supabase:", err);
    }
  },

  renderPatientsList(query = "") {
    const container = document.getElementById("patientsListGrid");
    if (!container) return;

    const q = (query || "").toLowerCase().trim();
    const filtered = this.patientsList.filter(p => {
      return p.name.toLowerCase().includes(q) || (p.email && p.email.toLowerCase().includes(q));
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
            <img src="${p.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}" class="patient-avatar-lg" alt="${p.name}">
            <div class="patient-card-title">
              <h3>${p.name}</h3>
              <span class="patient-email"><i class="fa-regular fa-envelope"></i> ${p.email || 'Sem e-mail'}</span>
              <span class="patient-phone"><i class="fa-brands fa-whatsapp text-emerald"></i> ${p.phone || 'Sem telefone'}</span>
            </div>
            <span class="badge ${p.status === 'Ativo' ? 'badge-p' : 'badge-cal'}">${p.status}</span>
          </div>

          <div class="patient-meta-grid">
            <div class="patient-meta-item">
              <span class="p-meta-label">Idade</span>
              <span class="p-meta-val">${p.age || '-'} anos</span>
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
              <span class="p-meta-val">${p.objective || 'Em Acompanhamento'}</span>
            </div>
          </div>

          <div class="patient-notes-snippet">
            <i class="fa-regular fa-clipboard"></i> <span>${p.notes || 'Sem observações registradas.'}</span>
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

  async saveNewPatient(e) {
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

    try {
      const newPatientData = {
        name: name,
        email: email,
        phone: phone,
        age: age,
        gender: gender,
        weight: weight,
        height: height,
        objective: objective,
        activity_level: activityLevel,
        status: "Ativo",
        avatar_url: gender === "F" 
          ? "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80"
          : "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
        notes: "Paciente cadastrado no sistema NutriCore via Supabase."
      };

      const created = await window.DBService.createPatient(newPatientData);

      // Cria a medição inicial
      await window.DBService.createMeasurement({
        patient_id: created.id,
        date: new Date().toISOString().split("T")[0],
        weight: weight,
        body_fat: gender === "F" ? 26.0 : 18.0,
        waist: 75.0,
        hip: 100.0,
        arm: 30.0,
        notes: "Avaliação inicial de cadastro"
      });

      await this.loadPatientsFromDatabase();
      window.closeModal("newPatientModal");
      window.showToast(`Paciente ${name} gravado no banco de dados Supabase!`, "success");
      form.reset();

      if (confirm(`Deseja criar um plano alimentar para ${name} agora no Supabase?`)) {
        await this.openPatientDiet(created.id);
      }
    } catch (err) {
      console.error("Erro ao salvar paciente no banco:", err);
      window.showToast("Erro ao gravar paciente no Supabase.", "error");
    }
  },

  async openPatientDiet(patientId) {
    const patient = this.patientsList.find(p => p.id === patientId);
    if (!patient) return;

    const existingPlan = (window.DietManager.allDiets || []).find(d => d.patient_id === patientId);

    if (existingPlan) {
      await window.DietManager.setDiet(existingPlan.id);
    } else {
      try {
        const newDiet = {
          patient_id: patient.id,
          title: `Plano Alimentar - ${patient.name}`,
          target_calories: 2000,
          target_carbs: 220,
          target_protein: 140,
          target_fats: 60,
          water_target_ml: 2800,
          notes: "Plano individualizado focado nas metas do paciente.",
          is_active: true
        };

        const createdPlan = await window.DBService.createDietPlan(newDiet);

        // Adiciona 2 refeições padrão
        const m1 = await window.DBService.createDietMeal({
          diet_id: createdPlan.id,
          name: "Café da Manhã",
          time: "07:30",
          icon: "fa-coffee",
          order_index: 1
        });

        await window.DBService.createDietMealItem({
          meal_id: m1.id,
          food_id: "ovo_cozido",
          food_name: "Ovo de Galinha Cozido Inteiro",
          grams: 100,
          portion_name: "2 unidades (100g)",
          calories: 143,
          carbs: 0.8,
          protein: 13.0,
          fats: 9.5,
          fiber: 0
        });

        await window.DietManager.loadDietPlans(createdPlan.id);
      } catch (err) {
        console.error("Erro ao criar plano:", err);
      }
    }

    this.switchView("view-diet-builder");
  },

  // ==========================================
  // CONSULTAS (SUPABASE)
  // ==========================================
  async loadAppointmentsFromDatabase() {
    try {
      if (window.DBService) {
        this.appointmentsList = await window.DBService.getAppointments();
        this.renderAppointments();
        this.renderDashboard();
      }
    } catch (err) {
      console.error("Erro ao carregar consultas:", err);
    }
  },

  renderAppointments() {
    const container = document.getElementById("appointmentsListGrid");
    if (!container) return;

    if (this.appointmentsList.length === 0) {
      container.innerHTML = `<div class="empty-state"><p>Nenhuma consulta agendada no banco.</p></div>`;
      return;
    }

    container.innerHTML = this.appointmentsList.map(a => {
      const patient = a.patients || { name: "Paciente" };
      const dateFormatted = new Date(a.appointment_date).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

      return `
        <div class="appointment-card">
          <div class="app-card-time">
            <i class="fa-regular fa-clock text-emerald"></i>
            <span>${dateFormatted}</span>
          </div>
          <div class="app-card-body">
            <h3>${patient.name}</h3>
            <p class="app-type"><i class="fa-solid fa-video text-blue"></i> ${a.type}</p>
            <p class="app-obj">Objetivo: <b>${a.objective || 'Consulta Nutricional'}</b></p>
          </div>
          <div class="app-card-actions">
            <select class="db-input-field" style="width: auto; padding: 4px 8px; font-size: 0.8rem;" onchange="App.updateAppointmentStatus('${a.id}', this.value)">
              <option value="Agendado" ${a.status === 'Agendado' ? 'selected' : ''}>Agendado</option>
              <option value="Confirmado" ${a.status === 'Confirmado' ? 'selected' : ''}>Confirmado</option>
              <option value="Realizado" ${a.status === 'Realizado' ? 'selected' : ''}>Realizado</option>
              <option value="Cancelado" ${a.status === 'Cancelado' ? 'selected' : ''}>Cancelado</option>
            </select>
            <button class="db-btn db-btn--outline db-btn--sm" onclick="window.showToast('Link de telemedicina copiado!', 'success')">
              <i class="fa-solid fa-link"></i> Link Vídeo
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  async updateAppointmentStatus(appId, newStatus) {
    try {
      await window.DBService.updateAppointmentStatus(appId, newStatus);
      await this.loadAppointmentsFromDatabase();
      window.showToast(`Status atualizado para "${newStatus}" no banco!`, "success");
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
    }
  },

  openNewAppointmentModal() {
    const modalSelect = document.getElementById("appPatientSelect");
    if (modalSelect) {
      modalSelect.innerHTML = this.patientsList.map(p => `
        <option value="${p.id}">${p.name}</option>
      `).join('');
    }
    window.openModal("newAppModal");
  },

  async saveNewAppointment(e) {
    e.preventDefault();
    const form = e.target;
    const patientId = form.appPatientSelect.value;
    const date = form.appDate.value;
    const time = form.appTime.value;
    const type = form.appType.value;
    const obj = form.appObjective.value;

    try {
      const newAppData = {
        patient_id: patientId,
        appointment_date: `${date}T${time}:00`,
        type: type,
        status: "Agendado",
        objective: obj,
        meeting_link: "https://meet.nutricore.com.br/consulta-" + Date.now()
      };

      await window.DBService.createAppointment(newAppData);
      await this.loadAppointmentsFromDatabase();
      window.closeModal("newAppModal");
      window.showToast("Consulta gravada no Supabase!", "success");
      form.reset();
    } catch (err) {
      console.error("Erro ao agendar consulta:", err);
      window.showToast("Erro ao agendar consulta no banco.", "error");
    }
  },

  // ==========================================
  // RECEITAS (SUPABASE)
  // ==========================================
  async loadRecipesFromDatabase() {
    try {
      if (window.DBService) {
        this.recipesList = await window.DBService.getRecipes();
        this.renderRecipes();
      }
    } catch (err) {
      console.error("Erro ao carregar receitas:", err);
    }
  },

  renderRecipes() {
    const container = document.getElementById("recipesGrid");
    if (!container) return;

    if (this.recipesList.length === 0) {
      container.innerHTML = `<p class="empty-state">Nenhuma receita encontrada no banco.</p>`;
      return;
    }

    container.innerHTML = this.recipesList.map(r => {
      const ings = Array.isArray(r.ingredients) ? r.ingredients : [];
      return `
        <div class="recipe-card">
          <div class="recipe-card-header">
            <span class="recipe-badge"><i class="fa-regular fa-clock"></i> ${r.prep_time || '15 min'}</span>
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
              ${ings.map(ing => `<li>${ing}</li>`).join('')}
            </ul>
          </div>
          <div class="recipe-instructions">
            <strong>Modo de preparo:</strong>
            <p>${r.instructions || ''}</p>
          </div>
        </div>
      `;
    }).join('');
  },

  generateSmartShoppingList() {
    const container = document.getElementById("shoppingListContent");
    if (!container) return;

    const currentDiet = window.DietManager.currentDiet;
    if (!currentDiet) {
      container.innerHTML = `<p class="empty-state">Nenhum plano alimentar selecionado.</p>`;
      return;
    }

    const meals = currentDiet.diet_meals || currentDiet.meals || [];
    const foodMap = {};
    meals.forEach(m => {
      const items = m.diet_meal_items || m.items || [];
      items.forEach(item => {
        const fId = item.food_id || item.foodId;
        if (!foodMap[fId]) {
          foodMap[fId] = 0;
        }
        foodMap[fId] += parseFloat(item.grams) || 100;
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
        weeklyWeight: displayWeight
      };
    });

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
          <p class="text-muted">Calculada com base nos ingredientes do plano: <b>${currentDiet.title}</b></p>
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

  // ==========================================
  // DASHBOARD
  // ==========================================
  renderDashboard() {
    const statPatients = document.getElementById("statTotalPatients");
    if (statPatients) statPatients.innerText = this.patientsList.length;

    const statDiets = document.getElementById("statTotalDiets");
    if (statDiets) statDiets.innerText = (window.DietManager.allDiets || []).length;

    const statApp = document.getElementById("statAppointments");
    if (statApp) statApp.innerText = this.appointmentsList.length;

    const statUsers = document.getElementById("statTotalUsers");
    if (statUsers) statUsers.innerText = this.profilesList.length;

    const nextAppList = document.getElementById("dashNextAppointments");
    if (nextAppList) {
      if (this.appointmentsList.length === 0) {
        nextAppList.innerHTML = `<p class="empty-state">Nenhum atendimento para hoje.</p>`;
      } else {
        nextAppList.innerHTML = this.appointmentsList.slice(0, 3).map(a => {
          const patient = a.patients || { name: "Paciente" };
          const dateFormatted = new Date(a.appointment_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
          return `
            <div class="dash-item-row">
              <div class="dash-item-avatar">
                <i class="fa-solid fa-calendar-check text-emerald"></i>
              </div>
              <div class="dash-item-info">
                <strong>${patient.name}</strong>
                <span>${a.type} • <b>${dateFormatted}</b></span>
              </div>
              <span class="badge ${a.status === 'Confirmado' ? 'badge-p' : 'badge-cal'}">${a.status}</span>
            </div>
          `;
        }).join('');
      }
    }

    const recentPatientsList = document.getElementById("dashRecentPatients");
    if (recentPatientsList) {
      recentPatientsList.innerHTML = this.patientsList.slice(0, 3).map(p => `
        <div class="dash-item-row">
          <img src="${p.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}" class="dash-patient-avatar" alt="${p.name}">
          <div class="dash-item-info">
            <strong>${p.name}</strong>
            <span>${p.objective || 'Acompanhamento'} • ${p.weight} kg</span>
          </div>
          <button class="db-btn db-btn--outline db-btn--sm" onclick="App.openPatientDiet('${p.id}')">
            Abrir Plano
          </button>
        </div>
      `).join('');
    }
  },

  // ==========================================
  // SIMULADOR DO APP DO PACIENTE (TEMPO REAL)
  // ==========================================
  async loadPatientSimulatorData() {
    const currentDiet = window.DietManager.currentDiet || (window.DietManager.allDiets && window.DietManager.allDiets[0]);
    if (!currentDiet) return;

    const patient = currentDiet.patients || (this.patientsList.length > 0 ? this.patientsList[0] : null);
    if (!patient) return;

    this.currentSimulatorPatientId = patient.id;

    // Busca água do dia no Supabase
    let waterMl = 0;
    try {
      waterMl = await window.DBService.getTodayWater(patient.id);
    } catch (e) {}

    // Busca mensagens de chat no Supabase
    let messages = [];
    try {
      messages = await window.DBService.getChatMessages(patient.id);
    } catch (e) {}

    this.renderPatientAppSimulator(currentDiet, patient, waterMl, messages);
  },

  renderPatientAppSimulator(diet, patient, waterMl, messages) {
    const screen = document.getElementById("phoneScreenContent");
    if (!screen) return;

    const waterTarget = diet.water_target_ml || diet.waterTargetMl || 2500;
    const waterPct = Math.min(100, Math.round((waterMl / waterTarget) * 100));
    const meals = diet.diet_meals || diet.meals || [];

    screen.innerHTML = `
      <div class="phone-app-inner">
        <!-- App Header -->
        <div class="phone-header">
          <div class="phone-header-user">
            <img src="${patient.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}" class="phone-user-avatar" alt="${patient.name}">
            <div>
              <span class="phone-greeting">Olá, ${patient.name.split(' ')[0]} 👋</span>
              <span class="phone-sub">${patient.objective || 'Metas NutriCore'}</span>
            </div>
          </div>
          <div class="phone-header-nutri">
            <span class="nutri-badge"><i class="fa-solid fa-cloud-bolt text-emerald"></i> Supabase</span>
          </div>
        </div>

        <!-- Meta de Água Interativa -->
        <div class="phone-water-card">
          <div class="water-card-top">
            <div class="water-info">
              <span class="water-title"><i class="fa-solid fa-glass-water text-cyan"></i> Hidratação Gravada no Banco</span>
              <span class="water-counter"><b>${(waterMl / 1000).toFixed(2)}L</b> de ${(waterTarget/1000).toFixed(1)}L (${waterPct}%)</span>
            </div>
            <button class="water-add-btn" onclick="App.addWaterGlass('${patient.id}')">
              <i class="fa-solid fa-plus"></i> +250ml
            </button>
          </div>
          <div class="db-progress-bar" style="margin-top: 8px;">
            <div class="db-progress-fill bg-cyan" style="width: ${waterPct}%"></div>
          </div>
        </div>

        <!-- Refeições de Hoje -->
        <div class="phone-section-title">
          <span>Refeições Ativas no Supabase</span>
          <span class="phone-date">${new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
        </div>

        <div class="phone-meals-list">
          ${meals.map((m) => {
            const mTotals = window.DietManager.getMealTotals(m);
            const items = m.diet_meal_items || m.items || [];
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
                  ${items.map(it => `
                    <div class="phone-food-pill">
                      <i class="fa-regular fa-circle-check text-emerald"></i>
                      <span>${it.food_name || it.name} - <b>${it.portion_name || it.grams + 'g'}</b></span>
                    </div>
                  `).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Chat em Tempo Real -->
        <div class="phone-chat-preview">
          <div class="chat-top">
            <i class="fa-solid fa-comments text-emerald"></i>
            <span>Chat Direto no Banco de Dados:</span>
          </div>
          <div id="phoneChatMessagesContainer" style="max-height: 120px; overflow-y: auto; margin-bottom: 8px; font-size: 0.775rem;">
            ${messages.map(msg => `
              <div style="margin-bottom: 4px; padding: 4px 6px; border-radius: 4px; background: ${msg.sender_role === 'paciente' ? '#e0f2fe' : '#f0fdf4'}; text-align: ${msg.sender_role === 'paciente' ? 'right' : 'left'};">
                <span style="font-size: 0.65rem; color: #64748b; display: block;">${msg.sender_role === 'paciente' ? 'Você' : 'Nutricionista'}</span>
                <span>${msg.message}</span>
              </div>
            `).join('')}
          </div>
          <div class="chat-input-box">
            <input type="text" placeholder="Envie uma mensagem em tempo real..." class="phone-chat-input" id="phoneChatInput" onkeydown="if(event.key==='Enter') App.sendPatientChat('${patient.id}')">
            <button class="phone-send-btn" onclick="App.sendPatientChat('${patient.id}')"><i class="fa-solid fa-paper-plane"></i></button>
          </div>
        </div>
      </div>
    `;
  },

  async addWaterGlass(patientId) {
    try {
      const newTotal = await window.DBService.addWaterGlasses(patientId, 250);
      await this.loadPatientSimulatorData();
      window.showToast(`+250ml gravado no Supabase! Total: ${(newTotal/1000).toFixed(2)}L 💧`, "success");
    } catch (err) {
      console.error("Erro ao registrar água:", err);
    }
  },

  async sendPatientChat(patientId) {
    const input = document.getElementById("phoneChatInput");
    if (!input || !input.value.trim()) return;
    const msg = input.value.trim();
    input.value = "";

    try {
      await window.DBService.sendChatMessage(patientId, null, "paciente", msg);
      await this.loadPatientSimulatorData();
      window.showToast("Mensagem gravada no banco de dados!", "success");
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);
    }
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
