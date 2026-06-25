import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from '../components/pages/login/Login';
import Student from '../components/pages/Students/Students'; // если твой файл лежит в папке Students
import SubjectPage from '../components/pages/SubjectPage/SubjectPage';
import Teacher from '../components/pages/Teacher/Teacher';
import GroupPage from '../components/pages/groupPage/GroupPage';
import { ProtectedRoute } from '../components/common/ProtectedRoute';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/student"
          element={
            <ProtectedRoute role="student">
              <Student />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/subject/:subjectId"
          element={
            <ProtectedRoute role="student">
              <SubjectPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher"
          element={
            <ProtectedRoute role="teacher">
              <Teacher />
            </ProtectedRoute>
          }
        />
        <Route
          path="/group/:groupId"
          element={
            <ProtectedRoute role="teacher">
              <GroupPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;