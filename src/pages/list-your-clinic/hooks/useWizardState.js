import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { INITIAL_WIZARD_STATE } from '../constants';

const STORAGE_KEY = 'glowra_list_clinic_wizard';

/**
 * Custom hook for managing wizard state with:
 * - React Hook Form for validation
 * - localStorage persistence
 * - URL param handling (clinicId, submitterKey)
 */
export const useWizardState = () => {
  const [searchParams] = useSearchParams();
  const [wizardState, setWizardState] = useState(() => {
    // Try to restore from localStorage
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed;
      }
    } catch (error) {
      console.error('Failed to restore wizard state:', error);
    }
    
    // Initialize with defaults
    const initial = { ...INITIAL_WIZARD_STATE };
    
    // Check for URL params
    const clinicId = searchParams.get('clinicId');
    const submitterKey = searchParams.get('submitterKey');
    
    if (clinicId) {
      initial.existingClinicId = parseInt(clinicId, 10);
      initial.flow = 'add_to_existing';
      initial.currentStep = 2; // Skip to providers step
    }
    
    if (submitterKey) {
      initial.submitterKey = submitterKey;
    }
    
    return initial;
  });

  // React Hook Form instance
  const methods = useForm({
    mode: 'onBlur',
    defaultValues: wizardState
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wizardState));
    } catch (error) {
      console.error('Failed to save wizard state:', error);
    }
  }, [wizardState]);

  // Update wizard state
  const updateWizard = (updates) => {
    setWizardState((prev) => ({
      ...prev,
      ...updates
    }));
  };

  // Navigate between steps
  const goToStep = (stepNumber) => {
    updateWizard({ currentStep: stepNumber });
  };

  const nextStep = () => {
    updateWizard({ currentStep: wizardState.currentStep + 1 });
  };

  const prevStep = () => {
    if (wizardState.currentStep > 0) {
      updateWizard({ currentStep: wizardState.currentStep - 1 });
    }
  };

  // Update specific sections
  const updateClinic = (clinicData) => {
    updateWizard({ clinic: { ...wizardState.clinic, ...clinicData } });
  };

  const updateAdvanced = (advancedData) => {
    updateWizard({ advanced: { ...wizardState.advanced, ...advancedData } });
  };

  const updatePhotos = (photos) => {
    updateWizard({ photos });
  };

  const updateProviders = (providers) => {
    updateWizard({ providers });
  };

  const updateProcedures = (procedures) => {
    updateWizard({ procedures });
  };

  const setFlow = (flow, resetData = false) => {
    if (resetData) {
      // When switching flows, reset all data to initial state but keep the new flow
      const resetState = {
        ...INITIAL_WIZARD_STATE,
        flow,
        currentStep: wizardState.currentStep
      };
      setWizardState(resetState);
      methods.reset(resetState);
    } else {
      updateWizard({ flow });
    }
  };

  // Reset wizard state for new clinic flow (clears all clinic-related data)
  const resetForNewClinic = () => {
    const resetState = {
      ...INITIAL_WIZARD_STATE,
      flow: 'new_clinic',
      currentStep: 1
    };
    setWizardState(resetState);
    methods.reset(resetState);
  };

  // Reset wizard state for add to existing flow
  const resetForExistingClinic = () => {
    const resetState = {
      ...INITIAL_WIZARD_STATE,
      flow: 'add_to_existing',
      currentStep: 1
    };
    setWizardState(resetState);
    methods.reset(resetState);
  };

  const setSubmitterKey = (key) => {
    updateWizard({ submitterKey: key });
  };

  const setExistingClinicId = (id) => {
    updateWizard({ existingClinicId: id });
  };

  // Clear wizard state (for starting over or after successful submission)
  const clearWizard = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear wizard state:', error);
    }
    setWizardState({ ...INITIAL_WIZARD_STATE });
    methods.reset(INITIAL_WIZARD_STATE);
  };

  return {
    wizardState,
    methods,
    goToStep,
    nextStep,
    prevStep,
    updateClinic,
    updateAdvanced,
    updatePhotos,
    updateProviders,
    updateProcedures,
    setFlow,
    setSubmitterKey,
    setExistingClinicId,
    clearWizard,
    updateWizard,
    resetForNewClinic,
    resetForExistingClinic
  };
};

