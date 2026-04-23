import React from "react";
import ReactDOM from "react-dom/client";
import posthog from "posthog-js";
import { PostHogProvider } from "@posthog/react";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
import { initPostHog } from "./config/analytics";
import "./assets/fonts/font.css";
import "./index.css";
import reportWebVitals from "./reportWebVitals";

initPostHog();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
	<React.StrictMode>
		<HelmetProvider>
			<PostHogProvider client={posthog}>
				<App />
			</PostHogProvider>
		</HelmetProvider>
	</React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
