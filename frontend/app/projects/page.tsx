import Link from 'next/link';

async function getProjects() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error('Failed');
    return res.json();
  } catch {
    return [];
  }
}

export default async function ProjectsPage() {
  const apiProjects = await getProjects();

  const featuredProjects = [
    {
      id: 'p1',
      number: '01',
      title: 'DevOps Portfolio Site',
      description:
        'This site — full-stack Next.js + Express API, containerised with Docker, deployed via GitHub Actions CI/CD to AWS EC2 behind Nginx with auto-renewing TLS.',
      tags: ['Next.js 14', 'Node.js', 'Docker', 'GitHub Actions', 'AWS EC2', 'Nginx', 'Let\'s Encrypt'],
      github: 'https://github.com/gbengene/Devops-portfolio',
      live: '',
      highlight: '3 containers · 0-downtime deploys',
      status: 'live',
    },
    {
      id: 'p2',
      number: '02',
      title: 'Microservices Platform',
      description:
        'Kubernetes-based platform with 4 microservices, ArgoCD GitOps pipeline, Prometheus/Grafana observability stack and custom SLO dashboards. Chaos engineering tested.',
      tags: ['Kubernetes', 'Helm', 'ArgoCD', 'Prometheus', 'Grafana', 'Docker', 'GitHub Actions'],
      github: 'https://github.com/gbengene',
      live: '',
      highlight: 'GitOps · SLO dashboards · chaos tested',
      status: 'building',
    },
    {
      id: 'p3',
      number: '03',
      title: 'Cloud Infrastructure Automation',
      description:
        'Reusable Terraform modules for AWS — VPC, EKS, RDS, ALB across dev/staging/prod environments. Vault secrets management, least-privilege IAM and Atlantis PR-driven infra review.',
      tags: ['Terraform', 'AWS', 'HashiCorp Vault', 'IAM', 'Atlantis', 'Bash', 'Python'],
      github: 'https://github.com/gbengene',
      live: '',
      highlight: '3 environments · IaC best practices',
      status: 'building',
    },
  ];

  return (
    <div className="projects-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');

        :root {
          --bg: #0b0c10;
          --surface: #13151a;
          --surface2: #1a1d26;
          --border: #1f2230;
          --accent: #ff4d6d;
          --text: #e8eaf0;
          --muted: #6b7280;
          --dim: #3a3f52;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .projects-root {
          min-height: 100vh;
          background: var(--bg);
          font-family: 'DM Mono', monospace;
          color: var(--text);
          display: grid;
          grid-template-columns: 280px 1fr;
        }

        /* ── SIDEBAR (same as home) ── */
        .sidebar {
          background: var(--surface);
          border-right: 1px solid var(--border);
          padding: 2rem 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          position: sticky;
          top: 0;
          height: 100vh;
          overflow-y: auto;
        }
        .sidebar::-webkit-scrollbar { width: 3px; }
        .sidebar::-webkit-scrollbar-thumb { background: var(--dim); border-radius: 2px; }

        .avatar {
          width: 64px; height: 64px; border-radius: 50%;
          background: var(--surface2); border: 2px solid var(--accent);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 700;
          color: var(--accent); letter-spacing: -1px;
        }
        .sidebar-name { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; color: var(--text); line-height: 1.2; margin-bottom: 3px; }
        .sidebar-role { font-size: 11px; color: var(--accent); letter-spacing: .04em; }
        .divider { height: 1px; background: var(--border); }
        .sidebar-label { font-size: 9px; font-weight: 500; color: var(--dim); letter-spacing: .1em; text-transform: uppercase; margin-bottom: 10px; }

        .nav-item {
          display: block; font-size: 11px; color: var(--muted); text-decoration: none;
          padding: 7px 10px; border-radius: 5px; margin-bottom: 3px;
          transition: background .15s, color .15s;
          letter-spacing: .02em;
        }
        .nav-item:hover { background: var(--surface2); color: var(--text); }
        .nav-item.active { background: rgba(255,77,109,.1); color: var(--accent); }

        .stack-tag {
          display: inline-block; font-size: 9px; color: var(--muted);
          border: 1px solid var(--border); padding: 3px 8px; border-radius: 3px;
          margin: 0 4px 4px 0;
        }

        /* ── MAIN ── */
        .main { padding: 2.5rem; }

        .page-header { margin-bottom: 2.5rem; }
        .page-tag { font-size: 10px; color: var(--accent); letter-spacing: .08em; margin-bottom: 10px; }
        .page-title {
          font-family: 'Syne', sans-serif; font-size: clamp(24px, 3vw, 36px);
          font-weight: 800; color: var(--text); letter-spacing: -.02em;
          line-height: 1.1; margin-bottom: 10px;
        }
        .page-title em { font-style: normal; color: var(--accent); }
        .page-sub { font-size: 12px; color: var(--muted); line-height: 1.8; max-width: 500px; }

        /* Project cards */
        .projects-grid { display: flex; flex-direction: column; gap: 16px; }

        .project-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 1.5rem;
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 1.25rem;
          transition: border-color .2s;
        }
        .project-card:hover { border-color: var(--accent); }

        .project-number {
          font-family: 'Syne', sans-serif;
          font-size: 36px;
          font-weight: 800;
          color: var(--dim);
          line-height: 1;
          min-width: 48px;
          padding-top: 4px;
          transition: color .2s;
        }
        .project-card:hover .project-number { color: var(--accent); }

        .project-body {}

        .project-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 6px;
        }

        .project-title {
          font-family: 'Syne', sans-serif;
          font-size: 16px;
          font-weight: 700;
          color: var(--text);
          letter-spacing: -.01em;
        }

        .status-badge {
          font-size: 9px;
          padding: 3px 8px;
          border-radius: 3px;
          font-weight: 500;
          letter-spacing: .04em;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .status-live { background: rgba(34,197,94,.1); color: #4ade80; border: 1px solid rgba(34,197,94,.2); }
        .status-building { background: rgba(251,191,36,.08); color: #fbbf24; border: 1px solid rgba(251,191,36,.15); }

        .project-highlight {
          font-size: 10px;
          color: var(--accent);
          margin-bottom: 8px;
          letter-spacing: .03em;
        }

        .project-desc {
          font-size: 12px;
          color: var(--muted);
          line-height: 1.7;
          margin-bottom: 12px;
        }

        .project-tags { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 12px; }
        .project-tag {
          font-size: 9px; color: var(--muted);
          border: 1px solid var(--border); padding: 3px 8px; border-radius: 3px;
          background: var(--surface2);
        }

        .project-links { display: flex; gap: 10px; }
        .project-link {
          font-size: 11px; color: var(--muted); text-decoration: none;
          border: 1px solid var(--border); padding: 5px 12px; border-radius: 4px;
          transition: color .15s, border-color .15s;
        }
        .project-link:hover { color: var(--accent); border-color: var(--accent); }
        .project-link-live { color: var(--accent); border-color: rgba(255,77,109,.3); }

        /* Competencies */
        .competencies {
          margin-top: 2.5rem;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 1.5rem;
        }
        .comp-title {
          font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 700;
          color: var(--text); letter-spacing: .04em; text-transform: uppercase;
          margin-bottom: 1rem;
        }
        .comp-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
        .comp-item {
          background: var(--surface2); border: 1px solid var(--border);
          border-radius: 6px; padding: 10px; text-align: center;
          font-size: 11px; color: var(--muted);
        }
      `}</style>

      {/* ── SIDEBAR ── */}
      <aside className="sidebar">
        <div>
          <div className="avatar">GJ</div>
          <div style={{ marginTop: '12px' }}>
            <div className="sidebar-name">Gbemiga John</div>
            <div className="sidebar-role">Senior DevOps Engineer</div>
          </div>
        </div>

        <div className="divider" />

        <div>
          <div className="sidebar-label">Navigation</div>
          <Link href="/" className="nav-item">home</Link>
          <Link href="/projects" className="nav-item active">projects</Link>
          <a href="/#experience" className="nav-item">experience</a>
          <a href="/#skills" className="nav-item">skills</a>
          <Link href="/contact" className="nav-item">contact</Link>
        </div>

        <div className="divider" />

        <div>
          <div className="sidebar-label">Expertise</div>
          {['Kubernetes', 'Terraform', 'GitHub Actions', 'AWS', 'Docker', 'ArgoCD', 'Prometheus', 'Ansible', 'GCP', 'Azure'].map(t => (
            <span key={t} className="stack-tag">{t}</span>
          ))}
        </div>

        <div className="divider" />

        <div>
          <div className="sidebar-label">Currently</div>
          <div style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: '1.7' }}>
            DevOps Specialist<br />
            <span style={{ color: 'var(--accent)' }}>Gov. of Alberta (Affinity)</span><br />
            Edmonton, AB · Oct 2023–
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="main">
        <div className="page-header">
          <div className="page-tag">// projects</div>
          <h1 className="page-title">Real infra.<br /><em>Real deployments.</em></h1>
          <p className="page-sub">
            Three end-to-end projects covering the full DevOps stack — CI/CD, containers,
            Kubernetes, IaC and cloud observability. All code is on GitHub.
          </p>
        </div>

        <div className="projects-grid">
          {featuredProjects.map(p => (
            <div key={p.id} className="project-card">
              <div className="project-number">{p.number}</div>
              <div className="project-body">
                <div className="project-top">
                  <span className="project-title">{p.title}</span>
                  <span className={`status-badge status-${p.status}`}>
                    {p.status === 'live' ? 'live' : 'in progress'}
                  </span>
                </div>
                <div className="project-highlight">{p.highlight}</div>
                <p className="project-desc">{p.description}</p>
                <div className="project-tags">
                  {p.tags.map(t => <span key={t} className="project-tag">{t}</span>)}
                </div>
                <div className="project-links">
                  <a href={p.github} target="_blank" rel="noreferrer" className="project-link">
                    github →
                  </a>
                  {p.live && (
                    <a href={p.live} target="_blank" rel="noreferrer" className="project-link project-link-live">
                      live demo →
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="competencies">
          <div className="comp-title">DevOps competencies demonstrated</div>
          <div className="comp-grid">
            {[
              'CI/CD Pipelines', 'Docker & Kubernetes', 'Terraform / IaC',
              'GitOps / ArgoCD', 'Observability', 'Cloud (AWS/GCP/Azure)',
              'Security & IAM', 'Auto-scaling', 'Incident Response',
            ].map(c => (
              <div key={c} className="comp-item">{c}</div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
