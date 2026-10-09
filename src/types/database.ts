// Tipos TypeScript para o Banco de Dados NutriCore (Supabase)

export type UserRole = 'admin' | 'nutricionista' | 'paciente' | 'recepcionista';

export interface Profile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  title?: string;
  crn?: string;
  clinic?: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
  updated_at?: string;
}

export interface Patient {
  id: string;
  nutritionist_id?: string;
  name: string;
  email?: string;
  phone?: string;
  age?: number;
  gender?: 'M' | 'F';
  weight: number;
  height: number;
  objective?: string;
  activity_level?: 'sedentario' | 'leve' | 'moderado' | 'intenso' | 'atleta';
  status?: string;
  avatar_url?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
  measurements?: Measurement[];
  diet_plans?: DietPlan[];
}

export interface Measurement {
  id: string;
  patient_id: string;
  date: string;
  weight: number;
  body_fat?: number;
  waist?: number;
  hip?: number;
  arm?: number;
  notes?: string;
  created_at: string;
}

export interface DietMealItem {
  id: string;
  meal_id: string;
  food_id: string;
  food_name: string;
  grams: number;
  portion_name?: string;
  calories: number;
  carbs: number;
  protein: number;
  fats: number;
  fiber: number;
  order_index?: number;
  created_at?: string;
}

export interface DietMeal {
  id: string;
  diet_id: string;
  name: string;
  time: string;
  icon?: string;
  order_index?: number;
  created_at?: string;
  diet_meal_items?: DietMealItem[];
}

export interface DietPlan {
  id: string;
  patient_id: string;
  nutritionist_id?: string;
  title: string;
  target_calories: number;
  target_carbs: number;
  target_protein: number;
  target_fats: number;
  water_target_ml: number;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  patients?: Patient;
  diet_meals?: DietMeal[];
}

export interface Appointment {
  id: string;
  patient_id: string;
  nutritionist_id?: string;
  appointment_date: string;
  type: string;
  status: 'Agendado' | 'Confirmado' | 'Realizado' | 'Cancelado';
  objective?: string;
  meeting_link?: string;
  created_at: string;
  patients?: Patient;
}

export interface Recipe {
  id: string;
  name: string;
  prep_time?: string;
  calories: number;
  carbs: number;
  protein: number;
  fats: number;
  ingredients: string[];
  instructions?: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  patient_id: string;
  nutritionist_id?: string;
  sender_role: 'nutricionista' | 'paciente';
  message: string;
  is_read?: boolean;
  created_at: string;
}

export interface TacoFood {
  id: string;
  name: string;
  category: string;
  calories: number;
  carbs: number;
  protein: number;
  fats: number;
  fiber: number;
  standardPortion: string;
  standardGrams: number;
  substitutes: string[];
}
