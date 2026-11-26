import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { captureEvent } from "../config/analytics";
import {
	TEST_API_URL,
	CLINIC_ID,
	CLINIC_INFO,
	SELECTED_DATA,
	EXPECTED_PROCEDURES,
	jsonResponse,
	lastFetchCall,
} from "../testUtils/consultation";

jest.mock("../config/analytics", () => ({ captureEvent: jest.fn() }));

// config/api reads the env var when it loads, so set it before requiring the component.
process.env.REACT_APP_CONSULTATION_REQUEST_API_URL = TEST_API_URL;
const ConsultationRequestModal = require("./ConsultationRequestModal").default;

const renderModal = (props = {}) =>
	render(
		<ConsultationRequestModal
			isOpen
			onClose={jest.fn()}
			clinicId={CLINIC_ID}
			clinicInfo={CLINIC_INFO}
			selectedData={SELECTED_DATA}
			procedures={[]}
			{...props}
		/>
	);

const type = (placeholder, value) =>
	fireEvent.change(screen.getByPlaceholderText(placeholder), { target: { value } });

const fillRequired = () => {
	type("First name", " Jane ");
	type("Last name", " Doe ");
	type("Email", " jane@example.com ");
};

const submit = () => fireEvent.click(screen.getByRole("button", { name: "Submit" }));

describe("ConsultationRequestModal (mobile)", () => {
	beforeEach(() => {
		global.fetch = jest.fn();
		jest.spyOn(console, "log").mockImplementation(() => {});
		jest.spyOn(console, "error").mockImplementation(() => {});
	});

	afterEach(() => {
		jest.restoreAllMocks();
		captureEvent.mockClear();
		delete global.fetch;
	});

	it("posts the payload contact-request-api expects and shows success", async () => {
		global.fetch.mockReturnValue(jsonResponse({ success: true, requestId: 7 }));
		renderModal();

		fillRequired();
		submit();

		expect(await screen.findByText("Request Submitted!")).toBeInTheDocument();

		const { url, options, body } = lastFetchCall();
		expect(url).toBe(`${TEST_API_URL}/api/consultation-requests`);
		expect(options.method).toBe("POST");
		expect(options.headers["Content-Type"]).toBe("application/json");
		expect(body).toEqual({
			firstName: "Jane",
			lastName: "Doe",
			email: "jane@example.com",
			phone: null,
			message: null,
			patientStatus: "new",
			clinicId: CLINIC_ID,
			clinicName: "Glow Test Clinic",
			selectedProcedures: EXPECTED_PROCEDURES,
		});
		expect(captureEvent).toHaveBeenCalledWith(
			"consultation_requested",
			expect.objectContaining({ clinic_id: CLINIC_ID, surface: "mobile_modal" })
		);
	});

	it("sends optional fields and returning patient status when provided", async () => {
		global.fetch.mockReturnValue(jsonResponse({ success: true }));
		renderModal();

		fireEvent.click(screen.getByRole("button", { name: "Returning patient" }));
		fillRequired();
		type("Phone (optional)", " 555-0100 ");
		type("Message (optional)", " Hello ");
		submit();

		await screen.findByText("Request Submitted!");
		expect(lastFetchCall().body).toMatchObject({
			phone: "555-0100",
			message: "Hello",
			patientStatus: "returning",
		});
	});

	it("does not call the API when required fields are missing", () => {
		renderModal();
		submit();

		expect(screen.getByText("First name is required")).toBeInTheDocument();
		expect(screen.getByText("Last name is required")).toBeInTheDocument();
		expect(screen.getByText("Email is required")).toBeInTheDocument();
		expect(global.fetch).not.toHaveBeenCalled();
	});

	it("shows the API's error message when the request fails", async () => {
		global.fetch.mockReturnValue(jsonResponse({ success: false, error: "Server is down" }, false));
		renderModal();

		fillRequired();
		submit();

		expect(await screen.findByText("Server is down")).toBeInTheDocument();
		expect(screen.queryByText("Request Submitted!")).not.toBeInTheDocument();
		expect(captureEvent).toHaveBeenCalledWith(
			"consultation_request_failed",
			expect.objectContaining({ reason: "server_error", surface: "mobile_modal" })
		);
	});

	it("shows field errors returned by API validation", async () => {
		global.fetch.mockReturnValue(
			jsonResponse({ success: false, details: { lastName: "Last name is required" } }, false)
		);
		renderModal();

		fillRequired();
		submit();

		expect(await screen.findByText("Last name is required")).toBeInTheDocument();
	});

	it("shows a connection error when fetch rejects", async () => {
		global.fetch.mockRejectedValue(new Error("network down"));
		renderModal();

		fillRequired();
		submit();

		expect(await screen.findByText(/check your connection/i)).toBeInTheDocument();
		expect(captureEvent).toHaveBeenCalledWith(
			"consultation_request_failed",
			expect.objectContaining({ reason: "network_error" })
		);
	});
});
