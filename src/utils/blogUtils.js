import blogContent from "../generated/blog-content.json";

const parseDateValue = (value) => new Date(value).getTime() || 0;

export const getAllBlogPosts = () => {
	return [...blogContent].sort((a, b) => parseDateValue(b.date) - parseDateValue(a.date));
};

export const getBlogPostBySlug = (slug) => {
	return getAllBlogPosts().find((post) => post.slug === slug) || null;
};

export const getRelatedBlogPosts = (slug, limit = 2) => {
	return getAllBlogPosts()
		.filter((post) => post.slug !== slug)
		.slice(0, limit);
};
