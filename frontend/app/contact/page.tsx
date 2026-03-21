'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

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
    <div className="root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;1,700&family=IBM+Plex+Mono:wght@300;400;500&family=Crimson+Pro:wght@400;600&display=swap');

        :root {
          --cream:  #fdf8f0;
          --cream2: #f5ede0;
          --brown:  #2c2416;
          --brown2: #3d3020;
          --brown3: #4e3e2a;
          --gold:   #c9a96e;
          --gold2:  #e8c98a;
          --rust:   #8b4513;
          --muted:  #5a4a35;
          --dim:    #a89070;
          --border: #e8dece;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .root {
          min-height: 100vh;
          background: var(--cream);
          display: grid;
          grid-template-columns: 240px 1fr;
          font-family: 'Crimson Pro', Georgia, serif;
          color: var(--brown);
        }

        .sidebar {
          background: var(--brown);
          border-right: 1px solid var(--brown2);
          padding: 1.75rem 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1.1rem;
          position: sticky;
          top: 0;
          height: 100vh;
          overflow-y: auto;
        }
        .sidebar::-webkit-scrollbar { width: 2px; }
        .sidebar::-webkit-scrollbar-thumb { background: var(--brown3); border-radius: 2px; }

        .avatar {
          width: 52px; height: 52px; border-radius: 50%;
          background: var(--gold);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Playfair Display', serif;
          font-size: 17px; font-weight: 700; color: var(--brown);
        }
        .s-name { font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 700; color: #f5ede0; line-height: 1.2; margin-bottom: 2px; }
        .s-role { font-family: 'IBM Plex Mono', monospace; font-size: 8px; color: var(--gold); letter-spacing: .09em; text-transform: uppercase; }
        .open-pill {
          display: inline-flex; align-items: center; gap: 4px;
          border: 1px solid rgba(232,201,138,.4); color: var(--gold2);
          font-size: 8px; font-family: 'IBM Plex Mono', monospace;
          padding: 2px 8px; border-radius: 2px; margin-top: 5px; width: fit-content; letter-spacing: .04em;
        }
        .open-pill::before { content: ''; width: 4px; height: 4px; border-radius: 50%; background: var(--gold2); animation: glow 2s infinite; }
        @keyframes glow { 0%,100%{opacity:1} 50%{opacity:.3} }

        .divider { height: 1px; background: var(--brown3); }
        .s-label { font-family: 'IBM Plex Mono', monospace; font-size: 8px; font-weight: 500; color: var(--gold); letter-spacing: .12em; text-transform: uppercase; margin-bottom: 7px; }
        .s-contact { font-family: 'IBM Plex Mono', monospace; font-size: 9.5px; color: #d4b88a; margin-bottom: 4px; line-height: 1.4; display: flex; gap: 6px; align-items: flex-start; }
        .s-dot { width: 3px; height: 3px; border-radius: 50%; background: var(--gold2); flex-shrink: 0; margin-top: 5px; }

        .skill-bar { margin-bottom: 8px; }
        .skill-row { display: flex; justify-content: space-between; font-family: 'IBM Plex Mono', monospace; font-size: 8.5px; color: #c4a882; margin-bottom: 2px; }
        .skill-row span:last-child { color: var(--gold2); font-weight: 500; }
        .skill-track { height: 2px; background: var(--brown3); border-radius: 1px; }
        .skill-fill { height: 100%; background: var(--gold); border-radius: 1px; }

        .cert-card { background: #1e180f; border: 1px solid var(--brown3); border-radius: 2px; padding: 6px 8px; margin-bottom: 4px; }
        .cert-name { font-family: 'IBM Plex Mono', monospace; font-size: 8.5px; color: var(--gold2); line-height: 1.4; }
        .cert-iss  { font-family: 'IBM Plex Mono', monospace; font-size: 7.5px; color: #9a8060; margin-top: 1px; }

        .edu-deg    { font-family: 'IBM Plex Mono', monospace; font-size: 8.5px; color: #d4b88a; line-height: 1.4; }
        .edu-school { font-family: 'IBM Plex Mono', monospace; font-size: 7.5px; color: #9a8060; margin-top: 1px; margin-bottom: 6px; }

        /* MAIN */
        .main { background: var(--cream); display: flex; flex-direction: column; min-height: 100vh; }

        .top-nav { background: var(--brown); padding: 12px 32px; display: flex; justify-content: space-between; align-items: center; }
        .nav-links { display: flex; gap: 22px; }
        .nav-link { font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: #c4a882; text-decoration: none; letter-spacing: .04em; transition: color .15s; }
        .nav-link:hover, .nav-link.active { color: var(--gold2); }
        .nav-cta { font-family: 'IBM Plex Mono', monospace; font-size: 9px; background: var(--gold); color: var(--brown); padding: 6px 16px; border-radius: 2px; text-decoration: none; font-weight: 600; letter-spacing: .06em; }

        .contact-body {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 40px;
        }

        .contact-card {
          background: #fff;
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 40px 44px;
          width: 100%;
          max-width: 520px;
        }

        .contact-tag {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 8px; color: var(--brown); background: var(--gold2);
          padding: 3px 10px; border-radius: 2px;
          letter-spacing: .07em; margin-bottom: 14px;
          text-transform: uppercase; display: inline-block;
        }

        .contact-h1 {
          font-family: 'Playfair Display', serif;
          font-size: 32px; font-weight: 800; color: var(--brown);
          line-height: 1.1; letter-spacing: -.02em; margin-bottom: 8px;
        }
        .contact-h1 em { font-style: italic; color: var(--rust); }

        .contact-sub {
          font-size: 13px; color: var(--muted); line-height: 1.7; margin-bottom: 28px;
        }

        .field { margin-bottom: 14px; }

        .field label {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 8.5px; color: var(--dim);
          letter-spacing: .08em; text-transform: uppercase;
          display: block; margin-bottom: 5px;
        }

        .field input,
        .field textarea {
          width: 100%;
          background: var(--cream);
          border: 1px solid var(--border);
          border-radius: 3px;
          padding: 10px 14px;
          font-family: 'Crimson Pro', Georgia, serif;
          font-size: 14px;
          color: var(--brown);
          transition: border-color .15s;
          outline: none;
          resize: none;
        }

        .field input:focus,
        .field textarea:focus {
          border-color: var(--gold);
        }

        .field input::placeholder,
        .field textarea::placeholder {
          color: var(--dim);
        }

        .submit-btn {
          width: 100%;
          background: var(--brown);
          color: #fdf8f0;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          padding: 13px;
          border-radius: 3px;
          border: none;
          cursor: pointer;
          letter-spacing: .08em;
          text-transform: uppercase;
          transition: opacity .15s;
          margin-top: 4px;
        }
        .submit-btn:hover { opacity: .85; }
        .submit-btn:disabled { opacity: .5; cursor: not-allowed; }

        .msg-success {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 3px;
          padding: 14px 16px;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          color: #166534;
          text-align: center;
          margin-top: 14px;
          line-height: 1.6;
        }

        .msg-error {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px;
          color: var(--rust);
          margin-top: 10px;
          text-align: center;
        }

        .alt-contact {
          display: flex;
          gap: 16px;
          justify-content: center;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid var(--border);
        }

        .alt-link {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 9.5px;
          color: var(--dim);
          text-decoration: none;
          letter-spacing: .03em;
          transition: color .15s;
        }
        .alt-link:hover { color: var(--rust); }
      `}</style>

      {/* SIDEBAR */}
      <aside className="sidebar">
        <div>
          <div className="avatar">GJ</div>
          <div style={{ marginTop: '10px' }}>
            <div className="s-name">Gbemiga John</div>
            <div className="s-role">Senior DevOps Engineer</div>
            <div className="open-pill">Open to work</div>
          </div>
        </div>
        <div className="divider" />
        <div>
          <div className="s-label">Contact</div>
          <div className="s-contact"><span className="s-dot" />GbemigaOgele@gmail.com</div>
          <div className="s-contact"><span className="s-dot" />(647) 667-9778</div>
          <div className="s-contact"><span className="s-dot" />linkedin.com/in/john-gbemiga</div>
          <div className="s-contact"><span className="s-dot" />Toronto, ON · Canada</div>
        </div>
        <div className="divider" />
        <div>
          <div className="s-label">Core Skills</div>
          {[
            { name: 'Kubernetes', pct: 95 },
            { name: 'Terraform', pct: 92 },
            { name: 'CI/CD Pipelines', pct: 95 },
            { name: 'AWS / GCP / Azure', pct: 90 },
            { name: 'Docker', pct: 93 },
            { name: 'Ansible', pct: 85 },
            { name: 'Python / Bash', pct: 88 },
            { name: 'AI / MLOps', pct: 78 },
          ].map(s => (
            <div key={s.name} className="skill-bar">
              <div className="skill-row"><span>{s.name}</span><span>{s.pct}%</span></div>
              <div className="skill-track"><div className="skill-fill" style={{ width: `${s.pct}%` }} /></div>
            </div>
          ))}
        </div>
        <div className="divider" />
        <div>
          <div className="s-label">Certifications</div>
          {[
            { name: 'Terraform Associate', iss: 'HashiCorp' },
            { name: 'AI-900 Azure AI Fundamentals', iss: 'Microsoft · 2024' },
            { name: 'AWS Cloud Practitioner', iss: 'Amazon Web Services' },
            { name: 'SC-900 Security & Compliance', iss: 'Microsoft' },
          ].map(c => (
            <div key={c.name} className="cert-card">
              <div className="cert-name">{c.name}</div>
              <div className="cert-iss">{c.iss}</div>
            </div>
          ))}
        </div>
        <div className="divider" />
        <div>
          <div className="s-label">Education</div>
          <div className="edu-deg">Diploma — Software Engineering</div>
          <div className="edu-school">Sheridan College · Oakville, ON · 2017</div>
          <div className="edu-deg">BSc — Petroleum Engineering</div>
          <div className="edu-school">Covenant University · Nigeria · 2012</div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="main">
        <nav className="top-nav">
          <div className="nav-links">
            <Link href="/"            className="nav-link">home</Link>
            <Link href="/projects"    className="nav-link">projects</Link>
            <a    href="/#experience" className="nav-link">experience</a>
            <a    href="/#skills"     className="nav-link">skills</a>
            <Link href="/contact"     className="nav-link active">contact</Link>
          </div>
          <a href="mailto:GbemigaOgele@gmail.com" className="nav-cta">HIRE ME</a>
        </nav>

        <div className="contact-body">
          <div className="contact-card">
            <div className="contact-tag">Get in touch</div>
            <h1 className="contact-h1">
              Let's work<br /><em>together</em>
            </h1>
            <p className="contact-sub">
              Open to DevOps, Platform Engineer, SRE and Cloud Architect roles.
              Based in Toronto — available for remote and hybrid positions across Canada.
            </p>

            {status === 'sent' ? (
              <div className="msg-success">
                Message received — I will get back to you within 24 hours.
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="field">
                  <label>Your name</label>
                  <input
                    required
                    placeholder="John Smith"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label>Email address</label>
                  <input
                    required
                    type="email"
                    placeholder="john@company.com"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label>Message</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Tell me about the role or project..."
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                  />
                </div>
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={status === 'sending'}
                >
                  {status === 'sending' ? 'Sending...' : 'Send message'}
                </button>
                {status === 'error' && (
                  <div className="msg-error">
                    Something went wrong — please email me directly at GbemigaOgele@gmail.com
                  </div>
                )}
              </form>
            )}

            <div className="alt-contact">
              <a href="mailto:GbemigaOgele@gmail.com" className="alt-link">GbemigaOgele@gmail.com</a>
              <a href="https://www.linkedin.com/in/john-gbemiga/" target="_blank" rel="noreferrer" className="alt-link">linkedin →</a>
              <a href="https://github.com/gbengene" target="_blank" rel="noreferrer" className="alt-link">github →</a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
