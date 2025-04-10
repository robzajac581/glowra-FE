import { useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import "swiper/css/bundle";
import Clinic from "./pages/clinic/Clinic";
import Home from "./pages/home/Home";
import Procedures from "./pages/procedures/Procedures";
function App() {
	const Wrapper = ({ children }) => {
		const location = useLocation();
		useEffect(() => {
			window.scrollTo(0, 0);
			document.body.classList.remove("opacity-0");
		}, [location.pathname, location.search]);
		return children;
	};
	return (
		<BrowserRouter>
			<Wrapper>
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/procedures" element={<Procedures />} />
					<Route path="/clinic/:id" element={<Clinic />} />
					<Route path="*" element={<Home />} />
				</Routes>
			</Wrapper>
		</BrowserRouter>
	);
}

export default App;
