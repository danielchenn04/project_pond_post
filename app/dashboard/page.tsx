'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import NavBar from '@/components/NavBar';
import EnvelopeIcon from '@/components/EnvelopeIcon';
import { supabaseClient } from '@/lib/supabase/client';

interface UserInfo {
  id: string;
  pondNymName: string;
  pondNymIcon: string;
  activePondId: string;
  role: string;
}

interface Pond {
  id: string;
  name: string;
  unread: number;
}

interface Message {
  id: string;
  encrypted_body: string;
  status: string;
  created_at: string;
  user_pond_mapping?: {
    users?: { pond_nym_name: string; pond_nym_icon: string };
  };
}

interface SentMessage {
  id: string;
  created_at: string;
  reactions: { reaction_text: string }[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [ponds, setPonds] = useState<Pond[]>([]);
  const [activePondName, setActivePondName] = useState('My Pond');
  const [sentCount, setSentCount] = useState(0);
  const [inboxCount, setInboxCount] = useState(0);
  const [recentMessages, setRecentMessages] = useState<Message[]>([]);
  const [sentMessages, setSentMessages] = useState<SentMessage[]>([]);
  const [envelopeState, setEnvelopeState] = useState<'idle' | 'new-mail'>('idle');
  const [totalUnread, setTotalUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const meRes = await fetch('/api/users/me');
    if (!meRes.ok) { router.push('/login'); return; }
    const me = await meRes.json();
    setUser(me);

    const pondsRes = await fetch('/api/users/me/ponds');
    const pondsData = await pondsRes.json();
    setPonds(pondsData.ponds || []);
    const total = (pondsData.ponds || []).reduce((s: number, p: Pond) => s + p.unread, 0);
    setTotalUnread(total);
    const active = pondsData.ponds?.find((p: Pond) => p.id === me.activePondId);
    if (active) setActivePondName(active.name);

    if (me.activePondId) {
      const inboxRes = await fetch('/api/messages/inbox?filter=all');
      const inboxData = await inboxRes.json();
      const msgs: Message[] = inboxData.messages || [];
      setInboxCount(msgs.length);
      setRecentMessages(msgs.slice(0, 3));

      const unread = msgs.filter((m: Message) => m.status === 'Floating').length;
      setTotalUnread(unread + (pondsData.ponds || [])
        .filter((p: Pond) => p.id !== me.activePondId)
        .reduce((s: number, p: Pond) => s + p.unread, 0));

      const sentRes = await fetch('/api/messages/sent');
      const sentData = await sentRes.json();
      const sent: SentMessage[] = sentData.messages || [];
      setSentMessages(sent);
      setSentCount(sent.length);
    }

    setLoading(false);
  }, [router]);

  useEffect(() => { loadData(); }, [loadData]);

  // Real-time inbox subscription
  useEffect(() => {
    if (!user?.activePondId) return;
    const channel = supabaseClient
      .channel('inbox')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `recipient_user_id=eq.${user.id}`,
      }, () => {
        setEnvelopeState('new-mail');
        setTimeout(() => setEnvelopeState('idle'), 1000);
        loadData();
      })
      .subscribe();
    return () => { supabaseClient.removeChannel(channel); };
  }, [user, loadData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAFAFA' }}>
        <div className="envelope-idle text-4xl" style={{ color: '#D4A373' }}>✉</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAFA' }}>
      <NavBar
        userAlias={user?.pondNymName}
        userEmoji={user?.pondNymIcon}
        activePondId={user?.activePondId}
        activePondName={activePondName}
        ponds={ponds}
        totalUnread={totalUnread}
        role={user?.role}
      />

      <main className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="font-playfair text-4xl font-bold mb-1" style={{ color: '#283618' }}>Your Pond</h1>
        <p className="font-lato text-base mb-8" style={{ color: '#606C38' }}>{activePondName}</p>

        {/* Stats cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="rounded-xl p-6 text-center" style={{ backgroundColor: '#FCF9F2', border: '1px solid #A2D2FF' }}>
            <div className="font-lato font-bold text-4xl" style={{ color: '#283618' }}>{sentCount}</div>
            <div className="font-lato text-sm mt-1" style={{ color: '#4A5568' }}>Messages Sent into the Pond</div>
          </div>
          <div className="rounded-xl p-6 text-center" style={{ backgroundColor: '#FCF9F2', border: '1px solid #A2D2FF' }}>
            <div className="font-lato font-bold text-4xl" style={{ color: '#283618' }}>{inboxCount}</div>
            <div className="font-lato text-sm mt-1" style={{ color: '#4A5568' }}>Messages in Your Nest</div>
          </div>
        </div>

        {/* Send button */}
        <div className="flex justify-center mb-10">
          <Link href="/compose"
            className="btn-primary font-lato font-semibold text-white px-10 py-3 rounded-lg text-base"
            style={{ backgroundColor: '#606C38' }}>
            Send a Message
          </Link>
        </div>

        {/* Recent messages */}
        <h2 className="font-lato font-semibold text-lg mb-4" style={{ color: '#606C38' }}>Recent Messages</h2>

        {recentMessages.length === 0 ? (
          <div className="rounded-xl p-8 text-center" style={{ backgroundColor: '#FCF9F2', border: '1px solid #D4A373' }}>
            <div className="envelope-sway text-3xl mb-3" style={{ color: '#D4A373' }}>✉</div>
            <p className="font-lato text-sm" style={{ color: '#4A5568' }}>
              Your Nest is empty. The Pond awaits your first message.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {recentMessages.map((msg) => {
              const nym = (msg.user_pond_mapping as any)?.users;
              const isUnread = msg.status === 'Floating';
              return (
                <Link key={msg.id} href={`/nest?open=${msg.id}`}
                  className="card-hover flex items-center gap-3 p-4 rounded-xl cursor-pointer"
                  style={{
                    backgroundColor: '#FAFAFA',
                    border: '1px solid #D4A373',
                    borderLeft: `4px solid ${isUnread ? '#BC6C25' : '#BDE0FE'}`,
                  }}>
                  <span className="text-xl">{nym?.pond_nym_icon || '✉'}</span>
                  <div className="flex-1 min-w-0">
                    <span className="font-lato font-bold text-sm text-slate-dark">
                      {nym?.pond_nym_name || 'Someone'}
                    </span>
                    <span className="font-lato text-xs text-guardian-slate ml-2">
                      {new Date(msg.created_at).toLocaleDateString()}
                    </span>
                    <p className="font-lato text-sm text-guardian-slate truncate mt-0.5">
                      {isUnread ? '(Unread message)' : '(Read message)'}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Ripples sent */}
        <h2 className="font-lato font-semibold text-lg mb-4 mt-10" style={{ color: '#606C38' }}>Ripples You Sent</h2>

        {sentMessages.length === 0 ? (
          <div className="rounded-xl p-8 text-center" style={{ backgroundColor: '#FCF9F2', border: '1px solid #D4A373' }}>
            <p className="font-lato text-sm" style={{ color: '#4A5568' }}>
              You haven&apos;t sent any Ripples yet.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {sentMessages.map((msg) => {
              const reaction = msg.reactions?.[0];
              return (
                <div key={msg.id} className="flex items-center gap-3 p-4 rounded-xl"
                  style={{ backgroundColor: '#FAFAFA', border: '1px solid #D4A373' }}>
                  <span className="text-xl">✉</span>
                  <div className="flex-1 min-w-0">
                    <span className="font-lato text-xs" style={{ color: '#4A5568' }}>
                      {new Date(msg.created_at).toLocaleDateString()}
                    </span>
                    {reaction ? (
                      <p className="font-lato text-sm font-semibold mt-0.5" style={{ color: '#606C38' }}>
                        ✦ {reaction.reaction_text}
                      </p>
                    ) : (
                      <p className="font-lato text-sm mt-0.5" style={{ color: '#A0AEC0' }}>
                        No reaction yet
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Floating envelope */}
      <div className="fixed bottom-6 right-6">
        <EnvelopeIcon
          state={envelopeState}
          size={40}
          badge={totalUnread}
          onClick={() => router.push('/nest')}
        />
      </div>
    </div>
  );
}
