import { Injectable, inject } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AppConfig } from '@fsowemimo-d8b02f8a-4412-4cf4-a953-29470923d3a8/models';
import { APP_CONFIG } from './tokens';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    const config = inject(APP_CONFIG);
    this.supabase = createClient(
      config.supabase.url,
      config.supabase.key,
    );
  }

  get client() {
    return this.supabase;
  }

  get auth(): any {
    return this.supabase.auth;
  }
}