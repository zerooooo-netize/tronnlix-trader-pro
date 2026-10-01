import { useEffect, useState } from 'react';
import { FileUp, FileCheck2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { date } from '@/lib/format';

const TYPES = [['passport', 'Passport'], ['national_id', 'National ID card'], ['drivers_license', "Driver's license"], ['proof_of_address', 'Proof of address'], ['selfie', 'Selfie holding your ID']] as const;
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
type Doc = { id: string; doc_type: string; created_at: string };

export function KycUpload({ userId, locked }: { userId: string; locked: boolean }) {
  const [docs, setDocs] = useState<Doc[]>([]), [type, setType] = useState<string>('passport'), [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false), [err, setErr] = useState(''), [ok, setOk] = useState('');
  async function load() { const { data } = await supabase.from('kyc_documents').select('id,doc_type,created_at').eq('user_id', userId).order('created_at', { ascending: false }); setDocs(data ?? []); }
  useEffect(() => { load(); }, [userId]);
  async function upload() {
    setErr(''); setOk('');
    if (!file) return setErr('Choose a file first.');
    if (!ALLOWED.includes(file.type)) return setErr('Use a JPG, PNG, WEBP or PDF file.');
    if (file.size > 10 * 1024 * 1024) return setErr('That file is over 10 MB. Try a smaller photo or scan.');
    setBusy(true);
    const path = `${userId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const up = await supabase.storage.from('kyc-documents').upload(path, file, { contentType: file.type });
    if (up.error) { setBusy(false); return setErr(`Upload failed: ${up.error.message}`); }
    const { error } = await supabase.from('kyc_documents').insert({ user_id: userId, doc_type: type, file_path: path });
    setBusy(false);
    if (error) return setErr(error.message);
    setFile(null); setOk('Document uploaded. Our team will review it.'); load();
  }
  const label = (t: string) => TYPES.find(([k]) => k === t)?.[1] ?? t;
  return (
    <div className="mt-5">
      <p className="text-sm leading-7 text-muted-foreground">Upload a photo ID and a proof of address, then submit for review. Files are private and only seen by our compliance team.</p>
      {!locked && <div className="mt-4 grid gap-3">
        <select aria-label="Document type" className="field-input" value={type} onChange={(e) => setType(e.target.value)}>{TYPES.map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        <input aria-label="Document file" className="field-input" type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <Button type="button" variant="outline" className="w-fit" disabled={busy || !file} onClick={upload}><FileUp size={16} /> {busy ? 'Uploading…' : 'Upload document'}</Button>
      </div>}
      {err && <div role="alert" className="form-error mt-3">{err}</div>}{ok && <div className="form-notice mt-3">{ok}</div>}
      {docs.length > 0 && <ul className="mt-4 grid gap-2">{docs.map((d) => <li key={d.id} className="flex items-center gap-2 text-sm"><FileCheck2 size={16} className="text-primary" />{label(d.doc_type)}<span className="ml-auto text-xs text-muted-foreground">{date(d.created_at)}</span></li>)}</ul>}
    </div>
  );
}

export function KycDocsReview({ userId }: { userId: string }) {
  const [docs, setDocs] = useState<{ id: string; doc_type: string; url: string }[] | null>(null);
  useEffect(() => {
    supabase.from('kyc_documents').select('id,doc_type,file_path').eq('user_id', userId).then(async ({ data }) => {
      const out = await Promise.all((data ?? []).map(async (d) => { const { data: s } = await supabase.storage.from('kyc-documents').createSignedUrl(d.file_path, 600); return { id: d.id, doc_type: d.doc_type, url: s?.signedUrl ?? '' }; }));
      setDocs(out);
    });
  }, [userId]);
  if (!docs) return <p className="mt-2 text-xs text-muted-foreground">Loading documents…</p>;
  if (!docs.length) return <p className="mt-2 text-xs text-destructive">No documents uploaded.</p>;
  return <div className="mt-2 flex flex-wrap gap-2">{docs.map((d) => <a key={d.id} href={d.url} target="_blank" rel="noreferrer" className="rounded border border-border px-2 py-1 text-xs hover:border-primary">{TYPES.find(([k]) => k === d.doc_type)?.[1] ?? d.doc_type}</a>)}</div>;
}
