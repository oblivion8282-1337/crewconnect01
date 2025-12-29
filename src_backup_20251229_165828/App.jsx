import React, { useState, useMemo } from 'react';

// Components
import Header from './components/Header';
import Navigation from './components/Navigation';
import CancelBookingModal from './components/modals/CancelBookingModal';
import RescheduleBookingModal from './components/modals/RescheduleBookingModal';

// Freelancer Views
import FreelancerHomeDashboard from './components/freelancer/FreelancerHomeDashboard';
import FreelancerDashboard from './components/freelancer/FreelancerDashboard';
import FreelancerProjects from './components/freelancer/FreelancerProjects';
import FreelancerCalendar from './components/freelancer/FreelancerCalendar';
import FreelancerProfile from './components/freelancer/FreelancerProfile';

// Agency Views
import AgencyHomeDashboard from './components/agency/AgencyHomeDashboard';
import AgencyProjects from './components/agency/AgencyProjects';
import AgencyBookings from './components/agency/AgencyBookings';
import AgencyProfile from './components/agency/AgencyProfile';
import ProjectDetail from './components/agency/ProjectDetail';
import PhaseDetail from './components/agency/PhaseDetail';

// Shared Views
import BookingHistory from './components/shared/BookingHistory';

// Hooks & Data
import { useBookings } from './hooks/useBookings';
import { useProjects } from './hooks/useProjects';
import { useProfile } from './hooks/useProfile';
import { INITIAL_FREELANCERS, INITIAL_AGENCIES } from './data/initialData';
import { USER_ROLES } from './constants/calendar';

/**
 * CrewConnect - Hauptanwendung
 *
 * Eine Buchungsplattform für Freelancer und Agenturen in der Film-/Medienbranche.
 * Ermöglicht das Verwalten von Buchungsanfragen, Optionen, Fix-Buchungen und Verschiebungen.
 */
const App = () => {
  // === User Identity State (für Agent-Testing) ===
  const [freelancerId, setFreelancerId] = useState(1);
  const [agencyId, setAgencyId] = useState(1);

  // === UI State ===
  const [userRole, setUserRole] = useState(USER_ROLES.FREELANCER);
  const [currentView, setCurrentView] = useState('dashboard');
  const [currentDate, setCurrentDate] = useState(new Date(2025, 0, 1));
  const [showNotifications, setShowNotifications] = useState(false);

  // === Modal State ===
  const [cancelModalBooking, setCancelModalBooking] = useState(null);
  const [rescheduleModalBooking, setRescheduleModalBooking] = useState(null);

  // === Project Logic (Custom Hook) ===
  const {
    projects,
    getProjectById,
    deleteProject,
    updateProject,
    deletePhase,
    updatePhase,
    addProject,
    addPhase
  } = useProjects();

  // === Selected Project & Phase State ===
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedPhaseId, setSelectedPhaseId] = useState(null);
  const selectedProject = selectedProjectId ? getProjectById(selectedProjectId) : null;
  const selectedPhase = selectedProject?.phases?.find(p => p.id === selectedPhaseId) || null;

  // === Profile Logic (Custom Hook) ===
  const {
    freelancerProfile,
    agencyProfile,
    freelancers,
    agencies,
    updateFreelancerProfile,
    updateAgencyProfile,
    addProfession,
    removeProfession,
    addSkill,
    removeSkill,
    addEquipment,
    removeEquipment,
    addLanguage,
    removeLanguage,
    addPortfolioItem,
    updatePortfolioItem,
    removePortfolioItem,
    updateSocialMedia,
    toggleVisibility,
    updateAgencySocialMedia,
    addAgencyPortfolioItem,
    updateAgencyPortfolioItem,
    removeAgencyPortfolioItem
  } = useProfile(freelancerId, agencyId);

  // === Booking Logic (Custom Hook) ===
  const {
    bookings,
    notifications,
    blockedDays,
    openForMoreDays,
    pendingBookingsCount,
    rescheduleRequestsCount,
    getDayStatus,
    markNotificationsAsRead,
    markNotificationAsRead,
    acceptBooking,
    declineBooking,
    withdrawBooking,
    cancelBooking,
    convertOptionToFix,
    createBooking,
    declineOverlappingBookings,
    requestReschedule,
    acceptReschedule,
    declineReschedule,
    withdrawReschedule,
    blockDay,
    blockDayOpen,
    unblockDay,
    toggleOpenForMore
  } = useBookings(freelancerId, agencyId);

  // Gefilterte Benachrichtigungen für aktuelle Rolle
  const roleNotifications = useMemo(() =>
    notifications.filter(n => n.forRole === userRole),
    [notifications, userRole]
  );

  const unreadNotificationCount = useMemo(() =>
    roleNotifications.filter(n => !n.read).length,
    [roleNotifications]
  );

  // Badge-Anzahl für Navigation
  const navBadgeCount = pendingBookingsCount + rescheduleRequestsCount;

  // === Event Handlers ===

  /**
   * Wechselt die Benutzerrolle und setzt die Ansicht zurück
   */
  const handleRoleChange = (newRole) => {
    setUserRole(newRole);
    setCurrentView('dashboard');
    setShowNotifications(false);
    setSelectedProjectId(null);
    setSelectedPhaseId(null);
  };

  /**
   * Handler für Stornierung (öffnet Modal)
   */
  const handleOpenCancelModal = (booking) => {
    setCancelModalBooking(booking);
  };

  /**
   * Handler für Stornierung (führt aus)
   */
  const handleCancelBooking = (booking, reason) => {
    cancelBooking(booking, reason, userRole);
    setCancelModalBooking(null);
  };

  /**
   * Handler für Verschiebung (öffnet Modal)
   */
  const handleOpenRescheduleModal = (booking) => {
    setRescheduleModalBooking(booking);
  };

  /**
   * Handler für Verschiebungsanfrage (führt aus)
   */
  const handleRescheduleRequest = (booking, newDates) => {
    requestReschedule(booking, newDates);
    setRescheduleModalBooking(null);
  };

  // === Render ===
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header mit Rollen-Switcher und User-Switcher */}
      <Header
        userRole={userRole}
        onRoleChange={handleRoleChange}
        notifications={roleNotifications}
        unreadCount={unreadNotificationCount}
        showNotifications={showNotifications}
        onToggleNotifications={() => setShowNotifications(!showNotifications)}
        onMarkAllAsRead={() => markNotificationsAsRead(userRole)}
        onMarkAsRead={markNotificationAsRead}
        // User-Switcher Props
        freelancerId={freelancerId}
        agencyId={agencyId}
        freelancers={freelancers}
        agencies={agencies}
        onFreelancerChange={setFreelancerId}
        onAgencyChange={setAgencyId}
      />

      {/* Navigation */}
      <Navigation
        userRole={userRole}
        currentView={currentView}
        onViewChange={(view) => {
          setCurrentView(view);
          setSelectedProjectId(null);
          setSelectedPhaseId(null);
        }}
        badgeCount={navBadgeCount}
      />

      {/* Hauptinhalt */}
      <div className="p-6">
        {/* Freelancer Views */}
        {userRole === USER_ROLES.FREELANCER && currentView === 'dashboard' && (
          <FreelancerHomeDashboard
            bookings={bookings}
            freelancerId={freelancerId}
            freelancerProfile={freelancerProfile}
            currentDate={currentDate}
            onAccept={acceptBooking}
            onDecline={declineBooking}
            onCancel={handleOpenCancelModal}
            onAcceptReschedule={acceptReschedule}
            onDeclineReschedule={declineReschedule}
            onViewCalendar={() => setCurrentView('calendar')}
            onViewAllRequests={() => setCurrentView('requests')}
          />
        )}

        {userRole === USER_ROLES.FREELANCER && currentView === 'requests' && (
          <FreelancerDashboard
            bookings={bookings}
            freelancerId={freelancerId}
            onAccept={acceptBooking}
            onDecline={declineBooking}
            onCancel={handleOpenCancelModal}
            onAcceptReschedule={acceptReschedule}
            onDeclineReschedule={declineReschedule}
          />
        )}

        {userRole === USER_ROLES.FREELANCER && currentView === 'projects' && (
          <FreelancerProjects
            bookings={bookings}
            projects={projects}
            freelancers={freelancers}
            freelancerId={freelancerId}
          />
        )}

        {userRole === USER_ROLES.FREELANCER && currentView === 'calendar' && (
          <FreelancerCalendar
            currentDate={currentDate}
            onDateChange={setCurrentDate}
            getDayStatus={getDayStatus}
            openForMoreDays={openForMoreDays}
            onBlockDay={blockDay}
            onBlockDayOpen={blockDayOpen}
            onUnblockDay={unblockDay}
            onToggleOpenForMore={toggleOpenForMore}
          />
        )}

        {userRole === USER_ROLES.FREELANCER && currentView === 'history' && (
          <BookingHistory
            bookings={bookings}
            userRole={userRole}
            userId={freelancerId}
          />
        )}

        {userRole === USER_ROLES.FREELANCER && currentView === 'profile' && (
          <FreelancerProfile
            profile={freelancerProfile}
            onUpdate={updateFreelancerProfile}
            onAddProfession={addProfession}
            onRemoveProfession={removeProfession}
            onAddSkill={addSkill}
            onRemoveSkill={removeSkill}
            onAddEquipment={addEquipment}
            onRemoveEquipment={removeEquipment}
            onAddLanguage={addLanguage}
            onRemoveLanguage={removeLanguage}
            onAddPortfolioItem={addPortfolioItem}
            onUpdatePortfolioItem={updatePortfolioItem}
            onRemovePortfolioItem={removePortfolioItem}
            onUpdateSocialMedia={updateSocialMedia}
            onToggleVisibility={toggleVisibility}
          />
        )}

        {/* Agency Views */}
        {userRole === USER_ROLES.AGENCY && currentView === 'dashboard' && !selectedProject && (
          <AgencyHomeDashboard
            projects={projects}
            bookings={bookings}
            freelancers={freelancers}
            agencyId={agencyId}
            onSelectProject={setSelectedProjectId}
            onConvertToFix={convertOptionToFix}
            onViewBookings={() => setCurrentView('bookings')}
            onViewProjects={() => setCurrentView('projects')}
            onAddProject={addProject}
          />
        )}

        {userRole === USER_ROLES.AGENCY && currentView === 'projects' && !selectedProject && (
          <AgencyProjects
            projects={projects}
            bookings={bookings}
            freelancers={freelancers}
            agencyId={agencyId}
            onConvertToFix={convertOptionToFix}
            onAddProject={addProject}
            onSelectProject={setSelectedProjectId}
          />
        )}

        {userRole === USER_ROLES.AGENCY && (currentView === 'dashboard' || currentView === 'projects') && selectedProject && !selectedPhase && (
          <ProjectDetail
            project={selectedProject}
            bookings={bookings}
            freelancers={freelancers}
            agencyId={agencyId}
            getDayStatus={getDayStatus}
            onBack={() => setSelectedProjectId(null)}
            onBackToProjects={() => setSelectedProjectId(null)}
            onBook={createBooking}
            onConvertToFix={convertOptionToFix}
            onWithdraw={withdrawBooking}
            onUpdateProject={updateProject}
            onDeleteProject={deleteProject}
            onAddPhase={addPhase}
            onUpdatePhase={updatePhase}
            onDeletePhase={deletePhase}
            onSelectPhase={(phase) => setSelectedPhaseId(phase.id)}
          />
        )}

        {userRole === USER_ROLES.AGENCY && (currentView === 'dashboard' || currentView === 'projects') && selectedProject && selectedPhase && (
          <PhaseDetail
            project={selectedProject}
            phase={selectedPhase}
            bookings={bookings}
            freelancers={freelancers}
            agencyId={agencyId}
            getDayStatus={getDayStatus}
            onBack={() => setSelectedPhaseId(null)}
            onBackToProjects={() => {
              setSelectedProjectId(null);
              setSelectedPhaseId(null);
            }}
            onBook={createBooking}
            onConvertToFix={convertOptionToFix}
            onWithdraw={withdrawBooking}
            onUpdatePhase={updatePhase}
          />
        )}

        {userRole === USER_ROLES.AGENCY && currentView === 'bookings' && (
          <AgencyBookings
            bookings={bookings}
            agencyId={agencyId}
            onWithdraw={withdrawBooking}
            onConvertToFix={convertOptionToFix}
            onReschedule={handleOpenRescheduleModal}
            onCancel={handleOpenCancelModal}
            onWithdrawReschedule={withdrawReschedule}
          />
        )}


        {userRole === USER_ROLES.AGENCY && currentView === 'history' && (
          <BookingHistory
            bookings={bookings}
            userRole={userRole}
            userId={agencyId}
          />
        )}

        {userRole === USER_ROLES.AGENCY && currentView === 'profile' && (
          <AgencyProfile
            profile={agencyProfile}
            onUpdate={updateAgencyProfile}
            onUpdateSocialMedia={updateAgencySocialMedia}
            onAddPortfolioItem={addAgencyPortfolioItem}
            onUpdatePortfolioItem={updateAgencyPortfolioItem}
            onRemovePortfolioItem={removeAgencyPortfolioItem}
          />
        )}
      </div>

      {/* Modals */}
      <CancelBookingModal
        booking={cancelModalBooking}
        onCancel={handleCancelBooking}
        onClose={() => setCancelModalBooking(null)}
      />

      <RescheduleBookingModal
        booking={rescheduleModalBooking}
        getDayStatus={getDayStatus}
        agencyId={agencyId}
        onReschedule={handleRescheduleRequest}
        onClose={() => setRescheduleModalBooking(null)}
      />
    </div>
  );
};

export default App;
