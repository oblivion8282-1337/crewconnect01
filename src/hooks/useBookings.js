import { useState, useCallback, useMemo } from 'react';
import { getFreelancerById, getAgencyById } from '../data/initialData';
import {
  BOOKING_STATUS,
  isPendingStatus,
  isConfirmedStatus,
  isOptionStatus,
  isTerminalStatus
} from '../constants/calendar';

/**
 * Custom Hook für die Verwaltung von Buchungen
 *
 * NEUE BUCHUNGSLOGIK (Stand: Dezember 2024)
 * - Status ist EIN Feld (option_pending, option_confirmed, fix_pending, fix_confirmed, etc.)
 * - Kein separates type-Feld mehr
 * - Lila für pending, Gelb für Option bestätigt, Rot für Fix bestätigt
 * - openForMore ist Flag am Tag, nicht an Buchung
 *
 * @param {number} freelancerId - ID des aktuellen Freelancers
 * @param {number} agencyId - ID der aktuellen Agentur
 */
export const useBookings = (freelancerId, agencyId) => {
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [blockedDays, setBlockedDays] = useState({});
  // openForMore ist jetzt am Tag, nicht an der Buchung
  const [openForMoreDays, setOpenForMoreDays] = useState({});

  // Lade Profildaten für den aktuellen Benutzer
  const currentFreelancer = getFreelancerById(freelancerId);
  const currentAgency = getAgencyById(agencyId);

  const freelancerName = currentFreelancer
    ? `${currentFreelancer.firstName} ${currentFreelancer.lastName}`.trim()
    : 'Freelancer';
  const agencyName = currentAgency?.name || 'Agentur';
  const agencyAvatar = currentAgency?.logo || '🎬';

  // === Benachrichtigungen ===

  const addNotification = useCallback((forRole, type, title, message, bookingId) => {
    const newNotification = {
      id: Date.now(),
      forRole,
      read: false,
      createdAt: new Date().toISOString(),
      type,
      title,
      message,
      bookingId
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const markNotificationsAsRead = useCallback((userRole) => {
    setNotifications(prev =>
      prev.map(n => n.forRole === userRole ? { ...n, read: true } : n)
    );
  }, []);

  const markNotificationAsRead = useCallback((notificationId) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  }, []);

  // === Status-Ermittlung ===

  /**
   * Ermittelt den Status eines Tages für den Kalender
   *
   * SICHTBARKEITSMATRIX:
   * | Zustand                    | Freelancer | Agentur MIT Anfrage | Agentur OHNE Anfrage |
   * |----------------------------|------------|---------------------|----------------------|
   * | Verfügbar                  | 🟢 grün    | 🟢 grün             | 🟢 grün              |
   * | Anfrage pending            | 🟣 lila    | 🟣 lila             | 🟢 grün              |
   * | Option bestätigt           | 🟡 gelb    | 🟡 gelb             | 🟢 grün              |
   * | Fix bestätigt              | 🔴 rot     | 🔴 rot              | 🔴 rot               |
   * | Fix bestätigt + offen      | 🔴🟢 gestr.| 🔴 rot              | 🟢 grün              |
   * | Selbst geblockt            | 🔴 rot     | -                   | 🔴 rot               |
   * | Selbst geblockt + offen    | 🔴🟢 gestr.| -                   | 🟢 grün              |
   */
  const getDayStatus = useCallback((forFreelancerId, date, forAgencyId = null, excludeBookingId = null) => {
    const targetFreelancerId = forFreelancerId || freelancerId;
    const isFreelancerView = !forAgencyId;

    // === SELBST-BLOCKIERUNG ===
    if (targetFreelancerId === freelancerId) {
      const blockedDay = blockedDays[date];

      if (blockedDay?.type === 'blocked') {
        // Komplett geblockt → ROT für alle
        return {
          status: 'blocked',
          color: 'red',
          bookable: false,
          isBlocked: true,
          hasBooking: false
        };
      }

      if (blockedDay?.type === 'blocked-open') {
        // Geblockt aber offen für Anfragen
        if (isFreelancerView) {
          return {
            status: 'blocked-open',
            color: 'striped',
            bookable: true,
            isBlocked: true,
            hasBooking: false
          };
        } else {
          // Agenturen sehen: GRÜN (können anfragen)
          return {
            status: 'available',
            color: 'green',
            bookable: true,
            isBlocked: false,
            hasBooking: false
          };
        }
      }
    }

    // === BUCHUNGEN FINDEN ===
    const dayBookings = bookings.filter(b =>
      b.freelancerId === targetFreelancerId &&
      b.id !== excludeBookingId &&
      b.dates.includes(date) &&
      !isTerminalStatus(b.status)
    );

    // Keine Buchungen → GRÜN
    if (!dayBookings.length) {
      return {
        status: 'available',
        color: 'green',
        bookable: true,
        isBlocked: false,
        hasBooking: false
      };
    }

    // === FIX BESTÄTIGT ===
    const confirmedFix = dayBookings.find(b => b.status === BOOKING_STATUS.FIX_CONFIRMED);

    if (confirmedFix) {
      const isOpenForMore = openForMoreDays[date];

      if (isFreelancerView) {
        // Freelancer sieht: ROT oder gestreift wenn offen
        return {
          status: isOpenForMore ? 'fix-open' : 'fix-confirmed',
          color: isOpenForMore ? 'striped' : 'red',
          bookable: isOpenForMore,
          isBlocked: false,
          hasBooking: true,
          booking: confirmedFix
        };
      } else {
        // Agentur-Sicht
        if (forAgencyId === confirmedFix.agencyId) {
          // MEINE Fix-Buchung → ROT
          return {
            status: 'fix-confirmed',
            color: 'red',
            bookable: false,
            isBlocked: false,
            hasBooking: true,
            booking: confirmedFix
          };
        } else if (isOpenForMore) {
          // ANDERE Agentur + offen → GRÜN
          return {
            status: 'available',
            color: 'green',
            bookable: true,
            isBlocked: false,
            hasBooking: false
          };
        } else {
          // ANDERE Agentur + nicht offen → ROT
          return {
            status: 'fix-confirmed',
            color: 'red',
            bookable: false,
            isBlocked: false,
            hasBooking: true,
            booking: confirmedFix
          };
        }
      }
    }

    // === OPTION BESTÄTIGT (kein Fix) ===
    const confirmedOption = dayBookings.find(b => b.status === BOOKING_STATUS.OPTION_CONFIRMED);

    if (confirmedOption) {
      if (isFreelancerView) {
        // Freelancer sieht: GELB
        return {
          status: 'option-confirmed',
          color: 'yellow',
          bookable: false,
          isBlocked: false,
          hasBooking: true,
          bookings: dayBookings
        };
      } else {
        // Agentur-Sicht
        const myBooking = dayBookings.find(b => b.agencyId === forAgencyId);
        if (myBooking) {
          // MEINE Option → GELB
          return {
            status: 'option-confirmed',
            color: 'yellow',
            bookable: false,
            isBlocked: false,
            hasBooking: true,
            booking: myBooking
          };
        } else {
          // Andere Agentur → GRÜN (Optionen sind privat!)
          return {
            status: 'available',
            color: 'green',
            bookable: true,
            isBlocked: false,
            hasBooking: false
          };
        }
      }
    }

    // === PENDING ANFRAGEN (Option oder Fix pending) ===
    const pendingBookings = dayBookings.filter(b => isPendingStatus(b.status));

    if (pendingBookings.length > 0) {
      if (isFreelancerView) {
        // Freelancer sieht: LILA
        return {
          status: 'pending',
          color: 'purple',
          bookable: false,
          isBlocked: false,
          hasBooking: true,
          bookings: pendingBookings
        };
      } else {
        // Agentur-Sicht
        const myBooking = pendingBookings.find(b => b.agencyId === forAgencyId);
        if (myBooking) {
          // MEINE pending Anfrage → LILA
          return {
            status: 'pending',
            color: 'purple',
            bookable: false,
            isBlocked: false,
            hasBooking: true,
            booking: myBooking
          };
        } else {
          // Andere Agentur → GRÜN (pending ist privat!)
          return {
            status: 'available',
            color: 'green',
            bookable: true,
            isBlocked: false,
            hasBooking: false
          };
        }
      }
    }

    // Fallback: GRÜN
    return {
      status: 'available',
      color: 'green',
      bookable: true,
      isBlocked: false,
      hasBooking: false
    };
  }, [bookings, blockedDays, openForMoreDays, freelancerId]);

  /**
   * Findet überlappende Buchungen für Konflikt-Warnung
   */
  const getOverlappingBookings = useCallback((dates, excludeId) => {
    return bookings.filter(b =>
      b.freelancerId === freelancerId &&
      b.id !== excludeId &&
      (isPendingStatus(b.status) || b.status === BOOKING_STATUS.OPTION_CONFIRMED) &&
      b.dates.some(d => dates.includes(d))
    );
  }, [bookings, freelancerId]);

  // === Buchungs-Handler ===

  /**
   * Erstellt eine neue Buchungsanfrage
   * @param {string} requestType - 'option' oder 'fix'
   */
  const createBooking = useCallback((freelancer, dates, requestType, project, phase, rateInfo = {}) => {
    const rateType = rateInfo.rateType || 'daily';
    const dayRate = rateInfo.dayRate || freelancer.dayRate || 0;
    const flatRate = rateInfo.flatRate || 0;
    const totalCost = rateInfo.totalCost || (rateType === 'daily' ? dayRate * dates.length : flatRate);

    // Neuer Status basierend auf requestType
    const status = requestType === 'fix'
      ? BOOKING_STATUS.FIX_PENDING
      : BOOKING_STATUS.OPTION_PENDING;

    const newBooking = {
      id: Date.now(),
      status,
      agencyId,
      agencyName,
      agencyAvatar,
      projectId: project.id,
      projectName: project.name,
      phaseId: phase.id,
      phaseName: phase.name,
      freelancerId: freelancer.id,
      freelancerName: `${freelancer.firstName || ''} ${freelancer.lastName || ''}`.trim(),
      dates,
      rateType,
      dayRate,
      flatRate,
      totalCost,
      requestedAt: new Date().toISOString()
    };

    setBookings(prev => [...prev, newBooking]);

    const notificationTitle = requestType === 'fix'
      ? 'Neue Fix-Anfrage! 🔥'
      : 'Neue Option-Anfrage';

    addNotification(
      'freelancer',
      'new_request',
      notificationTitle,
      `${agencyName}: "${project.name}" (${dates.length} Tage)`,
      newBooking.id
    );
  }, [addNotification, agencyId, agencyName, agencyAvatar]);

  /**
   * Freelancer bestätigt eine Anfrage
   */
  const acceptBooking = useCallback((booking) => {
    // Bestimme neuen Status basierend auf aktuellem Status
    let newStatus;
    if (booking.status === BOOKING_STATUS.OPTION_PENDING) {
      newStatus = BOOKING_STATUS.OPTION_CONFIRMED;
    } else if (booking.status === BOOKING_STATUS.FIX_PENDING) {
      newStatus = BOOKING_STATUS.FIX_CONFIRMED;
    } else {
      // Bereits bestätigt oder ungültiger Status
      return;
    }

    setBookings(prev => prev.map(b =>
      b.id === booking.id
        ? { ...b, status: newStatus, confirmedAt: new Date().toISOString() }
        : b
    ));

    const notificationTitle = newStatus === BOOKING_STATUS.FIX_CONFIRMED
      ? 'Fixbuchung bestätigt ✓'
      : 'Option bestätigt ✓';

    addNotification(
      'agency',
      'confirmed',
      notificationTitle,
      `${freelancerName} hat "${booking.projectName}" bestätigt`,
      booking.id
    );
  }, [addNotification, freelancerName]);

  /**
   * Freelancer lehnt eine Anfrage ab
   */
  const declineBooking = useCallback((booking) => {
    setBookings(prev => prev.map(b =>
      b.id === booking.id ? { ...b, status: BOOKING_STATUS.DECLINED } : b
    ));

    addNotification(
      'agency',
      'declined',
      'Anfrage abgelehnt',
      `${freelancerName} hat "${booking.projectName}" abgelehnt`,
      booking.id
    );
  }, [addNotification, freelancerName]);

  /**
   * Agentur zieht Anfrage zurück (nur bei pending)
   */
  const withdrawBooking = useCallback((booking) => {
    if (!isPendingStatus(booking.status)) {
      console.warn('Nur pending Anfragen können zurückgezogen werden');
      return;
    }

    setBookings(prev => prev.map(b =>
      b.id === booking.id ? { ...b, status: BOOKING_STATUS.WITHDRAWN } : b
    ));

    addNotification(
      'freelancer',
      'withdrawn',
      'Anfrage zurückgezogen',
      `${booking.agencyName} hat "${booking.projectName}" zurückgezogen`,
      booking.id
    );
  }, [addNotification]);

  /**
   * Storniert eine bestätigte Buchung (von beiden Seiten möglich)
   */
  const cancelBooking = useCallback((booking, reason, cancelledByRole) => {
    if (!isConfirmedStatus(booking.status)) {
      console.warn('Nur bestätigte Buchungen können storniert werden');
      return;
    }

    const otherRole = cancelledByRole === 'freelancer' ? 'agency' : 'freelancer';
    const cancellerName = cancelledByRole === 'freelancer' ? freelancerName : booking.agencyName;

    setBookings(prev => prev.map(b =>
      b.id === booking.id
        ? {
          ...b,
          status: BOOKING_STATUS.CANCELLED,
          cancelledAt: new Date().toISOString(),
          cancelledBy: cancelledByRole,
          cancelReason: reason.trim()
        }
        : b
    ));

    addNotification(
      otherRole,
      'cancelled',
      'Buchung storniert ⚠️',
      `${cancellerName} hat "${booking.projectName}" storniert: ${reason}`,
      booking.id
    );
  }, [addNotification, freelancerName]);

  /**
   * Wandelt bestätigte Option in Fixbuchung um
   * KEINE erneute Bestätigung nötig!
   */
  const convertOptionToFix = useCallback((booking) => {
    if (booking.status !== BOOKING_STATUS.OPTION_CONFIRMED) {
      console.warn('Nur bestätigte Optionen können zu Fix umgewandelt werden');
      return;
    }

    // Direkt zu fix_confirmed - keine erneute Bestätigung!
    setBookings(prev => prev.map(b =>
      b.id === booking.id
        ? { ...b, status: BOOKING_STATUS.FIX_CONFIRMED, fixedAt: new Date().toISOString() }
        : b
    ));

    // Benachrichtigung an Freelancer
    addNotification(
      'freelancer',
      'option_to_fix',
      'Option wurde gefixt ✓',
      `${booking.agencyName} hat "${booking.projectName}" fix gebucht`,
      booking.id
    );

    // Benachrichtigung an Agentur
    addNotification(
      'agency',
      'confirmed',
      'Fixbuchung aktiv ✓',
      `"${booking.projectName}" ist jetzt fix gebucht`,
      booking.id
    );

    // Benachrichtige andere Agenturen mit überlappenden Optionen
    const overlappingOptions = bookings.filter(b =>
      b.id !== booking.id &&
      b.freelancerId === booking.freelancerId &&
      b.status === BOOKING_STATUS.OPTION_CONFIRMED &&
      b.dates.some(d => booking.dates.includes(d))
    );

    overlappingOptions.forEach(o => {
      addNotification(
        'agency',
        'option_overtaken',
        'Option überholt ⚠️',
        `Deine Option für "${o.projectName}" wurde von einer Fix-Buchung überholt`,
        o.id
      );
    });
  }, [addNotification, bookings]);

  /**
   * Lehnt alle überlappenden Anfragen ab (Convenience-Funktion)
   */
  const declineOverlappingBookings = useCallback((booking) => {
    const overlapping = getOverlappingBookings(booking.dates, booking.id);

    overlapping.forEach(o => {
      setBookings(prev => prev.map(b =>
        b.id === o.id ? { ...b, status: BOOKING_STATUS.DECLINED } : b
      ));

      addNotification(
        'agency',
        'declined',
        'Anfrage abgelehnt',
        `${freelancerName} hat "${o.projectName}" abgelehnt (Konflikt)`,
        o.id
      );
    });

    return overlapping.length;
  }, [addNotification, freelancerName, getOverlappingBookings]);

  // === Verschiebungs-Handler ===

  const requestReschedule = useCallback((booking, newDates) => {
    setBookings(prev => prev.map(b => {
      if (b.id !== booking.id) return b;

      const newTotalCost = b.rateType === 'flat'
        ? b.flatRate
        : (b.dayRate || 0) * newDates.length;

      return {
        ...b,
        reschedule: {
          newDates,
          originalDates: b.dates,
          requestedAt: new Date().toISOString(),
          newTotalCost
        }
      };
    }));

    addNotification(
      'freelancer',
      'reschedule_request',
      'Verschiebungsanfrage 📅',
      `${booking.agencyName} möchte "${booking.projectName}" verschieben: ${newDates.length} Tage`,
      booking.id
    );
  }, [addNotification]);

  const acceptReschedule = useCallback((booking) => {
    setBookings(prev => prev.map(b =>
      b.id === booking.id
        ? {
          ...b,
          dates: b.reschedule.newDates,
          totalCost: b.reschedule.newTotalCost,
          reschedule: null,
          rescheduledAt: new Date().toISOString()
        }
        : b
    ));

    addNotification(
      'agency',
      'reschedule_confirmed',
      'Verschiebung bestätigt ✓',
      `${freelancerName} hat die Verschiebung für "${booking.projectName}" bestätigt`,
      booking.id
    );
  }, [addNotification, freelancerName]);

  const declineReschedule = useCallback((booking) => {
    setBookings(prev => prev.map(b =>
      b.id === booking.id ? { ...b, reschedule: null } : b
    ));

    addNotification(
      'agency',
      'reschedule_declined',
      'Verschiebung abgelehnt',
      `${freelancerName} hat die Verschiebung für "${booking.projectName}" abgelehnt`,
      booking.id
    );
  }, [addNotification, freelancerName]);

  const withdrawReschedule = useCallback((booking) => {
    setBookings(prev => prev.map(b =>
      b.id === booking.id ? { ...b, reschedule: null } : b
    ));

    addNotification(
      'freelancer',
      'reschedule_withdrawn',
      'Verschiebung zurückgezogen',
      `${booking.agencyName} hat die Verschiebungsanfrage für "${booking.projectName}" zurückgezogen`,
      booking.id
    );
  }, [addNotification]);

  // === Tag-Verwaltung ===

  /**
   * Blockt einen Tag komplett
   */
  const blockDay = useCallback((date) => {
    // Prüfen ob es pending/bestätigte Buchungen gibt
    const hasActiveBookings = bookings.some(b =>
      b.freelancerId === freelancerId &&
      b.dates.includes(date) &&
      !isTerminalStatus(b.status)
    );

    if (hasActiveBookings) {
      console.warn('Tag hat aktive Buchungen - erst Anfragen ablehnen!');
      return false;
    }

    setBlockedDays(prev => ({ ...prev, [date]: { type: 'blocked' } }));
    return true;
  }, [bookings, freelancerId]);

  /**
   * Blockt einen Tag aber lässt Anfragen zu
   */
  const blockDayOpen = useCallback((date) => {
    const hasActiveBookings = bookings.some(b =>
      b.freelancerId === freelancerId &&
      b.dates.includes(date) &&
      !isTerminalStatus(b.status)
    );

    if (hasActiveBookings) {
      console.warn('Tag hat aktive Buchungen - erst Anfragen ablehnen!');
      return false;
    }

    setBlockedDays(prev => ({ ...prev, [date]: { type: 'blocked-open' } }));
    return true;
  }, [bookings, freelancerId]);

  /**
   * Gibt einen blockierten Tag frei
   */
  const unblockDay = useCallback((date) => {
    setBlockedDays(prev => {
      const { [date]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  /**
   * Öffnet/schließt einen Tag für weitere Anfragen (bei Fix-Buchung)
   */
  const toggleOpenForMore = useCallback((date) => {
    setOpenForMoreDays(prev => {
      if (prev[date]) {
        const { [date]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [date]: true };
    });
  }, []);

  // === Berechnete Werte ===

  const pendingBookingsCount = useMemo(() =>
    bookings.filter(b =>
      b.freelancerId === freelancerId && isPendingStatus(b.status)
    ).length,
    [bookings, freelancerId]
  );

  const rescheduleRequestsCount = useMemo(() =>
    bookings.filter(b =>
      b.freelancerId === freelancerId && b.reschedule
    ).length,
    [bookings, freelancerId]
  );

  return {
    // State
    bookings,
    notifications,
    blockedDays,
    openForMoreDays,

    // Berechnete Werte
    pendingBookingsCount,
    rescheduleRequestsCount,

    // Status-Funktionen
    getDayStatus,
    getOverlappingBookings,

    // Benachrichtigungen
    addNotification,
    markNotificationsAsRead,
    markNotificationAsRead,

    // Buchungs-Handler
    acceptBooking,
    declineBooking,
    withdrawBooking,
    cancelBooking,
    convertOptionToFix,
    createBooking,
    declineOverlappingBookings,

    // Verschiebungs-Handler
    requestReschedule,
    acceptReschedule,
    declineReschedule,
    withdrawReschedule,

    // Tag-Verwaltung
    blockDay,
    blockDayOpen,
    unblockDay,
    toggleOpenForMore
  };
};
