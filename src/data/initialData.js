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
    name: 'Werbespot BMW i7',
    client: 'BMW Group',
    clientContact: {
      name: 'Stefan Berger',
      email: 'stefan.berger@bmw.de',
      phone: '+49 89 123456'
    },
    agencyId: 1,
    status: PROJECT_STATUS.PRE_PRODUCTION,
    description: '30-Sekunden TV-Spot für den neuen BMW i7. Premium-Ästhetik mit Fokus auf Elektromobilität und Innovation.',
    budget: {
      total: 0,
      spent: 0,
      currency: 'EUR'
    },
    notes: '',
    phases: []
  },
  {
    id: 2,
    name: 'Dokumentarfilm "Stadtleben"',
    client: 'ARD Kultur',
    clientContact: {
      name: 'Katrin Meier',
      email: 'katrin.meier@ard.de',
      phone: '+49 30 987654'
    },
    agencyId: 1,
    status: PROJECT_STATUS.PLANNING,
    description: 'Dokumentation über das urbane Leben in deutschen Großstädten. Portrait von Menschen und ihren Geschichten.',
    budget: {
      total: 0,
      spent: 0,
      currency: 'EUR'
    },
    notes: '',
    phases: []
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
  },
  {
    id: 4,
    firstName: 'Jonas',
    lastName: 'Becker',
    avatar: '🎬',
    professions: ['Regisseur/in', 'Creative Director'],
    experience: 15,
    tags: ['Werbefilm', 'Imagefilm', 'Musikvideo', 'Branded Content', 'Storytelling', 'Konzeptentwicklung', 'Deutsch', 'Englisch'],
    email: 'jonas.becker@example.de',
    phone: '+49 173 8765432',
    website: 'https://jonasbecker.film',
    socialMedia: {
      linkedin: 'https://linkedin.com/in/jonasbecker',
      instagram: 'jonas.becker.film',
      twitter: '',
      vimeo: 'jonasbecker',
      youtube: '',
      imdb: 'nm2345678',
      crewUnited: ''
    },
    address: {
      street: 'Zollhof 2',
      postalCode: '40221',
      city: 'Düsseldorf',
      country: 'Deutschland'
    },
    region: 'Nordrhein-Westfalen',
    coordinates: { lat: 51.2277, lon: 6.7735 },
    willingToTravel: true,
    travelRadius: 200,
    remoteWork: false,
    dayRate: 1200,
    halfDayRate: 750,
    hasOwnEquipment: false,
    bio: 'Regisseur mit Fokus auf emotionales Storytelling für Marken. Über 200 Werbefilme für internationale Kunden.',
    portfolio: [],
    visibility: {
      dayRate: true,
      address: true,
      email: false,
      phone: false,
      website: true,
      socialMedia: true,
      bio: true
    },
    rating: 4.9,
    verified: true
  },
  {
    id: 5,
    firstName: 'Lisa',
    lastName: 'Hoffmann',
    avatar: '💄',
    professions: ['Make-up Artist', 'Hair Stylist'],
    experience: 10,
    tags: ['SFX Make-up', 'Beauty', 'Fashion', 'Film', 'Werbung', 'Bridal', 'Airbrush', 'Deutsch', 'Englisch', 'Italienisch'],
    email: 'lisa.hoffmann@example.de',
    phone: '+49 176 1112233',
    website: 'https://lisahoffmann-makeup.de',
    socialMedia: {
      linkedin: '',
      instagram: 'lisa.hoffmann.mua',
      twitter: '',
      vimeo: '',
      youtube: '',
      imdb: '',
      crewUnited: 'lisa-hoffmann'
    },
    address: {
      street: 'Gärtnerplatz 3',
      postalCode: '80469',
      city: 'München',
      country: 'Deutschland'
    },
    region: 'Bayern',
    coordinates: { lat: 48.1291, lon: 11.5768 },
    willingToTravel: true,
    travelRadius: 100,
    remoteWork: false,
    dayRate: 450,
    halfDayRate: 280,
    hasOwnEquipment: true,
    bio: 'Professionelle Make-up Artistin für Film, Werbung und Fashion. Spezialisiert auf natürliche Beauty-Looks und SFX.',
    portfolio: [],
    visibility: {
      dayRate: true,
      address: true,
      email: true,
      phone: true,
      website: true,
      socialMedia: true,
      bio: true
    },
    rating: 4.8,
    verified: true
  },
  {
    id: 6,
    firstName: 'Tom',
    lastName: 'Richter',
    avatar: '🎥',
    professions: ['Kameramann/Kamerafrau', 'Drohnenpilot'],
    experience: 7,
    tags: ['Drohne', 'Gimbal', 'Sony FX9', 'Blackmagic', 'DJI Inspire 3', 'FPV', 'Naturfilm', 'Sport', 'Deutsch', 'Englisch'],
    email: 'tom.richter@example.de',
    phone: '+49 174 3334455',
    website: '',
    socialMedia: {
      linkedin: '',
      instagram: 'tomrichter.aerial',
      twitter: '',
      vimeo: 'tomrichter',
      youtube: 'tomrichteraerial',
      imdb: '',
      crewUnited: ''
    },
    address: {
      street: 'Königstraße 28',
      postalCode: '70173',
      city: 'Stuttgart',
      country: 'Deutschland'
    },
    region: 'Baden-Württemberg',
    coordinates: { lat: 48.7758, lon: 9.1829 },
    willingToTravel: true,
    travelRadius: 150,
    remoteWork: false,
    dayRate: 700,
    halfDayRate: 420,
    hasOwnEquipment: true,
    bio: 'Kameramann und zertifizierter Drohnenpilot für spektakuläre Luftaufnahmen. EU-Drohnenführerschein A1/A2/A3.',
    portfolio: [],
    visibility: {
      dayRate: true,
      address: true,
      email: false,
      phone: false,
      website: true,
      socialMedia: true,
      bio: true
    },
    rating: 4.6,
    verified: true
  },
  {
    id: 7,
    firstName: 'Emma',
    lastName: 'Klein',
    avatar: '✂️',
    professions: ['Editor / Cutter', 'Motion Designer'],
    experience: 5,
    tags: ['Premiere Pro', 'After Effects', 'Cinema 4D', 'Motion Graphics', '3D Animation', 'VFX', 'Deutsch', 'Englisch'],
    email: 'emma.klein@example.de',
    phone: '+49 175 6667788',
    website: 'https://emmaklein.design',
    socialMedia: {
      linkedin: 'https://linkedin.com/in/emmaklein',
      instagram: 'emma.klein.motion',
      twitter: '',
      vimeo: 'emmaklein',
      youtube: '',
      imdb: '',
      crewUnited: ''
    },
    address: {
      street: 'Marienstraße 15',
      postalCode: '04109',
      city: 'Leipzig',
      country: 'Deutschland'
    },
    region: 'Sachsen',
    coordinates: { lat: 51.3397, lon: 12.3731 },
    willingToTravel: true,
    travelRadius: 80,
    remoteWork: true,
    dayRate: 520,
    halfDayRate: 320,
    hasOwnEquipment: true,
    bio: 'Motion Design und Editing für Werbefilm und Social Media. Kreative Animationen und dynamische Schnitte.',
    portfolio: [],
    visibility: {
      dayRate: true,
      address: true,
      email: true,
      phone: false,
      website: true,
      socialMedia: true,
      bio: true
    },
    rating: 4.5,
    verified: false
  },
  {
    id: 8,
    firstName: 'Lukas',
    lastName: 'Braun',
    avatar: '💡',
    professions: ['Gaffer', 'Lichttechniker/in'],
    experience: 9,
    tags: ['ARRI', 'Aputure', 'Kinoflo', 'LED', 'HMI', 'Grip', 'Lichtgestaltung', 'Deutsch', 'Englisch', 'Polnisch'],
    email: 'lukas.braun@example.de',
    phone: '+49 177 9990011',
    website: '',
    socialMedia: {
      linkedin: '',
      instagram: '',
      twitter: '',
      vimeo: '',
      youtube: '',
      imdb: '',
      crewUnited: 'lukas-braun-gaffer'
    },
    address: {
      street: 'Babelsberg Straße 10',
      postalCode: '14482',
      city: 'Potsdam',
      country: 'Deutschland'
    },
    region: 'Brandenburg',
    coordinates: { lat: 52.3906, lon: 13.0645 },
    willingToTravel: true,
    travelRadius: 100,
    remoteWork: false,
    dayRate: 480,
    halfDayRate: 300,
    hasOwnEquipment: true,
    bio: 'Erfahrener Gaffer für Spielfilm, Werbung und TV. Große Lichtparks und kreative Lichtgestaltung.',
    portfolio: [],
    visibility: {
      dayRate: true,
      address: true,
      email: true,
      phone: true,
      website: true,
      socialMedia: true,
      bio: true
    },
    rating: 4.7,
    verified: true
  },
  {
    id: 9,
    firstName: 'Sophie',
    lastName: 'Wagner',
    avatar: '🎨',
    professions: ['Szenenbildner/in', 'Production Designer'],
    experience: 11,
    tags: ['Szenenbild', 'Art Direction', 'Set Design', 'Requisite', 'AutoCAD', 'SketchUp', 'Deutsch', 'Englisch', 'Französisch'],
    email: 'sophie.wagner@example.de',
    phone: '+49 178 2223344',
    website: 'https://sophiewagner-design.de',
    socialMedia: {
      linkedin: 'https://linkedin.com/in/sophiewagner',
      instagram: 'sophie.wagner.design',
      twitter: '',
      vimeo: '',
      youtube: '',
      imdb: 'nm3456789',
      crewUnited: ''
    },
    address: {
      street: 'Rheinauhafen 12',
      postalCode: '50678',
      city: 'Köln',
      country: 'Deutschland'
    },
    region: 'Nordrhein-Westfalen',
    coordinates: { lat: 50.9375, lon: 6.9603 },
    willingToTravel: true,
    travelRadius: 150,
    remoteWork: false,
    dayRate: 680,
    halfDayRate: 420,
    hasOwnEquipment: false,
    bio: 'Production Design für Werbefilm und Spielfilm. Von der Konzeption bis zur Umsetzung - kreative Welten erschaffen.',
    portfolio: [],
    visibility: {
      dayRate: true,
      address: true,
      email: false,
      phone: false,
      website: true,
      socialMedia: true,
      bio: true
    },
    rating: 4.8,
    verified: true
  },
  {
    id: 10,
    firstName: 'Felix',
    lastName: 'Zimmermann',
    avatar: '🎧',
    professions: ['Tonmeister/in', 'Boom Operator'],
    experience: 4,
    tags: ['Location Sound', 'Boom', 'Lavalier', 'Sound Devices', 'Sennheiser', 'Lectrosonics', 'Funk', 'Deutsch', 'Englisch'],
    email: 'felix.zimmermann@example.de',
    phone: '+49 179 5556677',
    website: '',
    socialMedia: {
      linkedin: '',
      instagram: 'felix.sound',
      twitter: '',
      vimeo: '',
      youtube: '',
      imdb: '',
      crewUnited: 'felix-zimmermann'
    },
    address: {
      street: 'Hauptstraße 42',
      postalCode: '60311',
      city: 'Frankfurt',
      country: 'Deutschland'
    },
    region: 'Hessen',
    coordinates: { lat: 50.1109, lon: 8.6821 },
    willingToTravel: true,
    travelRadius: 120,
    remoteWork: false,
    dayRate: 380,
    halfDayRate: 240,
    hasOwnEquipment: true,
    bio: 'Tonmeister für Film und Werbung. Sauberer O-Ton auch unter schwierigen Bedingungen.',
    portfolio: [],
    visibility: {
      dayRate: true,
      address: true,
      email: true,
      phone: true,
      website: true,
      socialMedia: true,
      bio: true
    },
    rating: 4.4,
    verified: false
  },
  {
    id: 11,
    firstName: 'Marie',
    lastName: 'Fischer',
    avatar: '📋',
    professions: ['Produktionsleitung', 'Line Producer'],
    experience: 13,
    tags: ['Budgetierung', 'Disposition', 'Drehplanung', 'Teamführung', 'Movie Magic', 'Deutsch', 'Englisch', 'Spanisch'],
    email: 'marie.fischer@example.de',
    phone: '+49 170 8889900',
    website: 'https://mariefischer-production.de',
    socialMedia: {
      linkedin: 'https://linkedin.com/in/mariefischer',
      instagram: '',
      twitter: '',
      vimeo: '',
      youtube: '',
      imdb: 'nm4567890',
      crewUnited: ''
    },
    address: {
      street: 'Elbchaussee 100',
      postalCode: '22763',
      city: 'Hamburg',
      country: 'Deutschland'
    },
    region: 'Hamburg',
    coordinates: { lat: 53.5459, lon: 9.9055 },
    willingToTravel: true,
    travelRadius: 200,
    remoteWork: true,
    dayRate: 750,
    halfDayRate: 450,
    hasOwnEquipment: false,
    bio: 'Erfahrene Produktionsleitung für Werbefilm und Content. Von der Kalkulation bis zum Wrap - alles im Griff.',
    portfolio: [],
    visibility: {
      dayRate: true,
      address: true,
      email: false,
      phone: false,
      website: true,
      socialMedia: true,
      bio: true
    },
    rating: 4.9,
    verified: true
  },
  {
    id: 12,
    firstName: 'David',
    lastName: 'Koch',
    avatar: '🚗',
    professions: ['Set Runner', 'Location Scout'],
    experience: 3,
    tags: ['Fahrer', 'Location', 'Catering', 'Set-Aufbau', 'Logistik', 'Führerschein B', 'Deutsch', 'Englisch', 'Türkisch'],
    email: 'david.koch@example.de',
    phone: '+49 171 1234567',
    website: '',
    socialMedia: {
      linkedin: '',
      instagram: '',
      twitter: '',
      vimeo: '',
      youtube: '',
      imdb: '',
      crewUnited: ''
    },
    address: {
      street: 'Kreuzberg Straße 55',
      postalCode: '10965',
      city: 'Berlin',
      country: 'Deutschland'
    },
    region: 'Berlin-Brandenburg',
    coordinates: { lat: 52.4934, lon: 13.3912 },
    willingToTravel: true,
    travelRadius: 50,
    remoteWork: false,
    dayRate: 280,
    halfDayRate: 180,
    hasOwnEquipment: false,
    bio: 'Flexibler Set Runner und Location Scout in Berlin. Zuverlässig und schnell.',
    portfolio: [],
    visibility: {
      dayRate: true,
      address: true,
      email: true,
      phone: true,
      website: true,
      socialMedia: true,
      bio: true
    },
    rating: 4.3,
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
