/**
 * Stammdaten für die CrewConnect App
 * In einer echten Anwendung würden diese von einer API geladen werden.
 */

/** Projekt-Status Optionen */
export const PROJECT_STATUS = {
  PLANNING: 'planning',
  PRE_PRODUCTION: 'pre_production',
  PRODUCTION: 'production',
  POST_PRODUCTION: 'post_production',
  COMPLETED: 'completed',
  ON_HOLD: 'on_hold',
  CANCELLED: 'cancelled'
};

export const PROJECT_STATUS_LABELS = {
  [PROJECT_STATUS.PLANNING]: 'Planung',
  [PROJECT_STATUS.PRE_PRODUCTION]: 'Pre-Production',
  [PROJECT_STATUS.PRODUCTION]: 'Produktion',
  [PROJECT_STATUS.POST_PRODUCTION]: 'Post-Production',
  [PROJECT_STATUS.COMPLETED]: 'Abgeschlossen',
  [PROJECT_STATUS.ON_HOLD]: 'Pausiert',
  [PROJECT_STATUS.CANCELLED]: 'Abgesagt'
};

export const PROJECT_STATUS_COLORS = {
  [PROJECT_STATUS.PLANNING]: 'bg-blue-100 text-blue-700',
  [PROJECT_STATUS.PRE_PRODUCTION]: 'bg-purple-100 text-purple-700',
  [PROJECT_STATUS.PRODUCTION]: 'bg-green-100 text-green-700',
  [PROJECT_STATUS.POST_PRODUCTION]: 'bg-orange-100 text-orange-700',
  [PROJECT_STATUS.COMPLETED]: 'bg-gray-100 text-gray-700',
  [PROJECT_STATUS.ON_HOLD]: 'bg-yellow-100 text-yellow-700',
  [PROJECT_STATUS.CANCELLED]: 'bg-red-100 text-red-700'
};

/** Beispiel-Projekte */
export const INITIAL_PROJECTS = [
  {
    id: 1,
    name: 'Werbespot Mercedes 2025',
    client: 'Mercedes-Benz AG',
    clientContact: {
      name: 'Thomas Schneider',
      email: 'thomas.schneider@mercedes-benz.com',
      phone: '+49 711 123456'
    },
    agencyId: 1,
    status: PROJECT_STATUS.PRE_PRODUCTION,
    description: 'Imagespot für die neue E-Klasse. 30 Sekunden TV-Spot plus Social Media Cutdowns.',
    startDate: '2025-01-10',
    endDate: '2025-02-28',
    budget: {
      total: 85000,
      spent: 32000,
      currency: 'EUR'
    },
    notes: 'Kunde wünscht Premium-Look. Referenz: Apple Werbung.',
    phases: [
      {
        id: 101,
        name: 'Drehphase',
        icon: '🎬',
        startDate: '2025-01-12',
        endDate: '2025-01-20',
        budget: 45000
      },
      {
        id: 102,
        name: 'Post-Production',
        icon: '🎞️',
        startDate: '2025-02-01',
        endDate: '2025-02-15',
        budget: 25000
      }
    ]
  },
  {
    id: 2,
    name: 'Social Media Kampagne',
    client: 'Fashion Brand X',
    clientContact: {
      name: 'Lisa Braun',
      email: 'lisa.braun@fashionbrandx.com',
      phone: '+49 89 987654'
    },
    agencyId: 1,
    status: PROJECT_STATUS.PLANNING,
    description: 'Monatliche Content-Produktion für Instagram und TikTok.',
    startDate: '2025-01-15',
    endDate: '2025-01-30',
    budget: {
      total: 15000,
      spent: 0,
      currency: 'EUR'
    },
    notes: '',
    phases: [
      {
        id: 201,
        name: 'Content Dreh',
        icon: '📱',
        startDate: '2025-01-15',
        endDate: '2025-01-20',
        budget: 12000
      }
    ]
  },
  {
    id: 3,
    name: 'Musikvideo "Neon Dreams"',
    client: 'Independent Label',
    clientContact: {
      name: 'Marco Richter',
      email: 'marco@indie-label.de',
      phone: '+49 40 555123'
    },
    agencyId: 2,
    status: PROJECT_STATUS.PRE_PRODUCTION,
    description: 'Offizielles Musikvideo für aufstrebende Band. Cyberpunk-Ästhetik mit praktischen Effekten.',
    startDate: '2025-01-15',
    endDate: '2025-01-25',
    budget: {
      total: 25000,
      spent: 5000,
      currency: 'EUR'
    },
    notes: 'Nachtdreh geplant. Neon-Lichter und Nebel.',
    phases: [
      {
        id: 301,
        name: 'Dreh',
        icon: '🎥',
        startDate: '2025-01-18',
        endDate: '2025-01-20',
        budget: 15000
      },
      {
        id: 302,
        name: 'Post & Grading',
        icon: '🎨',
        startDate: '2025-01-21',
        endDate: '2025-01-25',
        budget: 8000
      }
    ]
  }
];

/** Beispiel-Freelancer mit vollständigen Profildaten */
export const INITIAL_FREELANCERS = [
  {
    id: 1,
    // Basis
    firstName: 'Anna',
    lastName: 'Schmidt',
    avatar: '👩‍🎨',

    // Beruf (Array für mehrere Berufe)
    professions: ['Director of Photography (DoP)', 'Kameramann/Kamerafrau'],
    experience: 12,

    // Tags (vereint Skills, Equipment, Sprachen)
    tags: ['Steadicam', 'Drohne', 'Gimbal', 'Unterwasser', 'RED Komodo', 'Sony FX6', 'DJI Ronin 4D', 'DJI Mavic 3 Pro', 'Deutsch', 'Englisch', 'Französisch'],

    // Kontakt
    email: 'anna.schmidt@example.de',
    phone: '+49 170 1234567',
    website: 'https://anna-schmidt.de',

    // Social Media
    socialMedia: {
      linkedin: 'https://linkedin.com/in/annaschmidt',
      instagram: 'anna.dop',
      twitter: '',
      vimeo: 'annaschmidt',
      youtube: '',
      imdb: 'nm1234567',
      crewUnited: ''
    },

    // Standort
    address: {
      street: 'Friedrichstraße 123',
      postalCode: '10117',
      city: 'Berlin',
      country: 'Deutschland'
    },
    region: 'Berlin-Brandenburg',
    coordinates: {
      lat: 52.5200,
      lon: 13.4050
    },

    // Reisebereitschaft & Remote
    willingToTravel: true,
    travelRadius: 150,
    remoteWork: false,

    // Konditionen
    dayRate: 800,
    halfDayRate: 500,

    // Equipment
    hasOwnEquipment: true,

    // Portfolio
    bio: 'Seit über 12 Jahren arbeite ich als Director of Photography für Werbefilme, Dokumentationen und Spielfilme. Mein Fokus liegt auf visuell anspruchsvollen Projekten mit emotionalem Storytelling. Ich bringe mein eigenes hochwertiges Equipment mit und bin deutschlandweit sowie international verfügbar.',
    portfolio: [
      {
        id: 1,
        url: 'https://vimeo.com/annaschmidt/mercedes2024',
        title: 'Mercedes-Benz E-Klasse Spot',
        description: 'Imagefilm für die neue E-Klasse. Gedreht auf ARRI Alexa Mini.',
        category: 'commercial'
      },
      {
        id: 2,
        url: 'https://vimeo.com/annaschmidt/documentary',
        title: 'Heimat - Eine Spurensuche',
        description: 'Preisgekrönte Dokumentation über Migration und Identität.',
        category: 'documentary'
      }
    ],

    // Sichtbarkeits-Einstellungen (was in der Suche angezeigt wird)
    visibility: {
      dayRate: true,
      address: true,
      email: false,
      phone: false,
      website: true,
      socialMedia: true,
      bio: true
    },

    // Meta
    rating: 4.8,
    verified: true
  },
  {
    id: 2,
    // Basis
    firstName: 'Max',
    lastName: 'Weber',
    avatar: '👨‍💻',

    // Beruf (Array für mehrere Berufe)
    professions: ['Editor / Cutter', 'Colorist'],
    experience: 8,

    // Tags (vereint Skills, Equipment, Sprachen)
    tags: ['Premiere Pro', 'DaVinci Resolve', 'After Effects', 'Color Grading', 'Mac Studio M2 Ultra', 'DaVinci Resolve Studio', 'Eizo ColorEdge', 'Deutsch', 'Englisch'],

    // Kontakt
    email: 'max.weber@example.de',
    phone: '+49 171 9876543',
    website: 'https://maxweber-edit.de',

    // Social Media
    socialMedia: {
      linkedin: '',
      instagram: 'maxweber.edit',
      twitter: '',
      vimeo: 'maxweber',
      youtube: 'maxweberedits',
      imdb: '',
      crewUnited: ''
    },

    // Standort
    address: {
      street: 'Maximilianstraße 45',
      postalCode: '80539',
      city: 'München',
      country: 'Deutschland'
    },
    region: 'Bayern',
    coordinates: {
      lat: 48.1351,
      lon: 11.5820
    },

    // Reisebereitschaft & Remote
    willingToTravel: true,
    travelRadius: 50,
    remoteWork: true,

    // Konditionen
    dayRate: 650,
    halfDayRate: 400,

    // Equipment
    hasOwnEquipment: true,

    // Portfolio
    bio: 'Als Editor und Colorist verbinde ich technische Präzision mit kreativem Storytelling. Spezialisiert auf Werbefilme und Musikvideos. Remote-Arbeit möglich.',
    portfolio: [
      {
        id: 1,
        url: 'https://vimeo.com/maxweber/showreel2024',
        title: 'Showreel 2024',
        description: 'Zusammenschnitt meiner besten Arbeiten aus 2024.',
        category: 'showreel'
      },
      {
        id: 2,
        url: 'https://vimeo.com/maxweber/musicvideo',
        title: 'Musikvideo "Nachtleben"',
        description: 'Offizielles Musikvideo für Band XY.',
        category: 'music_video'
      }
    ],

    // Sichtbarkeits-Einstellungen
    visibility: {
      dayRate: false,
      address: false,
      email: true,
      phone: false,
      website: true,
      socialMedia: true,
      bio: true
    },

    // Meta
    rating: 4.9,
    verified: true
  },
  {
    id: 3,
    // Basis
    firstName: 'Sarah',
    lastName: 'Müller',
    avatar: '👩‍🎤',

    // Beruf (Array für mehrere Berufe)
    professions: ['Sound Designer', 'Tonmeister/in'],
    experience: 6,

    // Tags (vereint Skills, Equipment, Sprachen)
    tags: ['Pro Tools', 'Ableton Live', 'Field Recording', 'Foley', 'Mixing', 'Sound Devices MixPre-10', 'Sennheiser MKH416', 'Schoeps CMC6', 'Deutsch', 'Englisch', 'Spanisch'],

    // Kontakt
    email: 'sarah.mueller@example.de',
    phone: '+49 172 5551234',
    website: '',

    // Social Media
    socialMedia: {
      linkedin: 'https://linkedin.com/in/sarahmueller',
      instagram: '',
      twitter: '',
      vimeo: '',
      youtube: '',
      imdb: '',
      crewUnited: 'sarah-mueller-sound'
    },

    // Standort
    address: {
      street: 'Speicherstadt 7',
      postalCode: '20457',
      city: 'Hamburg',
      country: 'Deutschland'
    },
    region: 'Hamburg',
    coordinates: {
      lat: 53.5511,
      lon: 9.9937
    },

    // Reisebereitschaft & Remote
    willingToTravel: true,
    travelRadius: 100,
    remoteWork: true,

    // Konditionen
    dayRate: 550,
    halfDayRate: 350,

    // Equipment
    hasOwnEquipment: true,

    // Portfolio
    bio: 'Sound Design und Tonaufnahme für Film, Werbung und Podcast. Von der Aufnahme am Set bis zum finalen Mix - alles aus einer Hand.',
    portfolio: [
      {
        id: 1,
        url: 'https://soundcloud.com/sarahmueller/demoreel',
        title: 'Sound Design Demoreel',
        description: 'Zusammenstellung verschiedener Sound Design Arbeiten.',
        category: 'showreel'
      }
    ],

    // Sichtbarkeits-Einstellungen
    visibility: {
      dayRate: true,
      address: true,
      email: true,
      phone: true,
      website: true,
      socialMedia: true,
      bio: true
    },

    // Meta
    rating: 4.7,
    verified: false
  }
];

/** Beispiel-Agenturen mit vollständigen Profildaten */
export const INITIAL_AGENCIES = [
  {
    id: 1,
    // Basis
    name: 'Bluescreen Productions',
    logo: '🎬',

    // Firma
    industry: 'Werbefilm & Branded Content',
    description: 'Wir sind eine Full-Service Filmproduktion mit Fokus auf hochwertige Werbefilme und Branded Content. Seit 2010 realisieren wir Projekte für nationale und internationale Marken. Unser Team verbindet kreative Exzellenz mit effizienter Produktion.',
    website: 'https://bluescreen-productions.de',

    // Kontakt
    contactFirstName: 'Michael',
    contactLastName: 'Hoffmann',
    email: 'kontakt@bluescreen-productions.de',
    phone: '+49 30 12345678',

    // Social Media
    socialMedia: {
      linkedin: 'https://linkedin.com/company/bluescreen-productions',
      instagram: 'bluescreen_productions',
      twitter: '',
      vimeo: 'bluescreenproductions',
      youtube: 'BluescreenProductions',
      imdb: '',
      crewUnited: ''
    },

    // Portfolio
    portfolio: [
      {
        id: 1,
        url: 'https://vimeo.com/bluescreen/mercedes2024',
        title: 'Mercedes-Benz Kampagne 2024',
        description: 'Image-Kampagne für die neue A-Klasse.',
        category: 'commercial'
      },
      {
        id: 2,
        url: 'https://vimeo.com/bluescreen/showreel',
        title: 'Showreel 2024',
        description: 'Unsere besten Arbeiten aus 2024.',
        category: 'showreel'
      }
    ],

    // Standort
    address: {
      street: 'Filmstraße 42',
      postalCode: '10115',
      city: 'Berlin',
      country: 'Deutschland'
    },
    coordinates: {
      lat: 52.5320,
      lon: 13.3880
    },

    // Meta
    foundedYear: 2010,
    employeeCount: '11-50'
  },
  {
    id: 2,
    // Basis
    name: 'Redlight Studios',
    logo: '🔴',

    // Firma
    industry: 'Musikvideo & Dokumentarfilm',
    description: 'Redlight Studios ist spezialisiert auf Musikvideos, Dokumentarfilme und künstlerische Projekte. Wir arbeiten mit aufstrebenden und etablierten Künstlern zusammen und bringen kreative Visionen zum Leben.',
    website: 'https://redlight-studios.de',

    // Kontakt
    contactFirstName: 'Julia',
    contactLastName: 'Krause',
    email: 'booking@redlight-studios.de',
    phone: '+49 40 9876543',

    // Social Media
    socialMedia: {
      linkedin: 'https://linkedin.com/company/redlight-studios',
      instagram: 'redlight_studios',
      twitter: 'redlightstudios',
      vimeo: 'redlightstudios',
      youtube: '',
      imdb: '',
      crewUnited: ''
    },

    // Portfolio
    portfolio: [
      {
        id: 1,
        url: 'https://vimeo.com/redlight/musicvideo2024',
        title: 'Musikvideo "Neon Dreams"',
        description: 'Offizielles Musikvideo für Künstler XY.',
        category: 'music_video'
      }
    ],

    // Standort
    address: {
      street: 'Hafenstraße 88',
      postalCode: '20459',
      city: 'Hamburg',
      country: 'Deutschland'
    },
    coordinates: {
      lat: 53.5459,
      lon: 9.9660
    },

    // Meta
    foundedYear: 2018,
    employeeCount: '2-10'
  }
];

/** Aktuelle Benutzer-IDs (für Demo-Zwecke) */
export const CURRENT_USER = {
  freelancerId: 1,
  agencyId: 1
};

/**
 * Hilfsfunktion: Findet Freelancer-Profil nach ID
 */
export const getFreelancerById = (id) =>
  INITIAL_FREELANCERS.find(f => f.id === id);

/**
 * Hilfsfunktion: Findet Agentur-Profil nach ID
 */
export const getAgencyById = (id) =>
  INITIAL_AGENCIES.find(a => a.id === id);
