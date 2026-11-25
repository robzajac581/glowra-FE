import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Layout from "../../components/Layout";

/**
 * Shown for any path the app doesn't know. The edge returns HTTP 404 for
 * these (see vercel.json routes + build/404.html); this page adds noindex
 * for client-side navigations.
 */
const NotFound = () => (
	<Layout>
		<Helmet>
			<title>Page not found | Glowra</title>
			<meta name="robots" content="noindex" />
		</Helmet>
		<section className="py-20 bg-white">
			<div className="container text-center">
				<h1 className="text-3xl font-bold mb-4">Page not found</h1>
				<p className="mb-8">The page you're looking for doesn't exist or has moved.</p>
				<div className="flex justify-center gap-4">
					<Link className="btn" to="/">Go home</Link>
					<Link className="btn" to="/search">Search clinics</Link>
				</div>
			</div>
		</section>
	</Layout>
);

export default NotFound;
