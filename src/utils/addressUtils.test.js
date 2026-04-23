import { formatClinicLocationDisplay } from "./addressUtils";

describe("formatClinicLocationDisplay", () => {
	it("keeps city in title case with state abbreviation", () => {
		expect(formatClinicLocationDisplay({ city: "Chicago", state: "IL" })).toEqual({
			city: "Chicago",
			state: "IL",
		});
	});

	it("converts full state names to two-letter abbreviations", () => {
		expect(formatClinicLocationDisplay({ city: "chicago", state: "Illinois" })).toEqual({
			city: "Chicago",
			state: "IL",
		});
	});

	it("strips duplicated state from city before formatting", () => {
		expect(formatClinicLocationDisplay({ city: "CHICAGO ILLINOIS", state: "Illinois" })).toEqual({
			city: "Chicago",
			state: "IL",
		});
	});

	it("falls back to original state value when unknown", () => {
		expect(formatClinicLocationDisplay({ city: "new york", state: "New Yrk" })).toEqual({
			city: "New York",
			state: "New Yrk",
		});
	});
});
