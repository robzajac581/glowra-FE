import React, { useState, useEffect } from "react";
import { CONSULTATION_REQUEST_API_URL } from "../config/api";
import { cn } from "../utils/cn";

const ConsultationRequestForm = ({ 
  clinicId, 
  clinicInfo, 
  selectedData,
  procedures // All procedures offered by the clinic (organized by category)
}) => {
  const [patientStatus, setPatientStatus] = useState("new");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    procedureType: "",
    phone: "",
    message: ""
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isOptionalExpanded, setIsOptionalExpanded] = useState(false);

  // Calculate total estimate
  const totalEstimate = selectedData.reduce((sum, item) => sum + item.price, 0);

  // Format price with tilde prefix
  const formatPrice = (price) => {
    return '~' + new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Get all procedure types offered by clinic
  const procedureTypes = procedures ? Object.keys(procedures) : [];

  // Auto-populate procedure type based on selected procedures
  useEffect(() => {
    if (selectedData.length === 0) {
      setFormData(prev => ({ ...prev, procedureType: "" }));
      return;
    }

    // Get unique categories from selected procedures
    const selectedCategories = new Set();
    selectedData.forEach(item => {
      // Find which category this procedure belongs to
      if (procedures) {
        Object.entries(procedures).forEach(([category, data]) => {
          if (data.procedures.some(proc => proc.id === item.id)) {
            selectedCategories.add(category);
          }
        });
      }
    });

    // Set procedure type based on selection
    if (selectedCategories.size === 1) {
      // Single category selected
      setFormData(prev => ({ ...prev, procedureType: Array.from(selectedCategories)[0] }));
    } else if (selectedCategories.size > 1) {
      // Multiple categories selected
      setFormData(prev => ({ ...prev, procedureType: "Multiple" }));
    }
  }, [selectedData, procedures]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.procedureType) {
      newErrors.procedureType = "Procedure type is required";
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
    setErrors({});

    try {
      // Prepare request payload
      const payload = {
        // Split name into firstName and lastName for backend compatibility
        firstName: formData.name.trim().split(' ')[0],
        lastName: formData.name.trim().split(' ').slice(1).join(' ') || formData.name.trim().split(' ')[0],
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        message: formData.message.trim() || null,
        patientStatus: patientStatus, // new or returning
        procedureType: formData.procedureType,
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

      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        throw new Error("Invalid response from server");
      }

      if (result.success) {
        console.log('Consultation request submitted successfully. Request ID:', result.requestId);
        setIsSuccess(true);
        // Reset form after 4 seconds
        setTimeout(() => {
          setIsSuccess(false);
          setFormData({
            name: "",
            email: "",
            procedureType: "",
            phone: "",
            message: ""
          });
          setPatientStatus("new");
          setIsOptionalExpanded(false);
        }, 4000);
      } else {
        if (result.details && typeof result.details === 'object') {
          const apiErrors = {};
          Object.keys(result.details).forEach((field) => {
            apiErrors[field] = result.details[field];
          });
          setErrors(apiErrors);
        } else {
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

  if (isSuccess) {
    return (
      <div className="clinic-sidebar-card text-center py-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            className="w-8 h-8 text-primary"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-xl font-medium mb-2">Request Submitted!</h3>
        <p className="text-sm text-gray-600">
          Thank you for your interest. We'll get back to you soon.
        </p>
      </div>
    );
  }

  return (
    <div className="clinic-sidebar-card">
      <h4 className="text-xl font-medium mb-4">Request a consultation</h4>
      <p className="text-sm text-gray-600 mb-4">
        * Prices are estimates and may vary based on surgeon expertise, location, and individual procedure needs. Please request a consult for a personalized quote
      </p>

      {/* Patient Status Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setPatientStatus("new")}
          className={cn(
            "flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
            patientStatus === "new"
              ? "bg-white border-2 border-primary text-primary"
              : "bg-gray-100 border-2 border-transparent text-gray-600 hover:border-gray-300"
          )}
        >
          New patient
        </button>
        <button
          type="button"
          onClick={() => setPatientStatus("returning")}
          className={cn(
            "flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
            patientStatus === "returning"
              ? "bg-white border-2 border-primary text-primary"
              : "bg-gray-100 border-2 border-transparent text-gray-600 hover:border-gray-300"
          )}
        >
          Returning patient
        </button>
      </div>

      {/* Estimate Overview */}
      {selectedData.length > 0 && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h5 className="font-semibold text-primary mb-3" style={{ fontSize: '0.9375rem', letterSpacing: '-0.01em' }}>Estimate Overview</h5>
          <div className="space-y-2 mb-3">
            {selectedData.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-sm">
                <span className="text-gray-800">{item.name}</span>
                <span className="font-medium text-black">{formatPrice(item.price)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center pt-3 mt-2 border-t border-gray-300">
            <span className="font-bold text-black">Price Estimate:</span>
            <span className="font-bold text-lg text-black">{formatPrice(totalEstimate)}</span>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Name</label>
          <input
            type="text"
            name="name"
            placeholder="Enter your name"
            value={formData.name}
            onChange={handleInputChange}
            className={cn(
              "w-full h-11 px-3.5 text-sm bg-gray-50 border border-gray-300 rounded-lg outline-none focus:border-primary transition-colors",
              errors.name && "border-red-500"
            )}
          />
          {errors.name && (
            <p className="text-xs text-red-500 mt-1">{errors.name}</p>
          )}
        </div>

        {/* Procedure Type */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Procedure Type</label>
          <select
            name="procedureType"
            value={formData.procedureType}
            onChange={handleInputChange}
            className={cn(
              "w-full h-11 px-3.5 text-sm bg-gray-50 border border-gray-300 rounded-lg outline-none focus:border-primary transition-colors appearance-none cursor-pointer",
              errors.procedureType && "border-red-500",
              !formData.procedureType && "text-gray-500"
            )}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0.75rem center',
              backgroundSize: '1.25rem'
            }}
          >
            <option value="">
              {selectedData.length === 0 ? "Select feature" : "Select procedure type"}
            </option>
            {procedureTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
            {selectedData.length > 0 && formData.procedureType === "Multiple" && (
              <option value="Multiple">Multiple</option>
            )}
          </select>
          {errors.procedureType && (
            <p className="text-xs text-red-500 mt-1">{errors.procedureType}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Email</label>
          <input
            type="email"
            name="email"
            placeholder="Enter your Email"
            value={formData.email}
            onChange={handleInputChange}
            className={cn(
              "w-full h-11 px-3.5 text-sm bg-gray-50 border border-gray-300 rounded-lg outline-none focus:border-primary transition-colors",
              errors.email && "border-red-500"
            )}
          />
          {errors.email && (
            <p className="text-xs text-red-500 mt-1">{errors.email}</p>
          )}
        </div>

        {/* Optional Fields - Expandable */}
        <div>
          <button
            type="button"
            onClick={() => setIsOptionalExpanded(!isOptionalExpanded)}
            className="flex items-center gap-2 text-sm text-primary hover:underline mb-2"
          >
            <svg
              className={cn(
                "w-4 h-4 transition-transform",
                isOptionalExpanded && "rotate-180"
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            {isOptionalExpanded ? "Hide" : "Add"} optional information
          </button>

          {isOptionalExpanded && (
            <div className="space-y-3 pl-6 border-l-2 border-gray-200">
              {/* Phone */}
              <div>
                <label className="block text-sm font-medium mb-1.5">Phone (optional)</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Enter your phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full h-11 px-3.5 text-sm bg-gray-50 border border-gray-300 rounded-lg outline-none focus:border-primary transition-colors"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium mb-1.5">Message (optional)</label>
                <textarea
                  name="message"
                  placeholder="Your message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-lg resize-none outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>
          )}
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {errors.submit}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 bg-black text-white rounded-lg font-medium text-base hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </>
          ) : (
            <>
              Request a consultation 
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ConsultationRequestForm;

