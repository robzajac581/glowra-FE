import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { useWizardState } from './hooks/useWizardState';
import WizardProgress from './components/WizardProgress';
import ChooseAction from './components/ChooseAction';
import SearchClinic from './components/SearchClinic';
import ClinicInfo from './components/ClinicInfo';
import Providers from './components/Providers';
import Procedures from './components/Procedures';
import Photos from './components/Photos';
import Review from './components/Review';
import Success from './components/Success';
import './ListYourClinic.css';

const ListYourClinic = () => {
  const {
    wizardState,
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
    updateWizard
  } = useWizardState();

  const [submissionResult, setSubmissionResult] = useState(null);

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [wizardState.currentStep]);

  // Step 0: Choose Action
  const handleSelectFlow = (flowType) => {
    setFlow(flowType);
    if (flowType === 'new_clinic') {
      goToStep(1); // Go to clinic info
    } else {
      goToStep(1); // Go to search clinic (will show different component based on flow)
    }
  };

  // Step 1A: Search Clinic
  const handleSelectClinic = (clinic) => {
    setExistingClinicId(clinic.id);
    updateClinic({
      clinicName: clinic.clinicName,
      address: clinic.address,
      city: clinic.city,
      state: clinic.state,
      zipCode: clinic.zipCode || '',
      category: clinic.category || '',
      website: clinic.website || '',
      phone: clinic.phone || '',
      email: clinic.email || ''
    });
    goToStep(2); // Skip to providers
  };

  const handleAddNewFromSearch = () => {
    setFlow('new_clinic');
    goToStep(1); // Go to clinic info form
  };

  // Step 1B: Clinic Info
  const handleClinicInfoContinue = (clinicData, advancedData) => {
    updateClinic(clinicData);
    updateAdvanced(advancedData);
    nextStep();
  };

  // Step 2: Providers
  const handleProvidersContinue = (providersData) => {
    updateProviders(providersData);
    nextStep();
  };

  const handleProvidersSkip = (emptyProviders) => {
    updateProviders(emptyProviders);
    nextStep();
  };

  // Step 3: Procedures
  const handleProceduresContinue = (proceduresData) => {
    updateProcedures(proceduresData);
    nextStep();
  };

  const handleProceduresSkip = (emptyProcedures) => {
    updateProcedures(emptyProcedures);
    nextStep();
  };

  // Step 4: Photos
  const handlePhotosContinue = (photosData) => {
    updatePhotos(photosData);
    nextStep();
  };

  const handlePhotosSkip = (emptyPhotos) => {
    updatePhotos(emptyPhotos);
    nextStep();
  };

  // Step 5: Review
  const handleReviewSuccess = (result) => {
    setSubmissionResult(result);
    nextStep(); // Go to success page
  };

  // Step 6: Success
  const handleListAnother = () => {
    clearWizard();
    setSubmissionResult(null);
    goToStep(0);
  };

  // Render current step
  const renderStep = () => {
    const step = wizardState.currentStep;

    switch (step) {
      case 0:
        return (
          <ChooseAction
            onSelectFlow={handleSelectFlow}
            submitterKey={wizardState.submitterKey}
            setSubmitterKey={setSubmitterKey}
          />
        );

      case 1:
        if (wizardState.flow === 'add_to_existing') {
          return (
            <SearchClinic
              onSelectClinic={handleSelectClinic}
              onAddNew={handleAddNewFromSearch}
              onBack={() => goToStep(0)}
            />
          );
        } else {
          return (
            <ClinicInfo
              initialData={wizardState.clinic}
              initialAdvanced={wizardState.advanced}
              onContinue={handleClinicInfoContinue}
              onBack={() => goToStep(0)}
            />
          );
        }

      case 2:
        return (
          <Providers
            initialProviders={wizardState.providers}
            onContinue={handleProvidersContinue}
            onSkip={handleProvidersSkip}
            onBack={prevStep}
          />
        );

      case 3:
        return (
          <Procedures
            initialProcedures={wizardState.procedures}
            providers={wizardState.providers}
            onContinue={handleProceduresContinue}
            onSkip={handleProceduresSkip}
            onBack={prevStep}
          />
        );

      case 4:
        return (
          <Photos
            initialPhotos={wizardState.photos}
            onContinue={handlePhotosContinue}
            onSkip={handlePhotosSkip}
            onBack={prevStep}
          />
        );

      case 5:
        return (
          <Review
            wizardState={wizardState}
            onEdit={goToStep}
            onBack={prevStep}
            onSuccess={handleReviewSuccess}
          />
        );

      case 6:
        return (
          <Success
            submissionResult={submissionResult}
            clinicName={wizardState.clinic.clinicName}
            onListAnother={handleListAnother}
          />
        );

      default:
        return null;
    }
  };

  const showProgress = wizardState.currentStep > 0 && wizardState.currentStep < 6;

  return (
    <Layout headerFixed={false}>
      <div className="list-your-clinic-page min-h-screen bg-white py-12">
        <div className="container">
          {showProgress && (
            <WizardProgress
              currentStep={wizardState.currentStep}
              totalSteps={6}
            />
          )}
          
          <div className="wizard-content">
            {renderStep()}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ListYourClinic;
