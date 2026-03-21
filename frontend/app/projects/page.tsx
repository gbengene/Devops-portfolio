import Link from 'next/link';

export default async function ProjectsPage() {
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

        .avatar { width: 52px; height: 52px; border-radius: 50%; background: var(--gold); display: flex; align-items: center; justify-content: center; font-family: 'Playfair Display', serif; font-size: 17px; font-weight: 700; color: var(--brown); }
        .s-name { font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 700; color: #f5ede0; line-height: 1.2; margin-bottom: 2px; }
        .s-role { font-family: 'IBM Plex Mono', monospace; font-size: 8px; color: var(--gold); letter-spacing: .09em; text-transform: uppercase; }

        .divider { height: 1px; background: var(--brown3); }
        .s-label { font-family: 'IBM Plex Mono', monospace; font-size: 8px; font-weight: 500; color: var(--gold); letter-spacing: .12em; text-transform: uppercase; margin-bottom: 7px; }

        .nav-item { display: block; font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: #c4a882; text-decoration: none; padding: 6px 8px; border-radius: 3px; margin-bottom: 2px; transition: background .15s, color .15s; letter-spacing: .03em; }
        .nav-item:hover { background: var(--brown2); color: #f5ede0; }
        .nav-item.active { background: rgba(201,169,110,.15); color: var(--gold2); }

        .stack-tag { display: inline-block; font-family: 'IBM Plex Mono', monospace; font-size: 8px; color: #c4a882; border: 1px solid var(--brown3); padding: 2px 7px; border-radius: 2px; margin: 0 3px 4px 0; }

        .curr-title { font-family: 'IBM Plex Mono', monospace; font-size: 9.5px; color: #d4b88a; line-height: 1.5; }
        .curr-co { font-family: 'IBM Plex Mono', monospace; font-size: 9px; color: var(--gold); margin-top: 1px; }
        .curr-date { font-family: 'IBM Plex Mono', monospace; font-size: 8px; color: #9a8060; margin-top: 2px; }

        /* MAIN */
        .main { background: var(--cream); display: flex; flex-direction: column; min-height: 100vh; }

        .top-nav { background: var(--brown); padding: 12px 32px; display: flex; justify-content: space-between; align-items: center; }
        .nav-links { display: flex; gap: 22px; }
        .nav-link { font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: #c4a882; text-decoration: none; letter-spacing: .04em; transition: color .15s; }
        .nav-link:hover, .nav-link.active { color: var(--gold2); }
        .nav-cta { font-family: 'IBM Plex Mono', monospace; font-size: 9px; background: var(--gold); color: var(--brown); padding: 6px 16px; border-radius: 2px; text-decoration: none; font-weight: 600; letter-spacing: .06em; }

        .content { padding: 36px 40px; }

        .page-tag { font-family: 'IBM Plex Mono', monospace; display: inline-block; font-size: 8px; color: var(--brown); background: var(--gold2); padding: 3px 10px; border-radius: 2px; letter-spacing: .07em; margin-bottom: 12px; text-transform: uppercase; }

        .page-h1 { font-family: 'Playfair Display', serif; font-size: clamp(28px, 3vw, 40px); font-weight: 800; color: var(--brown); line-height: 1.08; letter-spacing: -.02em; margin-bottom: 10px; }
        .page-h1 em { font-style: italic; color: var(--rust); }
        .page-sub { font-size: 13px; color: var(--muted); line-height: 1.75; max-width: 500px; margin-bottom: 28px; }

        .projects-list { display: flex; flex-direction: column; gap: 14px; margin-bottom: 28px; }

        .proj-card {
          background: #fff;
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 18px 20px;
          display: grid;
          grid-template-columns: 52px 1fr auto;
          gap: 16px;
          align-items: start;
          transition: border-color .2s;
        }
        .proj-card:hover { border-color: var(--gold); }

        .proj-num { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 800; color: var(--border); line-height: 1; transition: color .2s; padding-top: 2px; }
        .proj-card:hover .proj-num { color: var(--gold2); }

        .proj-title { font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 700; color: var(--brown); margin-bottom: 2px; }
        .proj-highlight { font-family: 'IBM Plex Mono', monospace; font-size: 8.5px; color: var(--rust); margin-bottom: 8px; letter-spacing: .02em; }
        .proj-desc { font-size: 12.5px; color: var(--muted); line-height: 1.75; margin-bottom: 10px; }

        .proj-tags { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 10px; }
        .proj-tag { font-family: 'IBM Plex Mono', monospace; font-size: 8px; color: var(--muted); background: var(--cream2); border: 1px solid var(--border); padding: 2px 7px; border-radius: 2px; }

        .proj-links { display: flex; gap: 8px; }
        .proj-link { font-family: 'IBM Plex Mono', monospace; font-size: 9px; color: var(--muted); text-decoration: none; border: 1px solid var(--border); padding: 4px 12px; border-radius: 2px; transition: color .15s, border-color .15s; }
        .proj-link:hover { color: var(--rust); border-color: var(--gold); }
        .proj-link.live { color: var(--rust); border-color: rgba(139,69,19,.3); }

        .status-badge { font-family: 'IBM Plex Mono', monospace; font-size: 8px; padding: 3px 8px; border-radius: 2px; font-weight: 500; letter-spacing: .04em; white-space: nowrap; flex-shrink: 0; }
        .status-live { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }
        .status-building { background: #fffbeb; color: #92400e; border: 1px solid #fde68a; }

        /* Competencies */
        .comp-section { background: #fff; border: 1px solid var(--border); border-radius: 6px; padding: 20px 24px; }
        .comp-title { font-family: 'IBM Plex Mono', monospace; font-size: 8px; font-weight: 500; color: var(--dim); letter-spacing: .14em; text-transform: uppercase; margin-bottom: 14px; }
        .comp-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
        .comp-item { background: var(--cream2); border: 1px solid var(--border); border-radius: 3px; padding: 9px 10px; text-align: center; font-family: 'IBM Plex Mono', monospace; font-size: 9px; color: var(--muted); }
      `}</style>

      {/* SIDEBAR */}
      <aside className="sidebar">
        <div>
          <div className="avatar">GJ</div>
          <div style={{ marginTop: '10px' }}>
            <div className="s-name">Gbemiga John</div>
            <div className="s-role">Senior DevOps Engineer</div>
          </div>
        </div>

        <div className="divider" />

        <div>
          <div className="s-label">Navigation</div>
          <Link href="/"         className="nav-item">home</Link>
          <Link href="/projects" className="nav-item active">projects</Link>
          <a href="/#experience" className="nav-item">experience</a>
          <a href="/#skills"     className="nav-item">skills</a>
          <Link href="/contact"  className="nav-item">contact</Link>
        </div>

        <div className="divider" />

        <div>
          <div className="s-label">Expertise</div>
          {['Kubernetes','Terraform','GitHub Actions','AWS','Docker','ArgoCD','Prometheus','Ansible','GCP','Azure','MLOps','Python'].map(t => (
            <span key={t} className="stack-tag">{t}</span>
          ))}
        </div>

        <div className="divider" />

        <div>
          <div className="s-label">Currently</div>
          <div className="curr-title">DevOps Specialist</div>
          <div className="curr-co">Gov. of Alberta (Affinity)</div>
          <div className="curr-date">Edmonton, AB · Oct 2023–</div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="main">
        <nav className="top-nav">
          <div className="nav-links">
            <Link href="/"         className="nav-link">home</Link>
            <Link href="/projects" className="nav-link active">projects</Link>
            <a href="/#experience" className="nav-link">experience</a>
            <a href="/#skills"     className="nav-link">skills</a>
            <Link href="/contact"  className="nav-link">contact</Link>
          </div>
          <a href="mailto:GbemigaOgele@gmail.com" className="nav-cta">HIRE ME</a>
        </nav>

        <div className="content">
          <div className="page-tag">// projects</div>
          <h1 className="page-h1">Real infra.<br /><em>Real deployments.</em></h1>
          <p className="page-sub">
            Three end-to-end projects covering the full DevOps stack — CI/CD, containers,
            Kubernetes, IaC and cloud observability. All code is on GitHub.
          </p>

          <div className="projects-list">
            {[
              {
                num: '01',
                title: 'DevOps Portfolio Site',
                highlight: '3 containers · 0-downtime deploys',
                desc: 'This site — full-stack Next.js + Express API, containerised with Docker, deployed via GitHub Actions CI/CD to AWS EC2 behind Nginx with auto-renewing TLS.',
                tags: ['Next.js 14','Node.js','Docker','GitHub Actions','AWS EC2','Nginx','Let\'s Encrypt'],
                github: 'https://github.com/gbengene/Devops-portfolio',
                live: 'http://3.14.82.125',
                status: 'live',
              },
              {
                num: '02',
                title: 'Microservices Platform',
                highlight: 'GitOps · SLO dashboards · chaos tested',
                desc: 'Kubernetes-based platform with 4 microservices, ArgoCD GitOps pipeline, Prometheus/Grafana observability stack and custom SLO dashboards. Chaos engineering tested.',
                tags: ['Kubernetes','Helm','ArgoCD','Prometheus','Grafana','Docker','GitHub Actions'],
                github: 'https://github.com/gbengene',
                live: '',
                status: 'building',
              },
              {
                num: '03',
                title: 'Cloud Infrastructure Automation',
                highlight: '3 environments · IaC best practices',
                desc: 'Reusable Terraform modules for AWS — VPC, EKS, RDS, ALB across dev/staging/prod. Vault secrets management, least-privilege IAM and Atlantis PR-driven infra review.',
                tags: ['Terraform','AWS','HashiCorp Vault','IAM','Atlantis','Bash','Python'],
                github: 'https://github.com/gbengene',
                live: '',
                status: 'building',
              },
            ].map(p => (
              <div key={p.num} className="proj-card">
                <div className="proj-num">{p.num}</div>
                <div>
                  <div className="proj-title">{p.title}</div>
                  <div className="proj-highlight">{p.highlight}</div>
                  <p className="proj-desc">{p.desc}</p>
                  <div className="proj-tags">
                    {p.tags.map(t => <span key={t} className="proj-tag">{t}</span>)}
                  </div>
                  <div className="proj-links">
                    <a href={p.github} target="_blank" rel="noreferrer" className="proj-link">github →</a>
                    {p.live && <a href={p.live} target="_blank" rel="noreferrer" className="proj-link live">live →</a>}
                  </div>
                </div>
                <span className={`status-badge status-${p.status}`}>
                  {p.status === 'live' ? 'live' : 'in progress'}
                </span>
              </div>
            ))}
          </div>

          <div className="comp-section">
            <div className="comp-title">DevOps competencies demonstrated</div>
            <div className="comp-grid">
              {['CI/CD Pipelines','Docker & Kubernetes','Terraform / IaC','GitOps / ArgoCD','Observability','Cloud (AWS/GCP/Azure)','Security & IAM','Auto-scaling','Incident Response'].map(c => (
                <div key={c} className="comp-item">{c}</div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
