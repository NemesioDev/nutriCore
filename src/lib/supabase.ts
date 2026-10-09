import { createClient } from '@supabase/supabase-js';
import type { Profile, Patient, DietPlan, Measurement, Appointment, Recipe, ChatMessage } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://grwxiknuwniemwvdeybc.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdyd3hpa251d25pZW13dmRleWJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1NTIyMTksImV4cCI6MjEwNzEyODIxOX0.QkabsUJBWzJMKR2hD3YFg4P8unxQM6t6EOp09stcXyE";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const dbService = {
  // Profiles / Níveis de Usuário
  async getProfiles(): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async createProfile(profile: Partial<Profile>): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .insert([profile])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateProfileRole(id: string, role: string): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteProfile(id: string): Promise<boolean> {
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  // Pacientes
  async getPatients(): Promise<Patient[]> {
    const { data, error } = await supabase
      .from('patients')
      .select(`
        *,
        measurements (*),
        diet_plans (*)
      `)
      .order('name', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async createPatient(patient: Partial<Patient>): Promise<Patient> {
    const { data, error } = await supabase
      .from('patients')
      .insert([patient])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updatePatient(id: string, updates: Partial<Patient>): Promise<Patient> {
    const { data, error } = await supabase
      .from('patients')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Medições Antropométricas
  async getMeasurements(patientId: string): Promise<Measurement[]> {
    const { data, error } = await supabase
      .from('measurements')
      .select('*')
      .eq('patient_id', patientId)
      .order('date', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async createMeasurement(measurement: Partial<Measurement>): Promise<Measurement> {
    const { data, error } = await supabase
      .from('measurements')
      .insert([measurement])
      .select()
      .single();
    if (error) throw error;

    if (measurement.weight && measurement.patient_id) {
      await supabase
        .from('patients')
        .update({ weight: measurement.weight, updated_at: new Date().toISOString() })
        .eq('id', measurement.patient_id);
    }
    return data;
  },

  // Planos de Dieta
  async getDietPlans(): Promise<DietPlan[]> {
    const { data, error } = await supabase
      .from('diet_plans')
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
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async createDietPlan(plan: Partial<DietPlan>): Promise<DietPlan> {
    const { data, error } = await supabase
      .from('diet_plans')
      .insert([plan])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async createDietMeal(meal: { diet_id: string; name: string; time: string; icon?: string; order_index?: number }) {
    const { data, error } = await supabase
      .from('diet_meals')
      .insert([meal])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteDietMeal(mealId: string) {
    const { error } = await supabase.from('diet_meals').delete().eq('id', mealId);
    if (error) throw error;
    return true;
  },

  async createDietMealItem(item: any) {
    const { data, error } = await supabase
      .from('diet_meal_items')
      .insert([item])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateDietMealItem(itemId: string, updates: any) {
    const { data, error } = await supabase
      .from('diet_meal_items')
      .update(updates)
      .eq('id', itemId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteDietMealItem(itemId: string) {
    const { error } = await supabase.from('diet_meal_items').delete().eq('id', itemId);
    if (error) throw error;
    return true;
  },

  async updateDietNotes(dietId: string, notes: string) {
    const { data, error } = await supabase
      .from('diet_plans')
      .update({ notes, updated_at: new Date().toISOString() })
      .eq('id', dietId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Consultas
  async getAppointments(): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        patients (id, name, avatar_url, phone)
      `)
      .order('appointment_date', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async createAppointment(appointment: Partial<Appointment>): Promise<Appointment> {
    const { data, error } = await supabase
      .from('appointments')
      .insert([appointment])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateAppointmentStatus(id: string, status: string): Promise<Appointment> {
    const { data, error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Receitas
  async getRecipes(): Promise<Recipe[]> {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  // Hidratação
  async getTodayWater(patientId: string): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('patient_daily_logs')
      .select('water_ml')
      .eq('patient_id', patientId)
      .eq('date', today)
      .maybeSingle();

    if (error) return 0;
    return data ? data.water_ml : 0;
  },

  async addWater(patientId: string, addMl = 250): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    const current = await this.getTodayWater(patientId);
    const newTotal = current + addMl;

    const { error } = await supabase
      .from('patient_daily_logs')
      .upsert({
        patient_id: patientId,
        date: today,
        water_ml: newTotal,
        notes: `${Math.round(newTotal / 250)} copos consumidos`
      }, { onConflict: 'patient_id,date' });

    if (error) throw error;
    return newTotal;
  },

  // Chat
  async getChatMessages(patientId: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async sendChatMessage(patientId: string, senderRole: 'nutricionista' | 'paciente', message: string): Promise<ChatMessage> {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert([{
        patient_id: patientId,
        sender_role: senderRole,
        message
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};
