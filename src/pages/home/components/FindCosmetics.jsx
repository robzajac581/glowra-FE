import React, { useState, useEffect } from "react";
import { Collapse, Option, Select } from "@material-tailwind/react";
import { Link } from "react-router-dom";
import { icons } from "../../../components/Icons";
import ProcedureCard from "../../../components/ProcedureCard";
import useScreen from "../../../hooks/useScreen";

const API_BASE_URL = 'http://localhost:3001';

const FindCosmetics = () => {
  const [open, setOpen] = useState(false);
  const screen = useScreen();
  const [procedures, setProcedures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Search states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProcedureType, setSelectedProcedureType] = useState("Botox");
  const [selectedLocation, setSelectedLocation] = useState("Dallas, TX");
  const [selectedPrice, setSelectedPrice] = useState("3500");
  const [selectedSpecialty, setSelectedSpecialty] = useState("Plastic Surgery");

  const fetchProcedures = async () => {
    try {
      setLoading(true);
      setError(null);

      // Construct query parameters
      const params = new URLSearchParams();
      if (selectedLocation) params.append('location', selectedLocation.split(',')[0]);
      if (selectedProcedureType) params.append('category', selectedProcedureType);
      if (selectedSpecialty) params.append('specialty', selectedSpecialty);
      if (selectedPrice) params.append('minPrice', selectedPrice);
      params.append('limit', 6); // Limit to 6 items for homepage preview

      const url = `${API_BASE_URL}/api/procedures?${params.toString()}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Transform the API response to match our card format
      const transformedProcedures = data.procedures.map(procedure => ({
        id: procedure.ProcedureID,
        img: `/img/procedures/${(procedure.ProcedureID % 6) + 1}.png`,
        doctor: procedure.ProviderName,
        doctorInfo: procedure.ClinicName,
        name: procedure.ProcedureName,
        price: procedure.AverageCost,
        City: procedure.City,
        State: procedure.State,
        website: procedure.Website
      }));

      setProcedures(transformedProcedures);
    } catch (err) {
      console.error('Error fetching procedures:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch procedures when filters change
  useEffect(() => {
    fetchProcedures();
  }, [selectedProcedureType, selectedLocation, selectedPrice, selectedSpecialty]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProcedures();
  };

  return (
    <section className="find-cosmetic">
      <div className="container">
        <h2 className="find-cosmetic-title">
          Find Your Cosmetic Procedure
        </h2>
        <form onSubmit={handleSearch}>
          <div className="flex md:gap-[30px] mb-[13px] md:mb-[30px]">
            <div className="w-0 flex-grow relative -mr-4 md:mr-0">
              <input
                type="text"
                placeholder={
                  screen < 768
                    ? "Search procedure"
                    : "Type the procedure you want here"
                }
                className="find-cosmetic-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button type="submit" className="find-cosmetic-search-btn">
                <span>Search {icons.searchIcon3}</span>
              </button>
            </div>
            <Link to="/procedures" className="find-cosmetic-btn">
              <span className="hidden md:block">See All</span>{" "}
              {icons.rightArrow}
            </Link>
          </div>
        </form>

        {screen >= 1024 ? (
          <AdvancedFilter
            procedureType={selectedProcedureType}
            setProcedureType={setSelectedProcedureType}
            location={selectedLocation}
            setLocation={setSelectedLocation}
            price={selectedPrice}
            setPrice={setSelectedPrice}
            specialty={selectedSpecialty}
            setSpecialty={setSelectedSpecialty}
          />
        ) : (
          <Collapse open={open}>
            <AdvancedFilter
              procedureType={selectedProcedureType}
              setProcedureType={setSelectedProcedureType}
              location={selectedLocation}
              setLocation={setSelectedLocation}
              price={selectedPrice}
              setPrice={setSelectedPrice}
              specialty={selectedSpecialty}
              setSpecialty={setSelectedSpecialty}
            />
          </Collapse>
        )}

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className={`text-black flex gap-3 lg:hidden ${open ? "mt-3" : ""}`}
        >
          {icons.filter}
          Advanced filters
        </button>

        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-4">Error: {error}</div>
        ) : (
          <div className="products-grid">
            {procedures
              .slice(0, screen < 1024 ? (screen < 640 ? 3 : 4) : 6)
              .map((item) => (
                <ProcedureCard item={item} key={item.id} />
              ))}
          </div>
        )}
      </div>
      <div className="start-search-btn">
        <Link to="/procedures" className="btn w-full max-w-[297px]">
          Start Your Search
        </Link>
      </div>
    </section>
  );
};

const AdvancedFilter = ({
  procedureType,
  setProcedureType,
  location,
  setLocation,
  price,
  setPrice,
  specialty,
  setSpecialty
}) => {
  return (
    <div className="advanced-search-flex">
      <div className="select-item">
        {icons.searchicon}
        <label className="text-text">Procedure Type:</label>
        <Select
          className="border-none rounded-xl"
          containerProps={{
            className: "!min-w-20 w-full select-4",
          }}
          labelProps={{
            className: "hidden",
          }}
          value={procedureType}
          onChange={(value) => setProcedureType(value)}
        >
          <Option value="Breast">Breast</Option>
          <Option value="Body">Body</Option>
          <Option value="Face">Face</Option>
          <Option value="Injectibles">Injectibles</Option>
          <Option value="Skin">Skin</Option>
        </Select>
      </div>

      <div className="select-item">
        {icons.mapmarker}
        <label className="text-text">Select Locations:</label>
        <Select
          className="border-none rounded-xl"
          containerProps={{
            className: "!min-w-20 w-full select-4",
          }}
          labelProps={{
            className: "hidden",
          }}
          value={location}
          onChange={(value) => setLocation(value)}
        >
          <Option value="Dallas, TX">Dallas, TX</Option>
          <Option value="Los Angeles, CA">Los Angeles, CA</Option>
          <Option value="Miami, FL">Miami, FL</Option>
          <Option value="Denver, CO">Denver, CO</Option>
          <Option value="Chicago, IL">Chicago, IL</Option>
        </Select>
      </div>

      <div className="select-item">
        {icons.dollar}
        <label className="text-text">Price Range:</label>
        <Select
          className="border-none rounded-xl"
          containerProps={{
            className: "!min-w-20 w-full select-4",
          }}
          labelProps={{
            className: "hidden",
          }}
          value={price}
          onChange={(value) => setPrice(value)}
        >
          <Option value="3500">$3500</Option>
          <Option value="4500">$4500</Option>
          <Option value="5500">$5500</Option>
          <Option value="6500">$6500</Option>
        </Select>
      </div>

      <div className="select-item">
        {icons.doctor}
        <label className="text-text">Specialty:</label>
        <Select
          className="border-none rounded-xl"
          containerProps={{
            className: "!min-w-20 w-full select-4",
          }}
          labelProps={{
            className: "hidden",
          }}
          value={specialty}
          onChange={(value) => setSpecialty(value)}
        >
          <Option value="Plastic Surgery">Plastic Surgery</Option>
          <Option value="Dermatology">Dermatology</Option>
        </Select>
      </div>
    </div>
  );
};

export default FindCosmetics;