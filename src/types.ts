export enum GoalCategory {
  PERSONAL = 'Personal',
  FINANCIERA = 'Financiera',
}

export enum GoalHorizon {
  ONE_QUARTER = '1 trimestre',
  ONE_YEAR = '1 año',
  THREE_YEARS = '3 años',
  FIVE_YEARS = '5 años',
}

export enum GoalStatus {
  PLANIFICADO = 'Planificado',
  EN_PROGRESO = 'En progreso',
  COMPLETADO = 'Completado',
  PAUSADO = 'Pausado',
}

export enum Priority {
  BAJA = 'Baja',
  MEDIA = 'Media',
  ALTA = 'Alta',
}

export enum ActionType {
  DIARIA = 'Diaria',
  SEMANAL = 'Semanal',
  MENSUAL = 'Mensual',
}

export enum Impact {
  ALTO = 'Alto',
  MEDIO = 'Medio',
  BAJO = 'Bajo',
}

export interface Goal {
  id: string;
  category: string;
  horizon: GoalHorizon;
  objective: string;
  metric: string;
  targetValue: string;
  deadline: string;
  progress: number;
  priority: Priority;
  status: GoalStatus;
  relatedGoals?: string[];
  impactOnBusiness?: string; // For personal goals
  revenueSource?: string; // For financial goals
  marginPercentage?: number; // For financial goals
  description?: string;
  period?: string;
}

export interface ActionPlan {
  id: string;
  goalId: string;
  action: string;
  type: ActionType;
  impact: Impact;
  timeRequired: string;
  expectedResult: string;
}

export interface Habit {
  id: string;
  habit: string;
  goalId: string;
  frequency: string;
  type: 'personal' | 'productivo';
  suggestedTime: string;
  trigger: string;
  reward: string;
  targetCount: number;
  trackingUnit: 'days' | 'times' | 'duration';
  dailyGoal?: number; // times per day or minutes per day
  completedDates: string[]; // ISO date strings or Date.toDateString()
  completions?: Record<string, number>; // date string -> count or minutes
  icon: string;
  color: string;
  area?: string;
}

export interface DailyTracking {
  date: string;
  completedHabits: string[]; // List of habit IDs
  energyLevel: number; // 1-5
  notes: string;
}

export interface Reward {
  id: string;
  condition: string;
  reward: string;
  type: 'pequeña' | 'grande';
  status: 'pendiente' | 'reclamada';
  costXP?: number;
  triggerType?: 'diario' | 'semanal' | 'trimestral' | 'anual';
  category?: string;
}
