import React from "react";
import { cn } from "../utils/cn";

/**
 * GLO-72 — marks a price the clinic's own page conditioned on something
 * ("new clients only", "first treatment", "limited time", "package of three")
 * rather than quoting as its standard rate.
 *
 * Why this exists: Glowra is a price-comparison marketplace, so an
 * intro-offer price sitting unlabelled next to a competitor's standard rate is
 * a misleading comparison. 17.4% of extracted priced rows are promotional.
 *
 * ## The flag is three-state and the third state is "we do not know"
 *
 * The API sends `isPromotional: true`, `isPromotional: false`, or OMITS the
 * key entirely. An omitted key means the price was never assessed -- true of
 * every clinic loaded before the extractor existed, which is most of them.
 *
 * So this renders on `=== true` and nothing else. Treating absent or null as
 * "standard rate" and badging accordingly would publish a claim nobody made;
 * that is strictly worse than saying nothing, because a wrong badge is
 * believed while a missing one is merely uninformative.
 *
 * ## Wording
 *
 * "Promotional", not "Deal" or "Save". The flag records that the price is
 * conditional, not that it is good value -- a package price can be higher than
 * the per-session rate. The label has to describe the condition, not sell it.
 */
const PromotionalPriceBadge = ({ isPromotional, className }) => {
	// Strict: absent / null / undefined / false all render nothing.
	if (isPromotional !== true) return null;

	return (
		<span
			className={cn(
				"inline-flex items-center rounded-full border border-amber-300 bg-amber-50",
				"px-1.5 py-[1px] text-[10px] font-medium leading-tight text-amber-800",
				"whitespace-nowrap",
				className
			)}
			// Plain-language explanation of what the badge asserts. The
			// per-row evidence quote is deliberately NOT surfaced here -- see
			// the note in ProcedurePriceStack.
			title="Promotional price: the clinic listed this as a conditional offer (for example new clients, a limited time, or a package) rather than its standard rate."
		>
			Promotional
		</span>
	);
};

export default PromotionalPriceBadge;
