import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AppState, AppAction, Verifier, Requirement } from '../types';

const STORAGE_KEY = 'regutrack_db_v1';

const initialState: AppState = {
  verifiers: [
    { id: 'v1', name: 'Bureau Veritas', email: 'contact@bureauveritas.com', phone: '01 42 91 52 91', isInternal: false },
    { id: 'v2', name: 'Audit Interne', email: 'interne@entreprise.com', phone: '', isInternal: true },
  ],
  requirements: [
    {
      id: 'r1',
      designation: 'Vérification Extincteurs',
      description: 'Vérification réglementaire annuelle de tous les extincteurs.',
      lastDate: '2023-05-15',
      periodicityMonths: 12,
      verifierId: 'v1',
      trackingType: 'PERIODIC',
    },
    {
      id: 'r2',
      designation: 'Maintenance Ascenseurs',
      description: 'Contrôle de routine mensuel.',
      lastDate: '2024-02-01',
      periodicityMonths: 1,
      verifierId: 'v2',
      trackingType: 'PERIODIC',
    },
    {
      id: 'r3',
      designation: 'Rondes de sécurité',
      description: 'Surveillance quotidienne des issues de secours.',
      lastDate: '2024-01-01',
      periodicityMonths: 0,
      verifierId: 'v2',
      trackingType: 'CONTINUOUS',
    },
  ],
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'ADD_VERIFIER':
      return { ...state, verifiers: [...state.verifiers, action.payload] };
    case 'UPDATE_VERIFIER':
      return {
        ...state,
        verifiers: state.verifiers.map((v) =>
          v.id === action.payload.id ? action.payload : v
        ),
      };
    case 'DELETE_VERIFIER':
      return {
        ...state,
        verifiers: state.verifiers.filter((v) => v.id !== action.payload),
        // Optionnel : Suppression en cascade ou avertissement utilisateur géré dans l'UI
      };
    case 'ADD_REQUIREMENT':
      return { ...state, requirements: [...state.requirements, action.payload] };
    case 'UPDATE_REQUIREMENT':
      return {
        ...state,
        requirements: state.requirements.map((r) =>
          r.id === action.payload.id ? action.payload : r
        ),
      };
    case 'DELETE_REQUIREMENT':
      return {
        ...state,
        requirements: state.requirements.filter((r) => r.id !== action.payload),
      };
    case 'IMPORT_DATA':
      return action.payload;
    case 'RESET_DATA':
      return initialState;
    default:
      return state;
  }
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}>({
  state: initialState,
  dispatch: () => null,
});

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Charger l'état initial depuis le stockage local ou utiliser le défaut
  const loadState = (): AppState => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : initialState;
    } catch (e) {
      console.error('Échec du chargement de l\'état', e);
      return initialState;
    }
  };

  const [state, dispatch] = useReducer(appReducer, loadState());

  // Sauvegarder dans le stockage local à chaque changement d'état
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);