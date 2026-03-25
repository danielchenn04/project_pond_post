'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/NavBar';
import Modal from '@/components/Modal';
import Toast from '@/components/Toast';

interface Member {
  userId: string;
  pondNymName: string;
  pondNymIcon: string;
  role: string;
  isBanned: boolean;
}

interface AuditEntry {
  id: string;
  action: string;
  actor_role: string;
  actorNym: string;
  actorIcon: string;
  target_id: string | null;
  succeeded: boolean;
  created_at: string;
}

interface UserInfo {
  id: string;
  pondNymName: string;
  pondNymIcon: string;
  activePondId: string;
  role: string;
}

interface PondInfo {
  id: string;
  name: string;
  join_code: string;
}

type AdminSection = 'overview' | 'members' | 'audit' | 'danger';

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [pond, setPond] = useState<PondInfo | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
  const [auditPage, setAuditPage] = useState(1);
  const [auditTotal, setAuditTotal] = useState(0);
  const [section, setSection] = useState<AdminSection>('overview');
  const [toast, setToast] = useState<{ msg: string; type?: 'success' | 'error' } | null>(null);
  const [guardianLink, setGuardianLink] = useState('');
  const [keeperLink, setKeeperLink] = useState('');
  const [confirmAction, setConfirmAction] = useState<{ type: string; targetId?: string; label?: string } | null>(null);
  const [acting, setActing] = useState(false);
  const [renamingPond, setRenamingPond] = useState(false);
  const [newPondName, setNewPondName] = useState('');

  const loadData = useCallback(async () => {
    const meRes = await fetch('/api/users/me');
    if (!meRes.ok) { router.push('/login'); return; }
    const me = await meRes.json();
    if (me.role !== 'Keeper') { router.push('/dashboard'); return; }
    setUser(me);

    // Load pond info (including real join_code) and members
    if (me.activePondId) {
      const [pondRes, dirRes] = await Promise.all([
        fetch(`/api/ponds/${me.activePondId}`),
        fetch(`/api/ponds/${me.activePondId}/directory`),
      ]);
      const pondData = await pondRes.json();
      if (pondData.pond) setPond(pondData.pond);

      const dirData = await dirRes.json();
      setMembers(dirData.directory?.map((m: { userId: string; pondNymName: string; pondNymIcon: string; role?: string }) => ({
        userId: m.userId,
        pondNymName: m.pondNymName,
        pondNymIcon: m.pondNymIcon,
        role: (m as any).role || 'Inhabitant',
        isBanned: false,
      })) || []);
    }
  }, [router]);

  const loadAudit = useCallback(async (page = 1) => {
    const res = await fetch(`/api/audit-log?page=${page}`);
    if (!res.ok) return;
    const data = await res.json();
    setAuditLogs(data.logs || []);
    setAuditTotal(data.total || 0);
    setAuditPage(page);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { if (section === 'audit') loadAudit(1); }, [section, loadAudit]);

  async function generateGuardianLink() {
    if (!user?.activePondId) return;
    const res = await fetch(`/api/ponds/${user.activePondId}/guardian-link`, { method: 'POST' });
    const data = await res.json();
    setGuardianLink(data.link || '');
    await navigator.clipboard.writeText(data.link || '');
    setToast({ msg: 'Guardian link copied to clipboard!' });
  }

  async function generateKeeperLink() {
    if (!user?.activePondId) return;
    const res = await fetch(`/api/ponds/${user.activePondId}/keeper-link`, { method: 'POST' });
    const data = await res.json();
    setKeeperLink(data.link || '');
    await navigator.clipboard.writeText(data.link || '');
    setToast({ msg: 'Keeper link copied to clipboard!' });
  }

  async function resetJoinCode() {
    if (!user?.activePondId) return;
    setActing(true);
    const res = await fetch(`/api/ponds/${user.activePondId}/reset-join-code`, { method: 'POST' });
    const data = await res.json();
    setActing(false);
    setConfirmAction(null);
    if (res.ok) {
      setPond(p => p ? { ...p, join_code: data.joinCode } : p);
      setToast({ msg: 'Join Code reset. Previous code is now invalid.' });
    }
  }

  async function banMember(userId: string) {
    setActing(true);
    await fetch(`/api/users/${userId}/ban`, { method: 'PATCH' });
    setActing(false);
    setConfirmAction(null);
    setToast({ msg: 'Member banned.' });
    setMembers(prev => prev.map(m => m.userId === userId ? { ...m, isBanned: true } : m));
  }

  async function promoteMember(userId: string, role: 'Guardian' | 'Keeper') {
    setActing(true);
    const res = await fetch(`/api/users/${userId}/promote`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    setActing(false);
    setConfirmAction(null);
    if (res.ok) {
      setToast({ msg: `Member promoted to ${role}.` });
      setMembers(prev => prev.map(m => m.userId === userId ? { ...m, role } : m));
    } else {
      setToast({ msg: 'Promotion failed.', type: 'error' });
    }
  }

  async function renamePond(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.activePondId || !newPondName.trim()) return;
    setActing(true);
    const res = await fetch(`/api/ponds/${user.activePondId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newPondName.trim() }),
    });
    setActing(false);
    if (res.ok) {
      setPond(p => p ? { ...p, name: newPondName.trim() } : p);
      setRenamingPond(false);
      setNewPondName('');
      setToast({ msg: 'Pond name updated.' });
    } else {
      setToast({ msg: 'Failed to rename pond.', type: 'error' });
    }
  }

  async function deletePond() {
    if (!user?.activePondId) return;
    setActing(true);
    const res = await fetch(`/api/ponds/${user.activePondId}`, { method: 'DELETE' });
    setActing(false);
    setConfirmAction(null);
    if (res.ok) {
      router.push('/');
    } else {
      const data = await res.json();
      setToast({ msg: data.error || 'Could not delete pond', type: 'error' });
    }
  }

  const SECTIONS: { key: AdminSection; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'members', label: 'Members' },
    { key: 'audit', label: 'Audit Log' },
    { key: 'danger', label: 'Danger Zone' },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAFA' }}>
      <NavBar userAlias={user?.pondNymName} userEmoji={user?.pondNymIcon}
        activePondId={user?.activePondId} role={user?.role} />

      <div className="flex max-w-5xl mx-auto">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-56 min-h-screen pt-8 px-4"
          style={{ backgroundColor: '#2D3748' }}>
          <p className="font-playfair text-xl font-bold text-white mb-8">Keeper's Ledger</p>
          {SECTIONS.map(s => (
            <button key={s.key} onClick={() => setSection(s.key)}
              className="text-left py-2.5 px-3 rounded-lg font-lato text-sm mb-1 transition-colors"
              style={{
                color: section === s.key ? 'white' : '#A0AEC0',
                backgroundColor: section === s.key ? 'rgba(255,255,255,0.15)' : 'transparent',
              }}>
              {s.label}
            </button>
          ))}
        </aside>

        {/* Mobile tabs */}
        <div className="md:hidden flex gap-2 px-4 pt-4 overflow-x-auto w-full">
          {SECTIONS.map(s => (
            <button key={s.key} onClick={() => setSection(s.key)}
              className="font-lato text-sm px-3 py-1.5 rounded-full whitespace-nowrap"
              style={{
                backgroundColor: section === s.key ? '#606C38' : '#BDE0FE',
                color: section === s.key ? 'white' : '#2D3748',
              }}>
              {s.label}
            </button>
          ))}
        </div>

        <main className="flex-1 px-6 py-8">

          {/* OVERVIEW */}
          {section === 'overview' && (
            <div>
              <h1 className="font-playfair text-3xl font-bold mb-6" style={{ color: '#283618' }}>Overview</h1>

              {/* Pond Name */}
              <div className="rounded-xl p-5 mb-5" style={{ backgroundColor: '#FAFAFA', border: '1px solid #D4A373', borderLeft: '4px solid #2D3748' }}>
                <h3 className="font-lato font-semibold text-base mb-2" style={{ color: '#2D3748' }}>Pond Name</h3>
                {renamingPond ? (
                  <form onSubmit={renamePond} className="flex gap-2">
                    <input
                      autoFocus
                      type="text"
                      value={newPondName}
                      onChange={e => setNewPondName(e.target.value)}
                      placeholder={pond?.name}
                      required
                      className="flex-1 px-3 py-1.5 font-lato text-sm rounded-lg"
                      style={{ border: '1.5px solid #A2D2FF' }}
                    />
                    <button type="submit" disabled={acting || !newPondName.trim()}
                      className="font-lato text-sm font-semibold px-4 py-1.5 rounded-lg text-white disabled:opacity-50"
                      style={{ backgroundColor: '#606C38' }}>
                      {acting ? 'Saving…' : 'Save'}
                    </button>
                    <button type="button" onClick={() => { setRenamingPond(false); setNewPondName(''); }}
                      className="font-lato text-sm px-3 py-1.5 rounded-lg"
                      style={{ color: '#4A5568', border: '1px solid #BDE0FE' }}>
                      Cancel
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="font-playfair font-bold text-lg" style={{ color: '#283618' }}>{pond?.name}</span>
                    <button onClick={() => { setNewPondName(pond?.name || ''); setRenamingPond(true); }}
                      className="font-lato text-xs px-3 py-1 rounded"
                      style={{ color: '#606C38', border: '1px solid #606C38' }}>
                      Rename
                    </button>
                  </div>
                )}
              </div>

              {/* Join Code */}
              <div className="rounded-xl p-5 mb-5" style={{ backgroundColor: '#FAFAFA', border: '1px solid #D4A373', borderLeft: '4px solid #2D3748' }}>
                <h3 className="font-lato font-semibold text-base mb-2" style={{ color: '#2D3748' }}>Join Code</h3>
                <div className="flex items-center gap-3">
                  <code className="font-mono text-sm px-3 py-2 rounded" style={{ backgroundColor: '#F0F0F0', color: '#2D3748' }}>
                    {pond?.join_code || '—'}
                  </code>
                  <button onClick={() => pond?.join_code && navigator.clipboard.writeText(pond.join_code).then(() => setToast({ msg: 'Copied!' }))}
                    className="btn-secondary px-3 py-1.5 rounded-lg font-lato text-sm"
                    style={{ backgroundColor: '#BDE0FE', color: '#2D3748' }}>
                    Copy Join Code
                  </button>
                  <button onClick={() => setConfirmAction({ type: 'resetJoin', label: 'Reset the Join Code?' })}
                    className="font-lato text-sm px-3 py-1.5 rounded-lg"
                    style={{ color: '#BC6C25', border: '1px solid #BC6C25' }}>
                    Reset
                  </button>
                </div>
              </div>

              {/* Appointment Links */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                <div className="rounded-xl p-5" style={{ backgroundColor: '#FAFAFA', border: '1px solid #D4A373', borderLeft: '4px solid #2D3748' }}>
                  <h3 className="font-lato font-semibold text-sm mb-3" style={{ color: '#2D3748' }}>Guardian Appointment</h3>
                  <button onClick={generateGuardianLink}
                    className="btn-primary w-full py-2 rounded-lg font-lato font-semibold text-white text-sm"
                    style={{ backgroundColor: '#606C38' }}>
                    Generate Guardian Link
                  </button>
                  {guardianLink && <p className="font-mono text-xs mt-2 break-all" style={{ color: '#4A5568' }}>{guardianLink}</p>}
                </div>
                <div className="rounded-xl p-5" style={{ backgroundColor: '#FAFAFA', border: '1px solid #D4A373', borderLeft: '4px solid #2D3748' }}>
                  <h3 className="font-lato font-semibold text-sm mb-3" style={{ color: '#2D3748' }}>Keeper Promotion</h3>
                  <button onClick={generateKeeperLink}
                    className="btn-primary w-full py-2 rounded-lg font-lato font-semibold text-white text-sm"
                    style={{ backgroundColor: '#606C38' }}>
                    Generate Keeper Link
                  </button>
                  {keeperLink && <p className="font-mono text-xs mt-2 break-all" style={{ color: '#4A5568' }}>{keeperLink}</p>}
                </div>
              </div>
            </div>
          )}

          {/* MEMBERS */}
          {section === 'members' && (
            <div>
              <h1 className="font-playfair text-3xl font-bold mb-6" style={{ color: '#283618' }}>Members</h1>
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #D4A373' }}>
                <table className="w-full">
                  <thead style={{ backgroundColor: '#FCF9F2' }}>
                    <tr>
                      <th className="font-lato text-xs font-semibold text-left px-4 py-3" style={{ color: '#4A5568' }}>Alias</th>
                      <th className="font-lato text-xs font-semibold text-left px-4 py-3" style={{ color: '#4A5568' }}>Role</th>
                      <th className="font-lato text-xs font-semibold text-left px-4 py-3" style={{ color: '#4A5568' }}>Status</th>
                      <th className="font-lato text-xs font-semibold text-left px-4 py-3" style={{ color: '#4A5568' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map(m => (
                      <tr key={m.userId} style={{ borderTop: '1px solid #EDF2F7' }}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span>{m.pondNymIcon}</span>
                            <span className="font-playfair font-bold text-sm" style={{ color: '#283618' }}>{m.pondNymName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-lato text-sm" style={{ color: '#4A5568' }}>{m.role}</td>
                        <td className="px-4 py-3">
                          <span className="font-lato text-xs px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: m.isBanned ? '#FED7D7' : '#C6F6D5', color: m.isBanned ? '#C53030' : '#276749' }}>
                            {m.isBanned ? 'Banned' : 'Active'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {!m.isBanned && (
                            <div className="flex gap-2 flex-wrap">
                              {m.role === 'Inhabitant' && (
                                <button onClick={() => setConfirmAction({ type: 'promote-guardian', targetId: m.userId, label: `Promote ${m.pondNymName} to Guardian?` })}
                                  className="font-lato text-xs px-3 py-1 rounded"
                                  style={{ color: '#606C38', border: '1px solid #606C38' }}>
                                  → Guardian
                                </button>
                              )}
                              {m.role !== 'Keeper' && (
                                <button onClick={() => setConfirmAction({ type: 'promote-keeper', targetId: m.userId, label: `Promote ${m.pondNymName} to Keeper?` })}
                                  className="font-lato text-xs px-3 py-1 rounded"
                                  style={{ color: '#2D3748', border: '1px solid #2D3748' }}>
                                  → Keeper
                                </button>
                              )}
                              <button onClick={() => setConfirmAction({ type: 'ban', targetId: m.userId, label: `Ban ${m.pondNymName}?` })}
                                className="font-lato text-xs px-3 py-1 rounded"
                                style={{ color: '#BC6C25', border: '1px solid #BC6C25' }}>
                                Ban
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* AUDIT LOG */}
          {section === 'audit' && (
            <div>
              <h1 className="font-playfair text-3xl font-bold mb-6" style={{ color: '#283618' }}>Audit Log</h1>
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #D4A373' }}>
                <table className="w-full">
                  <thead style={{ backgroundColor: '#FCF9F2' }}>
                    <tr>
                      <th className="font-lato text-xs font-semibold text-left px-4 py-3" style={{ color: '#4A5568' }}>Date</th>
                      <th className="font-lato text-xs font-semibold text-left px-4 py-3" style={{ color: '#4A5568' }}>Action</th>
                      <th className="font-lato text-xs font-semibold text-left px-4 py-3" style={{ color: '#4A5568' }}>Actor</th>
                      <th className="font-lato text-xs font-semibold text-left px-4 py-3" style={{ color: '#4A5568' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map(log => (
                      <tr key={log.id} style={{ borderTop: '1px solid #EDF2F7' }}>
                        <td className="px-4 py-2 font-lato text-xs" style={{ color: '#4A5568' }}>
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td className="px-4 py-2 font-mono text-xs" style={{ color: '#2D3748' }}>{log.action}</td>
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm">{log.actorIcon}</span>
                            <span className="font-lato text-xs" style={{ color: '#4A5568' }}>{log.actorNym}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          <span className="font-lato text-xs">{log.succeeded ? '✓' : '✗'}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex gap-3 mt-4">
                <button disabled={auditPage <= 1} onClick={() => loadAudit(auditPage - 1)}
                  className="font-lato text-sm px-4 py-1.5 rounded disabled:opacity-40"
                  style={{ backgroundColor: '#BDE0FE', color: '#2D3748' }}>← Prev</button>
                <span className="font-lato text-sm self-center" style={{ color: '#4A5568' }}>
                  Page {auditPage} · {auditTotal} total
                </span>
                <button disabled={auditPage * 20 >= auditTotal} onClick={() => loadAudit(auditPage + 1)}
                  className="font-lato text-sm px-4 py-1.5 rounded disabled:opacity-40"
                  style={{ backgroundColor: '#BDE0FE', color: '#2D3748' }}>Next →</button>
              </div>
            </div>
          )}

          {/* DANGER ZONE */}
          {section === 'danger' && (
            <div>
              <h1 className="font-playfair text-3xl font-bold mb-6" style={{ color: '#283618' }}>Danger Zone</h1>
              <div className="rounded-xl p-6" style={{ border: '2px solid #BC6C25' }}>
                <h3 className="font-lato font-bold text-base mb-2" style={{ color: '#BC6C25' }}>Leave the Pond</h3>
                <p className="font-lato text-sm mb-4" style={{ color: '#4A5568' }}>
                  As the sole Keeper, leaving will permanently delete this Pond and all its data. This cannot be undone.
                </p>
                <button onClick={() => setConfirmAction({ type: 'deletePond', label: 'Delete this Pond permanently?' })}
                  className="btn-destructive px-6 py-2.5 rounded-lg font-lato font-semibold text-white text-sm"
                  style={{ backgroundColor: '#BC6C25' }}>
                  Leave the Pond
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Confirm modal */}
      <Modal open={!!confirmAction} destructive={!confirmAction?.type?.startsWith('promote')} title={confirmAction?.label || 'Are you sure?'}>
        <p className="font-lato text-sm mb-6" style={{ color: '#4A5568' }}>
          {confirmAction?.type === 'deletePond'
            ? 'All messages, members, and Pond data will be permanently deleted. This cannot be reversed.'
            : confirmAction?.type?.startsWith('promote')
            ? 'Their role will be updated immediately.'
            : 'This action cannot be undone.'}
        </p>
        <div className="flex gap-3">
          <button disabled={acting}
            onClick={() => {
              if (confirmAction?.type === 'ban') banMember(confirmAction.targetId!);
              else if (confirmAction?.type === 'promote-guardian') promoteMember(confirmAction.targetId!, 'Guardian');
              else if (confirmAction?.type === 'promote-keeper') promoteMember(confirmAction.targetId!, 'Keeper');
              else if (confirmAction?.type === 'resetJoin') resetJoinCode();
              else if (confirmAction?.type === 'deletePond') deletePond();
            }}
            className="flex-1 py-2.5 rounded-lg font-lato font-semibold text-white text-sm disabled:opacity-50"
            style={{ backgroundColor: confirmAction?.type?.startsWith('promote') ? '#606C38' : '#BC6C25' }}>
            {acting ? 'Working…' : 'Confirm'}
          </button>
          <button onClick={() => setConfirmAction(null)}
            className="flex-1 py-2.5 rounded-lg font-lato font-semibold text-sm"
            style={{ color: '#4A5568', border: '1px solid #BDE0FE' }}>
            Cancel
          </button>
        </div>
      </Modal>

      {toast && <Toast message={toast.msg} type={toast.type} onDismiss={() => setToast(null)} />}
    </div>
  );
}
