import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import PublicOnlyRoute from '@/components/PublicOnlyRoute';
import AdminRoute from '@/components/AdminRoute';

import AppLayout from '@/components/layout/AppLayout';
import Home from '@/pages/Home';
import Courses from '@/pages/Courses';
import CourseDetail from '@/pages/CourseDetail';
import LearningLab from '@/pages/LearningLab';
import Community from '@/pages/Community';
import About from '@/pages/About';
import Profile from '@/pages/Profile';
import AssessmentPlayer from '@/pages/AssessmentPlayer';
import BecomeTutor from '@/pages/BecomeTutor';
import CreateCourse from '@/pages/CreateCourse';
import EditCourse from '@/pages/EditCourse';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';

const AuthenticatedApp = () => {
  const { isLoadingAuth, authError } = useAuth();

  // In our decoupled app, we only wait for Firebase Auth to initialize
  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-muted border-t-primary rounded-full animate-spin" />
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Loading UniLearn</p>
        </div>
      </div>
    );
  }

  // Handle generic auth errors gracefully
  if (authError && authError.type === 'user_not_registered') {
    return <UserNotRegisteredError />;
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* Public — browsable without an account */}
        <Route path="/" element={<Home />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/course/:id" element={<CourseDetail />} />
        <Route path="/about" element={<About />} />

        {/* Auth pages — only for logged-out visitors */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        {/* Requires login */}
        <Route element={<ProtectedRoute />}>
          <Route path="/community" element={<Community />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/dashboard" element={<Navigate to="/community" replace />} />
          <Route path="/assessment/:id" element={<AssessmentPlayer />} />
          <Route path="/become-tutor" element={<BecomeTutor />} />
        </Route>

        {/* Requires login + admin role */}
        <Route element={<AdminRoute />}>
          <Route path="/admin/create-course" element={<CreateCourse />} />
          <Route path="/admin/edit-course/:id" element={<EditCourse />} />
        </Route>
      </Route>

      {/* LearningLab is full-screen (outside AppLayout) but still requires login */}
      <Route element={<ProtectedRoute />}>
        <Route path="/learn/:id" element={<LearningLab />} />
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App;
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import PublicOnlyRoute from '@/components/PublicOnlyRoute';
import AdminRoute from '@/components/AdminRoute';

import AppLayout from '@/components/layout/AppLayout';
import Home from '@/pages/Home';
import Courses from '@/pages/Courses';
import CourseDetail from '@/pages/CourseDetail';
import LearningLab from '@/pages/LearningLab';
import Community from '@/pages/Community';
import About from '@/pages/About';
import Profile from '@/pages/Profile';
import AssessmentPlayer from '@/pages/AssessmentPlayer';
import BecomeTutor from '@/pages/BecomeTutor';
import CreateCourse from '@/pages/CreateCourse';
import EditCourse from '@/pages/EditCourse';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';

const AuthenticatedApp = () => {
  const { isLoadingAuth, authError } = useAuth();

  // In our decoupled app, we only wait for Firebase Auth to initialize
  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-muted border-t-primary rounded-full animate-spin" />
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Loading UniLearn</p>
        </div>
      </div>
    );
  }

  // Handle generic auth errors gracefully
  if (authError && authError.type === 'user_not_registered') {
    return <UserNotRegisteredError />;
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* Public — browsable without an account */}
        <Route path="/" element={<Home />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/course/:id" element={<CourseDetail />} />
        <Route path="/about" element={<About />} />

        {/* Auth pages — only for logged-out visitors */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        {/* Requires login */}
        <Route element={<ProtectedRoute />}>
          <Route path="/community" element={<Community />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/dashboard" element={<Navigate to="/community" replace />} />
          <Route path="/assessment/:id" element={<AssessmentPlayer />} />
          <Route path="/become-tutor" element={<BecomeTutor />} />
        </Route>

        {/* Requires login + admin role */}
        <Route element={<AdminRoute />}>
          <Route path="/admin/create-course" element={<CreateCourse />} />
          <Route path="/admin/edit-course/:id" element={<EditCourse />} />
        </Route>
      </Route>

      {/* LearningLab is full-screen (outside AppLayout) but still requires login */}
      <Route element={<ProtectedRoute />}>
        <Route path="/learn/:id" element={<LearningLab />} />
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App;
