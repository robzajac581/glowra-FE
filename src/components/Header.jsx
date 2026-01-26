import React, { useState } from "react";
import { Link } from "react-router-dom";
import useScreen from "../hooks/useScreen";
// import { cn } from "../utils/cn";
import { icons } from "./Icons";

const Header = ({ fixed }) => {
	const [open, setOpen] = useState(false);
	const screen = useScreen();

	return (
		<header className={`header z-[100] ${fixed ? "lg:fixed" : ""}`}>
			<div className="container">
				<div className="flex items-center xl:gap-12 gap-5">
					<Link to="/" className="block">
						<img src="/img/logo.svg" alt="" />
					</Link>
					<div
						className={
							screen < 1024 ? (open ? "menu-open" : "menu-close") : ""
						}
					>
						<div className={screen < 1024 ? "container" : ""}>
							{/* <div className="lg:hidden mb-[18px]">
								<LoginButtons />
							</div> */}
							<ul className="menu">
								{menu?.map((item, index) => {
									const handleListClinicClick = (e) => {
										if (item.url === '/list-your-clinic') {
											// Dispatch custom event to signal wizard reset
											// This ensures the wizard always starts fresh when link is clicked
											window.dispatchEvent(new CustomEvent('resetWizard'));
										}
									};
									
									return (
										<li key={index}>
											<Link 
												to={item.url} 
												className="menu-link"
												onClick={handleListClinicClick}
											>
												{item.name}
											</Link>
										</li>
									);
								})}
							</ul>
						</div>
					</div>
					{/* <div className="header-search">
						<form onSubmit={handleSubmit}>
							<div className="flex gap-6 items-center">
								<input
									type="text"
									placeholder="Search here ..."
								/>
								<button type="submit">{icons.searchIcon4}</button>
							</div>
						</form>
						<LoginButtons />
					</div> */}
					<button
						type="button"
						className="lg:hidden ml-auto"
						onClick={() => setOpen(!open)}
					>
						{icons.hamburger}
					</button>
				</div>
			</div>
		</header>
	);
};
// // To be reintorduced in furture versions: dependant on GLOW-11
// const LoginButtons = () => {
// 	const screen = useScreen();
// 	return (
// 		<>
// 			<div className="flex items-center gap-5 xl:gap-7">
// 				<Link
// 					to=""
// 					className={cn("login-button", {
// 						"login-button-sm": screen < 1024,
// 					})}
// 				>
// 					Sign up
// 				</Link>
// 				<Link
// 					to=""
// 					className={cn("btn gap-1 lg:min-h-[47px] py-0 ", {
// 						"flex-grow w-1/2 min-h-[33px]": screen < 1024,
// 					})}
// 				>
// 					<span>Login</span> <span>{icons.user}</span>
// 				</Link>
// 			</div>
// 		</>
// 	);
// };
const menu = [
	{
		name: "Search",
		url: "/search",
	},
	{
		name: "About Us",
		url: "/about-us",
	},
	{
		name: "List your clinic on Glowra",
		url: "/list-your-clinic",
	},
];
export default Header;
