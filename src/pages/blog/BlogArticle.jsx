import React from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Layout from "../../components/Layout";
import { getBlogPostBySlug, getRelatedBlogPosts } from "../../utils/blogUtils";
import { toAbsoluteUrl } from "../../config/site";

const BlogArticle = () => {
	const { slug } = useParams();
	const post = getBlogPostBySlug(slug || "");

	if (!post) {
		return <Navigate to="/blog" replace />;
	}

	const relatedPosts = getRelatedBlogPosts(post.slug, 2);
	const articleUrl = toAbsoluteUrl(`/blog/${post.slug}`);
	const articleSchema = {
		"@context": "https://schema.org",
		"@type": "Article",
		headline: post.title,
		description: post.description,
		datePublished: post.date,
		dateModified: post.date,
		mainEntityOfPage: articleUrl,
		author: {
			"@type": "Organization",
			name: "Glowra",
		},
		publisher: {
			"@type": "Organization",
			name: "Glowra",
		},
	};

	return (
		<Layout>
			<Helmet>
				<title>{`${post.title} | Glowra Blog`}</title>
				<meta name="description" content={post.description} />
				<link rel="canonical" href={articleUrl} />
				<meta property="og:type" content="article" />
				<meta property="og:title" content={post.title} />
				<meta property="og:description" content={post.description} />
				<meta property="og:url" content={articleUrl} />
				<meta property="article:published_time" content={post.date} />
				<script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
			</Helmet>
			<section className="bg-section py-10 lg:py-14">
				<div className="container max-w-3xl">
					<p className="text-sm text-black text-opacity-50 mb-3">
						{new Date(post.date).toLocaleDateString("en-US", {
							year: "numeric",
							month: "long",
							day: "numeric",
						})}
					</p>
					<h1 className="text-4xl lg:text-5xl leading-tight mb-4">{post.title}</h1>
					<p className="text-lg text-black text-opacity-70 mb-8">{post.description}</p>

					<article
						className="blog-article-content"
						dangerouslySetInnerHTML={{ __html: post.html }}
					/>

					<div className="mt-10 p-6 rounded-[10px] bg-white border border-border shadow-input">
						<h2 className="text-2xl mb-2">Ready to compare real clinics?</h2>
						<p className="text-black text-opacity-70 mb-4">
							Use Glowra to search providers and procedures near you.
						</p>
						<Link to="/search" className="btn inline-flex">
							Start Your Search
						</Link>
					</div>

					{relatedPosts.length > 0 && (
						<div className="mt-10">
							<h2 className="text-2xl mb-4">Related articles</h2>
							<ul className="flex flex-col gap-2">
								{relatedPosts.map((relatedPost) => (
									<li key={relatedPost.slug}>
										<Link
											to={`/blog/${relatedPost.slug}`}
											className="text-primary font-extrabold"
										>
											{relatedPost.title}
										</Link>
									</li>
								))}
							</ul>
						</div>
					)}
				</div>
			</section>
		</Layout>
	);
};

export default BlogArticle;
