import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { CONSULTATION_REQUEST_API_URL } from "../config/api";
import { cn } from "../utils/cn";
import "./ConsultationRequestModal.css";

const ConsultationRequestModal = ({ 
  isOpen, 
  onClose, 
  clinicId, 
  clinicInfo, 
  selectedData 
}) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: ""
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        message: ""
      });
      setErrors({});
      setIsSuccess(false);
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

  // Auto-close after success
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, onClose]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({}); // Clear previous errors

    try {
      // Prepare request payload
      const payload = {
        // User inputs
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        message: formData.message.trim() || null,
        // Clinic context (auto-included)
        clinicId: clinicId,
        clinicName: clinicInfo?.ClinicName || null,
        selectedProcedures: selectedData.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price
        }))
      };

      const response = await fetch(`${CONSULTATION_REQUEST_API_URL}/api/consultation-requests`, {
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
        console.log('Consultation request submitted successfully. Request ID:', result.requestId);
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
      console.error("Error submitting consultation request:", error);
      setErrors({
        submit: "Failed to submit your request. Please check your connection and try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="consultation-modal-overlay"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="consultation-modal-backdrop" />
      
      {/* Modal Content */}
      <div
        className="consultation-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="consultation-modal-close-button"
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

        <div className="consultation-modal-body">
          {isSuccess ? (
            // Success Screen
            <div className="consultation-modal-success-wrapper">
              <div className="consultation-modal-success-icon">
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
              <h2 className="consultation-modal-success-title">
                Request Submitted!
              </h2>
              <p className="consultation-modal-success-message">
                Thank you for your interest. We'll get back to you soon.
              </p>
              <p className="consultation-modal-success-footer">
                This window will close automatically...
              </p>
            </div>
          ) : (
            // Form Screen
            <>
              <h2 className="consultation-modal-title">
                Get in Touch
              </h2>
              <p className="consultation-modal-description">
                We'd love to hear from you! Please fill out the form below to send us a message.
              </p>

              <form onSubmit={handleSubmit} className="consultation-modal-form">
                {/* First Name & Last Name Row */}
                <div className="consultation-modal-input-row">
                  <div>
                    <input
                      type="text"
                      name="firstName"
                      placeholder="First name"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={cn(
                        "consultation-modal-input",
                        errors.firstName && "error"
                      )}
                    />
                    {errors.firstName && (
                      <p className="consultation-modal-error">{errors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Last name"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={cn(
                        "consultation-modal-input",
                        errors.lastName && "error"
                      )}
                    />
                    {errors.lastName && (
                      <p className="consultation-modal-error">{errors.lastName}</p>
                    )}
                  </div>
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
                      "consultation-modal-input",
                      errors.email && "error"
                    )}
                  />
                  {errors.email && (
                    <p className="consultation-modal-error">{errors.email}</p>
                  )}
                </div>

                {/* Phone (Optional) */}
                <div>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone (optional)"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="consultation-modal-input"
                  />
                </div>

                {/* Message (Optional) */}
                <div>
                  <textarea
                    name="message"
                    placeholder="Message (optional)"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={6}
                    className="consultation-modal-textarea"
                  />
                </div>

                {/* Submit Error */}
                {errors.submit && (
                  <div className="consultation-modal-submit-error">
                    {errors.submit}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="consultation-modal-submit-button"
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

export default ConsultationRequestModal;

