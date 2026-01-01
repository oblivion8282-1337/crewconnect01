import React, { useState, useMemo, useCallback } from 'react';

// Components
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import CancelBookingModal from './components/modals/CancelBookingModal';
import RescheduleBookingModal from './components/modals/RescheduleBookingModal';

// Context
import { UnsavedChangesProvider, useUnsavedChangesContext } from './contexts/UnsavedChangesContext';

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
import CrewListsPage from './components/agency/CrewListsPage';
import AgencyFreelancerSearch from './components/agency/AgencyFreelancerSearch';
import FreelancerProfileView from './components/agency/FreelancerProfileView';
import AddToListModal from './components/modals/AddToListModal';
import AddFreelancerToCrewModal from './components/modals/AddFreelancerToCrewModal';
import BookFromProfileModal from './components/modals/BookFromProfileModal';

// Client Management (CRM)
import { ClientList, ClientDetail, ClientForm } from './components/agency/clients';

// Shared Views
import BookingHistory from './components/shared/BookingHistory';

// Message Views
import { ChatList, ChatView } from './components/messages';

// Dashboard View
import { Dashboard } from './components/dashboard';

// Hooks & Data
import { useBookings } from './hooks/useBookings';
import { useProjects } from './hooks/useProjects';
import { useProfile } from './hooks/useProfile';
import { useMessages } from './hooks/useMessages';
import { useClients } from './hooks/useClients';
import useTeam from './hooks/useTeam';
import { USER_ROLES } from './constants/calendar';

// Team Components
import { TeamList } from './components/agency/team';

/**
 * CrewConnect - Hauptanwendung (Innere Komponente mit Zugriff auf Context)
 */
const AppContent = () => {
  // Unsaved Changes Context
  const { confirmNavigation, hasUnsavedChanges } = useUnsavedChangesContext();
  // === User Identity State ===
  const [freelancerId, setFreelancerId] = useState(1);
  const [agencyId, setAgencyId] = useState(1);

  // === UI State ===
  const [userRole, setUserRole] = useState(USER_ROLES.AGENCY);
  const [currentView, setCurrentView] = useState('dashboard');
  const [currentDate, setCurrentDate] = useState(new Date(2025, 0, 1));
  const [showNotifications, setShowNotifications] = useState(false);
  const [showFinanceDashboard, setShowFinanceDashboard] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // === Modal State ===
  const [cancelModalBooking, setCancelModalBooking] = useState(null);
  const [rescheduleModalBooking, setRescheduleModalBooking] = useState(null);
  const [addToListModalOpen, setAddToListModalOpen] = useState(false);
  const [addToListFreelancerId, setAddToListFreelancerId] = useState(null);

  // === Freelancer Search State ===
  const [selectedFreelancerId, setSelectedFreelancerId] = useState(null);
  const [bookFromProfileFreelancer, setBookFromProfileFreelancer] = useState(null);

  // === Freelancer Project Navigation State ===
  const [freelancerSelectedProjectId, setFreelancerSelectedProjectId] = useState(null);
  const [freelancerSelectedPhaseId, setFreelancerSelectedPhaseId] = useState(null);

  // === Messaging State ===
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [bookingFromChatFreelancerId, setBookingFromChatFreelancerId] = useState(null);

  // === AddFreelancerToCrewModal State ===
  // null = closed, 'favorites' = open for favorites, listId = open with that list pre-selected
  const [addFreelancerModalListId, setAddFreelancerModalListId] = useState(null);

  // === Client (CRM) State ===
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [showClientForm, setShowClientForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  // === Project Logic ===
  const {
    projects,
    getProjectById,
    deleteProject,
    updateProject,
    deletePhase,
    updatePhase,
    addProject,
    addPhase,
    getProjectsByClient
  } = useProjects();

  // === Client (CRM) Logic ===
  const {
    clients,
    getClientById,
    createClient,
    updateClient,
    deleteClient,
    addContact,
    updateContact,
    removeContact,
    setPrimaryContact,
    toggleFavorite: toggleClientFavorite,
    updateStatus: updateClientStatus,
    addTag: addClientTag,
    removeTag: removeClientTag,
    getClientsWithStats
  } = useClients();

  // === Selected Project & Phase State ===
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedPhaseId, setSelectedPhaseId] = useState(null);
  const selectedProject = selectedProjectId ? getProjectById(selectedProjectId) : null;
  const selectedPhase = selectedProject?.phases?.find(p => p.id === selectedPhaseId) || null;

  // === Profile Logic ===
  const {
    freelancerProfile,
    agencyProfile,
    freelancers,
    agencies,
    updateFreelancerProfile,
    updateAgencyProfile,
    addProfession,
    removeProfession,
    addTag,
    removeTag,
    addPortfolioItem,
    updatePortfolioItem,
    removePortfolioItem,
    updateSocialMedia,
    toggleVisibility,
    updateAgencySocialMedia,
    addAgencyPortfolioItem,
    updateAgencyPortfolioItem,
    removeAgencyPortfolioItem,
    // Favoriten & Crew-Listen
    getAgencyFavorites,
    isFavorite,
    toggleFavorite,
    getAgencyCrewLists,
    createCrewList,
    deleteCrewList,
    renameCrewList,
    updateCrewListColor,
    addToCrewList,
    removeFromCrewList,
    getListsForFreelancer,
    // Team-Permissions
    updateDefaultMemberPermissions,
    getDefaultMemberPermissions
  } = useProfile(freelancerId, agencyId);

  // === Team Logic (interne Mitarbeiter) ===
  const {
    teamMembers,
    teamAbsences,
    absenceRequests,
    teamAssignments,
    createMember: addMember,
    updateMember,
    deleteMember: removeMember,
    addAbsence,
    removeAbsence,
    createAbsenceRequest: requestAbsence,
    approveAbsenceRequest,
    rejectAbsenceRequest,
    createAssignment: addTeamAssignment,
    removeAssignment: removeTeamAssignment,
    checkConflicts: checkTeamConflicts,
    getMemberUtilization: getUtilization,
    getMemberAvailabilityRange: getAvailability,
    getAbsencesForMember,
    getAssignmentsForMember
  } = useTeam(agencyId);

  // Anzahl der offenen Abwesenheitsanfragen für Badge
  const pendingAbsenceRequestsCount = absenceRequests.filter(r => r.status === 'pending').length;

  // === Booking Logic ===
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
    cancelProjectBookings,
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

  // === Messaging Logic ===
  const {
    chats,
    getOrCreateChat,
    getChatById,
    getChatsForAgency,
    getChatsForFreelancer,
    getUnreadCount,
    markChatAsRead,
    sendMessage,
    sendBookingRef,
    updateBookingRefStatus,
    findChatForBooking
  } = useMessages();

  // Message Unread Counts
  const freelancerUnreadMessages = useMemo(() =>
    getUnreadCount(freelancerId, 'freelancer'),
    [chats, freelancerId, getUnreadCount]
  );

  const agencyUnreadMessages = useMemo(() =>
    getUnreadCount(agencyId, 'agency'),
    [chats, agencyId, getUnreadCount]
  );

  // Gefilterte Benachrichtigungen
  const roleNotifications = useMemo(() =>
    notifications.filter(n => n.forRole === userRole),
    [notifications, userRole]
  );

  const unreadNotificationCount = useMemo(() =>
    roleNotifications.filter(n => !n.read).length,
    [roleNotifications]
  );

  // Ungelesene Buchungs-Notifications für Freelancer (z.B. Option zu Fix umgewandelt)
  const freelancerBookingNotificationsCount = useMemo(() => {
    if (userRole !== USER_ROLES.FREELANCER) return 0;
    // Zähle ungelesene Notifications für Freelancer
    const bookingTypes = ['option_to_fix'];
    return notifications.filter(n =>
      n.forRole === 'freelancer' &&
      !n.read &&
      bookingTypes.includes(n.type)
    ).length;
  }, [notifications, userRole]);

  const navBadgeCount = pendingBookingsCount + rescheduleRequestsCount + freelancerBookingNotificationsCount;

  // Ungelesene Buchungs-Notifications für Agentur
  const agencyBookingNotificationsCount = useMemo(() => {
    if (userRole !== USER_ROLES.AGENCY) return 0;
    // Zähle ungelesene Notifications, die mit Buchungen zu tun haben
    const bookingTypes = ['confirmed', 'declined', 'cancelled', 'option_overtaken', 'reschedule_confirmed', 'reschedule_declined'];
    return notifications.filter(n =>
      n.forRole === 'agency' &&
      !n.read &&
      bookingTypes.includes(n.type)
    ).length;
  }, [notifications, userRole]);

  // === Event Handlers ===
  const handleRoleChange = (newRole) => {
    if (!confirmNavigation()) return;
    setUserRole(newRole);
    setCurrentView('dashboard');
    setShowNotifications(false);
    setSelectedProjectId(null);
    setSelectedPhaseId(null);
    setSelectedChatId(null);
    setSelectedClientId(null);
    setShowClientForm(false);
    setEditingClient(null);
  };

  const handleOpenCancelModal = (booking) => {
    setCancelModalBooking(booking);
  };

  const handleCancelBooking = (booking, reason) => {
    handleCancelBookingWithSync(booking, reason, userRole);
    setCancelModalBooking(null);
  };

  const handleOpenRescheduleModal = (booking) => {
    setRescheduleModalBooking(booking);
  };

  const handleRescheduleRequest = (booking, newDates) => {
    requestReschedule(booking, newDates);
    setRescheduleModalBooking(null);
  };

  const handleOpenAddToListModal = (freelancerId) => {
    setAddToListFreelancerId(freelancerId);
    setAddToListModalOpen(true);
  };

  // === Messaging Handlers ===
  const handleSelectChat = (chatId) => {
    setSelectedChatId(chatId);
    const chat = getChatById(chatId);
    if (chat) {
      const currentUserType = userRole === USER_ROLES.FREELANCER ? 'freelancer' : 'agency';
      markChatAsRead(chatId, currentUserType);
    }
  };

  const handleSendChatMessage = (text) => {
    if (!selectedChatId) return;
    const senderType = userRole === USER_ROLES.FREELANCER ? 'freelancer' : 'agency';
    const senderId = userRole === USER_ROLES.FREELANCER ? freelancerId : agencyId;
    const senderName = userRole === USER_ROLES.FREELANCER
      ? `${freelancerProfile?.firstName} ${freelancerProfile?.lastName}`
      : agencyProfile?.name || 'Agentur';
    sendMessage(selectedChatId, senderId, senderType, senderName, text);
  };

  // === Chat/Booking Handlers ===
  const handleOpenBookingFromChat = () => {
    // Öffne Buchungsmodal für den Freelancer aus dem aktuellen Chat
    const chat = getChatById(selectedChatId);
    if (chat) {
      const freelancer = freelancers.find(f => f.id === chat.freelancerId);
      if (freelancer) {
        setBookFromProfileFreelancer(freelancer);
      }
    }
  };

  const handleOpenChatFromCrew = (freelancerIdToChat) => {
    // Finde oder erstelle Chat und öffne ihn
    const freelancer = freelancers.find(f => f.id === freelancerIdToChat);
    if (!freelancer) return;

    const chat = getOrCreateChat(
      agencyId,
      agencyProfile?.name || 'Agentur',
      agencyProfile?.profileImage || null,
      freelancerIdToChat,
      `${freelancer.firstName} ${freelancer.lastName}`,
      freelancer.profileImage || null
    );

    setCurrentView('messages');
    setSelectedChatId(chat.id);
  };

  const handleOpenBooking = (bookingId) => {
    // Navigiere zur Buchungs-Ansicht
    setCurrentView('bookings');
    // TODO: Scroll to booking or open booking detail
  };

  // === Booking + Chat Sync Handlers ===

  /**
   * Wrapper für createBooking - sendet automatisch booking_ref in Chat
   */
  const handleCreateBooking = (freelancer, dates, requestType, project, phase, rateInfo = {}) => {
    const result = createBooking(freelancer, dates, requestType, project, phase, rateInfo);

    // Anfragen erscheinen nur im Anfragen-Tab, NICHT als Chat-Nachricht
    // (Der Freelancer sieht die Anfrage im Anfragen-Tab mit allen Details)

    return result;
  };

  /**
   * Wrapper für acceptBooking - synct Status in Chat
   */
  const handleAcceptBooking = (booking) => {
    const result = acceptBooking(booking);

    if (result.success) {
      // Sync Status in Chat
      const chat = findChatForBooking(booking.agencyId, booking.freelancerId);
      if (chat) {
        updateBookingRefStatus(chat.id, booking.id, result.newStatus);
      }
    }

    return result;
  };

  /**
   * Wrapper für declineBooking - synct Status in Chat
   */
  const handleDeclineBooking = (booking) => {
    const result = declineBooking(booking);

    if (result.success) {
      const chat = findChatForBooking(booking.agencyId, booking.freelancerId);
      if (chat) {
        updateBookingRefStatus(chat.id, booking.id, 'declined');
      }
    }

    return result;
  };

  /**
   * Wrapper für convertOptionToFix - synct Status in Chat
   */
  const handleConvertToFix = (booking) => {
    const result = convertOptionToFix(booking);

    if (result.success) {
      const chat = findChatForBooking(booking.agencyId, booking.freelancerId);
      if (chat) {
        updateBookingRefStatus(chat.id, booking.id, 'fix_confirmed');
      }
    }

    return result;
  };

  /**
   * Wrapper für cancelBooking - synct Status in Chat
   */
  const handleCancelBookingWithSync = (booking, reason, cancelledByRole) => {
    const result = cancelBooking(booking, reason, cancelledByRole);

    if (result.success) {
      const chat = findChatForBooking(booking.agencyId, booking.freelancerId);
      if (chat) {
        updateBookingRefStatus(chat.id, booking.id, 'cancelled');
      }
    }

    return result;
  };

  /**
   * Wrapper für withdrawBooking - synct Status in Chat
   */
  const handleWithdrawBooking = (booking) => {
    const result = withdrawBooking(booking);

    if (result.success) {
      const chat = findChatForBooking(booking.agencyId, booking.freelancerId);
      if (chat) {
        updateBookingRefStatus(chat.id, booking.id, 'withdrawn');
      }
    }

    return result;
  };

  // Finance Dashboard View
  if (showFinanceDashboard) {
    return (
      <Dashboard onBack={() => setShowFinanceDashboard(false)} />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Sidebar */}
      <Sidebar
        userRole={userRole}
        currentView={currentView}
        onViewChange={(view) => {
          // Blockiere Navigation wenn ungespeicherte Änderungen vorhanden sind
          if (!confirmNavigation()) return;

          setCurrentView(view);
          setSelectedProjectId(null);
          setSelectedPhaseId(null);
          setSelectedFreelancerId(null);
          setSelectedChatId(null);
          setFreelancerSelectedProjectId(null);
          setFreelancerSelectedPhaseId(null);
          setSelectedClientId(null);
          setShowClientForm(false);
          setEditingClient(null);
          // Markiere Buchungs-Notifications als gelesen wenn Agentur auf Buchungen klickt
          if (view === 'bookings' && userRole === USER_ROLES.AGENCY) {
            const bookingTypes = ['confirmed', 'declined', 'cancelled', 'option_overtaken', 'reschedule_confirmed', 'reschedule_declined'];
            notifications
              .filter(n => n.forRole === 'agency' && !n.read && bookingTypes.includes(n.type))
              .forEach(n => markNotificationAsRead(n.id));
          }
          // Markiere Freelancer-Notifications als gelesen wenn Freelancer auf Buchungen klickt
          if (view === 'requests' && userRole === USER_ROLES.FREELANCER) {
            const bookingTypes = ['option_to_fix'];
            notifications
              .filter(n => n.forRole === 'freelancer' && !n.read && bookingTypes.includes(n.type))
              .forEach(n => markNotificationAsRead(n.id));
          }
        }}
        badgeCount={navBadgeCount}
        messageBadgeCount={userRole === USER_ROLES.FREELANCER ? freelancerUnreadMessages : agencyUnreadMessages}
        bookingsBadgeCount={agencyBookingNotificationsCount}
        teamBadgeCount={pendingAbsenceRequestsCount}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div className={`
        transition-all duration-300 ease-in-out
        ${sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[260px]'}
      `}>
        {/* Header */}
        <Header
          userRole={userRole}
          onRoleChange={handleRoleChange}
          notifications={roleNotifications}
          unreadCount={unreadNotificationCount}
          showNotifications={showNotifications}
          onToggleNotifications={() => setShowNotifications(!showNotifications)}
          onMarkAllAsRead={() => markNotificationsAsRead(userRole)}
          onMarkAsRead={markNotificationAsRead}
          freelancerId={freelancerId}
          agencyId={agencyId}
          freelancers={freelancers}
          agencies={agencies}
          onFreelancerChange={setFreelancerId}
          onAgencyChange={setAgencyId}
          onOpenSidebar={() => setSidebarOpen(true)}
        />

        {/* Page Content */}
        <main className="p-4 lg:p-8 max-w-screen-2xl">
          {/* Freelancer Views */}
          {userRole === USER_ROLES.FREELANCER && currentView === 'dashboard' && (
            <FreelancerHomeDashboard
              bookings={bookings}
              freelancerId={freelancerId}
              freelancerProfile={freelancerProfile}
              currentDate={currentDate}
              getDayStatus={getDayStatus}
              onAccept={handleAcceptBooking}
              onDecline={handleDeclineBooking}
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
              onAccept={handleAcceptBooking}
              onDecline={handleDeclineBooking}
              onCancel={handleOpenCancelModal}
              onAcceptReschedule={acceptReschedule}
              onDeclineReschedule={declineReschedule}
              onNavigateToProject={(projectId, phaseId) => {
                setFreelancerSelectedProjectId(projectId);
                setFreelancerSelectedPhaseId(phaseId);
                setCurrentView('projects');
              }}
            />
          )}

          {userRole === USER_ROLES.FREELANCER && currentView === 'projects' && (
            <FreelancerProjects
              bookings={bookings}
              projects={projects}
              freelancers={freelancers}
              freelancerId={freelancerId}
              initialProjectId={freelancerSelectedProjectId}
              initialPhaseId={freelancerSelectedPhaseId}
            />
          )}

          {userRole === USER_ROLES.FREELANCER && currentView === 'calendar' && (
            <FreelancerCalendar
              currentDate={currentDate}
              onDateChange={setCurrentDate}
              getDayStatus={getDayStatus}
              freelancerId={freelancerId}
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
              onAddTag={addTag}
              onRemoveTag={removeTag}
              onAddPortfolioItem={addPortfolioItem}
              onUpdatePortfolioItem={updatePortfolioItem}
              onRemovePortfolioItem={removePortfolioItem}
              onUpdateSocialMedia={updateSocialMedia}
              onToggleVisibility={toggleVisibility}
            />
          )}

          {/* Freelancer Messages View */}
          {userRole === USER_ROLES.FREELANCER && currentView === 'messages' && !selectedChatId && (
            <div className="max-w-2xl mx-auto">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Nachrichten
              </h1>
              <ChatList
                chats={getChatsForFreelancer(freelancerId)}
                currentUserId={freelancerId}
                currentUserType="freelancer"
                onSelectChat={handleSelectChat}
              />
            </div>
          )}

          {userRole === USER_ROLES.FREELANCER && currentView === 'messages' && selectedChatId && (
            <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <ChatView
                chat={getChatById(selectedChatId)}
                currentUserId={freelancerId}
                currentUserType="freelancer"
                onBack={() => setSelectedChatId(null)}
                onSendMessage={handleSendChatMessage}
                onOpenBooking={handleOpenBooking}
                onMarkAsRead={(chatId, userType) => markChatAsRead(chatId, userType)}
              />
            </div>
          )}

          {/* Agency Views */}
          {userRole === USER_ROLES.AGENCY && currentView === 'dashboard' && !selectedProject && (
            <AgencyHomeDashboard
              projects={projects}
              bookings={bookings}
              freelancers={freelancers}
              agencyId={agencyId}
              onSelectProject={setSelectedProjectId}
              onConvertToFix={handleConvertToFix}
              onViewBookings={() => setCurrentView('bookings')}
              onViewProjects={() => setCurrentView('projects')}
              onAddProject={() => setCurrentView('projects')}
            />
          )}

          {userRole === USER_ROLES.AGENCY && currentView === 'projects' && !selectedProject && (
            <AgencyProjects
              projects={projects}
              bookings={bookings}
              agencyId={agencyId}
              clients={clients}
              onAddProject={addProject}
              onUpdateProject={updateProject}
              onSelectProject={setSelectedProjectId}
              onCreateClient={() => {
                setCurrentView('clients');
                setShowClientForm(true);
              }}
            />
          )}

          {userRole === USER_ROLES.AGENCY && (currentView === 'dashboard' || currentView === 'projects') && selectedProject && !selectedPhase && (
            <ProjectDetail
              project={selectedProject}
              bookings={bookings}
              freelancers={freelancers}
              agencyId={agencyId}
              agencyProfile={agencyProfile}
              getDayStatus={getDayStatus}
              onBack={() => setSelectedProjectId(null)}
              onBackToProjects={() => setSelectedProjectId(null)}
              onBook={handleCreateBooking}
              onConvertToFix={handleConvertToFix}
              onWithdraw={handleWithdrawBooking}
              onUpdateProject={updateProject}
              onDeleteProject={deleteProject}
              onCancelProjectBookings={cancelProjectBookings}
              onAddPhase={addPhase}
              onUpdatePhase={updatePhase}
              onDeletePhase={deletePhase}
              onSelectPhase={(phase) => setSelectedPhaseId(phase.id)}
              isFavorite={isFavorite}
              onToggleFavorite={toggleFavorite}
              crewLists={getAgencyCrewLists()}
              getListsForFreelancer={getListsForFreelancer}
              onAddToList={addToCrewList}
              onRemoveFromList={removeFromCrewList}
              onOpenAddToListModal={handleOpenAddToListModal}
              getOrCreateChat={getOrCreateChat}
              onOpenChat={(chatId) => {
                setCurrentView('messages');
                setSelectedChatId(chatId);
              }}
              client={selectedProject?.clientId ? getClientById(selectedProject.clientId) : null}
              onNavigateToClient={(clientId) => {
                setSelectedProjectId(null);
                setSelectedClientId(clientId);
                setCurrentView('clients');
              }}
              // Team Props (interne Mitarbeiter)
              teamMembers={teamMembers}
              teamAssignments={teamAssignments}
              onAddTeamAssignment={addTeamAssignment}
              onRemoveTeamAssignment={removeTeamAssignment}
              checkTeamConflicts={checkTeamConflicts}
            />
          )}

          {userRole === USER_ROLES.AGENCY && (currentView === 'dashboard' || currentView === 'projects') && selectedProject && selectedPhase && (
            <PhaseDetail
              project={selectedProject}
              phase={selectedPhase}
              bookings={bookings}
              freelancers={freelancers}
              agencyId={agencyId}
              agencyProfile={agencyProfile}
              getDayStatus={getDayStatus}
              onBack={() => setSelectedPhaseId(null)}
              onBackToProjects={() => {
                setSelectedProjectId(null);
                setSelectedPhaseId(null);
              }}
              onBook={handleCreateBooking}
              onConvertToFix={handleConvertToFix}
              onWithdraw={handleWithdrawBooking}
              onReschedule={setRescheduleModalBooking}
              onUpdatePhase={updatePhase}
              isFavorite={isFavorite}
              onToggleFavorite={toggleFavorite}
              crewLists={getAgencyCrewLists()}
              getListsForFreelancer={getListsForFreelancer}
              onAddToList={addToCrewList}
              onRemoveFromList={removeFromCrewList}
              onOpenAddToListModal={handleOpenAddToListModal}
              getOrCreateChat={getOrCreateChat}
              onOpenChat={(chatId) => {
                setCurrentView('messages');
                setSelectedChatId(chatId);
              }}
            />
          )}

          {userRole === USER_ROLES.AGENCY && currentView === 'bookings' && (
            <AgencyBookings
              bookings={bookings}
              agencyId={agencyId}
              onWithdraw={handleWithdrawBooking}
              onConvertToFix={handleConvertToFix}
              onReschedule={handleOpenRescheduleModal}
              onCancel={handleOpenCancelModal}
              onWithdrawReschedule={withdrawReschedule}
              onNavigateToProject={(projectId) => {
                setSelectedProjectId(projectId);
                setSelectedPhaseId(null);
                setCurrentView('projects');
              }}
              onNavigateToPhase={(projectId, phaseId) => {
                setSelectedProjectId(projectId);
                setSelectedPhaseId(phaseId);
                setCurrentView('projects');
              }}
            />
          )}

          {/* Client (CRM) Views */}
          {userRole === USER_ROLES.AGENCY && currentView === 'clients' && !selectedClientId && (
            <ClientList
              clients={getClientsWithStats(projects)}
              onSelectClient={setSelectedClientId}
              onCreateClient={() => setShowClientForm(true)}
              onToggleFavorite={toggleClientFavorite}
            />
          )}

          {userRole === USER_ROLES.AGENCY && currentView === 'clients' && selectedClientId && (
            <ClientDetail
              client={getClientById(selectedClientId)}
              projects={getProjectsByClient(selectedClientId)}
              onBack={() => setSelectedClientId(null)}
              onSaveClient={(updatedData) => updateClient(selectedClientId, updatedData)}
              onDelete={() => {
                deleteClient(selectedClientId);
                setSelectedClientId(null);
              }}
              onToggleFavorite={() => toggleClientFavorite(selectedClientId)}
              onAddContact={(contact) => addContact(selectedClientId, contact)}
              onEditContact={(contactId, contact) => updateContact(selectedClientId, contactId, contact)}
              onRemoveContact={(contactId) => removeContact(selectedClientId, contactId)}
              onSetPrimaryContact={(contactId) => setPrimaryContact(selectedClientId, contactId)}
              onNavigateToProject={(projectId) => {
                setSelectedProjectId(projectId);
                setCurrentView('projects');
              }}
            />
          )}

          {/* Agency Team View (interne Mitarbeiter) */}
          {userRole === USER_ROLES.AGENCY && currentView === 'team' && (
            <TeamList
              teamMembers={teamMembers}
              teamAbsences={teamAbsences}
              teamAssignments={teamAssignments}
              teamHandlers={{
                addMember,
                updateMember,
                removeMember,
                addAbsence,
                removeAbsence,
                requestAbsence,
                approveAbsenceRequest,
                rejectAbsenceRequest
              }}
              absenceRequests={absenceRequests}
              agencyDefaults={getDefaultMemberPermissions()}
              updateDefaultMemberPermissions={updateDefaultMemberPermissions}
              getUtilization={getUtilization}
              getAbsencesForMember={getAbsencesForMember}
              getAssignmentsForMember={getAssignmentsForMember}
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

          {userRole === USER_ROLES.AGENCY && currentView === 'crew' && (
            <CrewListsPage
              freelancers={freelancers}
              favorites={getAgencyFavorites()}
              crewLists={getAgencyCrewLists()}
              onToggleFavorite={toggleFavorite}
              onCreateList={createCrewList}
              onDeleteList={deleteCrewList}
              onRenameList={renameCrewList}
              onUpdateListColor={updateCrewListColor}
              onAddToList={addToCrewList}
              onRemoveFromList={removeFromCrewList}
              onOpenAddToListModal={handleOpenAddToListModal}
              onOpenAddFreelancerModal={(listId) => setAddFreelancerModalListId(listId || 'favorites')}
              onOpenChat={handleOpenChatFromCrew}
              onSelectFreelancer={(id) => {
                setSelectedFreelancerId(id);
                setCurrentView('freelancer-search');
              }}
              isFavorite={isFavorite}
              getListsForFreelancer={getListsForFreelancer}
            />
          )}

          {userRole === USER_ROLES.AGENCY && currentView === 'freelancer-search' && !selectedFreelancerId && (
            <AgencyFreelancerSearch
              freelancers={freelancers}
              bookings={bookings}
              agencyId={agencyId}
              getDayStatus={getDayStatus}
              isFavorite={isFavorite}
              onToggleFavorite={toggleFavorite}
              onSelectFreelancer={setSelectedFreelancerId}
              onOpenAddToListModal={handleOpenAddToListModal}
            />
          )}

          {userRole === USER_ROLES.AGENCY && currentView === 'freelancer-search' && selectedFreelancerId && (
            <FreelancerProfileView
              freelancer={freelancers.find(f => f.id === selectedFreelancerId)}
              bookings={bookings}
              projects={projects}
              agencyId={agencyId}
              agencyProfile={agencyProfile}
              getDayStatus={getDayStatus}
              isFavorite={isFavorite}
              onToggleFavorite={toggleFavorite}
              onBack={() => setSelectedFreelancerId(null)}
              onOpenBookingModal={setBookFromProfileFreelancer}
              onOpenAddToListModal={handleOpenAddToListModal}
              getOrCreateChat={getOrCreateChat}
              onOpenChat={(chatId) => {
                setCurrentView('messages');
                setSelectedChatId(chatId);
              }}
              crewLists={getAgencyCrewLists()}
              getListsForFreelancer={getListsForFreelancer}
            />
          )}

          {/* Agency Messages View */}
          {userRole === USER_ROLES.AGENCY && currentView === 'messages' && !selectedChatId && (
            <div className="max-w-2xl mx-auto">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Nachrichten
              </h1>
              <ChatList
                chats={getChatsForAgency(agencyId)}
                currentUserId={agencyId}
                currentUserType="agency"
                onSelectChat={handleSelectChat}
              />
            </div>
          )}

          {userRole === USER_ROLES.AGENCY && currentView === 'messages' && selectedChatId && (
            <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <ChatView
                chat={getChatById(selectedChatId)}
                currentUserId={agencyId}
                currentUserType="agency"
                onBack={() => setSelectedChatId(null)}
                onSendMessage={handleSendChatMessage}
                onOpenBookingFlow={handleOpenBookingFromChat}
                onOpenBooking={handleOpenBooking}
                onMarkAsRead={(chatId, userType) => markChatAsRead(chatId, userType)}
              />
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <CancelBookingModal
        booking={cancelModalBooking}
        onCancel={handleCancelBooking}
        onClose={() => setCancelModalBooking(null)}
      />

      <RescheduleBookingModal
        booking={rescheduleModalBooking}
        projects={projects}
        getDayStatus={getDayStatus}
        agencyId={agencyId}
        onReschedule={handleRescheduleRequest}
        onClose={() => setRescheduleModalBooking(null)}
      />

      <AddToListModal
        isOpen={addToListModalOpen}
        onClose={() => {
          setAddToListModalOpen(false);
          setAddToListFreelancerId(null);
        }}
        onCreateList={createCrewList}
        onAddToList={addToCrewList}
        freelancerId={addToListFreelancerId}
        freelancer={addToListFreelancerId ? freelancers.find(f => f.id === addToListFreelancerId) : null}
      />

      <BookFromProfileModal
        isOpen={!!bookFromProfileFreelancer}
        freelancer={bookFromProfileFreelancer}
        projects={projects}
        agencyId={agencyId}
        getDayStatus={getDayStatus}
        onBook={handleCreateBooking}
        onAddProject={addProject}
        onAddPhase={addPhase}
        onClose={() => setBookFromProfileFreelancer(null)}
      />

      <AddFreelancerToCrewModal
        isOpen={addFreelancerModalListId !== null}
        onClose={() => setAddFreelancerModalListId(null)}
        freelancers={freelancers}
        onToggleFavorite={toggleFavorite}
        onAddToList={addToCrewList}
        onOpenChat={handleOpenChatFromCrew}
        isFavorite={isFavorite}
        getListsForFreelancer={getListsForFreelancer}
        initialListId={addFreelancerModalListId === 'favorites' ? null : addFreelancerModalListId}
      />

      {/* Client Form Modal */}
      {showClientForm && (
        <ClientForm
          client={editingClient}
          onSave={(clientData) => {
            if (editingClient) {
              updateClient(editingClient.id, clientData);
            } else {
              const newClient = createClient(clientData);
              setSelectedClientId(newClient.id);
            }
            setShowClientForm(false);
            setEditingClient(null);
          }}
          onCancel={() => {
            setShowClientForm(false);
            setEditingClient(null);
          }}
        />
      )}
    </div>
  );
};

/**
 * App - Wrapper mit UnsavedChangesProvider
 */
const App = () => {
  return (
    <UnsavedChangesProvider>
      <AppContent />
    </UnsavedChangesProvider>
  );
};

export default App;
