const {
	formatPrice,
	isValidClinic,
	renderClinic,
	fillTemplate,
} = require("../../scripts/lib/clinic-prerender");

const SITE = "https://www.glowra.com";

const clinic = (overrides = {}) => ({
	clinicId: 42,
	clinicName: "Glow & Co <Med Spa>",
	address: "1 Main Street",
	city: "Miami",
	state: "FL",
	zipCode: "33139",
	phone: "305-555-0100",
	website: "https://glow.example",
	latitude: 25.79,
	longitude: -80.13,
	rating: 4.7,
	reviewCount: 120,
	category: "Medical Spa",
	description: "A spa.",
	photoUrl: "https://api.example.test/api/photos/proxy/9?size=medium",
	procedures: [
		{ procedureId: 1, procedureName: "Botox", category: "Injectables", price: 12, priceUnit: "/unit" },
		{ procedureId: 2, procedureName: "Lip Filler", category: "Injectables", price: 650 },
		{ procedureId: 3, procedureName: "HydraFacial", category: "Skin", price: 1999.6 },
	],
	...overrides,
});

const TEMPLATE =
	'<html><head><title>Default</title><meta data-rh="true" name="description" content="d"/></head>' +
	'<body><div id="root"></div></body></html>';

describe("clinic prerender", () => {
	it("formats prices the way the clinic page does", () => {
		expect(formatPrice({ price: 12, priceUnit: "/unit" })).toBe("$12/unit+");
		expect(formatPrice({ price: 1999.6 })).toBe("$2,000+");
		expect(formatPrice({ price: 0 })).toBe("Price on request");
	});

	it("renders name, address, procedures and prices into the body", () => {
		const { body } = renderClinic(clinic(), SITE);
		expect(body).toContain("<h1>Glow &amp; Co &lt;Med Spa&gt;</h1>");
		expect(body).toContain("1 Main Street, Miami, FL 33139");
		expect(body).toContain("<td>Botox</td><td>$12/unit+</td>");
		expect(body).toContain("<td>HydraFacial</td><td>$2,000+</td>");
		expect(body).toContain("<h3>Injectables</h3>");
	});

	it("writes a canonical URL, description and JSON-LD that cannot break out of the script tag", () => {
		const { head } = renderClinic(clinic({ clinicName: "</script><b>x" }), SITE);
		expect(head).toContain('<link data-rh="true" rel="canonical" href="https://www.glowra.com/clinic/42"/>');
		expect(head).not.toContain("</script><b>");
		const json = head.match(/<script[^>]*>(.*?)<\/script>/)[1];
		const schema = JSON.parse(json);
		expect(schema.address.postalCode).toBe("33139");
		expect(schema.makesOffer).toHaveLength(3);
		expect(schema.aggregateRating.ratingValue).toBe(4.7);
	});

	it("references the photo only in JSON-LD, never as an <img> the browser or build would load", () => {
		const { head, body } = renderClinic(clinic(), SITE);
		expect(body).not.toContain("<img");
		expect(head).not.toMatch(/og:image/);
	});

	it("drops a non-http website link", () => {
		const { body } = renderClinic(clinic({ website: "javascript:alert(1)" }), SITE);
		expect(body).not.toContain("javascript:");
	});

	it("rejects malformed records", () => {
		expect(isValidClinic(clinic())).toBe(true);
		expect(isValidClinic(clinic({ clinicId: "../etc" }))).toBe(false);
		expect(isValidClinic(clinic({ clinicName: "" }))).toBe(false);
		expect(isValidClinic(clinic({ procedures: null }))).toBe(false);
	});

	it("fills the CRA template, replacing default head tags", () => {
		const html = fillTemplate(TEMPLATE, renderClinic(clinic(), SITE));
		expect(html).not.toContain("<title>Default</title>");
		expect(html).not.toContain('content="d"');
		expect(html).toContain('<div id="root"><main>');
		expect(() => fillTemplate("<html></html>", { head: "", body: "" })).toThrow();
	});
});
