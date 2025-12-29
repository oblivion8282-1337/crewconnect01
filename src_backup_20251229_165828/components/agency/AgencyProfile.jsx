import React, { useState } from 'react';
import {
  Pencil, Check, X, Globe, Phone, Mail, MapPin, Building2, Users, Calendar,
  Linkedin, Instagram, Twitter, Youtube, Film, Video,
  Plus, Trash2, ExternalLink
} from 'lucide-react';
import {
  TextField,
  TextAreaField,
  SelectField,
  ProfileSection
} from '../shared/ProfileField';
import {
  PORTFOLIO_CATEGORIES,
  SOCIAL_MEDIA_PLATFORMS
} from '../../constants/profileOptions';
import AddressAutocomplete from '../shared/AddressAutocomplete';

/**
 * AgencyProfile - Profilansicht für Agenturen
 */
const AgencyProfile = ({
  profile,
  onUpdate,
  onUpdateSocialMedia,
  onAddPortfolioItem,
  onUpdatePortfolioItem,
  onRemovePortfolioItem
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [showAddPortfolio, setShowAddPortfolio] = useState(false);
  const [newPortfolioItem, setNewPortfolioItem] = useState({
    url: '', title: '', description: '', category: 'other'
  });

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
          Kein Profil gefunden
        </div>
      </div>
    );
  }

  const handleStartEdit = () => {
    setEditData({ ...profile });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditData({});
    setIsEditing(false);
  };

  const handleSaveEdit = () => {
    // Nur die einfachen Felder speichern, Arrays werden direkt aktualisiert
    const { portfolio, socialMedia, ...simpleFields } = editData;
    onUpdate(simpleFields);
    setIsEditing(false);
  };

  const handleChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddPortfolio = () => {
    if (newPortfolioItem.url.trim()) {
      onAddPortfolioItem(newPortfolioItem);
      setNewPortfolioItem({ url: '', title: '', description: '', category: 'other' });
      setShowAddPortfolio(false);
    }
  };

  const currentData = isEditing ? editData : profile;
  const contactFullName = `${profile.contactFirstName || ''} ${profile.contactLastName || ''}`.trim() || '-';

  const employeeCountOptions = [
    '1-10',
    '11-50',
    '51-200',
    '201-500',
    '500+'
  ];

  const industryOptions = [
    'Werbefilm & Branded Content',
    'Dokumentation',
    'Spielfilm',
    'TV-Produktion',
    'Musikvideo',
    'Event & Live',
    'Corporate Film',
    'Social Media Content',
    'Animation & VFX',
    'Sonstiges'
  ];

  // Social Media Icon Mapping
  const getSocialIcon = (key) => {
    const icons = {
      linkedin: Linkedin,
      instagram: Instagram,
      twitter: Twitter,
      youtube: Youtube,
      vimeo: Video,
      imdb: Film,
      crewUnited: Users
    };
    return icons[key] || Globe;
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header mit Logo und Namen */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow p-6 mb-4 text-white">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="text-6xl">{currentData.logo}</div>
            <div>
              {isEditing ? (
                <input
                  type="text"
                  value={currentData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="text-2xl font-bold bg-white/20 rounded px-2 py-1 text-white placeholder-white/50"
                />
              ) : (
                <h1 className="text-2xl font-bold">{currentData.name}</h1>
              )}

              {isEditing ? (
                <select
                  value={currentData.industry}
                  onChange={(e) => handleChange('industry', e.target.value)}
                  className="text-lg bg-white/20 rounded px-2 py-1 text-white/90 mt-1"
                >
                  {industryOptions.map(opt => (
                    <option key={opt} value={opt} className="text-gray-900">{opt}</option>
                  ))}
                </select>
              ) : (
                <p className="text-lg text-white/90">{currentData.industry}</p>
              )}

              <div className="flex items-center gap-3 mt-2 text-sm text-white/80">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Seit {currentData.foundedYear}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {currentData.employeeCount} Mitarbeiter
                </span>
              </div>
            </div>
          </div>

          {/* Edit Buttons */}
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSaveEdit}
                  className="p-2 bg-green-500 rounded-lg hover:bg-green-600 transition-colors"
                  title="Speichern"
                >
                  <Check className="w-5 h-5" />
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                  title="Abbrechen"
                >
                  <X className="w-5 h-5" />
                </button>
              </>
            ) : (
              <button
                onClick={handleStartEdit}
                className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                title="Bearbeiten"
              >
                <Pencil className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Über uns */}
      <ProfileSection title="Über uns" icon="📝">
        <TextAreaField
          label=""
          value={currentData.description}
          onChange={(v) => handleChange('description', v)}
          isEditing={isEditing}
          placeholder="Beschreibe deine Agentur..."
          rows={5}
        />
      </ProfileSection>

      {/* Ansprechpartner */}
      <ProfileSection title="Ansprechpartner" icon="👤">
        {isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              label="Vorname"
              value={currentData.contactFirstName}
              onChange={(v) => handleChange('contactFirstName', v)}
              isEditing={isEditing}
              placeholder="Vorname"
            />
            <TextField
              label="Nachname"
              value={currentData.contactLastName}
              onChange={(v) => handleChange('contactLastName', v)}
              isEditing={isEditing}
              placeholder="Nachname"
            />
          </div>
        ) : (
          <p className="text-gray-800">{contactFullName}</p>
        )}
      </ProfileSection>

      {/* Portfolio */}
      <ProfileSection title="Portfolio" icon="🎬">
        {(profile.portfolio || []).length === 0 && !isEditing && (
          <p className="text-gray-400">Keine Portfolio-Einträge</p>
        )}

        <div className="space-y-4">
          {(profile.portfolio || []).map(item => (
            <div key={item.id} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{item.title || 'Ohne Titel'}</h4>
                    <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                      {PORTFOLIO_CATEGORIES.find(c => c.value === item.category)?.label || item.category}
                    </span>
                  </div>
                  {item.description && (
                    <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                  )}
                  <a href={item.url} target="_blank" rel="noopener noreferrer"
                    className="text-sm text-purple-600 hover:underline flex items-center gap-1">
                    {item.url} <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                {isEditing && (
                  <button onClick={() => onRemovePortfolioItem(item.id)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Neuen Eintrag hinzufügen */}
        {isEditing && (
          <div className="mt-4">
            {showAddPortfolio ? (
              <div className="border rounded-lg p-4 bg-white space-y-3">
                <TextField label="URL" value={newPortfolioItem.url}
                  onChange={(v) => setNewPortfolioItem(p => ({ ...p, url: v }))}
                  isEditing={true} placeholder="https://..." />
                <TextField label="Titel" value={newPortfolioItem.title}
                  onChange={(v) => setNewPortfolioItem(p => ({ ...p, title: v }))}
                  isEditing={true} placeholder="z.B. Mercedes Kampagne 2024" />
                <TextAreaField label="Beschreibung" value={newPortfolioItem.description}
                  onChange={(v) => setNewPortfolioItem(p => ({ ...p, description: v }))}
                  isEditing={true} placeholder="Kurze Beschreibung..." rows={2} />
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Kategorie</label>
                  <select value={newPortfolioItem.category}
                    onChange={(e) => setNewPortfolioItem(p => ({ ...p, category: e.target.value }))}
                    className="w-full p-2 border rounded-lg">
                    {PORTFOLIO_CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleAddPortfolio}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700">
                    Hinzufügen
                  </button>
                  <button onClick={() => setShowAddPortfolio(false)}
                    className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">
                    Abbrechen
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowAddPortfolio(true)}
                className="flex items-center gap-2 text-purple-600 hover:text-purple-700">
                <Plus className="w-4 h-4" /> Portfolio-Eintrag hinzufügen
              </button>
            )}
          </div>
        )}
      </ProfileSection>

      {/* Social Media */}
      <ProfileSection title="Social Media" icon="📱">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SOCIAL_MEDIA_PLATFORMS.map(platform => {
            const Icon = getSocialIcon(platform.key);
            const value = profile.socialMedia?.[platform.key] || '';

            return (
              <div key={platform.key} className="flex items-center gap-3">
                <Icon className="w-5 h-5 text-gray-500" />
                {isEditing ? (
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => onUpdateSocialMedia(platform.key, e.target.value)}
                    placeholder={platform.label}
                    className="flex-1 p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                ) : value ? (
                  <a href={value.startsWith('http') ? value : platform.urlPrefix + value}
                    target="_blank" rel="noopener noreferrer"
                    className="text-purple-600 hover:underline text-sm">
                    {platform.label}
                  </a>
                ) : (
                  <span className="text-gray-400 text-sm">-</span>
                )}
              </div>
            );
          })}
        </div>
      </ProfileSection>

      {/* Adresse */}
      <ProfileSection title="Adresse" icon="📍">
        {isEditing ? (
          <div className="space-y-4">
            <AddressAutocomplete
              label="Straße"
              value={currentData.address?.street || ''}
              onChange={(v) => handleChange('address', { ...currentData.address, street: v })}
              onSelect={(selected) => {
                if (selected) {
                  const street = `${selected.address.street} ${selected.address.houseNumber}`.trim();
                  handleChange('address', {
                    ...currentData.address,
                    street: street,
                    postalCode: selected.address.postalCode,
                    city: selected.address.city,
                    country: selected.address.country
                  });
                  handleChange('coordinates', { lat: selected.lat, lon: selected.lon });
                }
              }}
              placeholder="Straße und Hausnummer"
            />
            <div className="grid grid-cols-3 gap-4">
              <TextField label="PLZ" value={currentData.address?.postalCode || ''}
                onChange={(v) => handleChange('address', { ...currentData.address, postalCode: v })} isEditing={true} />
              <TextField label="Stadt" value={currentData.address?.city || ''}
                onChange={(v) => handleChange('address', { ...currentData.address, city: v })} isEditing={true} />
              <TextField label="Land" value={currentData.address?.country || ''}
                onChange={(v) => handleChange('address', { ...currentData.address, country: v })} isEditing={true} />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Straße</p>
              <p className="font-medium">{profile.address?.street || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">PLZ / Stadt</p>
              <p className="font-medium">{profile.address?.postalCode} {profile.address?.city}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Land</p>
              <p className="font-medium">{profile.address?.country || '-'}</p>
            </div>
          </div>
        )}
      </ProfileSection>

      {/* Kontakt */}
      <ProfileSection title="Kontakt" icon="📞">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField
            label="E-Mail"
            value={currentData.email}
            onChange={(v) => handleChange('email', v)}
            isEditing={isEditing}
            type="email"
            icon={<Mail className="w-4 h-4 inline" />}
          />
          <TextField
            label="Telefon"
            value={currentData.phone}
            onChange={(v) => handleChange('phone', v)}
            isEditing={isEditing}
            type="tel"
            icon={<Phone className="w-4 h-4 inline" />}
          />
        </div>
        <TextField
          label="Website"
          value={currentData.website}
          onChange={(v) => handleChange('website', v)}
          isEditing={isEditing}
          type="url"
          icon={<Globe className="w-4 h-4 inline" />}
        />
      </ProfileSection>

      {/* Unternehmensinfo */}
      <ProfileSection title="Unternehmensinfo" icon="ℹ️">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField
            label="Gründungsjahr"
            value={currentData.foundedYear?.toString()}
            onChange={(v) => handleChange('foundedYear', parseInt(v) || currentData.foundedYear)}
            isEditing={isEditing}
            icon={<Calendar className="w-4 h-4 inline" />}
          />
          <SelectField
            label="Mitarbeiteranzahl"
            value={currentData.employeeCount}
            onChange={(v) => handleChange('employeeCount', v)}
            isEditing={isEditing}
            options={employeeCountOptions}
            icon={<Users className="w-4 h-4 inline" />}
          />
        </div>
      </ProfileSection>
    </div>
  );
};

export default AgencyProfile;
