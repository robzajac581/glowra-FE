// Search.jsx
import { Radio, Popover, PopoverHandler, PopoverContent } from "@material-tailwind/react";
import React, { useState, useEffect, useCallback } from "react";
import { createSearchIndex, performSearch, applyFilters, paginateResults } from "../../utils/searchUtils";
import useSearchState from "../../hooks/useSearchState";
import { icons } from "../../components/Icons";
import Layout from "../../components/Layout";
import CombinedPriceFilter from '../../components/CombinedPriceFilter';
import SearchResultCard from "./components/SearchResultCard";
import useScreen from "../../hooks/useScreen";

const API_BASE_URL = 'http://localhost:3001';

const NUMBER_OF_CARDS_PER_PAGE = 9;

const Search = () => {
  const screen = useScreen();
  const [rating, setRating] = useState("5 star");
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
    page: 1
  });
  
  const { 
    searchQuery, 
    category, 
    minPrice, 
    maxPrice, 
    specialty, 
    page 
  } = searchState;
  
  // Local state for input value (separate from searchQuery to prevent search-as-you-type)
  const [inputValue, setInputValue] = useState(searchQuery);
  
  // Sync inputValue with searchQuery when it changes from external sources (like URL params)
  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);
  
  // State for full data and displayed products
  const [allProcedures, setAllProcedures] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchIndex, setSearchIndex] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalResults, setTotalResults] = useState(0);

  // Fetch all procedures for indexing
  useEffect(() => {
    const fetchAllProcedures = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/procedures/search-index`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Transform the data for our component format
        const transformedData = data.map(procedure => ({
          id: procedure.ProcedureID,
          clinicId: procedure.ClinicID,
          img: `/img/procedures/${(procedure.ProcedureID % 6) + 1}.png`, // Cycle through available images
          doctor: procedure.ProviderName,
          doctorInfo: procedure.ClinicName,
          name: procedure.ProcedureName,
          price: procedure.AverageCost,
          City: procedure.City,
          State: procedure.State,
          website: procedure.Website,
          category: procedure.Category,
          specialty: procedure.Specialty
        }));
        
        setAllProcedures(transformedData);
        
        // Build the Lunr search index using our utility function
        const idx = createSearchIndex(transformedData, {
          fields: {
            name: { boost: 7 },       // Procedure name
            doctorInfo: { boost: 4 },  // Clinic name
            doctor: { boost: 2 },      // Provider name
            category: { boost: 7 },
            specialty: { boost: 4 },
            City: { boost: 8 },
            State: { boost: 9 }
          }
        });
        
        setSearchIndex(idx);
      } catch (error) {
        console.error('Error fetching procedures for search index:', error);
        setError(error.message);
        
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllProcedures();
  }, []); // Add empty dependency array to prevent infinite loop
  
  // Perform search operation and apply filters
  useEffect(() => {
    if (!searchIndex || allProcedures.length === 0) {
      return;
    }

    let dataToFilter;

    if (!searchQuery.trim()) {
      // If no search query, use all procedures
      dataToFilter = allProcedures;
      setSearchResults([]);
    } else {
      // Use the performSearch utility, which includes error handling and fallbacks
      const results = performSearch(searchIndex, allProcedures, searchQuery);
      setSearchResults(results);
      dataToFilter = results;
    }
    
    // Apply filters using our utility function
    const filtered = applyFilters(dataToFilter, {
      category,
      specialty,
      minPrice,
      maxPrice
    });
    
    // Handle pagination using our utility function
    const paginationData = paginateResults(filtered, page, NUMBER_OF_CARDS_PER_PAGE);
    
    setTotalResults(paginationData.total);
    setProducts(paginationData.results);
  }, [searchIndex, allProcedures, searchQuery, category, specialty, minPrice, maxPrice, page]);
  
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
          <div className="subtitle">{totalResults} Procedures Found</div>
          
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
                    <label className="absolute text-xs text-black text-opacity-50 top-[6px] left-4">
                      Category
                    </label>
                    <div className="h-full w-full pt-4 px-4 flex items-center justify-between">
                      <span className="text-sm font-extrabold text-black">
                        {category || "Category"}
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
                
                <PopoverContent className="p-0 border border-border rounded-[10px] z-[9999] bg-white shadow-lg w-[230px]" style={{ width: '100%', maxWidth: '100%' }}>
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
                        updateSearchState('category', 'Breast');
                        setCategoryOpen(false);
                      }}
                    >
                      Breast
                    </div>
                    <div 
                      className="px-4 py-2 text-sm font-medium hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        updateSearchState('category', 'Body');
                        setCategoryOpen(false);
                      }}
                    >
                      Body
                    </div>
                    <div 
                      className="px-4 py-2 text-sm font-medium hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        updateSearchState('category', 'Face');
                        setCategoryOpen(false);
                      }}
                    >
                      Face
                    </div>
                    <div 
                      className="px-4 py-2 text-sm font-medium hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        updateSearchState('category', 'Injectibles');
                        setCategoryOpen(false);
                      }}
                    >
                      Injectibles
                    </div>
                    <div 
                      className="px-4 py-2 text-sm font-medium hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        updateSearchState('category', 'Skin');
                        setCategoryOpen(false);
                      }}
                    >
                      Skin
                    </div>
                    <div 
                      className="px-4 py-2 text-sm font-medium hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        updateSearchState('category', 'Other');
                        setCategoryOpen(false);
                      }}
                    >
                      Other
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
              {/* Rating filters */}
              <div className="mb-8">
                <h5 className="font-bold mb-2 font-Avenir">
                  Customer Rating
                </h5>
                <div className="flex flex-col gap-3">
                  {ratingList?.map((item) => (
                    <Radio
                      key={item.name}
                      name="terms"
                      label={
                        <div
                          className={`font-medium ${
                            item.name === rating
                              ? "text-black"
                              : "text-text2"
                          }`}
                        >
                          {item.name}
                        </div>
                      }
                      containerProps={{
                        className: "p-0 items-center radio",
                      }}
                      defaultChecked={item.name === rating}
                      onChange={() => setRating(item.name)}
                    />
                  ))}
                </div>
              </div>
              
              {/* Map */}
              <div className="mb-8">
                <h5 className="font-medium mb-2 font-Avenir">
                  Nearest Locations
                </h5>
                <iframe
                  title="Search Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7298.9601660514245!2d90.36501104466463!3d23.837080364445423!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c14a3366b005%3A0x901b07016468944c!2sMirpur%20DOHS%2C%20Dhaka!5e0!3m2!1sen!2sbd!4v1721925768310!5m2!1sen!2sbd"
                  height="250"
                  style={{ border: "none", width: "100%" }}
                ></iframe>
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
              ) : products.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-xl font-medium">No procedures found matching your criteria.</p>
                  <p className="mt-2 text-gray-600">Try adjusting your filters or search terms.</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
                    {products.map((item) => (
                      <div className="procedure-card-wrapper" key={item.id}>
                        <SearchResultCard 
                          item={item}
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

const ratingList = [
  { name: "5 star" },
  { name: "4 star (& above)" },
  { name: "3 star (& above)" },
  { name: "2 star (& above)" },
  { name: "1 star (& above)" },
];

export default Search;

