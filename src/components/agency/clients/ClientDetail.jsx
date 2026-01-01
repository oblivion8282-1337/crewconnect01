import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, Star, Pencil, Trash2, Globe, MapPin, Plus, X,
  Mail, Phone, User, Building2, FileText, CreditCard, Briefcase,
  ExternalLink, Check, Crown, Calendar, Euro, Save
} from 'lucide-react';
import { ClientLogo, StatusBadge } from './ClientCard';
import ClientContactForm from './ClientContactForm';
import AddressAutocomplete from '../../shared/AddressAutocomplete';
import { useUnsavedChangesContext } from '../../../contexts/UnsavedChangesContext';
import {
  getIndustryLabel,
  getPaymentTermLabel,
  INDUSTRY_OPTIONS,
  CLIENT_STATUS_OPTIONS,
  PAYMENT_TERM_OPTIONS
} from '../../../constants/clients';
import { formatDate } from '../../../utils/dateUtils';

/**
 * Tab-Button Komponente
 */
const TabButton = ({ active, onClick, icon: Icon, children, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`
      flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border-2
      ${active
        ? 'border-primary text-primary bg-primary/5 dark:bg-primary/10'
        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
      }
      ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    `}
  >
    {Icon && <Icon className="w-4 h-4" />}
    {children}
  </button>
);

/**
 * Info-Card Komponente
 */
const InfoCard = ({ icon: Icon, label, value, className = '' }) => (
  <div className={`bg-gray-50 dark:bg-gray-900 rounded-xl p-4 ${className}`}>
    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
      {Icon && <Icon className="w-4 h-4" />}
      {label}
    </div>
    <div className="text-lg font-semibold text-gray-900 dark:text-white">
      {value || '-'}
    </div>
  </div>
);

/**
 * Editierbares Feld
 */
const EditableField = ({ label, value, onChange, type = 'text', placeholder, options, isEditing }) => {
  const inputClasses = "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors";

  if (!isEditing) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
        <p className="text-gray-900 dark:text-white">{value || '-'}</p>
      </div>
    );
  }

  if (options) {
    return (
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className={inputClasses}
      >
        <option value="">Bitte wählen...</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    );
  }

  if (type === 'textarea') {
    return (
      <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClasses} resize-none`}
        rows={4}
        placeholder={placeholder}
      />
    );
  }

  return (
    <input
      type={type}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className={inputClasses}
      placeholder={placeholder}
    />
  );
};

/**
 * ClientDetail - Detailansicht eines Kunden mit Inline-Edit
 */
const ClientDetail = ({
  client,
  projects = [],
  onBack,
  onSaveClient,
  onDelete,
  onToggleFavorite,
  onAddContact,
  onEditContact,
  onRemoveContact,
  onSetPrimaryContact,
  onNavigateToProject
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showContactForm, setShowContactForm] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Edit Mode
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [newTag, setNewTag] = useState('');

  // Ungespeicherte Änderungen tracken
  const { setUnsaved, clearUnsaved, confirmNavigation } = useUnsavedChangesContext();

  // Wenn isEditing aktiv ist, gibt es ungespeicherte Änderungen
  useEffect(() => {
    setUnsaved(isEditing);
  }, [isEditing, setUnsaved]);

  // FormData initialisieren wenn client sich ändert
  useEffect(() => {
    if (client) {
      setFormData({
        companyName: client.companyName || '',
        industry: client.industry || '',
        status: client.status || 'active',
        website: client.website || '',
        address: {
          street: client.address?.street || '',
          zip: client.address?.zip || '',
          city: client.address?.city || '',
          country: client.address?.country || 'Deutschland'
        },
        tags: client.tags || [],
        notes: client.notes || '',
        billing: {
          useMainAddress: client.billing?.useMainAddress ?? true,
          address: {
            street: client.billing?.address?.street || '',
            zip: client.billing?.address?.zip || '',
            city: client.billing?.address?.city || '',
            country: client.billing?.address?.country || 'Deutschland'
          },
          vatId: client.billing?.vatId || '',
          paymentTermDays: client.billing?.paymentTermDays ?? 30,
          invoiceRecipient: client.billing?.invoiceRecipient || '',
          costCenter: client.billing?.costCenter || '',
          requiresPurchaseOrder: client.billing?.requiresPurchaseOrder || false
        }
      });
    }
  }, [client]);

  if (!client) {
    return (
      <div className="max-w-5xl mx-auto p-8 text-center text-gray-500">
        Kunde nicht gefunden
      </div>
    );
  }

  const handleSaveContact = (contactData) => {
    if (editingContact) {
      onEditContact(editingContact.id, contactData);
    } else {
      onAddContact(contactData);
    }
    setShowContactForm(false);
    setEditingContact(null);
  };

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    // FormData zurücksetzen
    setFormData({
      companyName: client.companyName || '',
      industry: client.industry || '',
      status: client.status || 'active',
      website: client.website || '',
      address: {
        street: client.address?.street || '',
        zip: client.address?.zip || '',
        city: client.address?.city || '',
        country: client.address?.country || 'Deutschland'
      },
      tags: client.tags || [],
      notes: client.notes || '',
      billing: {
        useMainAddress: client.billing?.useMainAddress ?? true,
        address: {
          street: client.billing?.address?.street || '',
          zip: client.billing?.address?.zip || '',
          city: client.billing?.address?.city || '',
          country: client.billing?.address?.country || 'Deutschland'
        },
        vatId: client.billing?.vatId || '',
        paymentTermDays: client.billing?.paymentTermDays ?? 30,
        invoiceRecipient: client.billing?.invoiceRecipient || '',
        costCenter: client.billing?.costCenter || '',
        requiresPurchaseOrder: client.billing?.requiresPurchaseOrder || false
      }
    });
    setIsEditing(false);
    setNewTag('');
    clearUnsaved();
  };

  const handleSaveEdit = () => {
    onSaveClient(formData);
    setIsEditing(false);
    clearUnsaved();
  };

  // Sichere Navigation mit Warnung bei ungespeicherten Änderungen
  const handleSafeBack = () => {
    if (confirmNavigation('Du hast ungespeicherte Änderungen. Möchtest du wirklich zurück?')) {
      setIsEditing(false);
      clearUnsaved();
      onBack();
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddressChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      address: { ...prev.address, [field]: value }
    }));
  };

  const handleBillingChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      billing: { ...prev.billing, [field]: value }
    }));
  };

  const handleBillingAddressChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      billing: {
        ...prev.billing,
        address: { ...prev.billing.address, [field]: value }
      }
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Adresse aus LocationIQ-Suggestion extrahieren
  const handleAddressSelect = (suggestion) => {
    if (!suggestion) return;
    setFormData(prev => ({
      ...prev,
      address: {
        street: [suggestion.address.street, suggestion.address.houseNumber].filter(Boolean).join(' '),
        zip: suggestion.address.postalCode || '',
        city: suggestion.address.city || '',
        country: suggestion.address.country || 'Deutschland'
      }
    }));
  };

  const handleBillingAddressSelect = (suggestion) => {
    if (!suggestion) return;
    setFormData(prev => ({
      ...prev,
      billing: {
        ...prev.billing,
        address: {
          street: [suggestion.address.street, suggestion.address.houseNumber].filter(Boolean).join(' '),
          zip: suggestion.address.postalCode || '',
          city: suggestion.address.city || '',
          country: suggestion.address.country || 'Deutschland'
        }
      }
    }));
  };

  const billingAddress = client.billing?.useMainAddress
    ? client.address
    : client.billing?.address;

  const inputClasses = "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors";

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleSafeBack}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Zurück zur Übersicht"
            >
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </button>

            <ClientLogo logo={client.logo} companyName={isEditing ? formData.companyName : client.companyName} size="lg" />

            <div>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => handleChange('companyName', e.target.value)}
                  className="text-2xl font-bold text-gray-900 dark:text-white bg-transparent border-b-2 border-primary focus:outline-none"
                  placeholder="Firmenname"
                />
              ) : (
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {client.companyName}
                  </h1>
                  <button
                    onClick={onToggleFavorite}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    aria-label={client.isFavorite ? 'Von Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
                  >
                    <Star className={`w-5 h-5 ${client.isFavorite ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600 hover:text-yellow-400'}`} />
                  </button>
                </div>
              )}

              <div className="flex items-center gap-3 mt-2">
                {isEditing ? (
                  <select
                    value={formData.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                    className="text-sm px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                  >
                    {CLIENT_STATUS_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                ) : (
                  <StatusBadge status={client.status} />
                )}
                <span className="text-gray-400">•</span>
                {isEditing ? (
                  <select
                    value={formData.industry}
                    onChange={(e) => handleChange('industry', e.target.value)}
                    className="text-sm px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                  >
                    <option value="">Branche wählen...</option>
                    {INDUSTRY_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                ) : (
                  <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1 text-sm">
                    <Briefcase className="w-4 h-4" />
                    {getIndustryLabel(client.industry)}
                  </span>
                )}

                {!isEditing && client.website && (
                  <>
                    <span className="text-gray-400">•</span>
                    <a
                      href={client.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1 text-sm"
                    >
                      <Globe className="w-4 h-4" />
                      Website
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </>
                )}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap items-center gap-1.5 mt-3">
                {(isEditing ? formData.tags : client.tags || []).map(tag => (
                  <span
                    key={tag}
                    className={`px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs ${isEditing ? 'pr-1' : ''}`}
                  >
                    #{tag}
                    {isEditing && (
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 text-gray-400 hover:text-red-500"
                      >
                        <X className="w-3 h-3 inline" />
                      </button>
                    )}
                  </span>
                ))}
                {isEditing && (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      placeholder="+ Tag"
                      className="w-20 px-2 py-0.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Aktionen */}
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Speichern
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleStartEdit}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                  Bearbeiten
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  aria-label="Kunde archivieren"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={Building2}>
          Übersicht
        </TabButton>
        <TabButton active={activeTab === 'billing'} onClick={() => setActiveTab('billing')} icon={CreditCard}>
          Rechnungsinfos
        </TabButton>
        <TabButton active={activeTab === 'contacts'} onClick={() => setActiveTab('contacts')} icon={User} disabled={isEditing}>
          Kontakte ({client.contacts?.length || 0})
        </TabButton>
        <TabButton active={activeTab === 'projects'} onClick={() => setActiveTab('projects')} icon={Briefcase} disabled={isEditing}>
          Archiv ({projects.filter(p => p.status === 'completed' || p.status === 'cancelled').length})
        </TabButton>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        {/* Übersicht Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Website im Edit-Mode */}
            {isEditing && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Website
                </h3>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleChange('website', e.target.value)}
                  className={inputClasses}
                  placeholder="https://..."
                />
              </div>
            )}

            {/* Adresse */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Adresse
              </h3>
              {isEditing ? (
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-3">
                    <AddressAutocomplete
                      value={formData.address.street}
                      onChange={(val) => handleAddressChange('street', val)}
                      onSelect={handleAddressSelect}
                      placeholder="Straße & Hausnummer"
                    />
                  </div>
                  <input
                    type="text"
                    value={formData.address.zip}
                    onChange={(e) => handleAddressChange('zip', e.target.value)}
                    className={inputClasses}
                    placeholder="PLZ"
                  />
                  <input
                    type="text"
                    value={formData.address.city}
                    onChange={(e) => handleAddressChange('city', e.target.value)}
                    className={`${inputClasses} col-span-2`}
                    placeholder="Stadt"
                  />
                  <input
                    type="text"
                    value={formData.address.country}
                    onChange={(e) => handleAddressChange('country', e.target.value)}
                    className={`${inputClasses} col-span-3`}
                    placeholder="Land"
                  />
                </div>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                  {client.address?.street && (
                    <p className="text-gray-900 dark:text-white">{client.address.street}</p>
                  )}
                  <p className="text-gray-900 dark:text-white">
                    {client.address?.zip} {client.address?.city}
                  </p>
                  {client.address?.country && (
                    <p className="text-gray-500 dark:text-gray-400">{client.address.country}</p>
                  )}
                </div>
              )}
            </div>

            {/* Notizen */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Notizen
              </h3>
              {isEditing ? (
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  className={`${inputClasses} resize-none`}
                  rows={4}
                  placeholder="Notizen zum Kunden..."
                />
              ) : (
                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 min-h-[80px]">
                  {client.notes ? (
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{client.notes}</p>
                  ) : (
                    <p className="text-gray-400 dark:text-gray-500 italic">Keine Notizen vorhanden</p>
                  )}
                </div>
              )}
            </div>

            {/* Statistiken - nur im View-Mode */}
            {!isEditing && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Statistiken
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <InfoCard icon={Briefcase} label="Projekte" value={projects.length} />
                  <InfoCard
                    icon={Calendar}
                    label="Letztes Projekt"
                    value={projects.length > 0 ? formatDate(projects[0]?.endDate || projects[0]?.startDate) : '-'}
                  />
                  <InfoCard
                    icon={Euro}
                    label="Gesamt-Budget"
                    value={projects.reduce((sum, p) => sum + (p.budget?.total || 0), 0).toLocaleString('de-DE') + ' €'}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Kontakte Tab */}
        {activeTab === 'contacts' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Ansprechpartner
              </h3>
              <button
                onClick={() => { setEditingContact(null); setShowContactForm(true); }}
                className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90"
              >
                <Plus className="w-4 h-4" />
                Hinzufügen
              </button>
            </div>

            {client.contacts?.length > 0 ? (
              <div className="space-y-3">
                {client.contacts.map(contact => (
                  <div
                    key={contact.id}
                    className="group flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary font-medium">
                          {contact.firstName?.[0]}{contact.lastName?.[0]}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900 dark:text-white truncate">
                            {contact.firstName} {contact.lastName}
                          </p>
                          {contact.isPrimary && (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full flex-shrink-0">
                              <Crown className="w-3 h-3" />
                              Hauptkontakt
                            </span>
                          )}
                        </div>
                        {contact.position && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{contact.position}</p>
                        )}
                        <div className="flex items-center gap-4 mt-1 text-sm">
                          {contact.email && (
                            <a href={`mailto:${contact.email}`} className="text-primary hover:underline flex items-center gap-1 truncate">
                              <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="truncate">{contact.email}</span>
                            </a>
                          )}
                          {contact.phone && (
                            <a href={`tel:${contact.phone}`} className="text-gray-600 dark:text-gray-400 hover:text-primary flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                              {contact.phone}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Aktionen - Nur bei Hover sichtbar */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!contact.isPrimary && (
                        <button
                          onClick={() => onSetPrimaryContact(contact.id)}
                          className="px-2.5 py-1.5 text-xs text-gray-500 hover:text-primary hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="Als Hauptkontakt festlegen"
                        >
                          <Crown className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => { setEditingContact(contact); setShowContactForm(true); }}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-colors"
                        aria-label="Kontakt bearbeiten"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onRemoveContact(contact.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-colors"
                        aria-label="Kontakt entfernen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <User className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                <p>Noch keine Ansprechpartner</p>
              </div>
            )}
          </div>
        )}

        {/* Projekte Tab */}
        {activeTab === 'projects' && (
          (() => {
            const archivedProjects = projects.filter(p =>
              p.status === 'completed' || p.status === 'cancelled'
            );

            return (
              <div>
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Abgeschlossene Projekte
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Archiv der beendeten Zusammenarbeit
                  </p>
                </div>

                {archivedProjects.length > 0 ? (
                  <div className="space-y-3">
                    {archivedProjects.map(project => (
                      <button
                        key={project.id}
                        onClick={() => onNavigateToProject(project.id)}
                        className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-gray-900 dark:text-white">{project.name}</p>
                            <span className={`px-2 py-0.5 text-xs rounded-full ${
                              project.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                            }`}>
                              {project.status === 'completed' ? 'Abgeschlossen' : 'Abgebrochen'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(project.startDate)} – {formatDate(project.endDate)}
                            {project.phases?.length > 0 && ` • ${project.phases.length} Phasen`}
                          </p>
                        </div>
                        <div className="text-right">
                          {project.budget?.total > 0 && (
                            <p className="font-medium text-gray-900 dark:text-white">
                              {project.budget.total.toLocaleString('de-DE')} €
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                    <p>Noch keine abgeschlossenen Projekte</p>
                  </div>
                )}
              </div>
            );
          })()
        )}

        {/* Rechnungsinfos Tab */}
        {activeTab === 'billing' && (
          <div className="space-y-6">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Rechnungsinformationen
            </h3>

            {isEditing && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <input
                  type="checkbox"
                  id="useMainAddress"
                  checked={formData.billing.useMainAddress}
                  onChange={(e) => handleBillingChange('useMainAddress', e.target.checked)}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label htmlFor="useMainAddress" className="text-sm text-gray-700 dark:text-gray-300">
                  Hauptadresse als Rechnungsadresse verwenden
                </label>
              </div>
            )}

            <div className="grid grid-cols-2 gap-6">
              {/* Rechnungsadresse */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Rechnungsadresse
                </h4>
                {isEditing && !formData.billing.useMainAddress ? (
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-3">
                      <AddressAutocomplete
                        value={formData.billing.address.street}
                        onChange={(val) => handleBillingAddressChange('street', val)}
                        onSelect={handleBillingAddressSelect}
                        placeholder="Straße & Hausnummer"
                      />
                    </div>
                    <input
                      type="text"
                      value={formData.billing.address.zip}
                      onChange={(e) => handleBillingAddressChange('zip', e.target.value)}
                      className={inputClasses}
                      placeholder="PLZ"
                    />
                    <input
                      type="text"
                      value={formData.billing.address.city}
                      onChange={(e) => handleBillingAddressChange('city', e.target.value)}
                      className={`${inputClasses} col-span-2`}
                      placeholder="Stadt"
                    />
                  </div>
                ) : (
                  (() => {
                    // Im Edit-Mode: formData verwenden, sonst client
                    const useMain = isEditing ? formData.billing.useMainAddress : client.billing?.useMainAddress;
                    const displayAddress = isEditing
                      ? (useMain ? formData.address : formData.billing.address)
                      : billingAddress;

                    return (
                      <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                        {useMain && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 italic mb-2">
                            Wie Hauptadresse
                          </p>
                        )}
                        {displayAddress?.street && (
                          <p className="text-gray-900 dark:text-white">{displayAddress.street}</p>
                        )}
                        <p className="text-gray-900 dark:text-white">
                          {displayAddress?.zip} {displayAddress?.city}
                        </p>
                        {displayAddress?.country && (
                          <p className="text-gray-500 dark:text-gray-400">{displayAddress.country}</p>
                        )}
                      </div>
                    );
                  })()
                )}
              </div>

              {/* USt-IdNr */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  USt-IdNr.
                </h4>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.billing.vatId}
                    onChange={(e) => handleBillingChange('vatId', e.target.value)}
                    className={inputClasses}
                    placeholder="DE123456789"
                  />
                ) : (
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                    <p className="text-gray-900 dark:text-white">
                      {client.billing?.vatId || '-'}
                    </p>
                  </div>
                )}
              </div>

              {/* Zahlungsziel */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Zahlungsziel
                </h4>
                {isEditing ? (
                  <select
                    value={formData.billing.paymentTermDays}
                    onChange={(e) => handleBillingChange('paymentTermDays', parseInt(e.target.value))}
                    className={inputClasses}
                  >
                    {PAYMENT_TERM_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                ) : (
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                    <p className="text-gray-900 dark:text-white">
                      {getPaymentTermLabel(client.billing?.paymentTermDays)}
                    </p>
                  </div>
                )}
              </div>

              {/* Rechnungsempfänger */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Rechnungsempfänger
                </h4>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.billing.invoiceRecipient}
                    onChange={(e) => handleBillingChange('invoiceRecipient', e.target.value)}
                    className={inputClasses}
                    placeholder="z.B. Buchhaltung"
                  />
                ) : (
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                    <p className="text-gray-900 dark:text-white">
                      {client.billing?.invoiceRecipient || '-'}
                    </p>
                  </div>
                )}
              </div>

              {/* Kostenstelle */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Kostenstelle
                </h4>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.billing.costCenter}
                    onChange={(e) => handleBillingChange('costCenter', e.target.value)}
                    className={inputClasses}
                  />
                ) : (
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                    <p className="text-gray-900 dark:text-white">
                      {client.billing?.costCenter || '-'}
                    </p>
                  </div>
                )}
              </div>

              {/* PO erforderlich */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  PO-Nummer erforderlich
                </h4>
                {isEditing ? (
                  <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                    <input
                      type="checkbox"
                      id="requiresPO"
                      checked={formData.billing.requiresPurchaseOrder}
                      onChange={(e) => handleBillingChange('requiresPurchaseOrder', e.target.checked)}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <label htmlFor="requiresPO" className="text-sm text-gray-700 dark:text-gray-300">
                      Ja, PO-Nummer erforderlich
                    </label>
                  </div>
                ) : (
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                    <p className={`flex items-center gap-2 ${client.billing?.requiresPurchaseOrder ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500'}`}>
                      {client.billing?.requiresPurchaseOrder ? (
                        <>
                          <Check className="w-4 h-4" />
                          Ja
                        </>
                      ) : 'Nein'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Contact Form Modal */}
      {showContactForm && (
        <ClientContactForm
          contact={editingContact}
          onSave={handleSaveContact}
          onCancel={() => { setShowContactForm(false); setEditingContact(null); }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Kunde archivieren?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Möchtest du "{client.companyName}" wirklich archivieren? Der Kunde wird in der Übersicht nicht mehr angezeigt.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={() => { onDelete(); setShowDeleteConfirm(false); }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
              >
                Archivieren
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDetail;
