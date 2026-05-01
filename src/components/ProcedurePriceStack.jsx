import React from "react";
import { cn } from "../utils/cn";
import {
	formatClinicPriceEstimate,
	formatProcedurePriceUnitSuffix,
} from "../utils/clinicPriceDisplay";

/**
 * Procedure price: amount on first line; optional unit (e.g. /treatment) below in smaller type.
 *
 * @param {Object} props
 * @param {{ price?: number, priceUnit?: string, unit?: string }} props.item
 * @param {boolean} [props.trailingPlus]
 * @param {'end' | 'start'} [props.align] — column cross-axis for price column layout
 * @param {string} [props.className] — wrapper
 * @param {string} [props.mainClassName] — first line
 * @param {string} [props.unitClassName] — unit line
 */
const ProcedurePriceStack = ({
	item,
	trailingPlus = false,
	align = "end",
	className,
	mainClassName,
	unitClassName,
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
			<span className={cn("leading-tight font-medium text-black", mainClassName)}>
				{base}
				{trailingPlus ? "+" : ""}
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
