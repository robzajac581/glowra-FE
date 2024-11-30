import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useScreen from "../hooks/useScreen";
import { cn } from "../utils/cn";
import { icons } from "./Icons";

const Header = ({ fixed }) => {
	const [open, setOpen] = useState(false);
	const navigate = useNavigate();
	const handleSubmit = (e) => {
		e.preventDefault();
		navigate("/procedures");
	};
	const screen = useScreen();

	const location = useLocation();

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
							<div className="lg:hidden mb-[18px]">
								<LoginButtons />
							</div>
							<ul className="menu">
								{menu?.map((item, index) => (
									<li key={index}>
										<Link to={item.url} className="menu-link">
											{item.name}
										</Link>
									</li>
								))}
							</ul>
						</div>
					</div>
					<div className="header-search">
						<form onSubmit={handleSubmit}>
							<div className="flex gap-6 items-center">
								<input
									type="text"
									placeholder="Search your procedures..."
								/>
								<button type="submit">{icons.searchIcon4}</button>
							</div>
						</form>
						<LoginButtons />
					</div>
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
const LoginButtons = () => {
	const screen = useScreen();
	return (
		<>
			<div className="flex items-center gap-5 xl:gap-7">
				<Link
					to=""
					className={cn("login-button", {
						"login-button-sm": screen < 1024,
					})}
				>
					Sign up
				</Link>
				<Link
					to=""
					className={cn("btn gap-1 lg:min-h-[47px] py-0 ", {
						"flex-grow w-1/2 min-h-[33px]": screen < 1024,
					})}
				>
					<span>Login</span> <span>{icons.user}</span>
				</Link>
			</div>
		</>
	);
};
const menu = [
	{
		name: "Home",
		url: "/",
	},
	{
		name: "About Us",
		url: "/",
	},
	{
		name: "Blog",
		url: "/",
	},
	{
		name: "Contact Us",
		url: "/",
	},
	{
		name: "List your clinic on Glowra",
		url: "/",
	},
];
export default Header;
