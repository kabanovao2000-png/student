import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from '../components/pages/login/Login';
import Student from '../components/pages/Students/Students';
import Teacher from '../components/pages/Teacher/Teacher';
import GroupStudents from '../components/pages/GroupStudents/GroupStudents';
import { ProtectedRoute } from '../components/common/ProtectedRoute';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/student"
          element={<ProtectedRoute role="student"><Student /></ProtectedRoute>}
        />
        <Route
          path="/teacher"
          element={<ProtectedRoute role="teacher"><Teacher /></ProtectedRoute>}
        />
        <Route
          path="/group/:groupId"
          element={<ProtectedRoute role="teacher"><GroupStudents /></ProtectedRoute>}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;