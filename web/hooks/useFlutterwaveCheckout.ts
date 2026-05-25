'use client';

import { useEffect, useCallback } from 'react';

// Extend the Window interface to include FlutterwaveCheckout
declare global {
  interface Window {
    FlutterwaveCheckout: (options: FlutterwaveOptions) => { close: () => void };
  }
}

interface FlutterwaveOptions {
  public_key: string;
  tx_ref: string;
  amount: number;
  currency: string;
  customer: {
    email: string;
    name: string;
    phone_number?: string;
  };
  meta?: Record<string, unknown>;
  payment_options?: string;
  customizations?: {
    title?: string;
    description?: string;
    logo?: string;
  };
  callback: (payment: FlutterwavePaymentData) => void;
  onclose: (incomplete: boolean) => void;
}

export interface FlutterwavePaymentData {
  amount: number;
  currency: string;
  customer: { name: string; email: string; phone_number: string };
  flw_ref: string;
  status: string;
  tx_ref: string;
  transaction_id: number;
}

interface UseFlutterwaveCheckoutProps {
  onSuccess: (payment: FlutterwavePaymentData) => void;
  onCancel: () => void;
  onError?: (error: string) => void;
}

const SCRIPT_ID = 'flutterwave-v3-script';

export function useFlutterwaveCheckout({ onSuccess, onCancel, onError }: UseFlutterwaveCheckoutProps) {
  // Load the Flutterwave script once on mount
  useEffect(() => {
    if (document.getElementById(SCRIPT_ID)) return;

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = 'https://checkout.flutterwave.com/v3.js';
    script.async = true;
    document.body.appendChild(script);

    // Keep the script in the DOM so that navigation doesn't force re-downloading it and causing race conditions
  }, []);

  const initiatePayment = useCallback(
    ({
      txRef,
      amount,
      currency = 'NGN',
      customerEmail,
      customerName,
      customerPhone,
      description,
      meta,
    }: {
      txRef: string;
      amount: number;
      currency?: string;
      customerEmail: string;
      customerName: string;
      customerPhone?: string;
      description?: string;
      meta?: Record<string, unknown>;
    }) => {
      if (!window.FlutterwaveCheckout) {
        const errorMsg = 'Flutterwave script not loaded yet or blocked by your browser/adblocker. Please wait a moment, disable ad-blockers, and try again.';
        console.error(errorMsg);
        if (onError) {
          onError(errorMsg);
        }
        return;
      }

      const publicKey = process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY || '';
      if (!publicKey) {
        const errorMsg = 'Flutterwave public key (NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY) is not configured in the application environment.';
        console.error(errorMsg);
        if (onError) {
          onError(errorMsg);
        }
        return;
      }

      const modal = window.FlutterwaveCheckout({
        public_key: publicKey,
        tx_ref: txRef,
        amount,
        currency,
        payment_options: 'card,ussd,banktransfer',
        customer: {
          email: customerEmail,
          name: customerName,
          phone_number: customerPhone,
        },
        meta,
        customizations: {
          title: 'Kyvatron',
          description: description || 'Bill Payment',
          logo: '/logo.png',
        },
        callback: (payment: FlutterwavePaymentData) => {
          modal.close();
          const transactionId = payment.transaction_id || (payment as any).id;
          const txRef = payment.tx_ref || (payment as any).txRef;

          // Always verify server-side before crediting user
          fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transaction_id: transactionId, tx_ref: txRef }),
          })
            .then((res) => res.json())
            .then((data) => {
              if (data.success) {
                onSuccess({
                  ...payment,
                  transaction_id: transactionId,
                  tx_ref: txRef
                });
              } else {
                console.error('Payment verification failed:', data.error);
                if (onError) {
                  onError(`Payment verification failed: ${data.error || 'Unknown error'}`);
                }
              }
            })
            .catch((err) => {
              console.error('Verification request failed:', err);
              if (onError) {
                onError('Failed to verify payment with server. Please contact support.');
              }
            });
        },
        onclose: (incomplete: boolean) => {
          if (incomplete) {
            onCancel();
          }
        },
      });
    },
    [onSuccess, onCancel, onError]
  );

  return { initiatePayment };
}
