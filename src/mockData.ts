import { Goal, GoalCategory, GoalHorizon, GoalStatus, Priority, ActionPlan, ActionType, Impact, Habit, Reward, DailyTracking } from './types';

export const INITIAL_GOALS: Goal[] = [
  {
    id: 'g1',
    category: GoalCategory.FINANCIERA,
    horizon: GoalHorizon.ONE_YEAR,
    objective: 'Facturar $15,000 mensuales constantes',
    metric: 'Ventas brutas mensuales',
    targetValue: '$15,000',
    deadline: '2026-12-31',
    progress: 45,
    priority: Priority.ALTA,
    status: GoalStatus.EN_PROGRESO,
    revenueSource: 'Ventas combos de accesorios (TikTok/IG)',
    marginPercentage: 40,
  },
  {
    id: 'g2',
    category: GoalCategory.PERSONAL,
    horizon: GoalHorizon.ONE_YEAR,
    objective: 'Dominar edición de video creativa para redes',
    metric: 'Capacidad de editar 1 video en < 30 mins',
    targetValue: '30 mins',
    deadline: '2026-06-30',
    progress: 20,
    priority: Priority.MEDIA,
    status: GoalStatus.EN_PROGRESO,
    impactOnBusiness: 'Ahorro de $500/mes en editor externo y mayor agilidad',
  },
  {
    id: 'g3',
    category: GoalCategory.FINANCIERA,
    horizon: GoalHorizon.THREE_YEARS,
    objective: 'Expandir a tienda física propia / showroom',
    metric: 'Apertura de local',
    targetValue: '1 Local',
    deadline: '2028-12-31',
    progress: 5,
    priority: Priority.BAJA,
    status: GoalStatus.PLANIFICADO,
    revenueSource: 'Reinversión de utilidades online',
    marginPercentage: 35,
  }
];

export const ACTION_PLANS: ActionPlan[] = [
  {
    id: 'a1',
    goalId: 'g1',
    action: 'Campaña semanal de combos específicos en TikTok',
    type: ActionType.SEMANAL,
    impact: Impact.ALTO,
    timeRequired: '4 horas',
    expectedResult: '+15 pedidos/semana por WhatsApp',
  },
  {
    id: 'a2',
    goalId: 'g2',
    action: 'Curso intensivo de CapCut y hooks de ventas',
    type: ActionType.SEMANAL,
    impact: Impact.MEDIO,
    timeRequired: '2 horas',
    expectedResult: 'Mejorar retención en los primeros 3s del video',
  }
];

export const HABITS: Habit[] = [
  {
    id: 'h1',
    habit: 'Grabar 2 clips de producto (UGC style)',
    goalId: 'g1',
    frequency: 'Diaria',
    type: 'productivo',
    suggestedTime: '09:00 AM',
    trigger: 'Al llegar al taller/oficina',
    reward: 'Café premium al terminar',
    targetCount: 7,
    trackingUnit: 'times',
    dailyGoal: 2,
    completedDates: [],
    completions: {},
    icon: '📹',
    color: 'bg-orange-500',
    area: 'Marketing'
  },
  {
    id: 'h2',
    habit: 'Contestar mensajes de WhatsApp pendientes',
    goalId: 'g1',
    frequency: 'Diaria',
    type: 'productivo',
    suggestedTime: '11:00 AM',
    trigger: 'Alarma de "Cierre de Ventas"',
    reward: '15 min de descanso total',
    targetCount: 7,
    trackingUnit: 'days',
    dailyGoal: 1,
    completedDates: [],
    completions: {},
    icon: '💬',
    color: 'bg-[#ffcc00]',
    area: 'Ventas'
  },
  {
    id: 'h3',
    habit: 'Lectura de métricas diarias (Ads/Organic)',
    goalId: 'g1',
    frequency: 'Diaria',
    type: 'productivo',
    suggestedTime: '06:00 PM',
    trigger: 'Antes de cerrar el día',
    reward: 'Cena sin revisar el celular',
    targetCount: 7,
    trackingUnit: 'days',
    dailyGoal: 1,
    completedDates: [],
    completions: {},
    icon: '📊',
    color: 'bg-blue-500',
    area: 'Análisis'
  }
];

export const DAILY_TRACKING_EXAMPLES: DailyTracking[] = [
  {
    date: '2026-05-01',
    completedHabits: ['h1', 'h2'],
    energyLevel: 4,
    notes: 'Buen flujo de ventas por TikTok, pero faltó tiempo para el hábito 3.',
  }
];

export const REWARDS: Reward[] = [
  {
    id: 'r1',
    condition: 'Completar 100% de hábitos por 15 días seguidos',
    reward: 'Cena en restaurante nuevo',
    type: 'grande',
    status: 'pendiente',
    costXP: 1000,
    triggerType: 'semanal',
    category: 'Relaciones'
  },
  {
    id: 'r2',
    condition: 'Lograr primera venta de >$200 en un solo pedido',
    reward: 'Nueva suscripción premium',
    type: 'pequeña',
    status: 'pendiente',
    costXP: 200,
    triggerType: 'diario',
    category: 'Negocios'
  },
  {
    id: 'r3',
    condition: 'Finalizar trimestre con 20% más de ahorro',
    reward: 'Viaje de fin de semana',
    type: 'grande',
    status: 'pendiente',
    costXP: 5000,
    triggerType: 'trimestral',
    category: 'Finanzas'
  }
];
