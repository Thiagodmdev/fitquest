import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AchievementsPage from './pages/AchievementsPage';
import DashboardPage from './pages/DashboardPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import NewWorkoutPage from './pages/NewWorkoutPage';
import NotFoundPage from './pages/NotFoundPage';
import ProgressPage from './pages/ProgressPage';
import WorkoutsPage from './pages/WorkoutsPage';
import { api } from './services/api';

export default function App() {
  return (
    <>
      <Navbar />
      {api.mode === 'demo' && (
        <p className="demo-banner">Modo demonstração: os dados ficam salvos só neste navegador.</p>
      )}
      <main className="page">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/painel" element={<DashboardPage />} />
            <Route path="/treinos" element={<WorkoutsPage />} />
            <Route path="/treinos/novo" element={<NewWorkoutPage />} />
            <Route path="/evolucao" element={<ProgressPage />} />
            <Route path="/conquistas" element={<AchievementsPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </>
  );
}
