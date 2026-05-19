const NOWPAYMENTS_API_URL = 'https://api.nowpayments.io/v1';

export class NOWPaymentsAPI {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.NOWPAYMENTS_API_KEY || '';
    if (!this.apiKey) {
      console.warn('NOWPAYMENTS_API_KEY is not set in environment variables.');
    }
  }

  private async fetchAPI(endpoint: string, options: RequestInit = {}) {
    const url = `${NOWPAYMENTS_API_URL}${endpoint}`;
    const headers = {
      'x-api-key': this.apiKey,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('NOWPayments API Error:', response.status, errorData);
      throw new Error(`NOWPayments Error: ${response.statusText} - ${JSON.stringify(errorData)}`);
    }

    return response.json();
  }

  /**
   * Creates a sub-partner account (unique wallet/ledger) for a user.
   * @param name The name or ID of the sub-account (e.g., the user's ID)
   */
  async createSubAccount(name: string): Promise<{ id: string; name: string }> {
    return this.fetchAPI('/sub-partner/balance', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  /**
   * Retrieves the balance of a specific sub-partner.
   * @param subPartnerId The ID of the sub-partner returned during creation
   */
  async getSubAccountBalance(subPartnerId: string) {
    return this.fetchAPI(`/sub-partner/balance/${subPartnerId}`);
  }
}

export const nowPayments = new NOWPaymentsAPI();
