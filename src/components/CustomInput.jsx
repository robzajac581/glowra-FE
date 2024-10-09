import { Option, Select } from "@material-tailwind/react";
import React from "react";
import { cn } from "../utils/cn";

const CustomInput = ({ label, type, className, options, ...rest }) => {
	return (
		<div>
			{label && <div className="font-medium text-[13px] mb-1">{label}</div>}
			{options?.length ? (
				<Select
					className={cn("border border-border input-select", {
						[className]: className,
					})}
					{...rest}
					labelProps={{
						className: "hidden",
					}}
					containerProps={{
						className: "select-2",
					}}
				>
					{options.map((item) => (
						<Option value={item.value}>{item.label}</Option>
					))}
				</Select>
			) : (
				<input
					className={cn("input", {
						[className]: className,
					})}
					type={type ? type : "text"}
					{...rest}
				/>
			)}
		</div>
	);
};

export default CustomInput;
