import posthog from 'posthog-js';

let isInitialized = false;

const INTERNAL_STORAGE_KEY = 'glowra_internal';

/**
 * Marks this browser as internal (Rob, Tik, test runs) so PostHog can filter it out.
 * Visit any page with `?internal=1` once to turn it on, `?internal=0` to turn it off.
 * The flag lives in localStorage and is sent on every event as `internal_user: true`.
 * @returns {boolean} whether this browser is marked internal
 */
const resolveInternalFlag = () => {
	try {
		const param = new URLSearchParams(window.location.search).get('internal');
		if (param === '1') window.localStorage.setItem(INTERNAL_STORAGE_KEY, '1');
		if (param === '0') window.localStorage.removeItem(INTERNAL_STORAGE_KEY);
		return window.localStorage.getItem(INTERNAL_STORAGE_KEY) === '1';
	} catch (err) {
		console.error('Could not read internal-traffic flag:', err);
		return false;
	}
};

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
		if (resolveInternalFlag()) {
			posthog.register({ internal_user: true });
		} else {
			posthog.unregister('internal_user');
		}
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

/**
 * Stops capture on /admin and resumes it elsewhere. Only changes state when it
 * actually needs to: opt_in_capturing() sends a `$opt_in` event every call.
 */
export const updateRouteTracking = (pathname) => {
	if (!isInitialized) return;
	const optedOut = posthog.has_opted_out_capturing();
	if (pathname.startsWith('/admin')) {
		if (!optedOut) posthog.opt_out_capturing();
	} else if (optedOut) {
		posthog.opt_in_capturing();
	}
};
