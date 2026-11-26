import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
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
const ConsultationRequestForm = require("./ConsultationRequestForm").default;

const renderForm = () =>
	render(
		<ConsultationRequestForm
			clinicId={CLINIC_ID}
			clinicInfo={CLINIC_INFO}
			selectedData={SELECTED_DATA}
			procedures={[]}
		/>
	);

const type = (placeholder, value) =>
	fireEvent.change(screen.getByPlaceholderText(placeholder), { target: { value } });

const submit = () => fireEvent.click(screen.getByRole("button", { name: /request a consultation/i }));

describe("ConsultationRequestForm (desktop)", () => {
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
		global.fetch.mockReturnValue(jsonResponse({ success: true, requestId: 42 }));
		renderForm();

		type("Enter your name", "  Jane Mary Doe ");
		type("Enter your Email", " jane@example.com ");
		submit();

		expect(await screen.findByText("Request Submitted!")).toBeInTheDocument();

		const { url, options, body } = lastFetchCall();
		expect(url).toBe(`${TEST_API_URL}/api/consultation-requests`);
		expect(options.method).toBe("POST");
		expect(options.headers["Content-Type"]).toBe("application/json");
		expect(body).toEqual({
			firstName: "Jane",
			lastName: "Mary Doe",
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
			expect.objectContaining({ clinic_id: CLINIC_ID, procedure_count: 2 })
		);
	});

	it("sends optional fields and returning patient status when provided", async () => {
		global.fetch.mockReturnValue(jsonResponse({ success: true }));
		renderForm();

		fireEvent.click(screen.getByRole("button", { name: "Returning patient" }));
		type("Enter your name", "Cher");
		type("Enter your Email", "cher@example.com");
		fireEvent.click(screen.getByRole("button", { name: /add optional information/i }));
		type("Enter your phone", " 555-0100 ");
		type("Your message", " Hello ");
		submit();

		await screen.findByText("Request Submitted!");
		const { body } = lastFetchCall();
		// Single-word names repeat as lastName, since the API requires a non-empty lastName.
		expect(body).toMatchObject({
			firstName: "Cher",
			lastName: "Cher",
			phone: "555-0100",
			message: "Hello",
			patientStatus: "returning",
		});
	});

	it("does not call the API when required fields are missing", () => {
		renderForm();
		submit();

		expect(screen.getByText("Name is required")).toBeInTheDocument();
		expect(screen.getByText("Email is required")).toBeInTheDocument();
		expect(global.fetch).not.toHaveBeenCalled();
	});

	it("shows the API's error message when the request fails", async () => {
		global.fetch.mockReturnValue(jsonResponse({ success: false, error: "Server is down" }, false));
		renderForm();

		type("Enter your name", "Jane Doe");
		type("Enter your Email", "jane@example.com");
		submit();

		expect(await screen.findByText("Server is down")).toBeInTheDocument();
		expect(screen.queryByText("Request Submitted!")).not.toBeInTheDocument();
		expect(captureEvent).toHaveBeenCalledWith(
			"consultation_request_failed",
			expect.objectContaining({ reason: "server_error" })
		);
	});

	it("shows field errors returned by API validation", async () => {
		global.fetch.mockReturnValue(
			jsonResponse({ success: false, details: { email: "Invalid email format" } }, false)
		);
		renderForm();

		type("Enter your name", "Jane Doe");
		type("Enter your Email", "jane@example.com");
		submit();

		expect(await screen.findByText("Invalid email format")).toBeInTheDocument();
	});

	it("shows a connection error when fetch rejects", async () => {
		global.fetch.mockRejectedValue(new Error("network down"));
		renderForm();

		type("Enter your name", "Jane Doe");
		type("Enter your Email", "jane@example.com");
		submit();

		expect(await screen.findByText(/check your connection/i)).toBeInTheDocument();
		await waitFor(() =>
			expect(screen.getByRole("button", { name: /request a consultation/i })).toBeEnabled()
		);
		expect(captureEvent).toHaveBeenCalledWith(
			"consultation_request_failed",
			expect.objectContaining({ reason: "network_error" })
		);
	});
});
