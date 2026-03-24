import { supabase } from './supabase'
import type { CartItem } from '@/types'

export async function createPreference(items: CartItem[], email: string) {
  const { data, error } = await supabase.functions.invoke('create-preference', {
    body: { items, email },
  })

  if (error) throw error
  return data as { init_point: string; preference_id: string }
}
