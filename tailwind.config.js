const withMT = require("@material-tailwind/react/utils/withMT");

module.exports = withMT({
	content: ["./src/**/*.{js,jsx,ts,tsx}"],
	theme: {
		container: {
			center: true,
			padding: {
				DEFAULT: "12px",
				sm: "2rem",
				lg: "1rem",
				xl: "1rem",
				"2xl": "1rem",
			},
		},
		extend: {
			screens: {
				sm: "640px",
				md: "768px",
				lg: "1024px",
				xl: "1280px",
				"2xl": "1536px",
			},
			colors: {
				dark: "#000D07",
				text: "#7B7B7B",
				primary: "#9269D4",
				secondary: "#CCADFF",
				section: "#F8F8F8",
				body: "#ffffff",
				border: "#DFDFDF",
				text2: "#6B6F7F",
				dark2: "#CECECE",
			},
			fontFamily: {
				Avenir: ["'Avenir'", "sans-serif"],
				Louize: ['"Louize"'],
			},
			backgroundImage: {
				whiteGradient:
					"linear-gradient(180deg, rgba(255, 255, 255, 0.00) 2.49%, #FFF 75.7%)",
			},
			boxShadow: {
				input: "2px 2px 20px 0px rgba(0, 0, 0, 0.04)",
				tabLink: "-2px 2px 16px 0px rgba(0, 0, 0, 0.20)",
				card: "18px 23px 19px 0px rgba(0, 0, 0, 0.01), 0px 16px 120px 0px rgba(0, 0, 0, 0.06)",
				offer: "2px 2px 15px 0px rgba(0, 0, 0, 0.16)",
			},
		},
		select: {
			valid: {
				colors: ["primary"],
			},
		},
	},
	darkMode: "selector",
	plugins: [],
});
