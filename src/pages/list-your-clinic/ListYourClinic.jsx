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
import API_BASE_URL from '../../config/api';
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
    setExistingClinicId,
    clearWizard,
    resetForNewClinic,
    resetForExistingClinic,
    updateWizard,
  } = useWizardState();

  const [submissionResult, setSubmissionResult] = useState(null);
  const [loadingClinicData, setLoadingClinicData] = useState(false);

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [wizardState.currentStep]);

  // Step 0: Choose Action
  const handleSelectFlow = (flowType) => {
    if (flowType === 'new_clinic') {
      // Reset all data for new clinic flow
      resetForNewClinic();
    } else {
      // Reset all data for existing clinic flow
      resetForExistingClinic();
    }
  };

  // Step 1A: Search Clinic - fetches full clinic data including providers, procedures, photos
  const handleSelectClinic = async (clinic) => {
    setLoadingClinicData(true);
    
    try {
      // Fetch full clinic data including providers, procedures, and photos
      const [clinicRes, providersRes, proceduresRes, photosRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/clinics/${clinic.id}`, {
          headers: { 'Content-Type': 'application/json' },
        }),
        fetch(`${API_BASE_URL}/api/clinics/${clinic.id}/providers`, {
          headers: { 'Content-Type': 'application/json' },
        }),
        fetch(`${API_BASE_URL}/api/clinics/${clinic.id}/procedures`, {
          headers: { 'Content-Type': 'application/json' },
        }),
        fetch(`${API_BASE_URL}/api/clinics/${clinic.id}/photos`, {
          headers: { 'Content-Type': 'application/json' },
        }),
      ]);

      const clinicData = clinicRes.ok ? await clinicRes.json() : clinic;
      const providersData = providersRes.ok ? await providersRes.json() : { providers: [] };
      const proceduresData = proceduresRes.ok ? await proceduresRes.json() : {};
      const photosData = photosRes.ok ? await photosRes.json() : { photos: [] };

      // Format providers for wizard state
      const formattedProviders = (providersData.providers || []).map((p, idx) => ({
        providerId: p.ProviderID || p.providerId || `provider-${idx}`,
        providerName: p.ProviderName || p.providerName || '',
        photoURL: p.PhotoURL || p.photoUrl || p.PhotoUrl || null,
        photoData: null, // Will be populated if user uploads new photo
      }));

      // Format procedures from grouped format to flat array
      const formattedProcedures = [];
      if (proceduresData && typeof proceduresData === 'object') {
        Object.entries(proceduresData).forEach(([category, data]) => {
          const procs = data?.procedures || data || [];
          if (Array.isArray(procs)) {
            procs.forEach((proc, idx) => {
              formattedProcedures.push({
                procedureId: proc.ProcedureID || proc.procedureId || `procedure-${idx}`,
                procedureName: proc.ProcedureName || proc.procedureName || proc.name || '',
                category: category,
                priceMin: proc.PriceMin || proc.priceMin || '',
                priceMax: proc.PriceMax || proc.priceMax || '',
                unit: proc.PriceUnit || proc.priceUnit || '',
                averagePrice: proc.AveragePrice || proc.averagePrice || proc.price || '',
                providerNames: proc.ProviderNames || proc.providerNames || [],
              });
            });
          }
        });
      }

      // Format photos
      const formattedPhotos = [];
      
      // Add clinic photos
      (photosData.photos || []).forEach((p, idx) => {
        formattedPhotos.push({
          id: p.PhotoID || p.photoId || `photo-${idx}`,
          photoType: 'clinic',
          photoUrl: p.url || p.urls?.medium || p.PhotoUrl || p.photoUrl || '',
          photoData: null, // Will be populated if user uploads new photo
          source: p.source || 'google',
          isPrimary: p.isPrimary || idx === 0,
          displayOrder: idx,
        });
      });

      // Add logo if exists
      const logoUrl = clinicData.Logo || clinicData.logo || clinicData.Photo || clinicData.photo || clinicData.iconUrl;
      if (logoUrl) {
        formattedPhotos.push({
          id: 'logo-existing',
          photoType: 'logo',
          photoUrl: logoUrl,
          photoData: null,
          source: 'existing',
          isPrimary: false,
          displayOrder: 0,
        });
      }

      // Update wizard state with all fetched data
      setExistingClinicId(clinic.id);
      updateClinic({
        clinicName: clinicData.ClinicName || clinicData.clinicName || clinic.clinicName,
        address: clinicData.Address || clinicData.address || clinic.address,
        city: clinicData.City || clinicData.city || clinic.city,
        state: clinicData.State || clinicData.state || clinic.state,
        zipCode: clinicData.ZipCode || clinicData.zipCode || clinic.zipCode || '',
        category: clinicData.Category || clinicData.category || clinic.category || '',
        website: clinicData.Website || clinicData.website || clinic.website || '',
        phone: clinicData.Phone || clinicData.phone || clinic.phone || '',
        email: clinicData.Email || clinicData.email || clinic.email || ''
      });
      updateAdvanced({
        latitude: clinicData.Latitude || clinicData.latitude || '',
        longitude: clinicData.Longitude || clinicData.longitude || '',
        placeID: clinicData.PlaceID || clinicData.placeId || '',
        description: clinicData.Description || clinicData.description || '',
        googleProfileLink: clinicData.GoogleProfileLink || clinicData.googleProfileLink || '',
        workingHours: clinicData.WorkingHours || clinicData.workingHours || {}
      });
      updateProviders(formattedProviders);
      updateProcedures(formattedProcedures);
      updatePhotos(formattedPhotos);
      
      goToStep(2); // Go to clinic info edit step (now step 2 for add_to_existing flow)
    } catch (error) {
      console.error('Failed to fetch clinic data:', error);
      // Fall back to basic clinic data if fetch fails
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
      goToStep(2);
    } finally {
      setLoadingClinicData(false);
    }
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
  // For add_to_existing flow: 0=Choose, 1=Search, 2=ClinicInfo, 3=Providers, 4=Procedures, 5=Photos, 6=Review, 7=Success
  // For new_clinic flow: 0=Choose, 1=ClinicInfo, 2=Providers, 3=Procedures, 4=Photos, 5=Review, 6=Success
  const renderStep = () => {
    const step = wizardState.currentStep;
    const isExistingFlow = wizardState.flow === 'add_to_existing';

    switch (step) {
      case 0:
        return (
          <ChooseAction
            onSelectFlow={handleSelectFlow}
          />
        );

      case 1:
        if (isExistingFlow) {
          return (
            <SearchClinic
              onSelectClinic={handleSelectClinic}
              onAddNew={handleAddNewFromSearch}
              onBack={() => goToStep(0)}
              loading={loadingClinicData}
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
        if (isExistingFlow) {
          // Clinic Info editing step for existing clinic
          return (
            <ClinicInfo
              initialData={wizardState.clinic}
              initialAdvanced={wizardState.advanced}
              onContinue={handleClinicInfoContinue}
              onBack={prevStep}
              isEditMode={true}
            />
          );
        } else {
          return (
            <Providers
              initialProviders={wizardState.providers}
              onContinue={handleProvidersContinue}
              onSkip={handleProvidersSkip}
              onBack={prevStep}
            />
          );
        }

      case 3:
        if (isExistingFlow) {
          return (
            <Providers
              initialProviders={wizardState.providers}
              onContinue={handleProvidersContinue}
              onSkip={handleProvidersSkip}
              onBack={prevStep}
              isEditMode={true}
            />
          );
        } else {
          return (
            <Procedures
              initialProcedures={wizardState.procedures}
              providers={wizardState.providers}
              onContinue={handleProceduresContinue}
              onSkip={handleProceduresSkip}
              onBack={prevStep}
            />
          );
        }

      case 4:
        if (isExistingFlow) {
          return (
            <Procedures
              initialProcedures={wizardState.procedures}
              providers={wizardState.providers}
              onContinue={handleProceduresContinue}
              onSkip={handleProceduresSkip}
              onBack={prevStep}
              isEditMode={true}
            />
          );
        } else {
          return (
            <Photos
              initialPhotos={wizardState.photos}
              clinicName={wizardState.clinic?.clinicName}
              onContinue={handlePhotosContinue}
              onSkip={handlePhotosSkip}
              onBack={prevStep}
            />
          );
        }

      case 5:
        if (isExistingFlow) {
          return (
            <Photos
              initialPhotos={wizardState.photos}
              clinicName={wizardState.clinic?.clinicName}
              onContinue={handlePhotosContinue}
              onSkip={handlePhotosSkip}
              onBack={prevStep}
              isEditMode={true}
              clinicId={wizardState.existingClinicId}
            />
          );
        } else {
          return (
            <Review
              wizardState={wizardState}
              onEdit={goToStep}
              onBack={prevStep}
              onSuccess={handleReviewSuccess}
            />
          );
        }

      case 6:
        if (isExistingFlow) {
          return (
            <Review
              wizardState={wizardState}
              onEdit={goToStep}
              onBack={prevStep}
              onSuccess={handleReviewSuccess}
            />
          );
        } else {
          return (
            <Success
              submissionResult={submissionResult}
              clinicName={wizardState.clinic.clinicName}
              onListAnother={handleListAnother}
            />
          );
        }

      case 7:
        // Only for add_to_existing flow
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

  // Calculate total steps and whether to show progress
  const isExistingFlow = wizardState.flow === 'add_to_existing';
  const totalSteps = isExistingFlow ? 7 : 6;
  const successStep = isExistingFlow ? 7 : 6;
  const showProgress = wizardState.currentStep > 0 && wizardState.currentStep < successStep;

  return (
    <Layout headerFixed={false}>
      <div className="list-your-clinic-page min-h-screen bg-white py-12">
        <div className="container">
          {showProgress && (
            <WizardProgress
              currentStep={wizardState.currentStep}
              totalSteps={totalSteps}
              isExistingFlow={isExistingFlow}
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
