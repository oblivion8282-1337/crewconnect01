import { useState, useCallback } from 'react';
import { CLIENT_STATUS } from '../constants/clients';

/**
 * Generiert eine eindeutige ID
 */
const generateId = () => `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
const generateContactId = () => `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

/**
 * Beispiel-Kunden für Demo-Zwecke
 */
const DEMO_CLIENTS = [
  {
    id: 'client_demo_1',
    companyName: 'Mercedes-Benz AG',
    logo: null,
    industry: 'automotive',
    website: 'https://www.mercedes-benz.de',
    address: {
      street: 'Mercedesstraße 120',
      zip: '70372',
      city: 'Stuttgart',
      country: 'Deutschland'
    },
    billing: {
      useMainAddress: true,
      address: null,
      vatId: 'DE123456789',
      paymentTermDays: 30,
      invoiceRecipient: 'Mercedes-Benz AG, Rechnungswesen',
      costCenter: 'MKT-2024',
      requiresPurchaseOrder: true
    },
    contacts: [
      {
        id: 'contact_demo_1',
        firstName: 'Thomas',
        lastName: 'Müller',
        position: 'Marketing Manager',
        email: 't.mueller@mercedes-benz.com',
        phone: '+49 711 123456',
        isPrimary: true
      },
      {
        id: 'contact_demo_2',
        firstName: 'Anna',
        lastName: 'Schmidt',
        position: 'Project Lead',
        email: 'a.schmidt@mercedes-benz.com',
        phone: '+49 711 123457',
        isPrimary: false
      }
    ],
    status: CLIENT_STATUS.ACTIVE,
    tags: ['premium', 'automotive', 'langzeitkunde'],
    isFavorite: true,
    notes: 'Wichtiger Bestandskunde seit 2020. Bevorzugt Produktionen in Stuttgart und Umgebung.',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-12-01T14:30:00Z'
  },
  {
    id: 'client_demo_2',
    companyName: 'Adidas AG',
    logo: null,
    industry: 'fashion',
    website: 'https://www.adidas.de',
    address: {
      street: 'Adi-Dassler-Straße 1',
      zip: '91074',
      city: 'Herzogenaurach',
      country: 'Deutschland'
    },
    billing: {
      useMainAddress: false,
      address: {
        street: 'Rechnungsabteilung, Postfach 1234',
        zip: '91074',
        city: 'Herzogenaurach',
        country: 'Deutschland'
      },
      vatId: 'DE987654321',
      paymentTermDays: 45,
      invoiceRecipient: 'Adidas AG, Accounts Payable',
      costCenter: '',
      requiresPurchaseOrder: true
    },
    contacts: [
      {
        id: 'contact_demo_3',
        firstName: 'Lisa',
        lastName: 'Weber',
        position: 'Brand Director',
        email: 'lisa.weber@adidas.com',
        phone: '+49 9132 84-0',
        isPrimary: true
      }
    ],
    status: CLIENT_STATUS.ACTIVE,
    tags: ['fashion', 'sport', 'international'],
    isFavorite: true,
    notes: '',
    createdAt: '2024-03-20T09:00:00Z',
    updatedAt: '2024-11-15T16:00:00Z'
  },
  {
    id: 'client_demo_3',
    companyName: 'TechStart GmbH',
    logo: null,
    industry: 'tech',
    website: 'https://www.techstart.de',
    address: {
      street: 'Innovationsweg 42',
      zip: '10115',
      city: 'Berlin',
      country: 'Deutschland'
    },
    billing: {
      useMainAddress: true,
      address: null,
      vatId: 'DE555666777',
      paymentTermDays: 14,
      invoiceRecipient: '',
      costCenter: '',
      requiresPurchaseOrder: false
    },
    contacts: [
      {
        id: 'contact_demo_4',
        firstName: 'Max',
        lastName: 'Hoffmann',
        position: 'CEO',
        email: 'max@techstart.de',
        phone: '+49 30 12345678',
        isPrimary: true
      }
    ],
    status: CLIENT_STATUS.LEAD,
    tags: ['startup', 'tech'],
    isFavorite: false,
    notes: 'Interessiert an Image-Film für Investoren-Pitch.',
    createdAt: '2024-11-01T11:00:00Z',
    updatedAt: '2024-11-01T11:00:00Z'
  }
];

/**
 * useClients - Hook für das Kundenstamm-System (CRM)
 */
const useClients = () => {
  const [clients, setClients] = useState(DEMO_CLIENTS);

  // ========== CRUD ==========

  /**
   * Erstellt einen neuen Kunden
   */
  const createClient = useCallback((clientData) => {
    const now = new Date().toISOString();
    const newClient = {
      id: generateId(),
      companyName: clientData.companyName || '',
      logo: clientData.logo || null,
      industry: clientData.industry || 'other',
      website: clientData.website || '',
      address: clientData.address || {
        street: '',
        zip: '',
        city: '',
        country: 'Deutschland'
      },
      billing: clientData.billing || {
        useMainAddress: true,
        address: null,
        vatId: '',
        paymentTermDays: 30,
        invoiceRecipient: '',
        costCenter: '',
        requiresPurchaseOrder: false
      },
      contacts: clientData.contacts || [],
      status: clientData.status || CLIENT_STATUS.ACTIVE,
      tags: clientData.tags || [],
      isFavorite: clientData.isFavorite || false,
      notes: clientData.notes || '',
      createdAt: now,
      updatedAt: now
    };

    setClients(prev => [...prev, newClient]);
    return newClient;
  }, []);

  /**
   * Aktualisiert einen bestehenden Kunden
   */
  const updateClient = useCallback((clientId, updates) => {
    let updatedClient = null;
    setClients(prev => prev.map(client => {
      if (client.id === clientId) {
        updatedClient = {
          ...client,
          ...updates,
          updatedAt: new Date().toISOString()
        };
        return updatedClient;
      }
      return client;
    }));
    return updatedClient;
  }, []);

  /**
   * Löscht einen Kunden (archiviert ihn)
   */
  const deleteClient = useCallback((clientId) => {
    setClients(prev => prev.map(client => {
      if (client.id === clientId) {
        return {
          ...client,
          status: CLIENT_STATUS.ARCHIVED,
          updatedAt: new Date().toISOString()
        };
      }
      return client;
    }));
  }, []);

  /**
   * Löscht einen Kunden permanent
   */
  const permanentlyDeleteClient = useCallback((clientId) => {
    setClients(prev => prev.filter(client => client.id !== clientId));
  }, []);

  /**
   * Gibt einen Kunden anhand der ID zurück
   */
  const getClientById = useCallback((clientId) => {
    return clients.find(client => client.id === clientId) || null;
  }, [clients]);

  // ========== Ansprechpartner ==========

  /**
   * Fügt einen Ansprechpartner hinzu
   */
  const addContact = useCallback((clientId, contactData) => {
    const newContact = {
      id: generateContactId(),
      firstName: contactData.firstName || '',
      lastName: contactData.lastName || '',
      position: contactData.position || '',
      email: contactData.email || '',
      phone: contactData.phone || '',
      isPrimary: false
    };

    setClients(prev => prev.map(client => {
      if (client.id === clientId) {
        const contacts = [...client.contacts, newContact];
        // Wenn erster Kontakt, als Primary setzen
        if (contacts.length === 1) {
          contacts[0].isPrimary = true;
        }
        // Wenn isPrimary explizit gesetzt
        if (contactData.isPrimary) {
          contacts.forEach(c => c.isPrimary = c.id === newContact.id);
        }
        return {
          ...client,
          contacts,
          updatedAt: new Date().toISOString()
        };
      }
      return client;
    }));

    return newContact;
  }, []);

  /**
   * Aktualisiert einen Ansprechpartner
   */
  const updateContact = useCallback((clientId, contactId, updates) => {
    let updatedContact = null;
    setClients(prev => prev.map(client => {
      if (client.id === clientId) {
        const contacts = client.contacts.map(contact => {
          if (contact.id === contactId) {
            updatedContact = { ...contact, ...updates };
            return updatedContact;
          }
          return contact;
        });
        return {
          ...client,
          contacts,
          updatedAt: new Date().toISOString()
        };
      }
      return client;
    }));
    return updatedContact;
  }, []);

  /**
   * Entfernt einen Ansprechpartner
   */
  const removeContact = useCallback((clientId, contactId) => {
    setClients(prev => prev.map(client => {
      if (client.id === clientId) {
        let contacts = client.contacts.filter(c => c.id !== contactId);
        // Wenn Primary entfernt wurde, ersten verbleibenden als Primary setzen
        if (contacts.length > 0 && !contacts.some(c => c.isPrimary)) {
          contacts[0].isPrimary = true;
        }
        return {
          ...client,
          contacts,
          updatedAt: new Date().toISOString()
        };
      }
      return client;
    }));
  }, []);

  /**
   * Setzt einen Ansprechpartner als Hauptkontakt
   */
  const setPrimaryContact = useCallback((clientId, contactId) => {
    setClients(prev => prev.map(client => {
      if (client.id === clientId) {
        const contacts = client.contacts.map(contact => ({
          ...contact,
          isPrimary: contact.id === contactId
        }));
        return {
          ...client,
          contacts,
          updatedAt: new Date().toISOString()
        };
      }
      return client;
    }));
  }, []);

  /**
   * Gibt den Hauptansprechpartner zurück
   */
  const getPrimaryContact = useCallback((clientId) => {
    const client = clients.find(c => c.id === clientId);
    if (!client || client.contacts.length === 0) return null;
    return client.contacts.find(c => c.isPrimary) || client.contacts[0];
  }, [clients]);

  // ========== Organisation ==========

  /**
   * Toggled Favoriten-Status
   */
  const toggleFavorite = useCallback((clientId) => {
    setClients(prev => prev.map(client => {
      if (client.id === clientId) {
        return {
          ...client,
          isFavorite: !client.isFavorite,
          updatedAt: new Date().toISOString()
        };
      }
      return client;
    }));
  }, []);

  /**
   * Aktualisiert den Status
   */
  const updateStatus = useCallback((clientId, status) => {
    setClients(prev => prev.map(client => {
      if (client.id === clientId) {
        return {
          ...client,
          status,
          updatedAt: new Date().toISOString()
        };
      }
      return client;
    }));
  }, []);

  /**
   * Fügt einen Tag hinzu
   */
  const addTag = useCallback((clientId, tag) => {
    const normalizedTag = tag.toLowerCase().trim();
    if (!normalizedTag) return;

    setClients(prev => prev.map(client => {
      if (client.id === clientId) {
        if (client.tags.includes(normalizedTag)) return client;
        return {
          ...client,
          tags: [...client.tags, normalizedTag],
          updatedAt: new Date().toISOString()
        };
      }
      return client;
    }));
  }, []);

  /**
   * Entfernt einen Tag
   */
  const removeTag = useCallback((clientId, tag) => {
    setClients(prev => prev.map(client => {
      if (client.id === clientId) {
        return {
          ...client,
          tags: client.tags.filter(t => t !== tag),
          updatedAt: new Date().toISOString()
        };
      }
      return client;
    }));
  }, []);

  // ========== Suche & Filter ==========

  /**
   * Sucht nach Kunden
   */
  const searchClients = useCallback((query) => {
    if (!query || !query.trim()) return clients;
    const lowerQuery = query.toLowerCase().trim();

    return clients.filter(client => {
      // Firmenname
      if (client.companyName.toLowerCase().includes(lowerQuery)) return true;
      // Tags
      if (client.tags.some(tag => tag.includes(lowerQuery))) return true;
      // Kontakte
      if (client.contacts.some(contact =>
        contact.firstName.toLowerCase().includes(lowerQuery) ||
        contact.lastName.toLowerCase().includes(lowerQuery) ||
        contact.email.toLowerCase().includes(lowerQuery)
      )) return true;
      return false;
    });
  }, [clients]);

  /**
   * Filtert nach Status
   */
  const getClientsByStatus = useCallback((status) => {
    return clients.filter(client => client.status === status);
  }, [clients]);

  /**
   * Filtert nach Branche
   */
  const getClientsByIndustry = useCallback((industry) => {
    return clients.filter(client => client.industry === industry);
  }, [clients]);

  /**
   * Gibt Favoriten zurück
   */
  const getFavoriteClients = useCallback(() => {
    return clients.filter(client => client.isFavorite);
  }, [clients]);

  /**
   * Gibt zuletzt aktualisierte Kunden zurück
   */
  const getRecentClients = useCallback((limit = 5) => {
    return [...clients]
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, limit);
  }, [clients]);

  /**
   * Gibt aktive Kunden zurück
   */
  const getActiveClients = useCallback(() => {
    return clients.filter(client => client.status === CLIENT_STATUS.ACTIVE);
  }, [clients]);

  // ========== Stats (mit Projekten) ==========

  /**
   * Berechnet Statistiken für einen Kunden
   */
  const getClientStats = useCallback((clientId, projects) => {
    const clientProjects = projects.filter(p => p.clientId === clientId);
    const projectCount = clientProjects.length;

    let lastProjectDate = null;
    let totalBudget = 0;

    clientProjects.forEach(project => {
      // Letztes Projekt-Datum
      if (project.endDate) {
        const endDate = new Date(project.endDate);
        if (!lastProjectDate || endDate > lastProjectDate) {
          lastProjectDate = endDate;
        }
      }
      // Budget summieren (falls vorhanden)
      if (project.budget) {
        totalBudget += project.budget;
      }
    });

    return {
      projectCount,
      lastProjectDate: lastProjectDate ? lastProjectDate.toISOString() : null,
      totalBudget,
      projects: clientProjects
    };
  }, []);

  /**
   * Gibt alle Kunden mit Stats zurück
   */
  const getClientsWithStats = useCallback((projects) => {
    return clients.map(client => ({
      ...client,
      stats: getClientStats(client.id, projects)
    }));
  }, [clients, getClientStats]);

  // ========== Hilfsfunktionen ==========

  /**
   * Gibt alle verwendeten Tags zurück
   */
  const getAllTags = useCallback(() => {
    const allTags = new Set();
    clients.forEach(client => {
      client.tags.forEach(tag => allTags.add(tag));
    });
    return Array.from(allTags).sort();
  }, [clients]);

  /**
   * Gibt den Anzeigenamen eines Kunden zurück
   */
  const getClientDisplayName = useCallback((client) => {
    return client?.companyName || 'Unbekannter Kunde';
  }, []);

  /**
   * Gibt den Anzeigenamen eines Kontakts zurück
   */
  const getContactDisplayName = useCallback((contact) => {
    if (!contact) return '';
    return `${contact.firstName} ${contact.lastName}`.trim();
  }, []);

  /**
   * Gibt Projekte eines Kunden zurück
   */
  const getProjectsByClient = useCallback((clientId, projects) => {
    return projects.filter(p => p.clientId === clientId);
  }, []);

  return {
    clients,
    // CRUD
    createClient,
    updateClient,
    deleteClient,
    permanentlyDeleteClient,
    getClientById,
    // Ansprechpartner
    addContact,
    updateContact,
    removeContact,
    setPrimaryContact,
    getPrimaryContact,
    // Organisation
    toggleFavorite,
    updateStatus,
    addTag,
    removeTag,
    // Suche & Filter
    searchClients,
    getClientsByStatus,
    getClientsByIndustry,
    getFavoriteClients,
    getRecentClients,
    getActiveClients,
    // Stats
    getClientStats,
    getClientsWithStats,
    // Hilfsfunktionen
    getAllTags,
    getClientDisplayName,
    getContactDisplayName,
    getProjectsByClient
  };
};

export { useClients };
