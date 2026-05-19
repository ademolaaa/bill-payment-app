const FLUTTERWAVE_API_URL = 'https://api.flutterwave.com/v3';

export class FlutterwaveAPI {
  private secretKey: string;

  constructor() {
    this.secretKey = process.env.FLUTTERWAVE_SECRET_KEY || '';
    if (!this.secretKey) {
      console.warn('FLUTTERWAVE_SECRET_KEY is not set in environment variables.');
    }
  }

  private async fetchAPI(endpoint: string, options: RequestInit = {}) {
    const url = `${FLUTTERWAVE_API_URL}${endpoint}`;
    const headers = {
      Authorization: `Bearer ${this.secretKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Flutterwave API Error:', response.status, errorData);
      throw new Error(`Flutterwave Error: ${response.statusText} - ${JSON.stringify(errorData)}`);
    }

    return response.json();
  }

  /**
   * Fetches available bill categories (e.g. Airtime, Data, Utilities)
   */
  async getBillCategories() {
    return this.fetchAPI('/bill-categories');
  }

  /**
   * Validates a customer's information before paying a bill (e.g., meter number, phone number)
   * @param itemCode The specific biller item code
   * @param code The biller code
   * @param customer The customer identifier (phone number, meter number)
   */
  async validateBillService(itemCode: string, code: string, customer: string) {
    return this.fetchAPI(`/bill-items/${itemCode}/validate?code=${code}&customer=${customer}`);
  }

  /**
   * Creates a bill payment
   * Note: With Inline checkout, this is typically handled by the frontend widget.
   * However, this can be used if processing bills purely backend-to-backend.
   */
  async createBillPayment(data: any) {
    return this.fetchAPI('/bills', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Verifies a transaction by its ID (used in webhooks)
   * @param transactionId The transaction ID from Flutterwave
   */
  async verifyTransaction(transactionId: string) {
    return this.fetchAPI(`/transactions/${transactionId}/verify`);
  }
}

export const flutterwave = new FlutterwaveAPI();
