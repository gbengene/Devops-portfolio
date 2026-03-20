'use client';
import { useState } from 'react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle'|'sending'|'sent'|'error'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setStatus(res.ok ? 'sent' : 'error');
    } catch {
      setStatus('error');
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-xl mx-auto px-6 pt-24 pb-20">
        <h1 className="text-3xl font-bold mb-2">Get in touch</h1>
        <p className="text-gray-400 mb-10">Open to DevOps / Platform / SRE roles.</p>
        {status === 'sent' ? (
          <p className="text-green-400">Message sent — I will get back to you soon.</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input required placeholder="Name" value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}
              className="bg-gray-900 border border-gray-700 rounded px-4 py-3 focus:outline-none focus:border-green-500" />
            <input required type="email" placeholder="Email" value={form.email}
              onChange={e => setForm({...form, email: e.target.value})}
              className="bg-gray-900 border border-gray-700 rounded px-4 py-3 focus:outline-none focus:border-green-500" />
            <textarea required rows={5} placeholder="Message" value={form.message}
              onChange={e => setForm({...form, message: e.target.value})}
              className="bg-gray-900 border border-gray-700 rounded px-4 py-3 focus:outline-none focus:border-green-500 resize-none" />
            <button type="submit" disabled={status==='sending'}
              className="bg-green-500 text-gray-950 font-medium py-3 rounded hover:bg-green-400 transition disabled:opacity-50">
              {status === 'sending' ? 'Sending...' : 'Send message'}
            </button>
            {status === 'error' && <p className="text-red-400 text-sm">Something went wrong — please try again.</p>}
          </form>
        )}
      </div>
    </main>
  );
}
