import { Routes, Route, useLocation } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import PublicHeader from '@/components/layout/PublicHeader'
import { PublicFooter } from '@/components/layout/PublicFooter'
import { cn } from '@/lib/utils'

// Import converted pages
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import CurriculumPage from './pages/CurriculumPage'
import KeyStage2Page from './pages/KeyStage2Page'
import EarlyYearsPage from './pages/EarlyYearsPage'
import KeyStage1Page from './pages/KeyStage1Page'
import BeyondTheClassroomPage from './pages/BeyondTheClassroomPage'
import AdmissionsPage from './pages/AdmissionsPage'
import KidsCornerPage from './pages/KidsCornerPage'
import NewsPage from './pages/NewsPage'
import NewsArticlePage from './pages/NewsArticlePage'
import KeyInfoPage from './pages/KeyInfoPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminNews from './pages/admin/AdminNews'
import AdminDocuments from './pages/admin/AdminDocuments'
import AdminSettings from './pages/admin/AdminSettings'
import CalendarPage from './pages/admin/CalendarPage';
import AdminAnnouncements from './pages/admin/AdminAnnouncements';
import UsersPage from './pages/admin/UsersPage';
import GalleryPage from './pages/admin/GalleryPage';
import AdminInboxPage from './pages/admin/AdminInboxPage';
import StaffDashboard from './pages/staff/StaffDashboard'
import StaffLoginPage from './pages/staff/StaffLoginPage'
import TeacherDashboard from './pages/teacher/TeacherDashboard'
import TeacherValuesAward from './pages/teacher/TeacherValuesAward'
import TeacherNotify from './pages/teacher/TeacherNotify'
import TeacherOutboxPage from './pages/teacher/TeacherOutboxPage'
import TeacherGalleryPage from './pages/teacher/TeacherGalleryPage'
import TeacherLoginPage from './pages/teacher/TeacherLoginPage'
import AdminLoginPage from './pages/admin/AdminLoginPage'
// New Admin pages re-exported from Next.js implementations
import AdminChildren from './pages/admin/AdminChildren'
import AdminParents from './pages/admin/AdminParents'
import AdminStaff from './pages/admin/AdminStaff'
import AdminMenu from './pages/admin/AdminMenu'
// ContentLifecyclePage removed - admin archiving functionality no longer available
// Protected route and logout handler
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import LogoutHandler from '@/components/auth/LogoutHandler'
import PortalLayout from '@/components/layout/PortalLayout'
import TeacherLayout from '@/components/layout/TeacherLayout'
import AdminLayout from '@/components/layout/AdminLayout'

// Portal Pages
import DashboardPage from './pages/portal/DashboardPage'
import AbsencePage from './pages/portal/AbsencePage'
import CalendarPortalPage from './pages/portal/CalendarPage'
import GalleryPortalPage from './pages/portal/GalleryPage'
import InboxPage from './pages/portal/InboxPage'

function App() {
  const location = useLocation();
  
  // Define which routes should show the public header and footer
  const publicRoutes = ['/', '/about', '/contact', '/curriculum', '/curriculum/key-stage-2', 
    '/curriculum/early-years', '/curriculum/key-stage-1', '/curriculum/beyond-the-classroom', 
    '/admissions', '/kids-corner', '/news', '/key-info', '/signup', '/logout'];
  
  const isPublicRoute = publicRoutes.includes(location.pathname);
  
  return (
    <div className={cn("App min-h-screen bg-background font-body antialiased")}>
      {isPublicRoute && <PublicHeader />}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/curriculum" element={<CurriculumPage />} />
        <Route path="/curriculum/key-stage-2" element={<KeyStage2Page />} />
        <Route path="/curriculum/early-years" element={<EarlyYearsPage />} />
        <Route path="/curriculum/key-stage-1" element={<KeyStage1Page />} />
        <Route path="/curriculum/beyond-the-classroom" element={<BeyondTheClassroomPage />} />
        <Route path="/admissions" element={<AdmissionsPage />} />
        <Route path="/kids-corner" element={<KidsCornerPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/news/:slug" element={<NewsArticlePage />} />
        <Route path="/key-info" element={<KeyInfoPage />} />
        
        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRoles={["admin"]} redirectTo="/admin/login">
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/announcements" element={
          <ProtectedRoute allowedRoles={["admin"]} redirectTo="/admin/login">
            <AdminLayout>
              <AdminAnnouncements />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/news" element={
          <ProtectedRoute allowedRoles={["admin"]} redirectTo="/admin/login">
            <AdminLayout>
              <AdminNews />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/documents" element={
          <ProtectedRoute allowedRoles={["admin"]} redirectTo="/admin/login">
            <AdminLayout>
              <AdminDocuments />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/settings" element={
          <ProtectedRoute allowedRoles={["admin"]} redirectTo="/admin/login">
            <AdminLayout>
              <AdminSettings />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/calendar" element={
          <ProtectedRoute allowedRoles={["admin"]} redirectTo="/admin/login">
            <AdminLayout>
              <CalendarPage />
            </AdminLayout>
          </ProtectedRoute>
        } />
          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={["admin"]} redirectTo="/admin/login">
              <AdminLayout>
                <UsersPage />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/gallery" element={
            <ProtectedRoute allowedRoles={["admin"]} redirectTo="/admin/login">
              <AdminLayout>
                <GalleryPage />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/inbox" element={
            <ProtectedRoute allowedRoles={["admin"]} redirectTo="/admin/login">
              <AdminLayout>
                <AdminInboxPage />
              </AdminLayout>
            </ProtectedRoute>
          } />
          {/* Newly added Admin routes for parity */}
          <Route path="/admin/children" element={
            <ProtectedRoute allowedRoles={["admin"]} redirectTo="/admin/login">
              <AdminLayout>
                <AdminChildren />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/parents" element={
            <ProtectedRoute allowedRoles={["admin"]} redirectTo="/admin/login">
              <AdminLayout>
                <AdminParents />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/staff" element={
            <ProtectedRoute allowedRoles={["admin"]} redirectTo="/admin/login">
              <AdminLayout>
                <AdminStaff />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/menu" element={
            <ProtectedRoute allowedRoles={["admin"]} redirectTo="/admin/login">
              <AdminLayout>
                <AdminMenu />
              </AdminLayout>
            </ProtectedRoute>
          } />
          {/* Removed: /admin/lifecycle routes */} 
        {/* Staff Routes */}
        <Route path="/staff/login" element={<StaffLoginPage />} />
        <Route path="/staff/dashboard" element={<StaffDashboard />} />
        
        {/* Teacher Routes */}
        <Route path="/teacher/login" element={<TeacherLoginPage />} />
        <Route path="/teacher/dashboard" element={
          <ProtectedRoute allowedRoles={["teacher"]} redirectTo="/teacher/login">
            <TeacherLayout>
              <TeacherDashboard />
            </TeacherLayout>
          </ProtectedRoute>
        } />
        <Route path="/teacher/values-award" element={
          <ProtectedRoute allowedRoles={["teacher"]} redirectTo="/teacher/login">
            <TeacherLayout>
              <TeacherValuesAward />
            </TeacherLayout>
          </ProtectedRoute>
        } />
        <Route path="/teacher/notify" element={
          <ProtectedRoute allowedRoles={["teacher"]} redirectTo="/teacher/login">
            <TeacherLayout>
              <TeacherNotify />
            </TeacherLayout>
          </ProtectedRoute>
        } />
        <Route path="/teacher/outbox" element={
          <ProtectedRoute allowedRoles={["teacher"]} redirectTo="/teacher/login">
            <TeacherLayout>
              <TeacherOutboxPage />
            </TeacherLayout>
          </ProtectedRoute>
        } />
        <Route path="/teacher/gallery" element={
          <ProtectedRoute allowedRoles={["teacher"]} redirectTo="/teacher/login">
            <TeacherLayout>
              <TeacherGalleryPage />
            </TeacherLayout>
          </ProtectedRoute>
        } />
        
        {/* Portal Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={["parent"]} redirectTo="/login">
            <PortalLayout>
              <DashboardPage />
            </PortalLayout>
          </ProtectedRoute>
        } />
        <Route path="/absence" element={
          <ProtectedRoute allowedRoles={["parent"]} redirectTo="/login">
            <PortalLayout>
              <AbsencePage />
            </PortalLayout>
          </ProtectedRoute>
        } />
        <Route path="/calendar" element={
          <ProtectedRoute allowedRoles={["parent"]} redirectTo="/login">
            <PortalLayout>
              <CalendarPortalPage />
            </PortalLayout>
          </ProtectedRoute>
        } />
        <Route path="/gallery" element={
          <ProtectedRoute allowedRoles={["parent"]} redirectTo="/login">
            <PortalLayout>
              <GalleryPortalPage />
            </PortalLayout>
          </ProtectedRoute>
        } />
        <Route path="/inbox" element={
          <ProtectedRoute allowedRoles={["parent"]} redirectTo="/login">
            <PortalLayout>
              <InboxPage />
            </PortalLayout>
          </ProtectedRoute>
        } />

        {/* Logout */}
        <Route path="/logout" element={<LogoutHandler />} />
      </Routes>
      {isPublicRoute && <PublicFooter />}
      <Toaster />
    </div>
  )
}

export default App