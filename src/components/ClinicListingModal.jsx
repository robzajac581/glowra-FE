import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { CONSULTATION_REQUEST_API_URL } from "../config/api";
import { cn } from "../utils/cn";
import "./ClinicListingModal.css";

const ClinicListingModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("new"); // "new" or "adjustment"
  const [formData, setFormData] = useState({
    clinicName: "",
    address: "",
    city: "",
    state: "",
    website: "",
    clinicCategory: "",
    primaryContactName: "",
    email: "",
    phone: "",
    additionalDetails: "",
    message: ""
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedRequestType, setSubmittedRequestType] = useState(null);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        clinicName: "",
        address: "",
        city: "",
        state: "",
        website: "",
        clinicCategory: "",
        primaryContactName: "",
        email: "",
        phone: "",
        additionalDetails: "",
        message: ""
      });
      setErrors({});
      setIsSuccess(false);
      setActiveTab("new");
      setSubmittedRequestType(null);
    }
  }, [isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);


  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateURL = (url) => {
    if (!url.trim()) return true; // Empty is valid (optional field)
    try {
      new URL(url.startsWith("http") ? url : `https://${url}`);
      return true;
    } catch {
      return false;
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const isNewListing = activeTab === "new";

    // Required for both tabs
    if (!formData.clinicName.trim()) {
      newErrors.clinicName = "Clinic name is required";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!formData.state.trim()) {
      newErrors.state = "State is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Required only for "List Your Clinic" tab
    if (isNewListing) {
      if (!formData.website.trim()) {
        newErrors.website = "Website is required";
      } else if (!validateURL(formData.website)) {
        newErrors.website = "Please enter a valid website URL";
      }

      if (!formData.clinicCategory.trim()) {
        newErrors.clinicCategory = "Category is required";
      }

      if (!formData.primaryContactName.trim()) {
        newErrors.primaryContactName = "Primary contact name is required";
      }

      if (!formData.phone.trim()) {
        newErrors.phone = "Phone number is required";
      }
    } else {
      // For adjustment tab, website is optional but if provided, should be valid
      if (formData.website.trim() && !validateURL(formData.website)) {
        newErrors.website = "Please enter a valid website URL";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setErrors({}); // Clear errors when switching tabs
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({}); // Clear previous errors

    try {
      // Prepare request payload based on API documentation
      // Format website URL to include protocol if needed
      let websiteValue = formData.website.trim() || null;
      if (websiteValue && !websiteValue.match(/^https?:\/\//i)) {
        websiteValue = `https://${websiteValue}`;
      }

      const payload = {
        clinicName: formData.clinicName.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        email: formData.email.trim().toLowerCase(),
        requestType: activeTab,
        website: websiteValue,
        clinicCategory: formData.clinicCategory.trim() || null,
        primaryContactName: formData.primaryContactName.trim() || null,
        phone: formData.phone.trim() || null,
        additionalDetails: formData.additionalDetails.trim() || null,
        message: formData.message.trim() || null
      };

      const response = await fetch(`${CONSULTATION_REQUEST_API_URL}/api/clinic-listing-requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      // Try to parse JSON response
      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        // If response is not JSON, treat as error
        throw new Error("Invalid response from server");
      }

      if (result.success) {
        // Success - save requestId for potential tracking
        console.log('Clinic listing request submitted successfully. Request ID:', result.requestId);
        setSubmittedRequestType(activeTab);
        setIsSuccess(true);
      } else {
        // Handle validation errors from API
        if (result.details && typeof result.details === 'object') {
          // Map API validation errors to form errors
          const apiErrors = {};
          Object.keys(result.details).forEach((field) => {
            apiErrors[field] = result.details[field];
          });
          setErrors(apiErrors);
        } else {
          // Generic error
          setErrors({
            submit: result.error || "Failed to submit your request. Please try again later."
          });
        }
      }
    } catch (error) {
      console.error("Error submitting clinic listing request:", error);
      setErrors({
        submit: "Failed to submit your request. Please check your connection and try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const isNewListing = activeTab === "new";

  return createPortal(
    <div
      className="clinic-listing-modal-overlay"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="clinic-listing-modal-backdrop" />
      
      {/* Modal Content */}
      <div
        className="clinic-listing-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="clinic-listing-modal-close-button"
          aria-label="Close modal"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="clinic-listing-modal-body">
          {isSuccess ? (
            // Success Screen
            <div className="clinic-listing-modal-success-wrapper">
              <div className="clinic-listing-modal-success-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="clinic-listing-modal-success-title">
                Request Submitted!
              </h2>
              <p className="clinic-listing-modal-success-message">
                {submittedRequestType === "new" 
                  ? "Thank you for submitting your clinic! A member of our team will reach out soon to schedule a short demo call — we'll walk you through the platform, answer any questions, and help you get your clinic listed."
                  : "Thank you for submitting feedback. Our team may reach out to you for further information, but otherwise please check back on your clinic page in a few days."}
              </p>
            </div>
          ) : (
            // Form Screen
            <>
              <h2 className="clinic-listing-modal-title">
                List Your Clinic on Glowra
              </h2>
              <p className="clinic-listing-modal-description">
                Submit a request to list your clinic or make adjustments to your existing listing.
              </p>

              {/* Tabs */}
              <div className="clinic-listing-modal-tabs">
                <button
                  type="button"
                  onClick={() => handleTabChange("new")}
                  className={cn(
                    "clinic-listing-modal-tab",
                    activeTab === "new" && "clinic-listing-modal-tab-active"
                  )}
                >
                  List Your Clinic
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange("adjustment")}
                  className={cn(
                    "clinic-listing-modal-tab",
                    activeTab === "adjustment" && "clinic-listing-modal-tab-active"
                  )}
                >
                  Adjustment Request
                </button>
              </div>

              <form onSubmit={handleSubmit} className="clinic-listing-modal-form">
                {/* Clinic Name */}
                <div>
                  <input
                    type="text"
                    name="clinicName"
                    placeholder="Clinic Name"
                    value={formData.clinicName}
                    onChange={handleInputChange}
                    className={cn(
                      "clinic-listing-modal-input",
                      errors.clinicName && "error"
                    )}
                  />
                  {errors.clinicName && (
                    <p className="clinic-listing-modal-error">{errors.clinicName}</p>
                  )}
                </div>

                {/* Address */}
                <div>
                  <input
                    type="text"
                    name="address"
                    placeholder="Address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={cn(
                      "clinic-listing-modal-input",
                      errors.address && "error"
                    )}
                  />
                  {errors.address && (
                    <p className="clinic-listing-modal-error">{errors.address}</p>
                  )}
                </div>

                {/* City & State Row */}
                <div className="clinic-listing-modal-input-row">
                  <div>
                    <input
                      type="text"
                      name="city"
                      placeholder="City"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={cn(
                        "clinic-listing-modal-input",
                        errors.city && "error"
                      )}
                    />
                    {errors.city && (
                      <p className="clinic-listing-modal-error">{errors.city}</p>
                    )}
                  </div>
                  <div>
                    <input
                      type="text"
                      name="state"
                      placeholder="State"
                      value={formData.state}
                      onChange={handleInputChange}
                      className={cn(
                        "clinic-listing-modal-input",
                        errors.state && "error"
                      )}
                    />
                    {errors.state && (
                      <p className="clinic-listing-modal-error">{errors.state}</p>
                    )}
                  </div>
                </div>

                {/* Website */}
                <div>
                  <input
                    type="text"
                    name="website"
                    placeholder={isNewListing ? "Website" : "Website (optional)"}
                    value={formData.website}
                    onChange={handleInputChange}
                    className={cn(
                      "clinic-listing-modal-input",
                      errors.website && "error"
                    )}
                  />
                  {errors.website && (
                    <p className="clinic-listing-modal-error">{errors.website}</p>
                  )}
                </div>

                {/* Category - Only for List Your Clinic */}
                {isNewListing && (
                  <div>
                    <select
                      name="clinicCategory"
                      value={formData.clinicCategory}
                      onChange={handleInputChange}
                      className={cn(
                        "clinic-listing-modal-input",
                        errors.clinicCategory && "error"
                      )}
                    >
                      <option value="">Select Category</option>
                      <option value="Plastic Surgery">Plastic Surgery</option>
                      <option value="Medspa / Aesthetics">Medspa / Aesthetics</option>
                      <option value="Medical">Medical</option>
                      <option value="Dermatology">Dermatology</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.clinicCategory && (
                      <p className="clinic-listing-modal-error">{errors.clinicCategory}</p>
                    )}
                  </div>
                )}

                {/* Primary Contact Name */}
                <div>
                  <input
                    type="text"
                    name="primaryContactName"
                    placeholder={isNewListing ? "Primary Contact Name" : "Primary Contact Name (optional)"}
                    value={formData.primaryContactName}
                    onChange={handleInputChange}
                    className={cn(
                      "clinic-listing-modal-input",
                      errors.primaryContactName && "error"
                    )}
                  />
                  {errors.primaryContactName && (
                    <p className="clinic-listing-modal-error">{errors.primaryContactName}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={cn(
                      "clinic-listing-modal-input",
                      errors.email && "error"
                    )}
                  />
                  {errors.email && (
                    <p className="clinic-listing-modal-error">{errors.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <input
                    type="tel"
                    name="phone"
                    placeholder={isNewListing ? "Phone Number" : "Phone Number (optional)"}
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={cn(
                      "clinic-listing-modal-input",
                      errors.phone && "error"
                    )}
                  />
                  {errors.phone && (
                    <p className="clinic-listing-modal-error">{errors.phone}</p>
                  )}
                </div>

                {/* More Details - Only for List Your Clinic */}
                {isNewListing && (
                  <div>
                    <textarea
                      name="additionalDetails"
                      placeholder="More Details (optional)"
                      value={formData.additionalDetails}
                      onChange={handleInputChange}
                      rows={6}
                      className="clinic-listing-modal-textarea"
                    />
                  </div>
                )}

                {/* Message to Glowra */}
                <div>
                  <textarea
                    name="message"
                    placeholder="Message to Glowra (optional)"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={6}
                    className="clinic-listing-modal-textarea"
                  />
                </div>

                {/* Submit Error */}
                {errors.submit && (
                  <div className="clinic-listing-modal-submit-error">
                    {errors.submit}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="clinic-listing-modal-submit-button"
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ClinicListingModal;

