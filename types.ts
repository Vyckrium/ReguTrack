export interface Verifier {
  id: string;
  name: string;
  email: string;
}

export interface Requirement {
  id: string;
  designation: string;
  description: string;
  lastDate: string; // Chaîne de date ISO 8601 (AAAA-MM-JJ)
  periodicityMonths: number;
  verifierId: string;
}

export type Status = 'RED' | 'ORANGE' | 'GREEN';

export interface AppState {
  verifiers: Verifier[];
  requirements: Requirement[];
}

export type AppAction =
  | { type: 'ADD_VERIFIER'; payload: Verifier }
  | { type: 'DELETE_VERIFIER'; payload: string }
  | { type: 'ADD_REQUIREMENT'; payload: Requirement }
  | { type: 'UPDATE_REQUIREMENT'; payload: Requirement }
  | { type: 'DELETE_REQUIREMENT'; payload: string }
  | { type: 'IMPORT_DATA'; payload: AppState }
  | { type: 'RESET_DATA' };
