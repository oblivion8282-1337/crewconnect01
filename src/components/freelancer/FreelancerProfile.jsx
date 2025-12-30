import React, { useState } from 'react';
import {
  Pencil, Check, X, Star, BadgeCheck, MapPin, Globe, Phone, Mail,
  Linkedin, Instagram, Twitter, Youtube, Film, Users, Video,
  Plus, Trash2, ExternalLink, Eye, EyeOff, Lock, Laptop, Palette
} from 'lucide-react';
import {
  TextField,
  TextAreaField,
  NumberField,
  CheckboxField,
  ComboboxField,
  ProfileSection,
  ProfileAvatar
} from '../shared/ProfileField';
import {
  PROFESSIONS,
  TAGS,
  PORTFOLIO_CATEGORIES,
  SOCIAL_MEDIA_PLATFORMS
} from '../../constants/profileOptions';
import AddressAutocomplete from '../shared/AddressAutocomplete';
import AccentColorPicker from '../shared/AccentColorPicker';
import CalendarVisibilitySettings from './CalendarVisibilitySettings';

/**
 * VisibilityToggle - Kleiner Toggle für Sichtbarkeitseinstellungen
 */
const VisibilityToggle = ({ field, label, isVisible, onToggle }) => (
  <button
    onClick={() => onToggle(field)}
    className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors ${
      isVisible
        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50'
        : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
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
  onAddTag,
  onRemoveTag,
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
        <div className="bg-white dark:bg-gray-800 rounded-card shadow-sm p-8 text-center text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
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
    const { professions, tags, portfolio, socialMedia, visibility, ...simpleFields } = editData;
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
      <div className="bg-white dark:bg-gray-800 rounded-card shadow-sm p-6 mb-4 border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <ProfileAvatar
              imageUrl={currentData.profileImage}
              firstName={currentData.firstName}
              lastName={currentData.lastName}
              size="xl"
            />
            <div>
              {isEditing ? (
                <div className="flex gap-2 mb-1">
                  <input
                    type="text"
                    value={currentData.firstName || ''}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    placeholder="Vorname"
                    className="text-xl font-bold bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-1.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 w-32 border border-gray-200 dark:border-gray-600"
                  />
                  <input
                    type="text"
                    value={currentData.lastName || ''}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    placeholder="Nachname"
                    className="text-xl font-bold bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-1.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 w-40 border border-gray-200 dark:border-gray-600"
                  />
                </div>
              ) : (
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{fullName}</h1>
              )}
              <p className="text-lg text-gray-600 dark:text-gray-400">{professionsDisplay}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  {currentData.rating}
                </span>
                {currentData.verified && (
                  <span className="flex items-center gap-1 bg-primary/20 text-primary px-2 py-0.5 rounded-full text-sm">
                    <BadgeCheck className="w-4 h-4" /> Verifiziert
                  </span>
                )}
                <span className="text-sm text-gray-500 dark:text-gray-400">{currentData.experience} Jahre</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button onClick={handleSaveEdit} className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors" title="Speichern">
                  <Check className="w-5 h-5" />
                </button>
                <button onClick={handleCancelEdit} className="p-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors" title="Abbrechen">
                  <X className="w-5 h-5" />
                </button>
              </>
            ) : (
              <button onClick={handleStartEdit} className="p-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors" title="Bearbeiten">
                <Pencil className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Berufe */}
      <ProfileSection title="Berufe / Gewerke">
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
      <ProfileSection title="Standort & Reisebereitschaft"
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
              <p className="text-sm text-gray-500 dark:text-gray-400">Straße</p>
              <p className="font-medium text-gray-900 dark:text-white">{profile.address?.street || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">PLZ / Stadt</p>
              <p className="font-medium text-gray-900 dark:text-white">{profile.address?.postalCode} {profile.address?.city}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Land</p>
              <p className="font-medium text-gray-900 dark:text-white">{profile.address?.country || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Region</p>
              <p className="font-medium text-gray-900 dark:text-white">{profile.region || '-'}</p>
            </div>
          </div>
        )}

        {/* Reisebereitschaft & Remote Toggles */}
        <div className="mt-6 flex flex-wrap gap-6">
          {isEditing ? (
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-3 cursor-pointer text-gray-700 dark:text-gray-300">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={currentData.willingToTravel || false}
                    onChange={(e) => handleChange('willingToTravel', e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-11 h-6 rounded-full transition-colors ${
                    currentData.willingToTravel ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
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
                    className="w-20 p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    placeholder="km"
                  />
                  <span className="text-sm text-gray-500 dark:text-gray-400">km Radius</span>
                </div>
              )}
            </div>
          ) : (
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
              profile.willingToTravel
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
            }`}>
              <MapPin className="w-4 h-4" />
              {profile.willingToTravel
                ? `Reisebereit (${profile.travelRadius} km)`
                : 'Nicht reisebereit'}
            </div>
          )}

          {isEditing ? (
            <label className="flex items-center gap-3 cursor-pointer text-gray-700 dark:text-gray-300">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={currentData.remoteWork || false}
                  onChange={(e) => handleChange('remoteWork', e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-11 h-6 rounded-full transition-colors ${
                  currentData.remoteWork ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'
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
                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
            }`}>
              <Laptop className="w-4 h-4" />
              {profile.remoteWork ? 'Remote-Arbeit möglich' : 'Keine Remote-Arbeit'}
            </div>
          )}
        </div>
      </ProfileSection>

      {/* Konditionen */}
      <ProfileSection title="Konditionen"
        extra={<VisibilityToggle field="dayRate" label="Konditionen" isVisible={profile.visibility?.dayRate ?? true} onToggle={onToggleVisibility} />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <NumberField label="Tagessatz" value={currentData.dayRate}
            onChange={(v) => handleChange('dayRate', v)} isEditing={isEditing} suffix=" €" />
          <NumberField label="Halbtages-Satz" value={currentData.halfDayRate}
            onChange={(v) => handleChange('halfDayRate', v)} isEditing={isEditing} suffix=" €" />
        </div>
      </ProfileSection>

      {/* Tags (Skills, Equipment, Sprachen) */}
      <ProfileSection title="Tags">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          Skills, Equipment und Sprachen in einem
        </p>
        <ComboboxField
          values={profile.tags || []}
          suggestions={TAGS}
          onAdd={onAddTag}
          onRemove={onRemoveTag}
          isEditing={isEditing}
          placeholder="Tag suchen..."
          color="gray"
          maxSuggestions={20}
        />
        <div className="mt-4">
          <CheckboxField label="Eigenes Equipment vorhanden" value={currentData.hasOwnEquipment}
            onChange={(v) => handleChange('hasOwnEquipment', v)} isEditing={isEditing} />
        </div>
      </ProfileSection>

      {/* Über mich */}
      <ProfileSection title="Über mich"
        extra={<VisibilityToggle field="bio" label="Bio" isVisible={profile.visibility?.bio ?? true} onToggle={onToggleVisibility} />}>
        <TextAreaField label="" value={currentData.bio}
          onChange={(v) => handleChange('bio', v)} isEditing={isEditing}
          placeholder="Erzähle etwas über dich..." rows={5} />
      </ProfileSection>

      {/* Portfolio */}
      <ProfileSection title="Portfolio">
        {(profile.portfolio || []).length === 0 && !isEditing && (
          <p className="text-gray-400 dark:text-gray-500">Keine Portfolio-Einträge</p>
        )}

        <div className="space-y-4">
          {(profile.portfolio || []).map(item => (
            <div key={item.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-gray-50 dark:bg-gray-900">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">{item.title || 'Ohne Titel'}</h4>
                    <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">
                      {PORTFOLIO_CATEGORIES.find(c => c.value === item.category)?.label || item.category}
                    </span>
                  </div>
                  {item.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{item.description}</p>
                  )}
                  <a href={item.url} target="_blank" rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-1">
                    {item.url} <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                {isEditing && (
                  <button onClick={() => onRemovePortfolioItem(item.id)}
                    className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {isEditing && (
          <div className="mt-4">
            {showAddPortfolio ? (
              <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-gray-50 dark:bg-gray-900 space-y-3">
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
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Kategorie</label>
                  <select value={newPortfolioItem.category}
                    onChange={(e) => setNewPortfolioItem(p => ({ ...p, category: e.target.value }))}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                    {PORTFOLIO_CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleAddPortfolio}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:opacity-90 transition-opacity">
                    Hinzufügen
                  </button>
                  <button onClick={() => setShowAddPortfolio(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    Abbrechen
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowAddPortfolio(true)}
                className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
                <Plus className="w-4 h-4" /> Portfolio-Eintrag hinzufügen
              </button>
            )}
          </div>
        )}
      </ProfileSection>

      {/* Social Media */}
      <ProfileSection title="Social Media"
        extra={<VisibilityToggle field="socialMedia" label="Social Media" isVisible={profile.visibility?.socialMedia ?? true} onToggle={onToggleVisibility} />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SOCIAL_MEDIA_PLATFORMS.map(platform => {
            const Icon = getSocialIcon(platform.key);
            const value = profile.socialMedia?.[platform.key] || '';

            return (
              <div key={platform.key} className="flex items-center gap-3">
                <Icon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                {isEditing ? (
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => onUpdateSocialMedia(platform.key, e.target.value)}
                    placeholder={platform.label}
                    className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                ) : value ? (
                  <a href={value.startsWith('http') ? value : platform.urlPrefix + value}
                    target="_blank" rel="noopener noreferrer"
                    className="text-primary hover:underline text-sm">
                    {platform.label}
                  </a>
                ) : (
                  <span className="text-gray-400 dark:text-gray-500 text-sm">-</span>
                )}
              </div>
            );
          })}
        </div>
      </ProfileSection>

      {/* Kontakt */}
      <ProfileSection title="Kontakt"
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

      {/* Kalender-Sichtbarkeit */}
      <ProfileSection title="Kalender-Sichtbarkeit">
        <CalendarVisibilitySettings
          visibility={profile.calendarVisibility}
          onChange={(visibility) => onUpdate({ calendarVisibility: visibility })}
        />
      </ProfileSection>

      {/* Account-Einstellungen */}
      <ProfileSection title="Account-Einstellungen">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">E-Mail-Adresse</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{profile.email}</p>
              </div>
            </div>
            <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              Ändern
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Passwort</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">••••••••</p>
              </div>
            </div>
            <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              Ändern
            </button>
          </div>

          {/* Akzentfarbe */}
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <Palette className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Akzentfarbe</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Wähle deine bevorzugte Farbe für die App</p>
              </div>
            </div>
            <AccentColorPicker />
          </div>
        </div>
      </ProfileSection>
    </div>
  );
};

export default FreelancerProfile;
