import { Requirement, Status } from './types';

// Aide pour ajouter des mois à une chaîne de date
export const addMonthsToDate = (dateStr: string, months: number): Date => {
  const date = new Date(dateStr);
  date.setMonth(date.getMonth() + months);
  return date;
};

// Aide pour calculer la prochaine date d'échéance
export const calculateNextDueDate = (lastDate: string, periodicity: number): string => {
  const nextDate = addMonthsToDate(lastDate, periodicity);
  return nextDate.toISOString().split('T')[0];
};

// Aide pour déterminer le statut basé sur la date d'échéance
export const getRequirementStatus = (nextDueDateStr: string): Status => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const nextDue = new Date(nextDueDateStr);
  nextDue.setHours(0, 0, 0, 0);

  // Différence en millisecondes
  const diffTime = nextDue.getTime() - today.getTime();
  // Différence en jours
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return 'RED'; // En retard
  } else if (diffDays <= 90) {
    return 'ORANGE'; // Échéance dans les 90 jours
  } else {
    return 'GREEN'; // OK
  }
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};
