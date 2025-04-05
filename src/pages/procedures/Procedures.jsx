// Procedures.jsx
import { Option, Radio, Select } from "@material-tailwind/react";
import React, { useState, useEffect, useCallback } from "react";
import { createSearchIndex, performSearch, applyFilters, paginateResults } from "../../utils/searchUtils";
import useSearchState from "../../hooks/useSearchState";
import { icons } from "../../components/Icons";
import Layout from "../../components/Layout";
import PriceRangeFilter from '../../components/PriceRangeFilter';
import SearchResultCard from "./components/SearchResultCard";
import useScreen from "../../hooks/useScreen";

const API_BASE_URL = 'http://localhost:3001';

const NUMBER_OF_CARDS_PER_PAGE = 9;

const Procedures = () => {
  const screen = useScreen();
  const [rating, setRating] = useState("5 star");
  
  // Use our custom hook for search state management
  const { 
    searchState, 
    updateSearchState 
  } = useSearchState({
    searchQuery: "",
    category: "Breast",
    location: "Dallas, TX",
    minPrice: "3500",
    maxPrice: "8000",
    specialty: "Plastic Surgery",
    page: 1
  });
  
  const { 
    searchQuery, 
    category, 
    location, 
    minPrice, 
    maxPrice, 
    specialty, 
    page 
  } = searchState;
  
  // State for full data and displayed products
  const [allProcedures, setAllProcedures] = useState([]);
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
        console.log('API returned data:', data);
        
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
            name: { boost: 10 },       // Procedure name is most important
            doctorInfo: { boost: 5 },  // Clinic name
            doctor: { boost: 3 },      // Provider name
            category: { boost: 7 },    // Give category high importance
            specialty: { boost: 5 },
            City: { boost: 2 },
            State: { boost: 1 }
          }
        });
        
        setSearchIndex(idx);
        
        // Initial filtering without search
        filterProcedures(transformedData);
      } catch (error) {
        console.error('Error fetching procedures for search index:', error);
        setError(error.message);
        
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllProcedures();
  }, []); // Add empty dependency array to prevent infinite loop
  
  // Filter procedures based on current filters using our utility function
  const filterProcedures = useCallback((procedures) => {
    // Apply filters using our utility function
    const filtered = applyFilters(procedures, {
      category,
      location,
      specialty,
      minPrice,
      maxPrice
    });
    
    // Handle pagination using our utility function
    const paginationData = paginateResults(filtered, page, NUMBER_OF_CARDS_PER_PAGE);
    
    setTotalResults(paginationData.total);
    setProducts(paginationData.results);
  }, [category, location, specialty, minPrice, maxPrice, page]);
  
  // Apply filters when they change
  useEffect(() => {
    if (allProcedures.length > 0) {
      filterProcedures(allProcedures);
    }
  }, [allProcedures, filterProcedures]);
  
  // Handle search submission using our utility function
  const handleSearch = (e) => {
    e.preventDefault();
    
    if (!searchIndex || !searchQuery.trim()) {
      // If no search query, just apply filters to all procedures
      filterProcedures(allProcedures);
      return;
    }
    
    // Use the performSearch utility, which includes error handling and fallbacks
    const searchResults = performSearch(searchIndex, allProcedures, searchQuery);
    
    // Apply filters to search results
    filterProcedures(searchResults);
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
            {searchQuery ? `Search results for "${searchQuery}":` : "All Procedures:"}
          </h1>
          <div className="subtitle">{totalResults} Procedures Found</div>
          
          <form onSubmit={handleSearch}>
            <div className="relative">
              <input
                type="text"
                placeholder={
                  screen < 768
                    ? "Search procedure"
                    : "Type the procedure you want here"
                }
                className="search-input"
                value={searchQuery}
                onChange={(e) => updateSearchState('searchQuery', e.target.value)}
              />
              <button type="submit" className="search-btn">
                <span>Search</span>
                {icons.searchIcon3}
              </button>
            </div>
          </form>
          
          {/* Filters */}
          <div className="search-grid">
            <div className="border bg-white rounded-md">
              <Select
                variant="static"
                className="border-none h-[52px] rounded-xl"
                label="Category"
                containerProps={{
                  className: "!min-w-0 w-full select max-w-full",
                }}
                value={category}
                onChange={(val) => updateSearchState('category', val)}
              >
                <Option value="">All Categories</Option>
                <Option value="Breast">Breast</Option>
                <Option value="Body">Body</Option>
                <Option value="Face">Face</Option>
                <Option value="Injectibles">Injectibles</Option>
                <Option value="Skin">Skin</Option>
                <Option value="Other">Other</Option>
              </Select>
            </div>
            <div className="border bg-white rounded-md">
              <Select
                variant="static"
                className="border-none h-[52px] rounded-xl"
                label="Location"
                containerProps={{
                  className: "!min-w-0 w-full select max-w-full",
                }}
                value={location}
                onChange={(val) => updateSearchState('location', val)}
              >
                <Option value="Dallas, TX">Dallas, TX</Option>
                <Option value="Los Angeles, CA">Los Angeles, CA</Option>
                <Option value="Miami, FL">Miami, FL</Option>
                <Option value="Denver, CO">Denver, CO</Option>
                <Option value="Chicago, IL">Chicago, IL</Option>
              </Select>
            </div>
            {/* Price Range Filters */}
            <div>
              <PriceRangeFilter
                label="Price Min"
                value={minPrice}
                onChange={(val) => updateSearchState('minPrice', val)}
                placeholder="Min Price"
                type="min"
                options={[
                  { value: "", label: "Any Price" },
                  { value: "0", label: "$0" },
                  { value: "2000", label: "$2,000" },
                  { value: "5000", label: "$5,000" },
                  { value: "7500", label: "$7,500" },
                  { value: "10000", label: "$10,000" },
                  { value: "12500", label: "$12,500" },
                  { value: "15000", label: "$15,000" },
                  { value: "17500", label: "$17,500" },
                  { value: "20000", label: "$20,000" }
                ]}
              />
            </div>
            <div>
              <PriceRangeFilter
                label="Price Max"
                value={maxPrice}
                onChange={(val) => updateSearchState('maxPrice', val)}
                placeholder="Max Price"
                type="max"
                options={[
                  { value: "", label: "No Max" },
                  { value: "5000", label: "$5,000" },
                  { value: "7500", label: "$7,500" },
                  { value: "10000", label: "$10,000" },
                  { value: "12500", label: "$12,500" },
                  { value: "15000", label: "$15,000" },
                  { value: "20000", label: "$20,000" },
                  { value: "30000", label: "$30,000" },
                  { value: "50000", label: "$50,000" }
                ]}
              />
            </div>
            <div className="border bg-white rounded-md">
              <Select
                variant="static"
                className="border-none h-[52px] rounded-xl"
                label="Specialty"
                containerProps={{
                  className: "!min-w-0 w-full select max-w-full",
                }}
                value={specialty}
                onChange={(val) => updateSearchState('specialty', val)}
              >
                <Option value="Plastic Surgery">Plastic Surgery</Option>
                <Option value="Dermatology">Dermatology</Option>
              </Select>
            </div>
          </div>
          
          {/* Results and sidebar section */}
          <div className="flex flex-col xl:flex-row gap-8 mt-[34px] md:mt-[63px]">
            {/* Sidebar */}
            <div className="w-full xl:w-[208px] xl:flex-shrink-0 order-2 xl:order-1">
              {/* Rating filters */}
              <div className="mb-8">
                <h5 className="font-medium mb-2 font-Avenir">
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

const ratingList = [
  { name: "5 star" },
  { name: "4 star (& above)" },
  { name: "3 star (& above)" },
  { name: "2 star (& above)" },
  { name: "1 star (& above)" },
];

export default Procedures;