import React, { useState, useMemo } from 'react';

// Components
import Header from './components/Header';
import Sidebar from './components/Sidebar';
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
import CrewListsPage from './components/agency/CrewListsPage';
import AgencyFreelancerSearch from './components/agency/AgencyFreelancerSearch';
import FreelancerProfileView from './components/agency/FreelancerProfileView';
import AddToListModal from './components/modals/AddToListModal';
import AddFreelancerToCrewModal from './components/modals/AddFreelancerToCrewModal';
import BookFromProfileModal from './components/modals/BookFromProfileModal';

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
import { USER_ROLES } from './constants/calendar';

/**
 * CrewConnect - Hauptanwendung
 */
const App = () => {
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

  // === Messaging State ===
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [bookingFromChatFreelancerId, setBookingFromChatFreelancerId] = useState(null);

  // === AddFreelancerToCrewModal State ===
  const [addFreelancerModalOpen, setAddFreelancerModalOpen] = useState(false);

  // === Project Logic ===
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
    getListsForFreelancer
  } = useProfile(freelancerId, agencyId);

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

  const navBadgeCount = pendingBookingsCount + rescheduleRequestsCount;

  // === Event Handlers ===
  const handleRoleChange = (newRole) => {
    setUserRole(newRole);
    setCurrentView('dashboard');
    setShowNotifications(false);
    setSelectedProjectId(null);
    setSelectedPhaseId(null);
    setSelectedChatId(null);
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
      agencyProfile?.logo || '🎬',
      freelancerIdToChat,
      `${freelancer.firstName} ${freelancer.lastName}`,
      freelancer.avatar || '👤'
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
          setCurrentView(view);
          setSelectedProjectId(null);
          setSelectedPhaseId(null);
          setSelectedFreelancerId(null);
          setSelectedChatId(null);
        }}
        badgeCount={navBadgeCount}
        messageBadgeCount={userRole === USER_ROLES.FREELANCER ? freelancerUnreadMessages : agencyUnreadMessages}
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
              onAddProject={addProject}
            />
          )}

          {userRole === USER_ROLES.AGENCY && currentView === 'projects' && !selectedProject && (
            <AgencyProjects
              projects={projects}
              bookings={bookings}
              freelancers={freelancers}
              agencyId={agencyId}
              onConvertToFix={handleConvertToFix}
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
              onBook={handleCreateBooking}
              onConvertToFix={handleConvertToFix}
              onWithdraw={handleWithdrawBooking}
              onUpdateProject={updateProject}
              onDeleteProject={deleteProject}
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
              onBook={handleCreateBooking}
              onConvertToFix={handleConvertToFix}
              onWithdraw={handleWithdrawBooking}
              onUpdatePhase={updatePhase}
              isFavorite={isFavorite}
              onToggleFavorite={toggleFavorite}
              crewLists={getAgencyCrewLists()}
              getListsForFreelancer={getListsForFreelancer}
              onAddToList={addToCrewList}
              onRemoveFromList={removeFromCrewList}
              onOpenAddToListModal={handleOpenAddToListModal}
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
              onOpenAddFreelancerModal={() => setAddFreelancerModalOpen(true)}
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
        isOpen={addFreelancerModalOpen}
        onClose={() => setAddFreelancerModalOpen(false)}
        freelancers={freelancers}
        favorites={getAgencyFavorites()}
        crewLists={getAgencyCrewLists()}
        onToggleFavorite={toggleFavorite}
        onAddToList={addToCrewList}
        onOpenChat={handleOpenChatFromCrew}
        isFavorite={isFavorite}
        getListsForFreelancer={getListsForFreelancer}
      />
    </div>
  );
};

export default App;
