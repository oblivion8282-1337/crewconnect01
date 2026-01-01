/**
 * Konstanten für das Kundenstamm-System (CRM)
 */

export const INDUSTRY_OPTIONS = [
  { value: 'automotive', label: 'Automotive' },
  { value: 'fmcg', label: 'FMCG / Konsumgüter' },
  { value: 'tech', label: 'Tech / IT' },
  { value: 'pharma', label: 'Pharma / Healthcare' },
  { value: 'finance', label: 'Finanzen / Versicherung' },
  { value: 'retail', label: 'Retail / Handel' },
  { value: 'media', label: 'Medien / Entertainment' },
  { value: 'fashion', label: 'Fashion / Lifestyle' },
  { value: 'food', label: 'Food & Beverage' },
  { value: 'travel', label: 'Travel / Tourismus' },
  { value: 'realestate', label: 'Immobilien' },
  { value: 'nonprofit', label: 'Non-Profit / NGO' },
  { value: 'government', label: 'Öffentlicher Sektor' },
  { value: 'agency', label: 'Agentur' },
  { value: 'other', label: 'Sonstige' }
];

export const CLIENT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  LEAD: 'lead',
  ARCHIVED: 'archived'
};

export const CLIENT_STATUS_OPTIONS = [
  { value: 'active', label: 'Aktiv', color: 'green' },
  { value: 'inactive', label: 'Inaktiv', color: 'gray' },
  { value: 'lead', label: 'Lead', color: 'blue' },
  { value: 'archived', label: 'Archiviert', color: 'gray' }
];

export const PAYMENT_TERM_OPTIONS = [
  { value: 0, label: 'Sofort' },
  { value: 7, label: '7 Tage' },
  { value: 14, label: '14 Tage' },
  { value: 30, label: '30 Tage' },
  { value: 45, label: '45 Tage' },
  { value: 60, label: '60 Tage' },
  { value: 90, label: '90 Tage' }
];

/**
 * Hilfsfunktion: Industry-Label aus Value
 */
export const getIndustryLabel = (value) => {
  const industry = INDUSTRY_OPTIONS.find(i => i.value === value);
  return industry?.label || value;
};

/**
 * Hilfsfunktion: Status-Option aus Value
 */
export const getStatusOption = (value) => {
  return CLIENT_STATUS_OPTIONS.find(s => s.value === value) || CLIENT_STATUS_OPTIONS[0];
};

/**
 * Hilfsfunktion: Payment Term Label aus Value
 */
export const getPaymentTermLabel = (days) => {
  const term = PAYMENT_TERM_OPTIONS.find(t => t.value === days);
  return term?.label || `${days} Tage`;
};
