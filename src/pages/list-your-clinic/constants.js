// US States dropdown
export const US_STATES = [
  { value: 'Alabama', label: 'Alabama' },
  { value: 'Alaska', label: 'Alaska' },
  { value: 'Arizona', label: 'Arizona' },
  { value: 'Arkansas', label: 'Arkansas' },
  { value: 'California', label: 'California' },
  { value: 'Colorado', label: 'Colorado' },
  { value: 'Connecticut', label: 'Connecticut' },
  { value: 'Delaware', label: 'Delaware' },
  { value: 'District of Columbia', label: 'District of Columbia' },
  { value: 'Florida', label: 'Florida' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Hawaii', label: 'Hawaii' },
  { value: 'Idaho', label: 'Idaho' },
  { value: 'Illinois', label: 'Illinois' },
  { value: 'Indiana', label: 'Indiana' },
  { value: 'Iowa', label: 'Iowa' },
  { value: 'Kansas', label: 'Kansas' },
  { value: 'Kentucky', label: 'Kentucky' },
  { value: 'Louisiana', label: 'Louisiana' },
  { value: 'Maine', label: 'Maine' },
  { value: 'Maryland', label: 'Maryland' },
  { value: 'Massachusetts', label: 'Massachusetts' },
  { value: 'Michigan', label: 'Michigan' },
  { value: 'Minnesota', label: 'Minnesota' },
  { value: 'Mississippi', label: 'Mississippi' },
  { value: 'Missouri', label: 'Missouri' },
  { value: 'Montana', label: 'Montana' },
  { value: 'Nebraska', label: 'Nebraska' },
  { value: 'Nevada', label: 'Nevada' },
  { value: 'New Hampshire', label: 'New Hampshire' },
  { value: 'New Jersey', label: 'New Jersey' },
  { value: 'New Mexico', label: 'New Mexico' },
  { value: 'New York', label: 'New York' },
  { value: 'North Carolina', label: 'North Carolina' },
  { value: 'North Dakota', label: 'North Dakota' },
  { value: 'Ohio', label: 'Ohio' },
  { value: 'Oklahoma', label: 'Oklahoma' },
  { value: 'Oregon', label: 'Oregon' },
  { value: 'Pennsylvania', label: 'Pennsylvania' },
  { value: 'Rhode Island', label: 'Rhode Island' },
  { value: 'South Carolina', label: 'South Carolina' },
  { value: 'South Dakota', label: 'South Dakota' },
  { value: 'Tennessee', label: 'Tennessee' },
  { value: 'Texas', label: 'Texas' },
  { value: 'Utah', label: 'Utah' },
  { value: 'Vermont', label: 'Vermont' },
  { value: 'Virginia', label: 'Virginia' },
  { value: 'Washington', label: 'Washington' },
  { value: 'West Virginia', label: 'West Virginia' },
  { value: 'Wisconsin', label: 'Wisconsin' },
  { value: 'Wyoming', label: 'Wyoming' }
];

// Clinic Categories
export const CLINIC_CATEGORIES = [
  { value: 'Plastic Surgery', label: 'Plastic Surgery' },
  { value: 'Med Spa / Aesthetics', label: 'Med Spa / Aesthetics' },
  { value: 'Medical', label: 'Medical' },
  { value: 'Dermatology', label: 'Dermatology' },
  { value: 'Other', label: 'Other' }
];

// Provider Specialties
export const PROVIDER_SPECIALTIES = [
  { value: 'Plastic Surgery', label: 'Plastic Surgery' },
  { value: 'Med Spa / Aesthetics', label: 'Med Spa / Aesthetics' },
  { value: 'Medical', label: 'Medical' },
  { value: 'Dermatology', label: 'Dermatology' },
  { value: 'Other', label: 'Other' }
];

// Procedure Categories
export const PROCEDURE_CATEGORIES = [
  { value: 'Face', label: 'Face' },
  { value: 'Body', label: 'Body' },
  { value: 'Breast', label: 'Breast' },
  { value: 'Butt', label: 'Butt' },
  { value: 'Injectables', label: 'Injectables' },
  { value: 'Skin', label: 'Skin' },
  { value: 'Other', label: 'Other' }
];

// Price Units
export const PRICE_UNITS = [
  { value: '', label: '(none)' },
  { value: '/unit', label: '/unit' },
  { value: '/session', label: '/session' },
  { value: '/injection', label: '/injection' },
  { value: '/area', label: '/area' },
  { value: '/treatment', label: '/treatment' },
  { value: '/syringe', label: '/syringe' },
  { value: '/vial', label: '/vial' }
];

// Days of the week for working hours
export const DAYS_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

// Time options for working hours (15-minute intervals)
export const generateTimeOptions = () => {
  const times = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const h = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      const ampm = hour < 12 ? 'AM' : 'PM';
      const m = minute.toString().padStart(2, '0');
      const display = `${h}:${m} ${ampm}`;
      const value = `${hour.toString().padStart(2, '0')}:${m}`;
      times.push({ value, display });
    }
  }
  return times;
};

// Initial empty form values
export const INITIAL_WIZARD_STATE = {
  currentStep: 0,
  flow: null, // 'new_clinic' | 'add_to_existing'
  submitterKey: '',
  existingClinicId: null,
  clinic: {
    clinicName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    category: '',
    website: '',
    phone: '',
    email: ''
  },
  advanced: {
    latitude: '',
    longitude: '',
    placeID: '',
    description: '',
    googleProfileLink: '',
    workingHours: {}
  },
  photos: [],
  providers: [],
  procedures: []
};

