// Search.jsx
import { Popover, PopoverHandler, PopoverContent } from "@material-tailwind/react";
import React, { useState, useEffect } from "react";
import { createSearchIndex, performSearch, applyFilters, sortResults, paginateResults, getDisplayProcedures } from "../../utils/searchUtils";
import useSearchState from "../../hooks/useSearchState";
import { icons } from "../../components/Icons";
import Layout from "../../components/Layout";
import CombinedPriceFilter from '../../components/CombinedPriceFilter';
import SortFilter from "../../components/SortFilter";
import SearchResultCard from "./components/SearchResultCard";
import useScreen from "../../hooks/useScreen";
import API_BASE_URL from "../../config/api";

const NUMBER_OF_CARDS_PER_PAGE = 9;

const Search = () => {
  const screen = useScreen();
  const [categoryOpen, setCategoryOpen] = useState(false);
  
  // Use our custom hook for search state management
  const { 
    searchState, 
    updateSearchState 
  } = useSearchState({
    searchQuery: "",
    category: "",
    minPrice: "",
    maxPrice: "",
    specialty: "",
    sortBy: "relevance",
    page: 1
  });
  
  const { 
    searchQuery, 
    category, 
    minPrice, 
    maxPrice, 
    sortBy,
    page 
  } = searchState;
  
  // Local state for input value (separate from searchQuery to prevent search-as-you-type)
  const [inputValue, setInputValue] = useState(searchQuery);
  
  // Sync inputValue with searchQuery when it changes from external sources (like URL params)
  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);
  
  // State for full data and displayed clinics
  const [allClinics, setAllClinics] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [searchIndex, setSearchIndex] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalResults, setTotalResults] = useState(0);
  
  // User location state for map
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);

  // Get user's location for map
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationLoading(false);
        },
        (error) => {
          console.error("Error getting user location:", error);
          setLocationError(error.message);
          setLocationLoading(false);
          // Fallback to default location (Chicago, IL)
          setUserLocation({
            lat: 41.8781,
            lng: -87.6298
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } else {
      setLocationError("Geolocation is not supported by your browser");
      setLocationLoading(false);
      // Fallback to default location (Chicago, IL)
      setUserLocation({
        lat: 41.8781,
        lng: -87.6298
      });
    }
  }, []);

  // Fetch all clinics for indexing
  useEffect(() => {
    const fetchAllClinics = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/clinics/search-index`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Extract clinics array from response and filter out closed clinics
        const clinicsData = (data.clinics || []).filter(clinic => {
          // Check if clinic has businessStatus field and it's operational
          if (clinic.businessStatus && clinic.businessStatus !== 'OPERATIONAL') {
            return false;
          }
          
          // Also check if clinic name contains "(closed)"
          if (clinic.clinicName && clinic.clinicName.toLowerCase().includes('(closed)')) {
            return false;
          }
          
          return true;
        });
        
        setAllClinics(clinicsData);
        
        // Build the Lunr search index using our utility function
        const { idx } = createSearchIndex(clinicsData);
        
        setSearchIndex(idx);
      } catch (error) {
        console.error('Error fetching clinics for search index:', error);
        setError(error.message);
        
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllClinics();
  }, []); // Empty dependency array to fetch once on mount
  
  // Perform search operation, apply filters, sort, and paginate
  useEffect(() => {
    if (!searchIndex || allClinics.length === 0) {
      return;
    }

    let dataToFilter;
    let rawSearchResults = [];

    if (!searchQuery.trim()) {
      // If no search query, use all clinics
      dataToFilter = allClinics;
    } else {
      // Use the performSearch utility, which includes error handling and fallbacks
      const results = performSearch(searchIndex, allClinics, searchQuery);
      rawSearchResults = searchIndex.search(searchQuery); // Store raw Lunr results for scoring
      dataToFilter = results;
    }
    
    // Apply filters using our utility function
    const filtered = applyFilters(dataToFilter, {
      category,
      minPrice,
      maxPrice
    });
    
    // Sort the filtered results
    const sorted = sortResults(
      filtered,
      sortBy,
      searchQuery,
      rawSearchResults,
      userLocation
    );
    
    // Add display procedures to each clinic based on search context
    const clinicsWithDisplayProcedures = sorted.map(clinic => ({
      ...clinic,
      displayProcedures: getDisplayProcedures(clinic, searchQuery)
    }));
    
    // Handle pagination using our utility function
    const paginationData = paginateResults(clinicsWithDisplayProcedures, page, NUMBER_OF_CARDS_PER_PAGE);
    
    setTotalResults(paginationData.total);
    setClinics(paginationData.results);
  }, [searchIndex, allClinics, searchQuery, category, minPrice, maxPrice, sortBy, page, userLocation]);
  
  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    // Update searchQuery which will trigger the search via useEffect
    updateSearchState('searchQuery', inputValue);
    updateSearchState('page', 1); // Reset to page 1 on new search
  };
  
  // Handle page change
  const changePage = (newPage) => {
    updateSearchState('page', newPage);
    window.scrollTo(0, 0);
  };
  
  return (
    <Layout>
      <div className="single-procedure-card">
        <div className="container xl:max-w-[1226px]">
          <h1 className="title">
            {searchQuery ? `Search results for "${searchQuery}":` : "Search Locations or Procedures:"}
          </h1>
          <div className="subtitle">{totalResults} {totalResults === 1 ? 'Clinic' : 'Clinics'} Found</div>
          
          <div className="flex gap-4 items-start relative z-10">
            {/* Search Bar - 60% width */}
            <form onSubmit={handleSearch} className="w-[60%]">
              <div className="relative">
                <input
                  type="text"
                  placeholder={
                    screen < 768
                      ? "Search location or procedure"
                      : "Search by city, state, procedure name, or doctor"
                  }
                  className="search-input"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
                <button type="submit" className="search-btn">
                  <span>Search</span>
                  {icons.searchIcon3}
                </button>
              </div>
            </form>

            {/* Price Filter - 20% width */}
            <div className="w-[20%]">
              <CombinedPriceFilter
                minValue={minPrice}
                maxValue={maxPrice}
                onMinChange={(val) => updateSearchState('minPrice', val)}
                onMaxChange={(val) => updateSearchState('maxPrice', val)}
              />
            </div>

            {/* Category Filter - 20% width */}
            <div className="w-[20%]">
              <Popover 
                open={categoryOpen} 
                handler={() => setCategoryOpen(!categoryOpen)}
                placement="bottom-start"
                offset={5}
              >
                <PopoverHandler>
                  <div className="relative w-full h-[63px] border border-border rounded-[10px] bg-white cursor-pointer hover:bg-opacity-5 transition-colors">
                    <label className="absolute text-xs text-black text-opacity-50 top-[6px] left-2 md:left-4">
                      Category
                    </label>
                    <div className="h-full w-full pt-4 px-4 flex items-center justify-between">
                      <span className="text-sm font-extrabold text-black">
                        {category || "All"}
                      </span>
                      <div className="pointer-events-none text-black">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className={`h-4 w-4 transition-transform ${categoryOpen ? 'rotate-180' : ''}`}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </PopoverHandler>
                
                <PopoverContent className="p-0 border border-border rounded-[10px] z-[9999] bg-white shadow-lg w-[230px] max-h-[400px] overflow-y-auto" style={{ width: '100%', maxWidth: '100%' }}>
                  <div className="py-2">
                    <div 
                      className="px-4 py-2 text-sm font-extrabold hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        updateSearchState('category', '');
                        setCategoryOpen(false);
                      }}
                    >
                      All Categories
                    </div>
                    <div 
                      className="px-4 py-2 text-sm font-medium hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        updateSearchState('category', 'Plastic surgery clinic');
                        setCategoryOpen(false);
                      }}
                    >
                      Plastic surgery clinic
                    </div>
                    <div 
                      className="px-4 py-2 text-sm font-medium hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        updateSearchState('category', 'Plastic surgeon');
                        setCategoryOpen(false);
                      }}
                    >
                      Plastic surgeon
                    </div>
                    <div 
                      className="px-4 py-2 text-sm font-medium hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        updateSearchState('category', 'Cosmetic surgeon');
                        setCategoryOpen(false);
                      }}
                    >
                      Cosmetic surgeon
                    </div>
                    <div 
                      className="px-4 py-2 text-sm font-medium hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        updateSearchState('category', 'Medical spa');
                        setCategoryOpen(false);
                      }}
                    >
                      Medical spa
                    </div>
                    <div 
                      className="px-4 py-2 text-sm font-medium hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        updateSearchState('category', 'Dermatologist');
                        setCategoryOpen(false);
                      }}
                    >
                      Dermatologist
                    </div>
                    <div 
                      className="px-4 py-2 text-sm font-medium hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        updateSearchState('category', 'Skin care clinic');
                        setCategoryOpen(false);
                      }}
                    >
                      Skin care clinic
                    </div>
                    <div 
                      className="px-4 py-2 text-sm font-medium hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        updateSearchState('category', 'Nurse practitioner');
                        setCategoryOpen(false);
                      }}
                    >
                      Nurse practitioner
                    </div>
                    <div 
                      className="px-4 py-2 text-sm font-medium hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        updateSearchState('category', 'General hospital');
                        setCategoryOpen(false);
                      }}
                    >
                      General hospital
                    </div>
                    <div 
                      className="px-4 py-2 text-sm font-medium hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        updateSearchState('category', 'Medical Center');
                        setCategoryOpen(false);
                      }}
                    >
                      Medical Center
                    </div>
                    <div 
                      className="px-4 py-2 text-sm font-medium hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        updateSearchState('category', 'Surgical center');
                        setCategoryOpen(false);
                      }}
                    >
                      Surgical center
                    </div>
                    <div 
                      className="px-4 py-2 text-sm font-medium hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        updateSearchState('category', 'Doctor');
                        setCategoryOpen(false);
                      }}
                    >
                      Doctor
                    </div>
                    <div 
                      className="px-4 py-2 text-sm font-medium hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        updateSearchState('category', 'Health consultant');
                        setCategoryOpen(false);
                      }}
                    >
                      Health consultant
                    </div>
                    <div 
                      className="px-4 py-2 text-sm font-medium hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        updateSearchState('category', 'Ophthalmologist');
                        setCategoryOpen(false);
                      }}
                    >
                      Ophthalmologist
                    </div>
                    <div 
                      className="px-4 py-2 text-sm font-medium hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        updateSearchState('category', 'Clínica dermatológica');
                        setCategoryOpen(false);
                      }}
                    >
                      Clínica dermatológica
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          {/* Results and sidebar section */}
          <div className="flex flex-col xl:flex-row gap-8 mt-[34px] md:mt-[63px]">
            {/* Sidebar */}
            <div className="w-full xl:w-[208px] xl:flex-shrink-0 order-2 xl:order-1">
              {/* Sort Filter */}
              <SortFilter
                value={sortBy}
                onChange={(value) => updateSearchState('sortBy', value)}
              />
              
              {/* Map */}
              <div className="mb-8">
                <h5 className="font-medium mb-2 font-Avenir">
                  Nearest Locations
                </h5>
                {locationLoading ? (
                  <div className="flex justify-center items-center bg-gray-100 rounded-lg" style={{ height: "250px" }}>
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto mb-2"></div>
                      <p className="text-sm text-gray-600">Getting your location...</p>
                    </div>
                  </div>
                ) : userLocation ? (
                  <iframe
                    title="Search Map"
                    src={`https://maps.google.com/maps?q=${userLocation.lat},${userLocation.lng}&t=&z=11&ie=UTF8&iwloc=&output=embed`}
                    height="250"
                    style={{ border: "none", width: "100%" }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                ) : (
                  <div className="flex justify-center items-center bg-gray-100 rounded-lg" style={{ height: "250px" }}>
                    <p className="text-sm text-gray-600">Unable to load map</p>
                  </div>
                )}
                {locationError && (
                  <p className="text-xs text-gray-500 mt-1">
                    {locationError === "User denied Geolocation" 
                      ? "Location access denied. Showing default area." 
                      : "Using default location."}
                  </p>
                )}
              </div>
            </div>
            
            {/* Results section */}
            <div className="flex-grow order-1 xl:order-2">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : error ? (
                <div className="py-8">
                  <p className="text-red-500 font-medium">Error: {error}</p>
                  <p>Please try again or contact support if the problem persists.</p>
                </div>
              ) : clinics.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-xl font-medium">No clinics found matching your criteria.</p>
                  <p className="mt-2 text-gray-600">Try adjusting your filters or search terms.</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
                    {clinics.map((clinic) => (
                      <div className="procedure-card-wrapper" key={clinic.clinicId}>
                        <SearchResultCard 
                          clinic={clinic}
                          searchQuery={searchQuery}
                        />
                      </div>
                    ))}
                  </div>
                  
                  {/* Pagination controls */}
                  {totalResults > NUMBER_OF_CARDS_PER_PAGE && (
                    <div className="flex justify-center mt-8">
                      <div className="flex gap-2">
                        <button
                          className={`btn ${page === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                          onClick={() => page > 1 && changePage(page - 1)}
                          disabled={page === 1}
                        >
                          Previous
                        </button>
                        
                        {/* Page numbers */}
                        {Array.from({ length: Math.ceil(totalResults / NUMBER_OF_CARDS_PER_PAGE) }).map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => changePage(idx + 1)}
                            className={`w-10 h-10 rounded-md ${
                              page === idx + 1 
                                ? 'bg-primary text-white' 
                                : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                          >
                            {idx + 1}
                          </button>
                        )).slice(Math.max(0, page - 3), Math.min(page + 2, Math.ceil(totalResults / NUMBER_OF_CARDS_PER_PAGE)))}
                        
                        <button
                          className={`btn ${page === Math.ceil(totalResults / NUMBER_OF_CARDS_PER_PAGE) ? 'opacity-50 cursor-not-allowed' : ''}`}
                          onClick={() => page < Math.ceil(totalResults / NUMBER_OF_CARDS_PER_PAGE) && changePage(page + 1)}
                          disabled={page === Math.ceil(totalResults / NUMBER_OF_CARDS_PER_PAGE)}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Search;

