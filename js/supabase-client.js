// NutriCore - Cliente Oficial do Banco de Dados Supabase (Tempo Real)
const SUPABASE_URL = "https://grwxiknuwniemwvdeybc.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdyd3hpa251d25pZW13dmRleWJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1NTIyMTksImV4cCI6MjEwNzEyODIxOX0.QkabsUJBWzJMKR2hD3YFg4P8unxQM6t6EOp09stcXyE";

// Inicializa o cliente do Supabase
window.db = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

window.DBService = {
  client: window.db,

  init() {
    if (!window.supabase) {
      console.error("Supabase SDK não carregado!");
      return false;
    }
    this.client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    window.db = this.client;
    this.setupRealtimeListeners();
    return true;
  },

  // ==========================================
  // 1. USUÁRIOS E NÍVEIS DE ACESSO (PROFILES)
  // ==========================================
  async getProfiles() {
    const { data, error } = await this.client
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async createProfile(profileData) {
    const { data, error } = await this.client
      .from("profiles")
      .insert([profileData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateProfileRole(id, newRole) {
    const { data, error } = await this.client
      .from("profiles")
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteProfile(id) {
    const { error } = await this.client
      .from("profiles")
      .delete()
      .eq("id", id);
    if (error) throw error;
    return true;
  },

  // ==========================================
  // 2. PACIENTES
  // ==========================================
  async getPatients() {
    const { data, error } = await this.client
      .from("patients")
      .select(`
        *,
        measurements (*),
        diet_plans (*)
      `)
      .order("name", { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async createPatient(patientData) {
    const { data, error } = await this.client
      .from("patients")
      .insert([patientData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updatePatient(id, updates) {
    const { data, error } = await this.client
      .from("patients")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deletePatient(id) {
    const { error } = await this.client
      .from("patients")
      .delete()
      .eq("id", id);
    if (error) throw error;
    return true;
  },

  // ==========================================
  // 3. MEDIÇÕES ANTROPOMÉTRICAS
  // ==========================================
  async getMeasurements(patientId) {
    const { data, error } = await this.client
      .from("measurements")
      .select("*")
      .eq("patient_id", patientId)
      .order("date", { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async createMeasurement(measurementData) {
    const { data, error } = await this.client
      .from("measurements")
      .insert([measurementData])
      .select()
      .single();
    if (error) throw error;

    // Atualiza o peso atual no paciente
    if (measurementData.weight && measurementData.patient_id) {
      await this.client
        .from("patients")
        .update({ weight: measurementData.weight, updated_at: new Date().toISOString() })
        .eq("id", measurementData.patient_id);
    }

    return data;
  },

  // ==========================================
  // 4. PLANOS DE DIETA, REFEIÇÕES E ITENS
  // ==========================================
  async getDietPlans() {
    const { data, error } = await this.client
      .from("diet_plans")
      .select(`
        *,
        patients (id, name, age, weight, objective, avatar_url, phone),
        diet_meals (
          id, name, time, icon, order_index,
          diet_meal_items (
            id, food_id, food_name, grams, portion_name, calories, carbs, protein, fats, fiber, order_index
          )
        )
      `)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getDietPlanDetails(dietId) {
    const { data, error } = await this.client
      .from("diet_plans")
      .select(`
        *,
        patients (id, name, age, weight, objective, avatar_url, phone),
        diet_meals (
          id, name, time, icon, order_index,
          diet_meal_items (
            id, food_id, food_name, grams, portion_name, calories, carbs, protein, fats, fiber, order_index
          )
        )
      `)
      .eq("id", dietId)
      .single();
    if (error) throw error;
    return data;
  },

  async createDietPlan(planData) {
    const { data, error } = await this.client
      .from("diet_plans")
      .insert([planData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async createDietMeal(mealData) {
    const { data, error } = await this.client
      .from("diet_meals")
      .insert([mealData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteDietMeal(mealId) {
    const { error } = await this.client
      .from("diet_meals")
      .delete()
      .eq("id", mealId);
    if (error) throw error;
    return true;
  },

  async createDietMealItem(itemData) {
    const { data, error } = await this.client
      .from("diet_meal_items")
      .insert([itemData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateDietMealItem(itemId, updates) {
    const { data, error } = await this.client
      .from("diet_meal_items")
      .update(updates)
      .eq("id", itemId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteDietMealItem(itemId) {
    const { error } = await this.client
      .from("diet_meal_items")
      .delete()
      .eq("id", itemId);
    if (error) throw error;
    return true;
  },

  async updateDietNotes(dietId, notes) {
    const { data, error } = await this.client
      .from("diet_plans")
      .update({ notes: notes, updated_at: new Date().toISOString() })
      .eq("id", dietId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // ==========================================
  // 5. CONSULTAS / ATENDIMENTOS
  // ==========================================
  async getAppointments() {
    const { data, error } = await this.client
      .from("appointments")
      .select(`
        *,
        patients (id, name, avatar_url, phone)
      `)
      .order("appointment_date", { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async createAppointment(appData) {
    const { data, error } = await this.client
      .from("appointments")
      .insert([appData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateAppointmentStatus(id, newStatus) {
    const { data, error } = await this.client
      .from("appointments")
      .update({ status: newStatus })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // ==========================================
  // 6. RECEITAS
  // ==========================================
  async getRecipes() {
    const { data, error } = await this.client
      .from("recipes")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  },

  // ==========================================
  // 7. HIDRATAÇÃO DIÁRIA DO PACIENTE
  // ==========================================
  async getTodayWater(patientId) {
    const today = new Date().toISOString().split("T")[0];
    const { data, error } = await this.client
      .from("patient_daily_logs")
      .select("water_ml")
      .eq("patient_id", patientId)
      .eq("date", today)
      .maybeSingle();

    if (error) throw error;
    return data ? data.water_ml : 0;
  },

  async addWaterGlasses(patientId, addMl = 250) {
    const today = new Date().toISOString().split("T")[0];
    const current = await this.getTodayWater(patientId);
    const newTotal = current + addMl;

    const { data, error } = await this.client
      .from("patient_daily_logs")
      .upsert({
        patient_id: patientId,
        date: today,
        water_ml: newTotal,
        notes: `${Math.round(newTotal / 250)} copos consumidos`
      }, { onConflict: "patient_id,date" })
      .select()
      .single();

    if (error) throw error;
    return newTotal;
  },

  // ==========================================
  // 8. CHAT EM TEMPO REAL
  // ==========================================
  async getChatMessages(patientId) {
    const { data, error } = await this.client
      .from("chat_messages")
      .select("*")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async sendChatMessage(patientId, nutritionistId, senderRole, message) {
    const { data, error } = await this.client
      .from("chat_messages")
      .insert([{
        patient_id: patientId,
        nutritionist_id: nutritionistId || null,
        sender_role: senderRole,
        message: message
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // ==========================================
  // 9. ESCUTA DE EVENTOS EM TEMPO REAL (REALTIME)
  // ==========================================
  setupRealtimeListeners() {
    console.log("Conectando canais em tempo real do Supabase...");

    const channel = this.client.channel("nutricore-realtime-channel");

    channel
      .on("postgres_changes", { event: "*", schema: "public", table: "patients" }, (payload) => {
        console.log("Realtime: Paciente alterado", payload);
        if (window.App && typeof window.App.loadFromDatabase === "function") {
          window.App.loadPatientsFromDatabase();
        }
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "diet_plans" }, (payload) => {
        console.log("Realtime: Plano alimentar alterado", payload);
        if (window.DietManager && typeof window.DietManager.loadDietPlans === "function") {
          window.DietManager.loadDietPlans();
        }
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "diet_meals" }, (payload) => {
        console.log("Realtime: Refeição alterada", payload);
        if (window.DietManager && window.DietManager.currentDiet) {
          window.DietManager.reloadCurrentDiet();
        }
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "diet_meal_items" }, (payload) => {
        console.log("Realtime: Item de refeição alterado", payload);
        if (window.DietManager && window.DietManager.currentDiet) {
          window.DietManager.reloadCurrentDiet();
        }
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "measurements" }, (payload) => {
        console.log("Realtime: Medição alterada", payload);
        if (window.AnthroManager && typeof window.AnthroManager.loadPatientMeasurements === "function") {
          window.AnthroManager.loadPatientMeasurements(window.AnthroManager.currentPatientId);
        }
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "appointments" }, (payload) => {
        console.log("Realtime: Consulta alterada", payload);
        if (window.App && typeof window.App.loadAppointmentsFromDatabase === "function") {
          window.App.loadAppointmentsFromDatabase();
        }
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "patient_daily_logs" }, (payload) => {
        console.log("Realtime: Hidratação alterada", payload);
        if (window.App && typeof window.App.loadPatientSimulatorData === "function") {
          window.App.loadPatientSimulatorData();
        }
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_messages" }, (payload) => {
        console.log("Realtime: Nova mensagem de chat", payload);
        if (window.App && typeof window.App.loadChatMessages === "function") {
          window.App.loadChatMessages();
        }
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, (payload) => {
        console.log("Realtime: Usuário alterado", payload);
        if (window.App && typeof window.App.loadProfilesFromDatabase === "function") {
          window.App.loadProfilesFromDatabase();
        }
      })
      .subscribe((status) => {
        console.log("Status da assinatura Realtime Supabase:", status);
        const indicator = document.getElementById("dbRealtimeStatus");
        if (indicator) {
          if (status === "SUBSCRIBED") {
            indicator.innerHTML = '<span class="pulse-dot online"></span> Conectado ao Supabase (Tempo Real Ativo)';
            indicator.className = "realtime-badge online";
          } else {
            indicator.innerHTML = '<span class="pulse-dot connecting"></span> Conectando ao Banco...';
            indicator.className = "realtime-badge connecting";
          }
        }
      });
  }
};
