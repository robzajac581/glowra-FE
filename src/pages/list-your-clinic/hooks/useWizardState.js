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
    // Check for URL params first
    const clinicId = searchParams.get('clinicId');
    const submitterKey = searchParams.get('submitterKey');
    
    // If there are URL params, we're continuing a specific flow
    // Otherwise, always start fresh at step 0 (choice screen)
    const hasUrlParams = clinicId || submitterKey;
    
    // Initialize with defaults
    const initial = { ...INITIAL_WIZARD_STATE };
    
    if (clinicId) {
      initial.existingClinicId = parseInt(clinicId, 10);
      initial.flow = 'add_to_existing';
      initial.currentStep = 2; // Skip to providers step
    }
    
    if (submitterKey) {
      initial.submitterKey = submitterKey;
    }
    
    // Only restore from localStorage if we have URL params (continuing a flow)
    // Otherwise, always start fresh when clicking "List Your Clinic" button
    if (hasUrlParams) {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          // Merge saved state with URL param overrides
          return {
            ...parsed,
            ...initial,
            // Preserve URL param values
            existingClinicId: clinicId ? parseInt(clinicId, 10) : parsed.existingClinicId,
            submitterKey: submitterKey || parsed.submitterKey,
            currentStep: clinicId ? 2 : parsed.currentStep,
            flow: clinicId ? 'add_to_existing' : parsed.flow
          };
        }
      } catch (error) {
        console.error('Failed to restore wizard state:', error);
      }
    }
    
    return initial;
  });

  // React Hook Form instance
  const methods = useForm({
    mode: 'onBlur',
    defaultValues: wizardState
  });

  // Clear localStorage on initial mount when there are no URL params
  // This ensures clicking "List Your Clinic" always starts fresh at step 0
  useEffect(() => {
    const clinicId = searchParams.get('clinicId');
    const submitterKey = searchParams.get('submitterKey');
    const hasUrlParams = clinicId || submitterKey;
    
    if (!hasUrlParams && wizardState.currentStep === 0 && wizardState.flow === null) {
      // Only clear on initial mount when at step 0 with no flow selected
      // This indicates a fresh start
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        console.error('Failed to clear wizard state:', error);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

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

