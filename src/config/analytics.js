import posthog from 'posthog-js';

let isInitialized = false;

export const initPostHog = () => {
	const key = process.env.REACT_APP_POSTHOG_KEY;
	const host = process.env.REACT_APP_POSTHOG_HOST || 'https://us.i.posthog.com';
	const isProduction = process.env.NODE_ENV === 'production';
	const devEnabled = process.env.REACT_APP_POSTHOG_DEV === 'true';
	if (key && (isProduction || devEnabled)) {
		posthog.init(key, {
			api_host: host,
			capture_pageview: 'history_change',
			person_profiles: 'identified_only'
		});
		isInitialized = true;
		return posthog;
	}
	return null;
};

export const captureEvent = (eventName, properties = {}) => {
	if (isInitialized && !posthog.has_opted_out_capturing?.()) {
		posthog.capture(eventName, properties);
	}
};

export const updateRouteTracking = (pathname) => {
	if (!isInitialized) return;
	if (pathname.startsWith('/admin')) {
		posthog.opt_out_capturing();
	} else {
		posthog.opt_in_capturing();
	}
};
