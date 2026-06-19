import Stripe from 'stripe';
import { PLANS } from './plans';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

export { PLANS };
