import React from "react";
import { Link } from "react-router-dom";
import { socialIcons } from "./Icons";

const Footer = () => {
	return (
		<footer className="footer">
			<div className="container">
				<div className="footer-wrapper">
					<div className="footer-left">
						<Link to="/" className="footer-logo">
							<img src="/img/logo-bigger.svg" alt="" />
						</Link>
						<div className="text-[22.581px] text-black font-light">
							Find Your Glow.
						</div>
					</div>
					<div className="footer-center">
						<h5 className="footer-title">Pages</h5>
						<div className="footer-page-links">
							<ul className="flex flex-col gap-[11px]">
								{menu.map((item, index) => (
									<li key={index}>
										<Link to={item.url}>{item.name}</Link>
									</li>
								))}
							</ul>
							<ul className="flex flex-col gap-[11px]">
								{menu2.map((item, index) => (
									<li key={index}>
										<Link to={item.url}>{item.name}</Link>
									</li>
								))}
							</ul>
						</div>
					</div>
					<div className="footer-right">
						<h5 className="footer-title">In Social Media</h5>
						<ul className="social">
							{social.map((item, index) => (
								<li key={index}>
									<Link to={item.url}>{item.icon}</Link>
								</li>
							))}
						</ul>
						<div className="text-xs text-black">
							All Right reserved &copy; GlowUp
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
};

const menu = [
	{
		name: "Home",
		url: "#",
	},
	{
		name: "Services",
		url: "#",
	},
	{
		name: "Clinics",
		url: "#",
	},
	{
		name: "Contact",
		url: "#",
	},
];
const menu2 = [
	{
		name: "Get a Quote",
		url: "#",
	},
	{
		name: "About Us",
		url: "#",
	},
];

const social = [
	{
		icon: socialIcons.whatsapp,
		url: "",
	},
	{
		icon: socialIcons.mail,
		url: "",
	},
	{
		icon: socialIcons.instagram,
		url: "",
	},
	{
		icon: socialIcons.facebook,
		url: "",
	},
	{
		icon: socialIcons.pinterest,
		url: "",
	},
];

export default Footer;
