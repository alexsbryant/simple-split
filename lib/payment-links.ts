/**
 * Payment app deep link utilities
 *
 * Generates links to launch Venmo and PayPal with prefilled amounts.
 * No API keys or backend processing - just opens payment apps.
 */

import { isMobileDevice } from './device'

/**
 * Generate a Venmo payment link
 *
 * On mobile: Opens Venmo app with amount prefilled
 * On desktop: Opens Venmo website (no prefill possible)
 *
 * Note: Venmo only supports USD
 */
export function getVenmoLink(amount: number, note?: string): string {
  if (isMobileDevice()) {
    const params = new URLSearchParams({
      txn: 'pay',
      amount: amount.toFixed(2),
    })
    if (note) {
      params.set('note', note)
    }
    return `venmo://paycharge?${params.toString()}`
  }

  // Desktop fallback - just open Venmo (no prefill available)
  return 'https://venmo.com/'
}

/**
 * Generate a PayPal payment link
 *
 * Works on both mobile and desktop - opens PayPal send money page
 * with amount prefilled. User enters recipient in PayPal.
 */
export function getPayPalLink(amount: number, currency: string): string {
  const params = new URLSearchParams({
    amount: amount.toFixed(2),
    currencyCode: currency,
  })
  return `https://www.paypal.com/myaccount/transfer/send?${params.toString()}`
}

/**
 * Open a payment link
 *
 * On mobile: Attempts to open app via deep link
 * On desktop: Opens in new tab
 */
export function openPaymentLink(url: string): void {
  window.open(url, '_blank', 'noopener,noreferrer')
}
