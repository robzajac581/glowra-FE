import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API_BASE_URL from "../../config/api";
import { getAuthHeaders } from "./hooks/useAuth";
import Toast from "../../components/Toast";
import "./admin.css";

const BlogPostsPage = () => {
	const [posts, setPosts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [toastMessage, setToastMessage] = useState("");
	const [toastVisible, setToastVisible] = useState(false);

	const loadPosts = async () => {
		try {
			setLoading(true);
			const response = await fetch(`${API_BASE_URL}/api/admin/blog/posts?limit=200&page=1`, {
				headers: {
					...getAuthHeaders(),
					"Content-Type": "application/json",
				},
			});
			const data = await response.json();
			if (!data.success) {
				throw new Error(data.error || "Failed to load blog posts");
			}
			setPosts(data.posts || data.data || []);
			setError(null);
		} catch (err) {
			console.error("Failed to load blog posts:", err);
			setError(err.message || "Failed to load blog posts");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadPosts();
	}, []);

	const handleDelete = async (post) => {
		const confirmed = window.confirm(
			`Delete "${post.title}"? This triggers a new FE deploy if the post is published.`
		);
		if (!confirmed) return;

		try {
			const response = await fetch(`${API_BASE_URL}/api/admin/blog/posts/${post.id}`, {
				method: "DELETE",
				headers: {
					...getAuthHeaders(),
					"Content-Type": "application/json",
				},
			});
			const data = await response.json();
			if (!data.success) {
				throw new Error(data.error || "Failed to delete blog post");
			}

			setToastMessage("Post deleted. Deploy triggered for SEO refresh.");
			setToastVisible(true);
			await loadPosts();
		} catch (err) {
			console.error("Failed to delete blog post:", err);
			setError(err.message || "Failed to delete blog post");
		}
	};

	return (
		<div className="admin-page">
			<div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold text-dark mb-2">Blog Posts</h1>
					<p className="text-text">Manage markdown posts and publish updates via deploy webhook.</p>
				</div>
				<Link to="/admin/blog/new" className="btn !text-base !min-h-[44px]">
					New Blog Post
				</Link>
			</div>

			{error && (
				<div className="mb-6 p-4 rounded-lg border border-red-200 bg-red-50 text-red-700">
					{error}
				</div>
			)}

			{loading ? (
				<div className="flex justify-center py-12">
					<div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
				</div>
			) : posts.length === 0 ? (
				<div className="p-8 bg-white border border-border rounded-lg text-center">
					<p className="text-text mb-4">No blog posts yet.</p>
					<Link to="/admin/blog/new" className="text-primary font-semibold">
						Create your first post
					</Link>
				</div>
			) : (
				<div className="bg-white border border-border rounded-lg overflow-hidden">
					<div className="overflow-x-auto">
						<table className="min-w-full">
							<thead className="bg-slate-50 border-b border-border">
								<tr>
									<th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
										Title
									</th>
									<th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
										Slug
									</th>
									<th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
										Status
									</th>
									<th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
										Updated
									</th>
									<th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
										Actions
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-border">
								{posts.map((post) => (
									<tr key={post.id}>
										<td className="px-4 py-3 align-top">
											<p className="font-semibold text-dark">{post.title}</p>
											<p className="text-xs text-slate-500 mt-1 line-clamp-2">{post.description}</p>
										</td>
										<td className="px-4 py-3 align-top text-sm text-slate-700">{post.slug}</td>
										<td className="px-4 py-3 align-top">
											<span
												className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
													(post.isPublished ?? post.status === "published")
														? "bg-green-100 text-green-700"
														: "bg-amber-100 text-amber-700"
												}`}
											>
												{(post.isPublished ?? post.status === "published")
													? "Published"
													: "Draft"}
											</span>
										</td>
										<td className="px-4 py-3 align-top text-sm text-slate-600">
											{post.updatedAt
												? new Date(post.updatedAt).toLocaleDateString()
												: "-"}
										</td>
										<td className="px-4 py-3 align-top text-right">
											<div className="inline-flex items-center gap-2">
												<Link
													to={`/admin/blog/${post.id}/edit`}
													className="px-3 py-1.5 text-xs font-semibold rounded-md border border-border hover:bg-slate-50"
												>
													Edit
												</Link>
												<button
													type="button"
													onClick={() => handleDelete(post)}
													className="px-3 py-1.5 text-xs font-semibold rounded-md border border-red-200 text-red-700 hover:bg-red-50"
												>
													Delete
												</button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}

			<Toast
				message={toastMessage}
				isVisible={toastVisible}
				onClose={() => setToastVisible(false)}
			/>
		</div>
	);
};

export default BlogPostsPage;
