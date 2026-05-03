import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseKey && supabaseKey !== 'YOUR_SUPABASE_ANON_KEY_HERE'
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// Map Postgres lowercase back to React camelCase
const toCamelKeys = (obj: any): any => {
  if (typeof obj !== 'object' || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map(toCamelKeys);
  const map: Record<string, string> = {
    patientname: 'patientName',
    patientid: 'patientId',
    doctorid: 'doctorId',
    clinicid: 'clinicId',
    senderrole: 'senderRole',
    interventionid: 'interventionId',
  };
  const newObj: any = {};
  for (const key in obj) {
    newObj[map[key] || key] = toCamelKeys(obj[key]);
  }
  return newObj;
};

// Map React camelCase to Postgres lowercase
const toLowerKeys = (obj: any): any => {
  if (typeof obj !== 'object' || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map(toLowerKeys);
  const newObj: any = {};
  for (const key in obj) {
    newObj[key.toLowerCase()] = toLowerKeys(obj[key]);
  }
  return newObj;
};

export const api = {
  get: async <T>(endpoint: string): Promise<T> => {
    if (!supabase) throw new Error("Supabase is not configured yet. Add keys to .env");
    
    const [path, queryString] = endpoint.split('?');
    // Postgres tables are lowercase
    const table = path.replace('/', '').toLowerCase();
    
    let query = supabase.from(table).select('*');
    
    if (queryString) {
      const params = new URLSearchParams(queryString);
      params.forEach((value, key) => {
        // Query params must also be lowercased to match Postgres columns
        query = query.eq(key.toLowerCase(), value);
      });
    }

    const { data, error } = await query;
    if (error) throw error;
    return toCamelKeys(data) as T;
  },

  post: async <T>(endpoint: string, payload: any): Promise<T> => {
    if (!supabase) throw new Error("Supabase is not configured yet.");
    
    const table = endpoint.replace('/', '').toLowerCase();
    const { data, error } = await supabase.from(table).insert(toLowerKeys(payload)).select();
    if (error) throw error;
    return toCamelKeys(data[0]) as T;
  },

  put: async <T>(endpoint: string, payload: any): Promise<T> => {
    if (!supabase) throw new Error("Supabase is not configured yet.");
    
    const parts = endpoint.split('/');
    const table = parts[1].toLowerCase();
    const id = parts[2];
    
    const { data, error } = await supabase.from(table).update(toLowerKeys(payload)).eq('id', id).select();
    if (error) throw error;
    return toCamelKeys(data[0]) as T;
  },

  patch: async <T>(endpoint: string, payload: any): Promise<T> => {
    if (!supabase) throw new Error("Supabase is not configured yet.");
    
    const parts = endpoint.split('/');
    const table = parts[1].toLowerCase();
    const id = parts[2];
    
    const { data, error } = await supabase.from(table).update(toLowerKeys(payload)).eq('id', id).select();
    if (error) throw error;
    return toCamelKeys(data[0]) as T;
  },

  delete: async <T>(endpoint: string): Promise<T> => {
    if (!supabase) throw new Error("Supabase is not configured yet.");
    
    const parts = endpoint.split('/');
    const table = parts[1].toLowerCase();
    const id = parts[2];
    
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) throw error;
    return {} as T;
  }
};
