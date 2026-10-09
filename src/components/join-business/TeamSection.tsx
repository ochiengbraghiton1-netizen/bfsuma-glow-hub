import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TeamProfile {
  id: string;
  name: string;
  role: string;
  photo_url: string | null;
  bio: string | null;
  display_order: number;
  is_active: boolean;
  profile_group: 'leadership' | 'champion';
}

const initials = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('');

const TeamSection = ({ group = 'leadership' }: { group?: 'leadership' | 'champion' }) => {
  const [profiles, setProfiles] = useState<TeamProfile[]>([]);

  useEffect(() => {
    (supabase as any)
      .from('team_profiles')
      .select('id,name,role,photo_url,bio,display_order,is_active,profile_group')
      .eq('is_active', true)
      .eq('profile_group', group)
      .order('display_order', { ascending: true })
      .then(({ data }: { data: TeamProfile[] | null }) => setProfiles(data || []));
  }, [group]);

  if (!profiles.length) return null;

  const cols = profiles.length === 1 ? 'sm:grid-cols-1 max-w-sm' : profiles.length === 2 ? 'sm:grid-cols-2 max-w-3xl' : 'sm:grid-cols-2 lg:grid-cols-3 max-w-5xl';

  return (
    <div className={`grid grid-cols-1 ${cols} mx-auto gap-x-6 gap-y-20 pt-24`}>
      {profiles.map((p) => (
        <article key={p.id} className="relative rounded-2xl bg-card border border-border shadow-sm px-6 pt-20 pb-6 text-center">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 h-28 w-28 rounded-full border-4 border-background bg-muted shadow-md overflow-hidden flex items-center justify-center">
            {p.photo_url ? (
              <img src={p.photo_url} alt={`${p.name}, ${p.role}`} loading="lazy" decoding="async" width={112} height={112} className="h-full w-full object-cover" />
            ) : (
              <span className="text-3xl font-semibold text-muted-foreground" aria-hidden="true">{initials(p.name)}</span>
            )}
          </div>
          <h3 className="text-lg font-semibold text-foreground">{p.name}</h3>
          <p className="text-sm text-primary mt-1">{p.role}</p>
          {p.bio && <p className="text-sm text-muted-foreground mt-3">{p.bio}</p>}
        </article>
      ))}
    </div>
  );
};

export default TeamSection;
