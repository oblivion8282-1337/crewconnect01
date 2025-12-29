/**
 * Vordefinierte Optionen für Freelancer-Profile
 * Diese Listen dienen als Vorschläge und verhindern Tippfehler.
 */

/**
 * Berufe / Gewerke in der Film- und Medienbranche
 */
export const PROFESSIONS = [
  // Kamera
  'Director of Photography (DoP)',
  'Kameramann/Kamerafrau',
  'Kameraassistent/in',
  'Steadicam Operator',
  'Drohnen-Pilot',
  'DIT (Digital Imaging Technician)',

  // Ton
  'Tonmeister/in',
  'Tonassistent/in',
  'Boom Operator',
  'Sound Designer',
  'Mischtonmeister/in',

  // Licht
  'Oberbeleuchter/in',
  'Beleuchter/in',
  'Gaffer',
  'Best Boy',

  // Regie & Produktion
  'Regisseur/in',
  'Regieassistent/in',
  'Producer',
  'Line Producer',
  'Produktionsleiter/in',
  'Aufnahmeleiter/in',
  'Set Runner',

  // Post-Production
  'Editor / Cutter',
  'Colorist',
  'VFX Artist',
  'Motion Designer',
  'Compositor',
  'Online Editor',

  // Ausstattung
  'Szenenbildner/in',
  'Requisiteur/in',
  'Set Decorator',
  'Prop Master',

  // Kostüm & Maske
  'Kostümbildner/in',
  'Maskenbildner/in',
  'Hair & Make-up Artist',
  'SFX Make-up',

  // Sonstige
  'Stunt Coordinator',
  'Location Scout',
  'Casting Director',
  'Script Supervisor',
  'Fotograf/in (Set)',
  'Making-of Kamera'
];

/**
 * Skills / Spezialisierungen
 */
export const SKILLS = [
  // Kamera-Skills
  'Steadicam',
  'Gimbal',
  'Drohne',
  'Unterwasser',
  'Highspeed / Slow-Motion',
  'Timelapse',
  'Macro',
  '3D / Stereoskopie',
  'VR / 360°',
  'Greenscreen',
  'Motion Control',

  // Ton-Skills
  'Boom Operating',
  'Funkstrecken',
  'Lavalier',
  'Atmo Recording',
  'Foley',
  'ADR',
  'Mixing',
  'Sound Design',
  'Musik-Produktion',

  // Post-Skills
  'Color Grading',
  'Conforming',
  'Compositing',
  'Motion Graphics',
  '3D Animation',
  'VFX',
  'Rotoscoping',
  'Audio Mastering',

  // Software
  'DaVinci Resolve',
  'Premiere Pro',
  'Final Cut Pro',
  'Avid Media Composer',
  'After Effects',
  'Nuke',
  'Cinema 4D',
  'Blender',
  'Pro Tools',
  'Logic Pro',
  'Ableton Live',

  // Genres / Formate
  'Werbefilm',
  'Dokumentation',
  'Spielfilm',
  'Musikvideo',
  'Corporate Film',
  'Social Media Content',
  'Live / Event',
  'TV-Produktion',
  'News / ENG',

  // Soft Skills
  'Mehrsprachig',
  'Remote-Arbeit',
  'Internationale Projekte',
  'Führungserfahrung'
];

/**
 * Equipment-Kategorien und gängige Geräte
 */
export const EQUIPMENT = [
  // Kameras
  'ARRI Alexa Mini',
  'ARRI Alexa 35',
  'RED V-Raptor',
  'RED Komodo',
  'Sony Venice',
  'Sony FX9',
  'Sony FX6',
  'Sony FX3',
  'Sony A7S III',
  'Blackmagic Pocket 6K',
  'Blackmagic URSA Mini',
  'Canon C70',
  'Canon C300 III',
  'Canon R5',
  'Panasonic S1H',
  'Panasonic GH6',

  // Objektive
  'ARRI Signature Primes',
  'ARRI Master Primes',
  'Zeiss Supreme Primes',
  'Zeiss CP.3',
  'Cooke S4',
  'Canon CN-E Primes',
  'Sony CineAlta Primes',
  'Sigma Cine Primes',
  'Angenieux Optimo Zoom',

  // Stabilisierung
  'DJI Ronin 4D',
  'DJI RS 3 Pro',
  'Freefly MōVI Pro',
  'Steadicam',
  'Easyrig',
  'Slider',
  'Stativ (Sachtler)',
  'Stativ (O\'Connor)',

  // Drohnen
  'DJI Inspire 3',
  'DJI Mavic 3 Pro',
  'DJI Mini 4 Pro',
  'FPV Drohne',

  // Licht
  'ARRI SkyPanel',
  'ARRI Orbiter',
  'Aputure 600d',
  'Aputure 300x',
  'Aputure MC',
  'Nanlite Forza',
  'Astera Tubes',
  'Kino Flo',
  'Dedolight',
  'HMI 1.2kW',
  'HMI 4kW',

  // Ton
  'Sound Devices MixPre-10',
  'Sound Devices 833',
  'Zoom F8n Pro',
  'Sennheiser MKH416',
  'Sennheiser MKH50',
  'Schoeps CMC6',
  'DPA 4017',
  'Rode NTG5',
  'Sennheiser G4 Funkstrecke',
  'Lectrosonics',
  'DPA Lavalier',
  'Sanken COS-11',

  // Monitore & Recorder
  'SmallHD Cine 7',
  'Atomos Ninja V',
  'Atomos Shogun',
  'TVLogic',
  'Teradek Bolt',

  // Post-Production
  'Mac Studio M2 Ultra',
  'Mac Pro',
  'DaVinci Resolve Studio',
  'Eizo ColorEdge',
  'Blackmagic DeckLink',
  'RAID Storage',
  'LTO Archiv'
];

/**
 * Portfolio-Kategorien
 */
export const PORTFOLIO_CATEGORIES = [
  { value: 'commercial', label: 'Werbefilm' },
  { value: 'documentary', label: 'Dokumentation' },
  { value: 'music_video', label: 'Musikvideo' },
  { value: 'feature_film', label: 'Spielfilm' },
  { value: 'short_film', label: 'Kurzfilm' },
  { value: 'corporate', label: 'Corporate Film' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'showreel', label: 'Showreel' },
  { value: 'tv', label: 'TV-Produktion' },
  { value: 'event', label: 'Event / Live' },
  { value: 'other', label: 'Sonstiges' }
];

/**
 * Social Media Plattformen
 */
export const SOCIAL_MEDIA_PLATFORMS = [
  { key: 'linkedin', label: 'LinkedIn', icon: 'linkedin', urlPrefix: 'https://linkedin.com/in/' },
  { key: 'instagram', label: 'Instagram', icon: 'instagram', urlPrefix: 'https://instagram.com/' },
  { key: 'twitter', label: 'X (Twitter)', icon: 'twitter', urlPrefix: 'https://x.com/' },
  { key: 'vimeo', label: 'Vimeo', icon: 'video', urlPrefix: 'https://vimeo.com/' },
  { key: 'youtube', label: 'YouTube', icon: 'youtube', urlPrefix: 'https://youtube.com/@' },
  { key: 'imdb', label: 'IMDb', icon: 'film', urlPrefix: 'https://imdb.com/name/' },
  { key: 'crewUnited', label: 'Crew United', icon: 'users', urlPrefix: 'https://crew-united.com/' }
];

/**
 * Sichtbarkeits-Optionen
 */
export const VISIBILITY_OPTIONS = [
  { key: 'dayRate', label: 'Tagessatz' },
  { key: 'address', label: 'Adresse' },
  { key: 'email', label: 'E-Mail-Adresse' },
  { key: 'phone', label: 'Telefonnummer' },
  { key: 'website', label: 'Website' },
  { key: 'socialMedia', label: 'Social Media' },
  { key: 'equipment', label: 'Equipment' },
  { key: 'bio', label: 'Über mich' }
];

/**
 * Sprachen
 */
export const LANGUAGES = [
  'Deutsch',
  'Englisch',
  'Französisch',
  'Spanisch',
  'Italienisch',
  'Portugiesisch',
  'Niederländisch',
  'Polnisch',
  'Russisch',
  'Türkisch',
  'Arabisch',
  'Chinesisch',
  'Japanisch',
  'Koreanisch'
];
