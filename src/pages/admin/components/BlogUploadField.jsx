import React from "react";

const BlogUploadField = ({ onUpload, uploading = false }) => {
	return (
		<label className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white border border-border rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
			<input
				type="file"
				accept=".md,text/markdown,text/x-markdown"
				className="hidden"
				onChange={onUpload}
				disabled={uploading}
			/>
			<span>{uploading ? "Parsing markdown..." : "Upload .md file"}</span>
		</label>
	);
};

export default BlogUploadField;
