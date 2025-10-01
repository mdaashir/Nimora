import React from 'react'
import './App.css'
import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom'
import Home from './pages/homePage'
import Feedback from './pages/feedbackPage'
import TimeTable from './pages/timetablePage'
import Cgpa from './pages/cgpaPage'
import Internals from './pages/internalsPage'
import Login from './components/Login'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { AuthProvider, useAuth } from './context/AuthContext'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return isAuthenticated ? children : <Navigate to="/" replace />
}

// Layout component with fixed navbar and footer
const PageLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <div className="flex-grow pt-24 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </div>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path='/' element={<Login />} />
          <Route path='/Home' element={
            <ProtectedRoute>
              <PageLayout>
                <Home />
              </PageLayout>
            </ProtectedRoute>
          } />
          <Route path='/feedback' element={
            <ProtectedRoute>
              <PageLayout>
                <Feedback />
              </PageLayout>
            </ProtectedRoute>
          } />
          <Route path='/timetable' element={
            <ProtectedRoute>
              <PageLayout>
                <TimeTable />
              </PageLayout>
            </ProtectedRoute>
          } />
          <Route path='/cgpa' element={
            <ProtectedRoute>
              <PageLayout>
                <Cgpa />
              </PageLayout>
            </ProtectedRoute>
          } />
          <Route path='/internals' element={
            <ProtectedRoute>
              <PageLayout>
                <Internals />
              </PageLayout>
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
