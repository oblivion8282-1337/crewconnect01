import React, { useState } from 'react';
import { X, Building2, MapPin, CreditCard, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import {
  INDUSTRY_OPTIONS,
  CLIENT_STATUS_OPTIONS,
  PAYMENT_TERM_OPTIONS
} from '../../../constants/clients';

/**
 * Accordion Section Komponente
 */
const Section = ({ title, icon: Icon, isOpen, onToggle, children }) => (
  <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
    >
      <div className="flex items-center gap-3">
        {Icon && <Icon className="w-5 h-5 text-primary" />}
        <span className="font-medium text-gray-900 dark:text-white">{title}</span>
      </div>
      {isOpen ? (
        <ChevronUp className="w-5 h-5 text-gray-500" />
      ) : (
        <ChevronDown className="w-5 h-5 text-gray-500" />
      )}
    </button>
    {isOpen && (
      <div className="p-4 space-y-4">
        {children}
      </div>
    )}
  </div>
);

/**
 * ClientForm - Modal zum Erstellen/Bearbeiten eines Kunden
 */
const ClientForm = ({ client, onSave, onCancel }) => {
  const isEditing = !!client;

  const [formData, setFormData] = useState({
    companyName: client?.companyName || '',
    logo: client?.logo || '',
    industry: client?.industry || 'other',
    website: client?.website || '',
    status: client?.status || 'active',
    address: {
      street: client?.address?.street || '',
      zip: client?.address?.zip || '',
      city: client?.address?.city || '',
      country: client?.address?.country || 'Deutschland'
    },
    billing: {
      useMainAddress: client?.billing?.useMainAddress ?? true,
      address: client?.billing?.address || { street: '', zip: '', city: '', country: 'Deutschland' },
      vatId: client?.billing?.vatId || '',
      paymentTermDays: client?.billing?.paymentTermDays ?? 30,
      invoiceRecipient: client?.billing?.invoiceRecipient || '',
      costCenter: client?.billing?.costCenter || '',
      requiresPurchaseOrder: client?.billing?.requiresPurchaseOrder || false
    },
    notes: client?.notes || ''
  });

  const [openSections, setOpenSections] = useState({
    basic: true,
    address: true,
    billing: false,
    notes: false
  });

  const [errors, setErrors] = useState({});

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
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

  const validate = () => {
    const newErrors = {};
    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Firmenname ist erforderlich';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {isEditing ? 'Kunde bearbeiten' : 'Neuer Kunde'}
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form - Scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Basis-Infos */}
          <Section
            title="Basis-Informationen"
            icon={Building2}
            isOpen={openSections.basic}
            onToggle={() => toggleSection('basic')}
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Firmenname *
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                className={`w-full p-2.5 border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors ${
                  errors.companyName
                    ? 'border-red-500'
                    : 'border-gray-300 dark:border-gray-600 focus:ring-primary/50 focus:border-primary'
                }`}
                placeholder="z.B. Musterfirma GmbH"
              />
              {errors.companyName && (
                <p className="mt-1 text-sm text-red-500">{errors.companyName}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Branche
                </label>
                <select
                  value={formData.industry}
                  onChange={(e) => handleChange('industry', e.target.value)}
                  className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                >
                  {INDUSTRY_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                >
                  {CLIENT_STATUS_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Website
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => handleChange('website', e.target.value)}
                className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                placeholder="https://www.example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Logo (URL)
              </label>
              <input
                type="url"
                value={formData.logo}
                onChange={(e) => handleChange('logo', e.target.value)}
                className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                placeholder="https://example.com/logo.png"
              />
            </div>
          </Section>

          {/* Adresse */}
          <Section
            title="Adresse"
            icon={MapPin}
            isOpen={openSections.address}
            onToggle={() => toggleSection('address')}
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Straße
              </label>
              <input
                type="text"
                value={formData.address.street}
                onChange={(e) => handleAddressChange('street', e.target.value)}
                className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                placeholder="Musterstraße 123"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  PLZ
                </label>
                <input
                  type="text"
                  value={formData.address.zip}
                  onChange={(e) => handleAddressChange('zip', e.target.value)}
                  className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                  placeholder="12345"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Stadt
                </label>
                <input
                  type="text"
                  value={formData.address.city}
                  onChange={(e) => handleAddressChange('city', e.target.value)}
                  className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                  placeholder="Musterstadt"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Land
              </label>
              <input
                type="text"
                value={formData.address.country}
                onChange={(e) => handleAddressChange('country', e.target.value)}
                className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                placeholder="Deutschland"
              />
            </div>
          </Section>

          {/* Rechnungsinfos */}
          <Section
            title="Rechnungsinformationen"
            icon={CreditCard}
            isOpen={openSections.billing}
            onToggle={() => toggleSection('billing')}
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="useMainAddress"
                checked={formData.billing.useMainAddress}
                onChange={(e) => handleBillingChange('useMainAddress', e.target.checked)}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <label htmlFor="useMainAddress" className="text-sm text-gray-700 dark:text-gray-300">
                Rechnungsadresse wie Hauptadresse
              </label>
            </div>

            {!formData.billing.useMainAddress && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Rechnungsadresse - Straße
                  </label>
                  <input
                    type="text"
                    value={formData.billing.address.street}
                    onChange={(e) => handleBillingAddressChange('street', e.target.value)}
                    className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      PLZ
                    </label>
                    <input
                      type="text"
                      value={formData.billing.address.zip}
                      onChange={(e) => handleBillingAddressChange('zip', e.target.value)}
                      className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Stadt
                    </label>
                    <input
                      type="text"
                      value={formData.billing.address.city}
                      onChange={(e) => handleBillingAddressChange('city', e.target.value)}
                      className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  USt-IdNr.
                </label>
                <input
                  type="text"
                  value={formData.billing.vatId}
                  onChange={(e) => handleBillingChange('vatId', e.target.value)}
                  className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                  placeholder="DE123456789"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Zahlungsziel
                </label>
                <select
                  value={formData.billing.paymentTermDays}
                  onChange={(e) => handleBillingChange('paymentTermDays', parseInt(e.target.value))}
                  className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                >
                  {PAYMENT_TERM_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Rechnungsempfänger
              </label>
              <input
                type="text"
                value={formData.billing.invoiceRecipient}
                onChange={(e) => handleBillingChange('invoiceRecipient', e.target.value)}
                className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                placeholder="z.B. Buchhaltung, z.Hd. Frau Müller"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Kostenstelle
              </label>
              <input
                type="text"
                value={formData.billing.costCenter}
                onChange={(e) => handleBillingChange('costCenter', e.target.value)}
                className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                placeholder="z.B. MKT-2024"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="requiresPO"
                checked={formData.billing.requiresPurchaseOrder}
                onChange={(e) => handleBillingChange('requiresPurchaseOrder', e.target.checked)}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <label htmlFor="requiresPO" className="text-sm text-gray-700 dark:text-gray-300">
                PO-Nummer für Buchungen erforderlich
              </label>
            </div>
          </Section>

          {/* Notizen */}
          <Section
            title="Notizen"
            icon={FileText}
            isOpen={openSections.notes}
            onToggle={() => toggleSection('notes')}
          >
            <div>
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={4}
                className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors resize-none"
                placeholder="Interne Notizen zum Kunden..."
              />
            </div>
          </Section>
        </form>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Abbrechen
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:opacity-90 transition-opacity"
          >
            {isEditing ? 'Speichern' : 'Kunde anlegen'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientForm;
