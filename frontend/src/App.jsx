import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import SetPin from './pages/SetPin';
import Dashboard from './pages/Dashboard';
import Cards from './pages/Cards';
import Accounts from './pages/Accounts';
import Invest from './pages/Invest';
import Borrow from './pages/Borrow';
import Insurance from './pages/Insurance';

const PrivateRoute = ({ children }) => {
  const { user, loading } = React.useContext(AuthContext);
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/set-pin" element={<PrivateRoute><SetPin /></PrivateRoute>} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/cards" element={<PrivateRoute><Cards /></PrivateRoute>} />
          <Route path="/accounts" element={<PrivateRoute><Accounts /></PrivateRoute>} />
          <Route path="/invest" element={<PrivateRoute><Invest /></PrivateRoute>} />
          <Route path="/borrow" element={<PrivateRoute><Borrow /></PrivateRoute>} />
          <Route path="/insurance" element={<PrivateRoute><Insurance /></PrivateRoute>} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
