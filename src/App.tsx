import { Routes, Route } from 'react-router-dom';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Dashboard } from './pages/Dashboard';
import { TutorPage } from './pages/TutorPage';
import { CoursesPage } from './pages/CoursesPage';
import { TestsPage } from './pages/TestsPage';
import { LessonPage } from './pages/LessonPage';
import { SettingsPage } from './pages/SettingsPage';
import { KnowledgePage } from './pages/KnowledgePage';
import { ProfilePage } from './pages/ProfilePage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="academy" element={<CoursesPage />} />
        <Route path="lesson" element={<LessonPage />} />
        <Route path="tutor" element={<TutorPage />} />
        <Route path="training" element={<TestsPage />} />
        <Route path="knowledge" element={<KnowledgePage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}

export default App;
