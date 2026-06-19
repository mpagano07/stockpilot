export const PLANS = {
  free: {
    id: 'free',
    name: 'Gratuito',
    price: 0,
    priceId: null,
    features: [
      'Hasta 50 productos',
      'Hasta 3 usuarios',
      'Escaneo de códigos de barras',
      'Dashboard básico',
    ],
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 1500,
    priceId: null,
    features: [
      'Hasta 500 productos',
      'Hasta 10 usuarios',
      'Asistente IA',
      'Pronóstico de demanda',
      'Antipérdidas',
    ],
  },
  business: {
    id: 'business',
    name: 'Business',
    price: 4900,
    priceId: null,
    features: [
      'Productos ilimitados',
      'Usuarios ilimitados',
      'Visión de góndolas',
      'CRM avanzado',
      'API pública',
      'Soporte prioritario',
    ],
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 0,
    priceId: null,
    features: [
      'Todo lo de Business',
      'On-premise option',
      'Soporte dedicado 24/7',
      'Custom integrations',
      'SLA garantizado',
    ],
  },
} as const;

export type PlanId = keyof typeof PLANS;
