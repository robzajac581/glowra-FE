// Procedures.jsx
import { Option, Radio, Select } from "@material-tailwind/react";
import React, { useState, useEffect } from "react";
import { icons } from "../../components/Icons";
import Layout from "../../components/Layout";
import ProcedureCard from "../../components/ProcedureCard";
import useScreen from "../../hooks/useScreen";

const API_BASE_URL = 'http://localhost:3001';

const Procedures = () => {
  const screen = useScreen();
  const [search, setSearch] = useState("Botox");
  const [category, setCategory] = useState("Breast");
  const [location, setLocation] = useState("Dallas, TX");
  const [price, setPrice] = useState("3500");
  const [specialty, setSpecialty] = useState("Plastic Surgery");
  const [rating, setRating] = useState("5 star");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const fetchProcedures = async () => {
    try {
      setLoading(true);
      setError(null);

      // Construct query parameters
      const params = new URLSearchParams();
      if (location) params.append('location', location.split(',')[0]); // Only send city
      if (category) params.append('category', category);
      if (specialty) params.append('specialty', specialty);
      if (price) params.append('minPrice', price);
      params.append('page', page);
      params.append('limit', 10);

      const url = `${API_BASE_URL}/api/procedures?${params.toString()}`;
      console.log('Fetching from URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Received data:', data);
      
      // Transform the API response to match our product format
      const transformedProducts = data.procedures.map(procedure => ({
        id: procedure.ProcedureID,
        img: "/img/procedures/2.png", // Keeping hardcoded image for now
        doctor: procedure.ProviderName,
        doctorInfo: procedure.ClinicName,
        name: procedure.ProcedureName,
        price: procedure.AverageCost
      }));

      console.log('Transformed products:', transformedProducts);
      setProducts(transformedProducts);
      setTotalResults(data.pagination.total);
    } catch (err) {
      console.error('Detailed error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch procedures when filters change
  useEffect(() => {
    fetchProcedures();
  }, [location, category, specialty, price, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProcedures();
  };

  return (
    <Layout>
      <div className="single-procedure-card">
        <div className="container xl:max-w-[1226px]">
          <h1 className="title">Search results for "{search}":</h1>
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
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button type="submit" className="search-btn">
                <span>Search</span>
                {icons.searchIcon3}
              </button>
            </div>
          </form>
          <div className="search-grid">
            <div className="border bg-white rounded-md">
              <Select
                variant="static"
                className="border-none h-[52px] rounded-xl"
                label="Category"
                containerProps={{
                  className: "!min-w-0 w-full select",
                }}
                value={category}
                onChange={setCategory}
              >
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
                  className: "!min-w-0 w-full select",
                }}
                value={location}
                onChange={setLocation}
              >
                <Option value="Dallas, TX">Dallas, TX</Option>
                <Option value="Los Angeles, CA">Los Angeles, CA</Option>
                <Option value="Miami, FL">Miami, FL</Option>
                <Option value="Denver, CO">Denver, CO</Option>
                <Option value="Chicago, IL">Chicago, IL</Option>
              </Select>
            </div>
            <div className="border bg-white rounded-md">
              <Select
                variant="static"
                className="border-none h-[52px] rounded-xl"
                label="Price Range"
                containerProps={{
                  className: "!min-w-0 w-full select",
                }}
                value={price}
                onChange={setPrice}
              >
                <Option value="3500">$3500</Option>
                <Option value="4500">$4500</Option>
                <Option value="5500">$5500</Option>
                <Option value="6500">$6500</Option>
              </Select>
            </div>
            <div className="border bg-white rounded-md">
              <Select
                variant="static"
                className="border-none h-[52px] rounded-xl"
                label="Specialty"
                containerProps={{
                  className: "!min-w-0 w-full select",
                }}
                value={specialty}
                onChange={setSpecialty}
              >
                <Option value="Plastic Surgery">Plastic Surgery</Option>
                <Option value="Dermatology">Dermatology</Option>
              </Select>
            </div>
          </div>
          <div className="flex gap-8 mt-[34px] md:mt-[63px]">
            <div className="w-[208px] hidden xl:block">
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
              <div className="mb-8">
                <h5 className="font-medium mb-2 font-Avenir">
                  Nearest Locations
                </h5>
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7298.9601660514245!2d90.36501104466463!3d23.837080364445423!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c14a3366b005%3A0x901b07016468944c!2sMirpur%20DOHS%2C%20Dhaka!5e0!3m2!1sen!2sbd!4v1721925768310!5m2!1sen!2sbd"
                  height="250"
                  style={{ border: "none", width: "100%" }}
                ></iframe>
              </div>
              <button 
                type="button" 
                className="btn min-h-[47px] w-full"
                onClick={fetchProcedures}
              >
                Apply Filters
              </button>
            </div>
            <div className="w-0 flex-grow">
              {loading ? (
                <div>Loading...</div>
              ) : error ? (
                <div>
                  <p>Error: {error}</p>
                  <p>Please check the console for more details.</p>
                </div>
              ) : products.length === 0 ? (
                <div>No procedures found matching your criteria.</div>
              ) : (
                <div className="bottom-product-grid">
                  {products
                    .slice(0, screen < 1024 ? (screen < 640 ? 3 : 4) : 6)
                    .map((item) => (
                      <ProcedureCard search item={item} key={item.id} />
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

const ratingList = [
  {
    name: "5 star",
  },
  {
    name: "4 star (& above)",
  },
  {
    name: "3 star (& above)",
  },
  {
    name: "2 star (& above)",
  },
  {
    name: "1 star (& above)",
  },
];

export default Procedures;