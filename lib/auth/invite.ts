import { createServerClient } from '../supabase/server';

export async function validateInviteToken(token: string): Promise<{
  valid: boolean;
  data?: { pond_id: string; link_type: string; id: string };
  error?: string;
}> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('guardian_links')
    .select('id, pond_id, link_type, is_used, expires_at')
    .eq('token', token)
    .single();

  if (error || !data) {
    return { valid: false, error: 'Link not found' };
  }

  if (data.is_used) {
    return { valid: false, error: 'This link has already been used' };
  }

  if (new Date(data.expires_at) < new Date()) {
    return { valid: false, error: 'This link has expired' };
  }

  return { valid: true, data: { pond_id: data.pond_id, link_type: data.link_type, id: data.id } };
}

export async function markInviteTokenUsed(id: string): Promise<void> {
  const supabase = createServerClient();
  await supabase.from('guardian_links').update({ is_used: true }).eq('id', id);
}
