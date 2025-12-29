import React, { useState } from 'react';
import {
  Pencil, Check, X, Star, BadgeCheck, MapPin, Globe, Phone, Mail,
  Linkedin, Instagram, Twitter, Youtube, Film, Users, Video,
  Plus, Trash2, ExternalLink, Eye, EyeOff, Lock, Laptop
} from 'lucide-react';
import {
  TextField,
  TextAreaField,
  NumberField,
  CheckboxField,
  ComboboxField,
  ProfileSection
} from '../shared/ProfileField';
import {
  PROFESSIONS,
  SKILLS,
  EQUIPMENT,
  LANGUAGES,
  PORTFOLIO_CATEGORIES,
  SOCIAL_MEDIA_PLATFORMS
} from '../../constants/profileOptions';
import AddressAutocomplete from '../shared/AddressAutocomplete';

/**
 * VisibilityToggle - Kleiner Toggle für Sichtbarkeitseinstellungen
 */
const VisibilityToggle = ({ field, label, isVisible, onToggle }) => (
  <button
    onClick={() => onToggle(field)}
    className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors ${
      isVisible
        ? 'bg-green-100 text-green-700 hover:bg-green-200'
        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
    }`}
    title={isVisible ? `${label} wird in der Suche angezeigt` : `${label} wird in der Suche versteckt`}
  >
    {isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
    <span>{isVisible ? 'Sichtbar' : 'Versteckt'}</span>
  </button>
);

/**
 * FreelancerProfile - Profilansicht für Freelancer
 */
const FreelancerProfile = ({
  profile,
  onUpdate,
  onAddProfession,
  onRemoveProfession,
  onAddSkill,
  onRemoveSkill,
  onAddEquipment,
  onRemoveEquipment,
  onAddLanguage,
  onRemoveLanguage,
  onAddPortfolioItem,
  onUpdatePortfolioItem,
  onRemovePortfolioItem,
  onUpdateSocialMedia,
  onToggleVisibility
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
    const { professions, skills, equipment, languages, portfolio, socialMedia, visibility, ...simpleFields } = editData;
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
  const fullName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || '-';
  const professionsDisplay = (profile.professions || []).join(' / ') || '-';

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
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow p-6 mb-4 text-white">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="text-6xl">{currentData.avatar}</div>
            <div>
              {isEditing ? (
                <div className="flex gap-2 mb-1">
                  <input
                    type="text"
                    value={currentData.firstName || ''}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    placeholder="Vorname"
                    className="text-xl font-bold bg-white/20 rounded px-2 py-1 text-white placeholder-white/50 w-32"
                  />
                  <input
                    type="text"
                    value={currentData.lastName || ''}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    placeholder="Nachname"
                    className="text-xl font-bold bg-white/20 rounded px-2 py-1 text-white placeholder-white/50 w-40"
                  />
                </div>
              ) : (
                <h1 className="text-2xl font-bold">{fullName}</h1>
              )}
              <p className="text-lg text-white/90">{professionsDisplay}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  {currentData.rating}
                </span>
                {currentData.verified && (
                  <span className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full text-sm">
                    <BadgeCheck className="w-4 h-4" /> Verifiziert
                  </span>
                )}
                <span className="text-sm text-white/80">{currentData.experience} Jahre</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button onClick={handleSaveEdit} className="p-2 bg-green-500 rounded-lg hover:bg-green-600" title="Speichern">
                  <Check className="w-5 h-5" />
                </button>
                <button onClick={handleCancelEdit} className="p-2 bg-white/20 rounded-lg hover:bg-white/30" title="Abbrechen">
                  <X className="w-5 h-5" />
                </button>
              </>
            ) : (
              <button onClick={handleStartEdit} className="p-2 bg-white/20 rounded-lg hover:bg-white/30" title="Bearbeiten">
                <Pencil className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Berufe */}
      <ProfileSection title="Berufe / Gewerke" icon="💼">
        <ComboboxField
          values={profile.professions || []}
          suggestions={PROFESSIONS}
          onAdd={onAddProfession}
          onRemove={onRemoveProfession}
          isEditing={isEditing}
          placeholder="Beruf suchen..."
          color="gray"
          maxSuggestions={15}
        />
        {isEditing && (
          <NumberField label="Jahre Erfahrung" value={currentData.experience}
            onChange={(v) => handleChange('experience', v)} isEditing={isEditing} suffix=" Jahre" />
        )}
      </ProfileSection>

      {/* Standort */}
      <ProfileSection title="Standort & Reisebereitschaft" icon="📍"
        extra={<VisibilityToggle field="address" label="Adresse" isVisible={profile.visibility?.address ?? true} onToggle={onToggleVisibility} />}>
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
                  handleChange('region', selected.address.state || '');
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
            <TextField label="Region/Bundesland" value={currentData.region || ''}
              onChange={(v) => handleChange('region', v)} isEditing={true} />
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
            <div>
              <p className="text-sm text-gray-500">Region</p>
              <p className="font-medium">{profile.region || '-'}</p>
            </div>
          </div>
        )}

        {/* Reisebereitschaft & Remote Toggles */}
        <div className="mt-6 flex flex-wrap gap-6">
          {/* Reisebereitschaft Toggle */}
          {isEditing ? (
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={currentData.willingToTravel || false}
                    onChange={(e) => handleChange('willingToTravel', e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-11 h-6 rounded-full transition-colors ${
                    currentData.willingToTravel ? 'bg-blue-500' : 'bg-gray-300'
                  }`}>
                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      currentData.willingToTravel ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </div>
                </div>
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Reisebereit
                </span>
              </label>
              {currentData.willingToTravel && (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={currentData.travelRadius || ''}
                    onChange={(e) => handleChange('travelRadius', parseInt(e.target.value) || 0)}
                    className="w-20 p-2 border rounded-lg text-sm"
                    placeholder="km"
                  />
                  <span className="text-sm text-gray-500">km Radius</span>
                </div>
              )}
            </div>
          ) : (
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
              profile.willingToTravel
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-500'
            }`}>
              <MapPin className="w-4 h-4" />
              {profile.willingToTravel
                ? `Reisebereit (${profile.travelRadius} km)`
                : 'Nicht reisebereit'}
            </div>
          )}

          {/* Remote Work Toggle */}
          {isEditing ? (
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={currentData.remoteWork || false}
                  onChange={(e) => handleChange('remoteWork', e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-11 h-6 rounded-full transition-colors ${
                  currentData.remoteWork ? 'bg-green-500' : 'bg-gray-300'
                }`}>
                  <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    currentData.remoteWork ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </div>
              </div>
              <span className="flex items-center gap-2">
                <Laptop className="w-4 h-4" />
                Remote-Arbeit möglich
              </span>
            </label>
          ) : (
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
              profile.remoteWork
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-500'
            }`}>
              <Laptop className="w-4 h-4" />
              {profile.remoteWork ? 'Remote-Arbeit möglich' : 'Keine Remote-Arbeit'}
            </div>
          )}
        </div>
      </ProfileSection>

      {/* Konditionen */}
      <ProfileSection title="Konditionen" icon="💰"
        extra={<VisibilityToggle field="dayRate" label="Konditionen" isVisible={profile.visibility?.dayRate ?? true} onToggle={onToggleVisibility} />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <NumberField label="Tagessatz" value={currentData.dayRate}
            onChange={(v) => handleChange('dayRate', v)} isEditing={isEditing} suffix=" €" />
          <NumberField label="Halbtages-Satz" value={currentData.halfDayRate}
            onChange={(v) => handleChange('halfDayRate', v)} isEditing={isEditing} suffix=" €" />
        </div>
      </ProfileSection>

      {/* Skills */}
      <ProfileSection title="Skills & Spezialisierungen" icon="🎯">
        <ComboboxField
          values={profile.skills || []}
          suggestions={SKILLS}
          onAdd={onAddSkill}
          onRemove={onRemoveSkill}
          isEditing={isEditing}
          placeholder="Skill suchen..."
          color="blue"
          maxSuggestions={15}
        />
      </ProfileSection>

      {/* Equipment */}
      <ProfileSection title="Equipment" icon="🎥"
        extra={<VisibilityToggle field="equipment" label="Equipment" isVisible={profile.visibility?.equipment ?? true} onToggle={onToggleVisibility} />}>
        <CheckboxField label="Eigenes Equipment vorhanden" value={currentData.hasOwnEquipment}
          onChange={(v) => handleChange('hasOwnEquipment', v)} isEditing={isEditing} />
        {(isEditing ? currentData.hasOwnEquipment : profile.hasOwnEquipment) && (
          <ComboboxField
            values={profile.equipment || []}
            suggestions={EQUIPMENT}
            onAdd={onAddEquipment}
            onRemove={onRemoveEquipment}
            isEditing={isEditing}
            placeholder="Equipment suchen..."
            color="purple"
            maxSuggestions={15}
          />
        )}
      </ProfileSection>

      {/* Sprachen */}
      <ProfileSection title="Sprachen" icon="🌐">
        <ComboboxField
          values={profile.languages || []}
          suggestions={LANGUAGES}
          onAdd={onAddLanguage}
          onRemove={onRemoveLanguage}
          isEditing={isEditing}
          placeholder="Sprache suchen..."
          color="green"
          maxSuggestions={14}
        />
      </ProfileSection>

      {/* Über mich */}
      <ProfileSection title="Über mich" icon="📝"
        extra={<VisibilityToggle field="bio" label="Bio" isVisible={profile.visibility?.bio ?? true} onToggle={onToggleVisibility} />}>
        <TextAreaField label="" value={currentData.bio}
          onChange={(v) => handleChange('bio', v)} isEditing={isEditing}
          placeholder="Erzähle etwas über dich..." rows={5} />
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
                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                      {PORTFOLIO_CATEGORIES.find(c => c.value === item.category)?.label || item.category}
                    </span>
                  </div>
                  {item.description && (
                    <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                  )}
                  <a href={item.url} target="_blank" rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline flex items-center gap-1">
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
                  isEditing={true} placeholder="z.B. Mercedes Werbespot 2024" />
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
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
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
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
                <Plus className="w-4 h-4" /> Portfolio-Eintrag hinzufügen
              </button>
            )}
          </div>
        )}
      </ProfileSection>

      {/* Social Media */}
      <ProfileSection title="Social Media" icon="📱"
        extra={<VisibilityToggle field="socialMedia" label="Social Media" isVisible={profile.visibility?.socialMedia ?? true} onToggle={onToggleVisibility} />}>
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
                    className="flex-1 p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : value ? (
                  <a href={value.startsWith('http') ? value : platform.urlPrefix + value}
                    target="_blank" rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm">
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

      {/* Kontakt */}
      <ProfileSection title="Kontakt" icon="📞"
        extra={
          <div className="flex gap-2">
            <VisibilityToggle field="email" label="E-Mail" isVisible={profile.visibility?.email ?? true} onToggle={onToggleVisibility} />
            <VisibilityToggle field="phone" label="Telefon" isVisible={profile.visibility?.phone ?? true} onToggle={onToggleVisibility} />
            <VisibilityToggle field="website" label="Website" isVisible={profile.visibility?.website ?? true} onToggle={onToggleVisibility} />
          </div>
        }>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField label="E-Mail" value={currentData.email}
            onChange={(v) => handleChange('email', v)} isEditing={isEditing}
            type="email" icon={<Mail className="w-4 h-4 inline" />} />
          <TextField label="Telefon" value={currentData.phone}
            onChange={(v) => handleChange('phone', v)} isEditing={isEditing}
            type="tel" icon={<Phone className="w-4 h-4 inline" />} />
        </div>
        <TextField label="Website" value={currentData.website}
          onChange={(v) => handleChange('website', v)} isEditing={isEditing}
          type="url" icon={<Globe className="w-4 h-4 inline" />} />
      </ProfileSection>

      {/* Account-Einstellungen */}
      <ProfileSection title="Account-Einstellungen" icon="⚙️">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-500" />
              <div>
                <p className="font-medium">E-Mail-Adresse</p>
                <p className="text-sm text-gray-600">{profile.email}</p>
              </div>
            </div>
            <button className="px-4 py-2 border rounded-lg text-sm hover:bg-white">
              Ändern
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-gray-500" />
              <div>
                <p className="font-medium">Passwort</p>
                <p className="text-sm text-gray-600">••••••••</p>
              </div>
            </div>
            <button className="px-4 py-2 border rounded-lg text-sm hover:bg-white">
              Ändern
            </button>
          </div>
        </div>
      </ProfileSection>
    </div>
  );
};

export default FreelancerProfile;
