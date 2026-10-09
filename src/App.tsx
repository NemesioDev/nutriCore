import { useState, useEffect, useCallback } from 'react';
import type { Profile, Patient, DietPlan, Appointment, Recipe, UserRole } from './types/database';
import { dbService, supabase } from './lib/supabase';
import { Navbar } from './components/Navbar';
import { AuthScreen } from './components/AuthScreen';
import { Dashboard } from './components/Dashboard';
import { DietBuilder } from './components/DietBuilder';
import { Patients } from './components/Patients';
import { Anthropometry } from './components/Anthropometry';
import { Appointments } from './components/Appointments';
import { UserRoles } from './components/UserRoles';
import { RecipesShopping } from './components/RecipesShopping';
import { PatientSimulator } from './components/PatientSimulator';
import { NewPatientModal } from './components/Modals/NewPatientModal';
import { NewUserModal } from './components/Modals/NewUserModal';
import { NewAppointmentModal } from './components/Modals/NewAppointmentModal';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [currentView, setCurrentView] = useState('dashboard');

  const [patients, setPatients] = useState<Patient[]>([]);
  const [dietPlans, setDietPlans] = useState<DietPlan[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [realtimeConnected, setRealtimeConnected] = useState(false);

  // Modais Globais
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
  const [isNewAppModalOpen, setIsNewAppModalOpen] = useState(false);

  // Carrega todos os dados do banco de dados relacional Supabase
  const loadAllData = useCallback(async () => {
    try {
      const [profilesData, patientsData, plansData, appsData, recipesData] = await Promise.all([
        dbService.getProfiles(),
        dbService.getPatients(),
        dbService.getDietPlans(),
        dbService.getAppointments(),
        dbService.getRecipes(),
      ]);

      setProfiles(profilesData);
      setPatients(patientsData);
      setDietPlans(plansData);
      setAppointments(appsData);
      setRecipes(recipesData);

      // Define usuário inicial se ainda não selecionado
      if (!currentUser && profilesData.length > 0) {
        const nutri = profilesData.find(p => p.role === 'nutricionista') || profilesData[0];
        setCurrentUser(nutri);
      }

      // Define paciente selecionado padrão se vazio
      if (!selectedPatientId && patientsData.length > 0) {
        setSelectedPatientId(patientsData[0].id);
      }
    } catch (err) {
      console.error('Erro ao carregar dados do Supabase:', err);
    }
  }, [currentUser, selectedPatientId]);

  // Efeito de inicialização e Realtime Channel Supabase
  useEffect(() => {
    loadAllData();

    // Inscrição em tempo real em todas as tabelas
    const channel = supabase
      .channel('nutricore-realtime-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'patients' }, () => {
        loadAllData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        loadAllData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'diet_plans' }, () => {
        loadAllData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'diet_meals' }, () => {
        loadAllData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'diet_meal_items' }, () => {
        loadAllData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'measurements' }, () => {
        loadAllData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => {
        loadAllData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'recipes' }, () => {
        loadAllData();
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setRealtimeConnected(true);
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setRealtimeConnected(false);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadAllData]);

  // Login handler
  const handleLogin = (email: string, role: string) => {
    const matched = profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
    if (matched) {
      setCurrentUser(matched);
    } else {
      // Mock / fallback profile caso o email ainda não esteja registrado
      setCurrentUser({
        id: 'user-temp',
        name: email.split('@')[0],
        email,
        role: role as UserRole,
        created_at: new Date().toISOString()
      });
    }
    setIsLoggedIn(true);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
  };

  // Salvar novo paciente
  const handleSavePatient = async (patientData: Partial<Patient>) => {
    const created = await dbService.createPatient(patientData);
    await loadAllData();
    setSelectedPatientId(created.id);
  };

  // Salvar novo usuário / perfil
  const handleSaveUser = async (userData: Partial<Profile>) => {
    await dbService.createProfile(userData);
    await loadAllData();
  };

  // Salvar nova consulta
  const handleSaveAppointment = async (appData: Partial<Appointment>) => {
    await dbService.createAppointment(appData);
    await loadAllData();
  };

  // Navegar diretamente para dieta do paciente
  const handleOpenPatientDiet = (patientId: string) => {
    setSelectedPatientId(patientId);
    setCurrentView('diet-builder');
  };

  // Navegar diretamente para antropometria do paciente
  const handleOpenPatientAnthro = (patientId: string) => {
    setSelectedPatientId(patientId);
    setCurrentView('anthro');
  };

  if (!isLoggedIn) {
    return (
      <>
        <AuthScreen
          onLogin={handleLogin}
          onOpenNewUserModal={() => setIsNewUserModalOpen(true)}
        />
        <NewUserModal
          isOpen={isNewUserModalOpen}
          onClose={() => setIsNewUserModalOpen(false)}
          onSave={handleSaveUser}
        />
      </>
    );
  }

  return (
    <div className="nutricore-app" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        currentView={currentView}
        onSelectView={setCurrentView}
        currentUser={currentUser}
        onLogout={handleLogout}
        realtimeConnected={realtimeConnected}
      />

      <main className="db-main-content">
        {currentView === 'dashboard' && (
          <Dashboard
            patients={patients}
            dietPlans={dietPlans}
            appointments={appointments}
            profiles={profiles}
            onOpenPatientDiet={handleOpenPatientDiet}
            onOpenNewPatientModal={() => setIsNewPatientModalOpen(true)}
            onOpenNewUserModal={() => setIsNewUserModalOpen(true)}
            onOpenNewAppModal={() => setIsNewAppModalOpen(true)}
          />
        )}

        {currentView === 'diet-builder' && (
          <DietBuilder
            patients={patients}
            dietPlans={dietPlans}
            selectedPatientId={selectedPatientId}
            onSelectPatient={setSelectedPatientId}
            onRefreshData={loadAllData}
          />
        )}

        {currentView === 'patients' && (
          <Patients
            patients={patients}
            onOpenNewPatientModal={() => setIsNewPatientModalOpen(true)}
            onSelectPatientDiet={handleOpenPatientDiet}
            onSelectPatientAnthro={handleOpenPatientAnthro}
          />
        )}

        {currentView === 'anthro' && (
          <Anthropometry
            patients={patients}
            selectedPatientId={selectedPatientId}
            onSelectPatient={setSelectedPatientId}
            onRefreshData={loadAllData}
          />
        )}

        {currentView === 'appointments' && (
          <Appointments
            appointments={appointments}
            patients={patients}
            onOpenNewAppModal={() => setIsNewAppModalOpen(true)}
            onRefreshData={loadAllData}
          />
        )}

        {currentView === 'users' && (
          <UserRoles
            profiles={profiles}
            onOpenNewUserModal={() => setIsNewUserModalOpen(true)}
            onRefreshData={loadAllData}
          />
        )}

        {currentView === 'recipes' && (
          <RecipesShopping
            recipes={recipes}
            dietPlans={dietPlans}
            patients={patients}
            selectedPatientId={selectedPatientId}
            onSelectPatient={setSelectedPatientId}
          />
        )}

        {currentView === 'patient-app' && (
          <PatientSimulator
            patients={patients}
            dietPlans={dietPlans}
            selectedPatientId={selectedPatientId}
            onSelectPatient={setSelectedPatientId}
          />
        )}
      </main>

      {/* Modais Globais Conectados ao Supabase */}
      <NewPatientModal
        isOpen={isNewPatientModalOpen}
        onClose={() => setIsNewPatientModalOpen(false)}
        onSave={handleSavePatient}
      />

      <NewUserModal
        isOpen={isNewUserModalOpen}
        onClose={() => setIsNewUserModalOpen(false)}
        onSave={handleSaveUser}
      />

      <NewAppointmentModal
        isOpen={isNewAppModalOpen}
        onClose={() => setIsNewAppModalOpen(false)}
        patients={patients}
        onSave={handleSaveAppointment}
      />
    </div>
  );
}
