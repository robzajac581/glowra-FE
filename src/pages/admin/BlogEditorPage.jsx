import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import API_BASE_URL from "../../config/api";
import { getAuthHeaders } from "./hooks/useAuth";
import BlogUploadField from "./components/BlogUploadField";
import "./admin.css";

const EMPTY_FORM = {
	title: "",
	date: "",
	slug: "",
	description: "",
	body: "",
	published: true,
};

const parseMarkdownDocument = (source) => {
	const raw = String(source || "");
	if (!raw.startsWith("---")) {
		return { ...EMPTY_FORM, body: raw };
	}

	const closingMarkerIdx = raw.indexOf("\n---", 3);
	if (closingMarkerIdx === -1) {
		return { ...EMPTY_FORM, body: raw };
	}

	const frontmatterText = raw.slice(3, closingMarkerIdx).trim();
	const body = raw.slice(closingMarkerIdx + 4).replace(/^\s*\n/, "");
	const fields = { ...EMPTY_FORM, body };

	frontmatterText.split("\n").forEach((line) => {
		const idx = line.indexOf(":");
		if (idx === -1) return;
		const key = line.slice(0, idx).trim().toLowerCase();
		const value = line.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
		if (key === "title") fields.title = value;
		if (key === "date") fields.date = value;
		if (key === "slug") fields.slug = value;
		if (key === "description") fields.description = value;
	});

	return fields;
};

const buildMarkdownDocument = ({ title, date, slug, description, body }) => {
	return `---
title: "${title}"
date: "${date}"
slug: "${slug}"
description: "${description}"
---

${body || ""}
`;
};

const BlogEditorPage = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const isEditMode = Boolean(id);
	const [form, setForm] = useState(EMPTY_FORM);
	const [loading, setLoading] = useState(isEditMode);
	const [saving, setSaving] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [error, setError] = useState(null);

	const markdownPreview = useMemo(() => buildMarkdownDocument(form), [form]);

	useEffect(() => {
		if (!isEditMode) return;

		const fetchPost = async () => {
			try {
				setLoading(true);
				const response = await fetch(`${API_BASE_URL}/api/admin/blog/posts/${id}`, {
					headers: {
						...getAuthHeaders(),
						"Content-Type": "application/json",
					},
				});
				const data = await response.json();
				if (!data.success) {
					throw new Error(data.error || "Failed to load post");
				}
				const parsed = parseMarkdownDocument(data.post?.markdown || "");
				setForm({
					...parsed,
					published: Boolean(data.post?.isPublished ?? data.post?.status === "published"),
				});
				setError(null);
			} catch (err) {
				console.error("Failed to fetch post:", err);
				setError(err.message || "Failed to load post");
			} finally {
				setLoading(false);
			}
		};

		fetchPost();
	}, [id, isEditMode]);

	const onFieldChange = (field, value) => {
		setForm((prev) => ({ ...prev, [field]: value }));
	};

	const handleMarkdownUpload = async (event) => {
		const file = event.target.files?.[0];
		if (!file) return;

		try {
			setUploading(true);
			setError(null);
			const markdownSource = await file.text();
			const parsed = parseMarkdownDocument(markdownSource);
			setForm((prev) => ({
				...prev,
				...parsed,
				published: prev.published,
			}));
		} catch (err) {
			console.error("Markdown upload failed:", err);
			setError(err.message || "Markdown upload failed");
		} finally {
			setUploading(false);
			event.target.value = "";
		}
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		try {
			setSaving(true);
			setError(null);

			const payload = {
				markdown: markdownPreview,
				published: form.published,
			};
			const url = isEditMode
				? `${API_BASE_URL}/api/admin/blog/posts/${id}`
				: `${API_BASE_URL}/api/admin/blog/posts`;
			const method = isEditMode ? "PUT" : "POST";

			const response = await fetch(url, {
				method,
				headers: {
					...getAuthHeaders(),
					"Content-Type": "application/json",
				},
				body: JSON.stringify(payload),
			});

			const data = await response.json();
			if (!data.success) {
				throw new Error(
					data.error ||
						data.details?.map((detail) => detail.message).join(", ") ||
						"Failed to save blog post"
				);
			}

			navigate("/admin/blog");
		} catch (err) {
			console.error("Failed to save blog post:", err);
			setError(err.message || "Failed to save blog post");
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return (
			<div className="flex justify-center py-12">
				<div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
			</div>
		);
	}

	return (
		<div className="admin-page">
			<div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold text-dark mb-2">
						{isEditMode ? "Edit Blog Post" : "New Blog Post"}
					</h1>
					<p className="text-text">
						Save as draft or publish to trigger FE deploy + SEO refresh.
					</p>
				</div>
				<Link to="/admin/blog" className="text-primary font-semibold">
					← Back to posts
				</Link>
			</div>

			{error && (
				<div className="mb-6 p-4 rounded-lg border border-red-200 bg-red-50 text-red-700">
					{error}
				</div>
			)}

			<form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="lg:col-span-2 bg-white border border-border rounded-lg p-5">
					<div className="flex items-center justify-between mb-4">
						<h2 className="text-xl font-semibold text-dark">Content</h2>
						<BlogUploadField onUpload={handleMarkdownUpload} uploading={uploading} />
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
						<div>
							<label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
							<input
								type="text"
								value={form.title}
								onChange={(e) => onFieldChange("title", e.target.value)}
								className="w-full border border-border rounded-lg px-3 py-2"
								required
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-slate-700 mb-1">Slug</label>
							<input
								type="text"
								value={form.slug}
								onChange={(e) => onFieldChange("slug", e.target.value)}
								className="w-full border border-border rounded-lg px-3 py-2"
								required
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
							<input
								type="date"
								value={form.date}
								onChange={(e) => onFieldChange("date", e.target.value)}
								className="w-full border border-border rounded-lg px-3 py-2"
								required
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
							<select
								value={form.published ? "published" : "draft"}
								onChange={(e) => onFieldChange("published", e.target.value === "published")}
								className="w-full border border-border rounded-lg px-3 py-2"
							>
								<option value="published">Published</option>
								<option value="draft">Draft</option>
							</select>
						</div>
					</div>

					<div className="mb-4">
						<label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
						<textarea
							value={form.description}
							onChange={(e) => onFieldChange("description", e.target.value)}
							rows={3}
							className="w-full border border-border rounded-lg px-3 py-2"
							required
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-slate-700 mb-1">Body (Markdown)</label>
						<textarea
							value={form.body}
							onChange={(e) => onFieldChange("body", e.target.value)}
							rows={18}
							className="w-full border border-border rounded-lg px-3 py-2 font-mono text-sm"
							required
						/>
					</div>
				</div>

				<div className="bg-white border border-border rounded-lg p-5 h-fit">
					<h2 className="text-xl font-semibold text-dark mb-3">Generated Markdown</h2>
					<pre className="bg-slate-50 border border-border rounded-lg p-3 text-xs whitespace-pre-wrap max-h-[360px] overflow-auto">
						{markdownPreview}
					</pre>
					<p className="text-xs text-slate-500 mt-3">
						Saving a published post triggers a frontend deploy webhook so the blog sitemap and prerendered pages refresh.
					</p>
					<button
						type="submit"
						disabled={saving || uploading}
						className="btn w-full mt-4 !text-base !min-h-[44px] disabled:opacity-60"
					>
						{saving ? "Saving..." : isEditMode ? "Update post" : "Create post"}
					</button>
				</div>
			</form>
		</div>
	);
};

export default BlogEditorPage;
