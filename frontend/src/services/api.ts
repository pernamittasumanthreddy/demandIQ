const API_BASE = '/api/v1';

export class ApiClient {
  private static businessId: string | null = localStorage.getItem('demandiq_active_business_id');

  public static setActiveBusiness(id: string) {
    this.businessId = id;
    localStorage.setItem('demandiq_active_business_id', id);
  }

  public static getActiveBusiness(): string | null {
    return this.businessId || localStorage.getItem('demandiq_active_business_id');
  }

  private static getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    const bId = this.getActiveBusiness();
    if (bId) {
      headers['X-Business-ID'] = bId;
    }
    return headers;
  }

  public static async get<T>(endpoint: string): Promise<T> {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'same-origin',
    });
    if (!res.ok) {
      throw new Error(`API error ${res.status}: ${res.statusText}`);
    }
    return res.json();
  }

  public static async post<T>(endpoint: string, body?: any): Promise<T> {
    const isFormData = body instanceof FormData;
    const headers = isFormData ? {} : this.getHeaders();
    if (isFormData) {
      const bId = this.getActiveBusiness();
      if (bId) (headers as any)['X-Business-ID'] = bId;
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers,
      body: isFormData ? body : JSON.stringify(body),
      credentials: 'same-origin',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || `Request failed with status ${res.status}`);
    }
    return res.json();
  }

  public static async patch<T>(endpoint: string, body?: any): Promise<T> {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
      credentials: 'same-origin',
    });
    if (!res.ok) {
      throw new Error(`Request failed with status ${res.status}`);
    }
    return res.json();
  }

  public static async delete(endpoint: string): Promise<void> {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
      credentials: 'same-origin',
    });
    if (!res.ok) {
      throw new Error(`Delete failed: ${res.status}`);
    }
  }
}
