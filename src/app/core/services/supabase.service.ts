import { Injectable } from '@angular/core';
import { createClient, FunctionsFetchError, SupabaseClient } from '@supabase/supabase-js';
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

  async submitResponse(answer: 'yes' | 'no'): Promise<'yes' | 'no'> {
    const { data, error } = await this.client.functions.invoke('submit-response', {
      body: { answer },
    });
    if (error) {
      if (error instanceof FunctionsFetchError) {
        console.error('function said:', await error.context.json());
      }
      throw error;
    }
    // If she had already answered, the server returns the answer on record
    return data?.answer === 'yes' || data?.answer === 'no' ? data.answer : answer;
  }

  /** Her recorded answer, or null if she hasn't answered yet */
  async getResponse(): Promise<'yes' | 'no' | null> {
    const { data, error } = await this.client.rpc('get_proposal_response');
    if (error) throw error;
    return data === 'yes' || data === 'no' ? data : null;
  }
}