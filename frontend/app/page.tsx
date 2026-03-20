import Link from 'next/link';

export default function Home() {
  const skills = [
    { name: 'Kubernetes', pct: 95 },
    { name: 'Terraform', pct: 92 },
    { name: 'CI/CD Pipelines', pct: 95 },
    { name: 'AWS', pct: 90 },
    { name: 'Docker', pct: 93 },
    { name: 'Ansible', pct: 85 },
    { name: 'Python / Bash', pct: 88 },
    { name: 'Prometheus / Grafana', pct: 87 },
  ];

  const experience = [
    {
      title: 'DevOps Specialist',
      company: 'Government of Alberta (Affinity)',
      location: 'Edmonton, AB',
      period: 'Oct 2023 – Present',
      bullets: [
        'Containerisation strategies using Docker, Kubernetes & OpenShift, improving resource utilisation',
        'IaC with Terraform across AWS, Azure & GCP, reducing deployment time with Ansible',
        'Built CI/CD pipelines in Azure DevOps & GitHub Actions from scratch — full end-to-end automation',
        'Spearheaded migration of legacy systems to modern cloud platforms',
        'Led & mentored cross-functional team of Cloud and DevOps engineers',
        '24/7 on-call support ensuring high availability and rapid incident resolution',
      ],
    },
    {
      title: 'Senior DevOps Engineer',
      company: 'OXDIT Tech',
      location: 'Calgary, AB',
      period: 'Jun 2021 – Oct 2023',
      bullets: [
        'GKE microservices deployments — increased productivity by 25% for e-commerce clients',
        'Reduced manual deployment effort by 70% via end-to-end CI/CD automation',
        'Terraform across AWS, Azure & GCP — increased infrastructure efficiency by 30%',
        'Led on-premises to cloud migrations for fintech and e-commerce clients',
        'Supervised SCM branching, tagging and merge strategy; onboarded new engineers',
      ],
    },
    {
      title: 'DevOps Developer',
      company: '4Finance',
      location: 'Oakville, ON',
      period: 'Nov 2017 – Mar 2021',
      bullets: [
        'Reduced deployment time from 3 days to 1 hour using Ansible configuration management',
        'Built scalable Azure infrastructure: App Services, VMs, AD, ARM templates',
        'Configured AWS services: EC2, VPC, Route53, IAM, ELB, CloudWatch, S3',
        'Kubernetes cluster setup with auto-scaling, pod communication and load balancing',
        'Managed 5-member cross-functional team — successful e-commerce platform launch',
      ],
    },
  ];

  const techGroups = [
    { label: 'CI/CD', items: ['GitHub Actions', 'Jenkins', 'Azure DevOps'] },
    { label: 'Containers', items: ['Kubernetes', 'Docker', 'OpenShift', 'ECS'] },
    { label: 'Cloud', items: ['AWS (EKS, EC2, S3, VPC)', 'GCP / GKE', 'Azure'] },
    { label: 'IaC', items: ['Terraform', 'Ansible', 'CloudFormation'] },
    { label: 'Observability', items: ['Prometheus', 'Grafana', 'Datadog', 'Splunk', 'Kibana'] },
    { label: 'Scripting', items: ['Python', 'Bash', 'YAML'] },
  ];

  return (
    <div className="portfolio-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');

        :root {
          --bg: #0b0c10;
          --surface: #13151a;
          --surface2: #1a1d26;
          --border: #1f2230;
          --accent: #ff4d6d;
          --accent2: #7b5ea7;
          --text: #e8eaf0;
          --muted: #6b7280;
          --dim: #3a3f52;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .portfolio-root {
          min-height: 100vh;
          background: var(--bg);
          font-family: 'DM Mono', monospace;
          color: var(--text);
          display: grid;
          grid-template-columns: 280px 1fr;
        }

        /* ── SIDEBAR ── */
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
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: var(--surface2);
          border: 2px solid var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Syne', sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: var(--accent);
          letter-spacing: -1px;
          flex-shrink: 0;
        }

        .sidebar-name {
          font-family: 'Syne', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: var(--text);
          line-height: 1.2;
          margin-bottom: 3px;
        }

        .sidebar-role {
          font-size: 11px;
          color: var(--accent);
          letter-spacing: .04em;
        }

        .open-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: rgba(255,77,109,.1);
          border: 1px solid rgba(255,77,109,.25);
          color: var(--accent);
          font-size: 10px;
          padding: 4px 10px;
          border-radius: 20px;
          width: fit-content;
          margin-top: 6px;
        }

        .open-badge::before {
          content: '';
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--accent);
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .4; }
        }

        .divider {
          height: 1px;
          background: var(--border);
        }

        .sidebar-label {
          font-size: 9px;
          font-weight: 500;
          color: var(--dim);
          letter-spacing: .1em;
          text-transform: uppercase;
          margin-bottom: 10px;
        }

        .contact-link {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--muted);
          font-size: 11px;
          text-decoration: none;
          margin-bottom: 7px;
          transition: color .15s;
        }
        .contact-link:hover { color: var(--text); }

        .contact-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: var(--accent);
          flex-shrink: 0;
        }

        .skill-bar { margin-bottom: 10px; }
        .skill-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 10px;
          color: var(--muted);
          margin-bottom: 4px;
        }
        .skill-row span:last-child { color: var(--accent); }
        .skill-track {
          height: 2px;
          background: var(--border);
          border-radius: 2px;
          overflow: hidden;
        }
        .skill-fill {
          height: 100%;
          background: var(--accent);
          border-radius: 2px;
        }

        .cert-card {
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 8px 10px;
          margin-bottom: 6px;
        }
        .cert-name { font-size: 10px; color: var(--text); line-height: 1.4; }
        .cert-issuer { font-size: 9px; color: var(--muted); margin-top: 2px; }

        .edu-item { margin-bottom: 10px; }
        .edu-degree { font-size: 11px; color: var(--text); margin-bottom: 2px; }
        .edu-school { font-size: 10px; color: var(--muted); }

        /* ── MAIN ── */
        .main { padding: 2.5rem 2.5rem; overflow-x: hidden; }

        .top-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 3rem;
          padding-bottom: 1.25rem;
          border-bottom: 1px solid var(--border);
        }

        .nav-links { display: flex; gap: 1.5rem; }
        .nav-link {
          font-size: 11px;
          color: var(--muted);
          text-decoration: none;
          letter-spacing: .04em;
          transition: color .15s;
        }
        .nav-link:hover, .nav-link.active { color: var(--accent); }

        .nav-cta {
          font-size: 11px;
          background: var(--accent);
          color: #fff;
          padding: 7px 16px;
          border-radius: 4px;
          text-decoration: none;
          font-weight: 500;
          transition: opacity .15s;
        }
        .nav-cta:hover { opacity: .85; }

        /* Hero */
        .hero { margin-bottom: 3rem; }

        .hero-tag {
          display: inline-block;
          font-size: 10px;
          color: var(--accent);
          border: 1px solid rgba(255,77,109,.3);
          padding: 3px 10px;
          border-radius: 3px;
          margin-bottom: 16px;
          letter-spacing: .06em;
        }

        .hero-headline {
          font-family: 'Syne', sans-serif;
          font-size: clamp(28px, 4vw, 44px);
          font-weight: 800;
          line-height: 1.1;
          color: var(--text);
          margin-bottom: 16px;
          letter-spacing: -.02em;
        }

        .hero-headline em {
          font-style: normal;
          color: var(--accent);
        }

        .hero-sub {
          font-size: 13px;
          color: var(--muted);
          line-height: 1.8;
          max-width: 540px;
          margin-bottom: 2rem;
        }

        .hero-btns { display: flex; gap: 10px; flex-wrap: wrap; }

        .btn-primary {
          background: var(--accent);
          color: #fff;
          font-size: 12px;
          font-family: 'DM Mono', monospace;
          padding: 10px 20px;
          border-radius: 4px;
          border: none;
          cursor: pointer;
          text-decoration: none;
          transition: opacity .15s;
        }
        .btn-primary:hover { opacity: .85; }

        .btn-secondary {
          background: transparent;
          color: var(--muted);
          font-size: 12px;
          font-family: 'DM Mono', monospace;
          padding: 10px 20px;
          border-radius: 4px;
          border: 1px solid var(--border);
          cursor: pointer;
          text-decoration: none;
          transition: border-color .15s, color .15s;
        }
        .btn-secondary:hover { border-color: var(--accent); color: var(--text); }

        /* Metrics */
        .metrics {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-bottom: 3rem;
        }

        .metric {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 14px;
          text-align: center;
        }

        .metric-n {
          font-family: 'Syne', sans-serif;
          font-size: 26px;
          font-weight: 800;
          color: var(--accent);
          line-height: 1;
          margin-bottom: 4px;
        }

        .metric-l {
          font-size: 9px;
          color: var(--dim);
          letter-spacing: .05em;
          text-transform: uppercase;
        }

        /* Section */
        .section { margin-bottom: 3rem; }

        .section-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 1.25rem;
        }

        .section-title {
          font-family: 'Syne', sans-serif;
          font-size: 13px;
          font-weight: 700;
          color: var(--text);
          letter-spacing: .04em;
          text-transform: uppercase;
        }

        .section-line {
          flex: 1;
          height: 1px;
          background: var(--border);
        }

        /* Experience */
        .exp-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-left: 3px solid var(--accent);
          border-radius: 0 8px 8px 0;
          padding: 1.25rem 1.25rem 1.25rem 1.5rem;
          margin-bottom: 12px;
          transition: border-color .15s;
        }
        .exp-card:hover { border-color: var(--accent); }

        .exp-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 4px;
        }

        .exp-title {
          font-family: 'Syne', sans-serif;
          font-size: 14px;
          font-weight: 700;
          color: var(--text);
        }

        .exp-period {
          font-size: 10px;
          color: var(--muted);
          white-space: nowrap;
          flex-shrink: 0;
        }

        .exp-company {
          font-size: 11px;
          color: var(--accent);
          margin-bottom: 10px;
        }

        .exp-bullets { list-style: none; }

        .exp-bullet {
          font-size: 11px;
          color: var(--muted);
          line-height: 1.7;
          padding-left: 14px;
          position: relative;
          margin-bottom: 3px;
        }

        .exp-bullet::before {
          content: '—';
          position: absolute;
          left: 0;
          color: var(--dim);
        }

        /* Tech grid */
        .tech-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }

        .tech-group {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 12px;
        }

        .tech-group-label {
          font-size: 9px;
          font-weight: 500;
          color: var(--accent);
          letter-spacing: .1em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .tech-item {
          font-size: 11px;
          color: var(--muted);
          padding: 3px 0;
          border-bottom: 1px solid var(--border);
          line-height: 1.5;
        }
        .tech-item:last-child { border-bottom: none; }
      `}</style>

      {/* ── SIDEBAR ── */}
      <aside className="sidebar">
        <div>
          <div className="avatar">GJ</div>
          <div style={{ marginTop: '12px' }}>
            <div className="sidebar-name">Gbemiga John</div>
            <div className="sidebar-role">Senior DevOps Engineer</div>
            <div className="open-badge">Open to work</div>
          </div>
        </div>

        <div className="divider" />

        <div>
          <div className="sidebar-label">Contact</div>
          <a className="contact-link" href="mailto:GbemigaOgele@gmail.com">
            <span className="contact-dot" />
            GbemigaOgele@gmail.com
          </a>
          <a className="contact-link" href="tel:6476679778">
            <span className="contact-dot" />
            (647) 667-9778
          </a>
          <a className="contact-link" href="https://www.linkedin.com/in/john-gbemiga/" target="_blank" rel="noreferrer">
            <span className="contact-dot" />
            linkedin.com/in/john-gbemiga
          </a>
          <div className="contact-link">
            <span className="contact-dot" />
            Edmonton, AB · Canada
          </div>
        </div>

        <div className="divider" />

        <div>
          <div className="sidebar-label">Core skills</div>
          {[
            { name: 'Kubernetes', pct: 95 },
            { name: 'Terraform', pct: 92 },
            { name: 'CI/CD', pct: 95 },
            { name: 'AWS', pct: 90 },
            { name: 'Docker', pct: 93 },
            { name: 'Ansible', pct: 85 },
            { name: 'Python / Bash', pct: 88 },
          ].map(s => (
            <div key={s.name} className="skill-bar">
              <div className="skill-row">
                <span>{s.name}</span>
                <span>{s.pct}%</span>
              </div>
              <div className="skill-track">
                <div className="skill-fill" style={{ width: `${s.pct}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div className="divider" />

        <div>
          <div className="sidebar-label">Certifications</div>
          <div className="cert-card">
            <div className="cert-name">Terraform Associate</div>
            <div className="cert-issuer">HashiCorp</div>
          </div>
          <div className="cert-card">
            <div className="cert-name">Security, Compliance & Identity Fundamentals</div>
            <div className="cert-issuer">Microsoft · SC-900</div>
          </div>
        </div>

        <div className="divider" />

        <div>
          <div className="sidebar-label">Education</div>
          <div className="edu-item">
            <div className="edu-degree">Diploma — Software Engineering</div>
            <div className="edu-school">Sheridan College · Oakville, ON · 2017</div>
          </div>
          <div className="edu-item">
            <div className="edu-degree">BSc — Petroleum Engineering</div>
            <div className="edu-school">Covenant University · Nigeria · 2012</div>
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="main">
        <nav className="top-nav">
          <div className="nav-links">
            <a href="/" className="nav-link active">home</a>
            <Link href="/projects" className="nav-link">projects</Link>
            <a href="#experience" className="nav-link">experience</a>
            <a href="#skills" className="nav-link">skills</a>
            <Link href="/contact" className="nav-link">contact</Link>
          </div>
          <a href="mailto:GbemigaOgele@gmail.com" className="nav-cta">hire me</a>
        </nav>

        {/* Hero */}
        <section className="hero">
          <span className="hero-tag">8+ years · DevOps · Platform · Cloud</span>
          <h1 className="hero-headline">
            Building resilient<br />
            infrastructure <em>at scale</em>
          </h1>
          <p className="hero-sub">
            Senior DevOps Engineer specialising in Kubernetes, Terraform and end-to-end CI/CD automation
            across AWS, Azure & GCP. Cutting deploy times by 70%, increasing team productivity and
            keeping critical systems running 24/7.
          </p>
          <div className="hero-btns">
            <Link href="/projects" className="btn-primary">view projects</Link>
            <Link href="/contact" className="btn-secondary">get in touch</Link>
          </div>
        </section>

        {/* Metrics */}
        <div className="metrics">
          <div className="metric">
            <div className="metric-n">8+</div>
            <div className="metric-l">years experience</div>
          </div>
          <div className="metric">
            <div className="metric-n">70%</div>
            <div className="metric-l">deploy time saved</div>
          </div>
          <div className="metric">
            <div className="metric-n">3</div>
            <div className="metric-l">cloud platforms</div>
          </div>
          <div className="metric">
            <div className="metric-n">25%</div>
            <div className="metric-l">productivity gain</div>
          </div>
        </div>

        {/* Experience */}
        <section className="section" id="experience">
          <div className="section-header">
            <span className="section-title">Experience</span>
            <div className="section-line" />
          </div>
          {[
            {
              title: 'DevOps Specialist',
              company: 'Government of Alberta (Affinity) · Edmonton, AB',
              period: 'Oct 2023 – Present',
              bullets: [
                'Containerisation with Docker, Kubernetes & OpenShift — improved resource utilisation',
                'IaC with Terraform across AWS, Azure & GCP; configuration management via Ansible',
                'Built CI/CD pipelines in Azure DevOps & GitHub Actions — full end-to-end automation',
                'Spearheaded migration of legacy systems to modern cloud platforms',
                'Led & mentored cross-functional team of Cloud and DevOps engineers',
              ],
            },
            {
              title: 'Senior DevOps Engineer',
              company: 'OXDIT Tech · Calgary, AB',
              period: 'Jun 2021 – Oct 2023',
              bullets: [
                'GKE microservices deployments — increased client productivity by 25%',
                'Reduced manual deployment effort by 70% via full CI/CD automation',
                'Terraform best practices across AWS, Azure & GCP — 30% efficiency gain',
                'Led on-premises to cloud migration for fintech and e-commerce clients',
              ],
            },
            {
              title: 'DevOps Developer',
              company: '4Finance · Oakville, ON',
              period: 'Nov 2017 – Mar 2021',
              bullets: [
                'Reduced deployment time from 3 days to 1 hour using Ansible automation',
                'Scalable Azure infrastructure: App Services, VMs, Active Directory, ARM',
                'AWS configuration: EC2, VPC, Route53, IAM, ELB, CloudWatch, S3',
                'Kubernetes clusters with auto-scaling, pod communication and load balancing',
              ],
            },
          ].map(job => (
            <div key={job.title} className="exp-card">
              <div className="exp-header">
                <span className="exp-title">{job.title}</span>
                <span className="exp-period">{job.period}</span>
              </div>
              <div className="exp-company">{job.company}</div>
              <ul className="exp-bullets">
                {job.bullets.map((b, i) => (
                  <li key={i} className="exp-bullet">{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        {/* Skills */}
        <section className="section" id="skills">
          <div className="section-header">
            <span className="section-title">Full tech stack</span>
            <div className="section-line" />
          </div>
          <div className="tech-grid">
            {[
              { label: 'CI/CD', items: ['GitHub Actions', 'Jenkins', 'Azure DevOps'] },
              { label: 'Containers', items: ['Kubernetes', 'Docker', 'OpenShift', 'ECS'] },
              { label: 'Cloud', items: ['AWS (EKS, EC2, S3, VPC)', 'GCP / GKE', 'Azure'] },
              { label: 'IaC & Config', items: ['Terraform', 'Ansible', 'ARM Templates'] },
              { label: 'Observability', items: ['Prometheus', 'Grafana', 'Datadog', 'Splunk'] },
              { label: 'Languages', items: ['Python', 'Bash', 'YAML', 'Java', 'JavaScript'] },
            ].map(g => (
              <div key={g.label} className="tech-group">
                <div className="tech-group-label">{g.label}</div>
                {g.items.map(item => (
                  <div key={item} className="tech-item">{item}</div>
                ))}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
