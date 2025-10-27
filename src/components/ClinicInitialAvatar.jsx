import React from "react";

/**
 * ClinicInitialAvatar Component
 * Displays a nicely designed circle with the first initial of the clinic name
 * Used when clinic doesn't have a photo available
 */
const ClinicInitialAvatar = ({ clinicName, size = 76 }) => {
	if (!clinicName) return null;

	// Get the first letter of the clinic name
	const initial = clinicName.charAt(0).toUpperCase();

	// Generate a consistent color based on the first letter
	// This ensures the same clinic always gets the same color
	const getColorFromInitial = (letter) => {
		const colors = [
			{ bg: "bg-gradient-to-br from-purple-400 to-purple-600", text: "text-white" },
			{ bg: "bg-gradient-to-br from-blue-400 to-blue-600", text: "text-white" },
			{ bg: "bg-gradient-to-br from-teal-400 to-teal-600", text: "text-white" },
			{ bg: "bg-gradient-to-br from-green-400 to-green-600", text: "text-white" },
			{ bg: "bg-gradient-to-br from-indigo-400 to-indigo-600", text: "text-white" },
			{ bg: "bg-gradient-to-br from-pink-400 to-pink-600", text: "text-white" },
			{ bg: "bg-gradient-to-br from-rose-400 to-rose-600", text: "text-white" },
			{ bg: "bg-gradient-to-br from-cyan-400 to-cyan-600", text: "text-white" },
		];

		// Use char code to get consistent color for each letter
		const charCode = letter.charCodeAt(0);
		const index = charCode % colors.length;
		return colors[index];
	};

	const colorScheme = getColorFromInitial(initial);
	const fontSize = Math.floor(size * 0.45); // 45% of size for good proportion

	return (
		<div
			className={`${colorScheme.bg} ${colorScheme.text} rounded-full flex items-center justify-center font-semibold shadow-lg flex-shrink-0`}
			style={{
				width: `${size}px`,
				height: `${size}px`,
				fontSize: `${fontSize}px`,
			}}
		>
			{initial}
		</div>
	);
};

export default ClinicInitialAvatar;

