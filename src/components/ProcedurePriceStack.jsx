import React from "react";
import { cn } from "../utils/cn";
import PromotionalPriceBadge from "./PromotionalPriceBadge";
import {
	formatClinicPriceEstimate,
	formatProcedurePriceUnitSuffix,
} from "../utils/clinicPriceDisplay";

/**
 * Procedure price: amount on first line; optional unit (e.g. /treatment) below in smaller type.
 *
 * GLO-72: when the API marks the price promotional, a badge sits beside the
 * amount. Rendering it here rather than at each call site means every surface
 * that shows a procedure price — the clinic page table, the clinic sidebar,
 * the consultation form and modal — gets the qualifier automatically. A price
 * qualifier that appears on some surfaces and not others is worse than none,
 * because the unqualified surfaces look authoritative.
 *
 * Note on the evidence quote: the extractor holds a verbatim quote behind each
 * assessment, and exposing it on hover was considered. It is NOT shown,
 * because spot-checking the backfilled rows found several whose stored quote
 * is just the price line ("• Price: $810") and does not itself contain the
 * promotional wording the flag was judged from. Showing those as if they were
 * the justification would undermine the badge rather than support it. The
 * tooltip explains what the flag means instead.
 *
 * @param {Object} props
 * @param {{ price?: number, priceUnit?: string, unit?: string, isPromotional?: boolean }} props.item
 *   `isPromotional` is three-state: true, false, or absent meaning "not
 *   assessed". Only `true` badges.
 * @param {boolean} [props.trailingPlus]
 * @param {'end' | 'start'} [props.align] — column cross-axis for price column layout
 * @param {string} [props.className] — wrapper
 * @param {string} [props.mainClassName] — first line
 * @param {string} [props.unitClassName] — unit line
 * @param {boolean} [props.showPromotionalBadge=true] — opt out where space is too tight
 */
const ProcedurePriceStack = ({
	item,
	trailingPlus = false,
	align = "end",
	className,
	mainClassName,
	unitClassName,
	showPromotionalBadge = true,
}) => {
	const base = formatClinicPriceEstimate(item?.price);
	if (base === "Price on request") {
		return <span className={cn(className, mainClassName)}>{base}</span>;
	}
	const unit = formatProcedurePriceUnitSuffix(item);
	return (
		<span
			className={cn(
				"inline-flex flex-col gap-0.5",
				align === "end" ? "items-end" : "items-start",
				className
			)}
		>
			<span
				className={cn(
					"inline-flex items-center gap-1.5",
					align === "end" ? "flex-row-reverse" : "flex-row"
				)}
			>
				<span className={cn("leading-tight font-medium text-black", mainClassName)}>
					{base}
					{trailingPlus ? "+" : ""}
				</span>
				{showPromotionalBadge ? (
					<PromotionalPriceBadge isPromotional={item?.isPromotional} />
				) : null}
			</span>
			{unit ? (
				<span
					className={cn(
						"text-[11px] leading-snug text-black/60 font-normal",
						unitClassName
					)}
				>
					{unit}
				</span>
			) : null}
		</span>
	);
};

export default ProcedurePriceStack;
