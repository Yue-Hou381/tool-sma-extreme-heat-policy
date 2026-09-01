import type { LocationSuggestion } from "@/domain/location";
import type { SportType } from "@/domain/sport";

export const SAVED_ROUTINES_MAX = 8;
export const SAVED_ROUTINE_LABEL_MAX_LENGTH = 30;

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface SavedRoutine {
  id: string;
  label: string;
  location: LocationSuggestion;
  sport: SportType;
  weekday: Weekday;
  startMinutes: number;
  endMinutes: number;
  createdAt: number;
}

export type SaveRoutineRejectReason =
  | "empty_label"
  | "duplicate_label"
  | "limit_reached"
  | "missing_coordinates"
  | "invalid_time_window";

export type SaveRoutineResult =
  | { status: "saved"; id: string }
  | { status: "rejected"; reason: SaveRoutineRejectReason };

export function normalizeLabel(rawLabel: string): string {
  return rawLabel.trim().slice(0, SAVED_ROUTINE_LABEL_MAX_LENGTH);
}

export function isDuplicateLabel(
  savedRoutines: readonly SavedRoutine[],
  label: string,
): boolean {
  const comparableLabel = normalizeLabel(label).toLowerCase();

  return savedRoutines.some(
    (saved) => saved.label.toLowerCase() === comparableLabel,
  );
}

export function hasCoordinates(location: LocationSuggestion): boolean {
  return (
    Number.isFinite(location.latitude) && Number.isFinite(location.longitude)
  );
}

const MINUTES_IN_DAY = 24 * 60;

export function isValidTimeWindow(
  startMinutes: number,
  endMinutes: number,
): boolean {
  return (
    Number.isInteger(startMinutes) &&
    Number.isInteger(endMinutes) &&
    startMinutes >= 0 &&
    endMinutes <= MINUTES_IN_DAY &&
    startMinutes < endMinutes
  );
}

export function stripSessionToken(
  location: LocationSuggestion,
): LocationSuggestion {
  const persistableLocation = { ...location };
  delete persistableLocation.sessionToken;

  return persistableLocation;
}

export function createSavedRoutine(input: {
  label: string;
  location: LocationSuggestion;
  sport: SportType;
  weekday: Weekday;
  startMinutes: number;
  endMinutes: number;
}): SavedRoutine {
  return {
    id: crypto.randomUUID(),
    label: normalizeLabel(input.label),
    location: stripSessionToken(input.location),
    sport: input.sport,
    weekday: input.weekday,
    startMinutes: input.startMinutes,
    endMinutes: input.endMinutes,
    createdAt: Date.now(),
  };
}
