import { findCrosswalkByMrn } from "@/data";
import { CrosswalkEntry, FacilityId } from "@/data/shared/types";

export interface MatchCandidate {
  mrn: string;
  facilityId: FacilityId;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  phone?: string;
  address?: {
    line?: string[];
    city?: string;
    state?: string;
    postalCode?: string;
  };
}

export interface MatchResult {
  matched: boolean;
  confidence: number;
  requiresReview: boolean;
  crosswalk?: CrosswalkEntry;
  remoteMrn?: string;
  remoteFacilityId?: FacilityId;
  reasons: string[];
}

function normalize(value?: string): string {
  return (value ?? "").toLowerCase().replace(/\s+/g, " ").trim();
}

function compareAddress(
  a: MatchCandidate["address"],
  b: CrosswalkEntry["address"],
): boolean {
  const aLine = (a?.line ?? []).map(normalize).join(" ");
  const bLine = (b.line ?? []).map(normalize).join(" ");
  return (
    aLine === bLine.toLowerCase().replace(/\s+/g, " ").trim() &&
    normalize(a?.city) === normalize(b.city) &&
    normalize(a?.state) === normalize(b.state) &&
    normalize(a?.postalCode) === normalize(b.postalCode)
  );
}

export function matchPatient(candidate: MatchCandidate): MatchResult {
  const entry = findCrosswalkByMrn(candidate.mrn);
  const reasons: string[] = [];

  if (!entry) {
    return {
      matched: false,
      confidence: 0,
      requiresReview: true,
      reasons: [`No crosswalk entry for MRN ${candidate.mrn}`],
    };
  }

  // Always start with the MPI-style confidence from the crosswalk.
  let confidence = entry.matchConfidence;

  if (
    candidate.firstName &&
    normalize(candidate.firstName) !== normalize(entry.firstName)
  ) {
    confidence -= 0.1;
    reasons.push("First name does not exactly match");
  }

  if (
    candidate.lastName &&
    normalize(candidate.lastName) !== normalize(entry.lastName)
  ) {
    confidence -= 0.1;
    reasons.push("Last name does not exactly match");
  }

  const candidateDob = (candidate.dateOfBirth ?? "").replace(/-/g, "");
  const entryDob = entry.dateOfBirth.replace(/-/g, "");
  if (candidateDob && candidateDob !== entryDob) {
    confidence -= 0.15;
    reasons.push("Date of birth does not match");
  }

  const candidatePhone = (candidate.phone ?? "").replace(/\D/g, "");
  const entryPhone = (entry.phone ?? "").replace(/\D/g, "");
  if (candidatePhone && candidatePhone !== entryPhone) {
    confidence -= 0.1;
    reasons.push("Phone number does not match");
  }

  if (candidate.address && !compareAddress(candidate.address, entry.address)) {
    confidence -= 0.05;
    reasons.push("Address does not exactly match");
  }

  const remote = entry.identifiers.find(
    (id) => id.facilityId !== candidate.facilityId,
  );

  return {
    matched: confidence >= 0.9,
    confidence: Math.max(0, Math.min(1, confidence)),
    requiresReview: confidence < 0.99,
    crosswalk: entry,
    remoteMrn: remote?.value,
    remoteFacilityId: remote?.facilityId,
    reasons: reasons.length
      ? reasons
      : ["All corroborating demographics match"],
  };
}
