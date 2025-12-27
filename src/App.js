import { useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import "swiper/css/bundle";
import Clinic from "./pages/clinic/Clinic";
import Home from "./pages/home/Home";
import Search from "./pages/search/Search";
import AboutUs from "./pages/aboutus/AboutUs";
import ListYourClinic from "./pages/list-your-clinic/ListYourClinic";
import { AuthProvider } from "./pages/admin/hooks/useAuth";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ReviewPage from "./pages/admin/ReviewPage";

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
		<AuthProvider>
			<BrowserRouter>
				<Wrapper>
					<Routes>
						{/* Public Routes */}
						<Route path="/" element={<Home />} />
						<Route path="/search" element={<Search />} />
						<Route path="/about-us" element={<AboutUs />} />
						<Route path="/clinic/:id" element={<Clinic />} />
						<Route path="/list-your-clinic" element={<ListYourClinic />} />
						
						{/* Admin Routes */}
						<Route path="/admin/login" element={<AdminLogin />} />
						<Route path="/admin" element={<AdminLayout />}>
							<Route index element={<AdminDashboard />} />
							<Route path="review/:draftId" element={<ReviewPage />} />
						</Route>
						
						<Route path="*" element={<Home />} />
					</Routes>
				</Wrapper>
			</BrowserRouter>
		</AuthProvider>
	);
}

export default App;
