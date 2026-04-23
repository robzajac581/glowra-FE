import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Layout from "../../components/Layout";
import { getAllBlogPosts } from "../../utils/blogUtils";
import { toAbsoluteUrl } from "../../config/site";

const BlogIndex = () => {
	const posts = getAllBlogPosts();

	return (
		<Layout>
			<Helmet>
				<title>Glowra Blog | Procedure Guides, Pricing, and Provider Insights</title>
				<meta
					name="description"
					content="Explore Glowra blog guides on cosmetic procedure costs, treatment options, and provider research to help you make informed decisions."
				/>
				<link rel="canonical" href={toAbsoluteUrl("/blog")} />
			</Helmet>
			<section className="bg-section py-10 lg:py-14">
				<div className="container max-w-5xl">
					<h1 className="text-4xl lg:text-5xl mb-4">Glowra Blog</h1>
					<p className="text-base lg:text-lg text-black text-opacity-70 max-w-3xl mb-8">
						Actionable cosmetic procedure guides to help you research options,
						understand costs, and choose the right provider.
					</p>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
						{posts.map((post) => (
							<article
								key={post.slug}
								className="bg-white border border-border rounded-[10px] p-5 shadow-input"
							>
								<p className="text-sm text-black text-opacity-50 mb-2">
									{new Date(post.date).toLocaleDateString("en-US", {
										year: "numeric",
										month: "long",
										day: "numeric",
									})}
								</p>
								<h2 className="text-2xl leading-tight mb-3">{post.title}</h2>
								<p className="text-black text-opacity-70 mb-4">{post.description}</p>
								<Link to={`/blog/${post.slug}`} className="text-primary font-extrabold">
									Read article
								</Link>
							</article>
						))}
					</div>
				</div>
			</section>
		</Layout>
	);
};

export default BlogIndex;
