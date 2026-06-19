import { MercadoPagoConfig, PreApproval } from 'mercadopago';

let _client: MercadoPagoConfig | null = null;

function getClient(): MercadoPagoConfig {
  if (_client) return _client;

  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) {
    throw new Error(
      'MercadoPago access token is required. Ensure MERCADOPAGO_ACCESS_TOKEN is set in your environment variables.'
    );
  }

  _client = new MercadoPagoConfig({ accessToken: token });
  return _client;
}

export function createPreApproval(body: {
  payer_email: string;
  reason: string;
  back_url: string;
  external_reference: string;
  auto_recurring: {
    frequency: number;
    frequency_type: 'months';
    transaction_amount: number;
    currency_id: string;
  };
}) {
  const preApproval = new PreApproval(getClient());
  return preApproval.create({ body });
}

export function getPreApprovalById(id: string) {
  const preApproval = new PreApproval(getClient());
  return preApproval.get({ id });
}

export function cancelPreApproval(id: string) {
  const preApproval = new PreApproval(getClient());
  return preApproval.update({ id, body: { status: 'cancelled' } });
}
