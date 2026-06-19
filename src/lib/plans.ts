export const PLANS = {
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 20000,
    features: [
      'Hasta 50 productos',
      'Hasta 3 usuarios',
      'Escaneo de códigos de barras',
      'Dashboard básico',
    ],
  },
  business: {
    id: 'business',
    name: 'Business',
    price: 50000,
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
    price: 90000,
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
