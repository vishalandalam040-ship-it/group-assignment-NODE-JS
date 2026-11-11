const allowedPrinterStatuses = ["available", "printing", "maintenance"];
const allowedReservationStatuses = ["pending", "confirmed", "completed", "cancelled"];

function validateRequiredString(value, fieldName) {
  if (typeof value !== "string") {
    return `${fieldName} must be a string`;
  }

  if (!value.trim()) {
    return `${fieldName} is required`;
  }

  return null;
}

function validatePrinterPayload(payload) {
  if (!payload || typeof payload !== "object") {
    return "Printer payload is required";
  }

  const nameError = validateRequiredString(payload.name, "Printer name");
  if (nameError) {
    return nameError;
  }

  const materialError = validateRequiredString(payload.material, "Printer material");
  if (materialError) {
    return materialError;
  }

  const statusError = validateRequiredString(payload.status, "Printer status");
  if (statusError) {
    return statusError;
  }

  if (!allowedPrinterStatuses.includes(payload.status)) {
    return "Printer status must be one of: available, printing, maintenance";
  }

  return null;
}

function validateReservationPayload(payload) {
  if (!payload || typeof payload !== "object") {
    return "Reservation payload is required";
  }

  if (payload.designer_id === undefined || payload.designer_id === null || payload.designer_id === "") {
    return "Designer ID is required";
  }

  if (!Number.isInteger(Number(payload.designer_id)) || Number(payload.designer_id) <= 0) {
    return "Designer ID must be a valid positive integer";
  }

  if (payload.printer_id === undefined || payload.printer_id === null || payload.printer_id === "") {
    return "Printer ID is required";
  }

  if (!Number.isInteger(Number(payload.printer_id)) || Number(payload.printer_id) <= 0) {
    return "Printer ID must be a valid positive integer";
  }

  const reservationDateError = validateRequiredString(payload.reservation_date, "Reservation date");
  if (reservationDateError) {
    return reservationDateError;
  }

  const statusError = validateRequiredString(payload.status, "Reservation status");
  if (statusError) {
    return statusError;
  }

  if (!allowedReservationStatuses.includes(payload.status)) {
    return "Reservation status must be one of: pending, confirmed, completed, cancelled";
  }

  return null;
}

function validatePositiveInteger(value, label = "ID") {
  if (value === undefined || value === null || value === "") {
    return `${label} is required`;
  }

  const numericValue = Number(value);

  if (!Number.isInteger(numericValue) || numericValue <= 0) {
    return `${label} must be a valid positive integer`;
  }

  return null;
}

module.exports = {
  allowedPrinterStatuses,
  allowedReservationStatuses,
  validatePrinterPayload,
  validateReservationPayload,
  validatePositiveInteger,
};
