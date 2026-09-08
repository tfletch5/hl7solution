import { Facility, Patient, Provider } from "@/data";
import { riverside } from "@/data/riverside/facility";
import { harborview } from "@/data/harborview/facility";
import { patients as riversidePatients } from "@/data/riverside/patients";
import { providers as riversideProviders } from "@/data/riverside/providers";
import { toHl7Date, toHl7DateTime } from "./parser";

const FIELD = "|";
const COMPONENT = "^";
const ENCODING_CHARS = "^~\\&";

export function buildAdtA01({
  patient,
  sendingFacility,
  receivingFacility,
  provider,
  controlId,
  eventDate,
  reason = "Inpatient admission",
}: {
  patient: Patient;
  sendingFacility: Facility;
  receivingFacility: Facility;
  provider?: Provider;
  controlId: string;
  eventDate: string;
  reason?: string;
}): string {
  const timestamp = toHl7DateTime(eventDate);

  const msh = [
    "MSH",
    ENCODING_CHARS,
    sendingFacility.id.toUpperCase(),
    sendingFacility.name,
    receivingFacility.id.toUpperCase(),
    receivingFacility.name,
    timestamp,
    "",
    `ADT${COMPONENT}A01`,
    controlId,
    "P",
    "2.5",
  ];

  const evn = ["EVN", "A01", timestamp];

  const addressLine = patient.address.line[0] ?? "";
  const addressLine2 = patient.address.line[1] ?? "";

  const pid = [
    "PID",
    "1",
    "",
    `${patient.localMrn}${COMPONENT}${COMPONENT}${COMPONENT}${sendingFacility.mrnPrefix}${COMPONENT}PI`,
    "",
    `${patient.lastName}${COMPONENT}${patient.firstName}`,
    "",
    toHl7Date(patient.dateOfBirth),
    patient.gender.toUpperCase() === "FEMALE" ? "F" : "M",
    "",
    "",
    `${addressLine}${COMPONENT}${addressLine2}${COMPONENT}${patient.address.city}${COMPONENT}${patient.address.state}${COMPONENT}${patient.address.postalCode}${COMPONENT}${patient.address.country}`,
    "",
    patient.phone.replace(/\D/g, ""),
  ];

  const attending = provider
    ? `${provider.name.split(" ")[1] ?? ""}${COMPONENT}${provider.name.split(" ")[0] ?? ""}${COMPONENT}${provider.credentials}`
    : "";

  const pv1 = [
    "PV1",
    "1",
    "I",
    `IM${COMPONENT}101${COMPONENT}A`,
    "",
    "",
    "",
    attending,
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    timestamp,
    reason,
  ];

  return [msh, evn, pid, pv1].map((fields) => fields.join(FIELD)).join("\r");
}

export function buildJaneDoeAdmission(eventDate?: string): string {
  const patient = riversidePatients.find((p) => p.localMrn === "RG-000445");
  const provider = riversideProviders.find((p) => p.id === "RG-PROV-001");

  if (!patient) {
    throw new Error("Jane Doe (RG-000445) not found in Riverside patient data");
  }

  return buildAdtA01({
    patient,
    sendingFacility: riverside,
    receivingFacility: harborview,
    provider,
    controlId: "RG-ADT-000445-001",
    eventDate: eventDate ?? "2026-09-01T08:30:00Z",
    reason: "Hyperglycemia and dehydration",
  });
}
