import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// If the environment variables are missing, this will be null and the wrapper will throw
export const supabase = supabaseUrl && supabaseKey && supabaseKey !== 'YOUR_SUPABASE_ANON_KEY_HERE'
  ? createClient(supabaseUrl, supabaseKey)
  : null;

/**
 * Supabase API Wrapper
 * This completely mimics your existing fetch() behavior so that you 
 * DO NOT have to change a single line of code in your React components!
 * Example: api.get('/interventions') -> supabase.from('interventions').select('*')
 */
export const api = {
  get: async <T>(endpoint: string): Promise<T> => {
    if (!supabase) throw new Error("Supabase is not configured yet. Add keys to .env");
    
    // Parse the endpoint for query parameters
    // E.g., '/users?username=admin&password=123'
    const [path, queryString] = endpoint.split('?');
    const table = path.replace('/', '');
    
    let query = supabase.from(table).select('*');
    
    if (queryString) {
      const params = new URLSearchParams(queryString);
      params.forEach((value, key) => {
        query = query.eq(key, value);
      });
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as T;
  },

  post: async <T>(endpoint: string, payload: any): Promise<T> => {
    if (!supabase) throw new Error("Supabase is not configured yet.");
    
    const table = endpoint.replace('/', '');
    // Insert and select the created row
    const { data, error } = await supabase.from(table).insert(payload).select();
    if (error) throw error;
    return data[0] as T;
  },

  put: async <T>(endpoint: string, payload: any): Promise<T> => {
    if (!supabase) throw new Error("Supabase is not configured yet.");
    
    // Put usually implies a full replacement, but Supabase uses update.
    const parts = endpoint.split('/'); // ['', 'interventions', '1']
    const table = parts[1];
    const id = parts[2];
    
    const { data, error } = await supabase.from(table).update(payload).eq('id', id).select();
    if (error) throw error;
    return data[0] as T;
  },

  patch: async <T>(endpoint: string, payload: any): Promise<T> => {
    if (!supabase) throw new Error("Supabase is not configured yet.");
    
    const parts = endpoint.split('/');
    const table = parts[1];
    const id = parts[2];
    
    const { data, error } = await supabase.from(table).update(payload).eq('id', id).select();
    if (error) throw error;
    return data[0] as T;
  },

  delete: async <T>(endpoint: string): Promise<T> => {
    if (!supabase) throw new Error("Supabase is not configured yet.");
    
    const parts = endpoint.split('/');
    const table = parts[1];
    const id = parts[2];
    
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) throw error;
    
    return {} as T;
  }
};
