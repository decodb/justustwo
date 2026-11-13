import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private readonly client: SupabaseClient = createClient(
    environment.supabaseUrl,
    environment.supabaseKey,
  );

  async verifyAccessCode(code: string): Promise<boolean> {
    const { data, error } = await this.client.rpc('verify_access_code', {
      input_code: code,
    });
    if (error) throw error;
    return data === true;
  }

  async submitResponse(answer: 'yes' | 'no'): Promise<void> {
    const { error } = await this.client.functions.invoke('submit-response', {
      body: { answer },
    });
    if (error) throw error;
  }
}