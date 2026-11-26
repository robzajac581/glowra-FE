// Shared fixtures for the consultation form tests (GLO-120).
// The payload shape mirrors what glowra-contact-request-api accepts in
// middleware/validation.js (consultationRequestValidation).

export const TEST_API_URL = "https://contact-request-api.test";

export const CLINIC_ID = "clinic-123";
export const CLINIC_INFO = { clinicName: "Glow Test Clinic" };

export const SELECTED_DATA = [
	{ id: "proc-1", name: "Botox", price: 300, category: "Injectables" },
	{ id: "proc-2", name: "Lip Filler", price: 650, category: "Injectables" },
];

export const EXPECTED_PROCEDURES = [
	{ id: "proc-1", name: "Botox", price: 300 },
	{ id: "proc-2", name: "Lip Filler", price: 650 },
];

/** A fetch Response stand-in whose json() resolves to `body`. */
export const jsonResponse = (body, ok = true) =>
	Promise.resolve({ ok, json: () => Promise.resolve(body) });

/** The single fetch call's URL, options and parsed JSON body. */
export const lastFetchCall = () => {
	expect(global.fetch).toHaveBeenCalledTimes(1);
	const [url, options] = global.fetch.mock.calls[0];
	return { url, options, body: JSON.parse(options.body) };
};
