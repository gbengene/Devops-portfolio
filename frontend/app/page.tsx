import Link from 'next/link';

export default function Home() {
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

        /* ── SIDEBAR ── */
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
          flex-shrink: 0;
        }

        .s-name {
          font-family: 'Playfair Display', serif;
          font-size: 16px; font-weight: 700;
          color: #f5ede0; line-height: 1.2; margin-bottom: 2px;
        }
        .s-role {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 8px; color: var(--gold);
          letter-spacing: .09em; text-transform: uppercase;
        }
        .open-pill {
          display: inline-flex; align-items: center; gap: 4px;
          border: 1px solid rgba(232,201,138,.4);
          color: var(--gold2); font-size: 8px;
          font-family: 'IBM Plex Mono', monospace;
          padding: 2px 8px; border-radius: 2px;
          margin-top: 5px; width: fit-content; letter-spacing: .04em;
        }
        .open-pill::before {
          content: ''; width: 4px; height: 4px;
          border-radius: 50%; background: var(--gold2);
          animation: glow 2s infinite;
        }
        @keyframes glow { 0%,100%{opacity:1} 50%{opacity:.3} }

        .divider { height: 1px; background: var(--brown3); }

        /* Brighter sidebar labels */
        .s-label {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 8px; font-weight: 500; color: var(--gold);
          letter-spacing: .12em; text-transform: uppercase; margin-bottom: 7px;
        }

        /* Brighter contact text */
        .s-contact {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 9.5px; color: #d4b88a;
          margin-bottom: 4px; line-height: 1.4;
          display: flex; gap: 6px; align-items: flex-start;
        }
        .s-dot {
          width: 3px; height: 3px; border-radius: 50%;
          background: var(--gold2); flex-shrink: 0; margin-top: 5px;
        }

        /* Brighter skill rows */
        .skill-bar { margin-bottom: 8px; }
        .skill-row {
          display: flex; justify-content: space-between;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 8.5px; color: #c4a882; margin-bottom: 2px;
        }
        .skill-row span:last-child { color: var(--gold2); font-weight: 500; }
        .skill-track { height: 2px; background: var(--brown3); border-radius: 1px; }
        .skill-fill  { height: 100%; background: var(--gold); border-radius: 1px; }

        /* Brighter cert cards */
        .cert-card {
          background: #1e180f; border: 1px solid var(--brown3);
          border-radius: 2px; padding: 6px 8px; margin-bottom: 4px;
        }
        .cert-name { font-family: 'IBM Plex Mono', monospace; font-size: 8.5px; color: var(--gold2); line-height: 1.4; }
        .cert-iss  { font-family: 'IBM Plex Mono', monospace; font-size: 7.5px; color: #9a8060; margin-top: 1px; }

        /* Brighter education */
        .edu-deg   { font-family: 'IBM Plex Mono', monospace; font-size: 8.5px; color: #d4b88a; line-height: 1.4; }
        .edu-school{ font-family: 'IBM Plex Mono', monospace; font-size: 7.5px; color: #9a8060; margin-top: 1px; margin-bottom: 6px; }

        /* ── MAIN ── */
        .main { background: var(--cream); display: flex; flex-direction: column; min-height: 100vh; }

        .top-nav {
          background: var(--brown); padding: 12px 32px;
          display: flex; justify-content: space-between; align-items: center;
          flex-shrink: 0;
        }
        .nav-links { display: flex; gap: 22px; }
        .nav-link {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px; color: #c4a882; text-decoration: none;
          letter-spacing: .04em; transition: color .15s;
        }
        .nav-link:hover, .nav-link.active { color: var(--gold2); }
        .nav-cta {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 9px; background: var(--gold); color: var(--brown);
          padding: 6px 16px; border-radius: 2px; text-decoration: none;
          font-weight: 600; letter-spacing: .06em; transition: opacity .15s;
        }
        .nav-cta:hover { opacity: .85; }

        /* Hero — fits in one viewport with no scroll */
        .hero {
          padding: 28px 40px 24px;
          border-bottom: 1px solid var(--border);
          flex-shrink: 0;
        }
        .hero-tag {
          font-family: 'IBM Plex Mono', monospace;
          display: inline-block; font-size: 8px;
          color: var(--brown); background: var(--gold2);
          padding: 3px 10px; border-radius: 2px;
          letter-spacing: .07em; margin-bottom: 12px; text-transform: uppercase;
        }
        .hero-h1 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(28px, 3vw, 40px);
          font-weight: 800; color: var(--brown);
          line-height: 1.08; letter-spacing: -.02em; margin-bottom: 10px;
        }
        .hero-h1 em { font-style: italic; color: var(--rust); }

        .hero-p {
          font-size: 13px; color: var(--muted);
          line-height: 1.8; max-width: 520px; margin-bottom: 16px;
        }
        .hero-btns { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px; }

        .btn-p {
          font-family: 'IBM Plex Mono', monospace;
          background: var(--brown); color: #fdf8f0;
          font-size: 10px; padding: 9px 20px; border-radius: 2px;
          border: none; cursor: pointer; letter-spacing: .05em;
          text-decoration: none; transition: opacity .15s;
        }
        .btn-p:hover { opacity: .8; }
        .btn-s {
          font-family: 'IBM Plex Mono', monospace;
          background: transparent; color: var(--brown);
          font-size: 10px; padding: 9px 20px; border-radius: 2px;
          border: 1.5px solid var(--gold); cursor: pointer;
          letter-spacing: .05em; text-decoration: none; transition: background .15s;
        }
        .btn-s:hover { background: var(--cream2); }

        .metrics {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 1px; background: var(--border);
          border: 1px solid var(--border); border-radius: 3px; overflow: hidden;
        }
        .metric { background: var(--cream); text-align: center; padding: 12px 8px; }
        .metric-n {
          font-family: 'Playfair Display', serif;
          font-size: 24px; font-weight: 700; color: var(--rust); line-height: 1;
        }
        .metric-l {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 7px; color: var(--dim);
          letter-spacing: .07em; text-transform: uppercase; margin-top: 3px;
        }

        /* Experience */
        .content { padding: 24px 40px 32px; }

        .section { margin-bottom: 24px; }
        .section-head { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
        .section-title {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 8px; font-weight: 500; color: var(--dim);
          letter-spacing: .14em; text-transform: uppercase; white-space: nowrap;
        }
        .section-rule { flex: 1; height: 1px; background: var(--border); }

        /* Option B cards */
        .exp-card {
          border: 1px solid var(--border); border-radius: 6px;
          padding: 13px 16px; margin-bottom: 10px; background: #fff;
          display: grid; grid-template-columns: 1fr auto; gap: 12px;
          align-items: start; transition: border-color .2s;
        }
        .exp-card:hover { border-color: var(--gold); }

        .exp-period {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 8px; color: var(--dim);
          white-space: nowrap; text-align: right; padding-top: 2px;
        }
        .exp-title {
          font-family: 'Playfair Display', serif;
          font-size: 15px; font-weight: 700; color: var(--brown); margin-bottom: 1px;
        }
        .exp-company {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 9px; color: var(--rust); margin-bottom: 7px; letter-spacing: .02em;
        }
        .exp-summary {
          font-size: 12.5px; color: var(--muted); line-height: 1.75; margin-bottom: 9px;
        }
        .tag-row { display: flex; flex-wrap: wrap; gap: 4px; }
        .exp-tag {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 8px; color: var(--muted);
          background: var(--cream2); border: 1px solid var(--border);
          padding: 2px 7px; border-radius: 2px;
        }

        /* Skills grid */
        .skills-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;
        }
        .skill-group {
          background: #fff; border: 1px solid var(--border);
          border-radius: 4px; padding: 10px 12px;
        }
        .skill-group-label {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 7.5px; font-weight: 500; color: var(--rust);
          letter-spacing: .12em; text-transform: uppercase; margin-bottom: 6px;
        }
        .skill-item {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 9.5px; color: var(--muted);
          padding: 3px 0; border-bottom: 1px solid var(--border); line-height: 1.5;
        }
        .skill-item:last-child { border-bottom: none; }

        /* ── TABLET ── */
        @media (max-width: 1024px) {
          .skills-grid { grid-template-columns: repeat(2, 1fr); }
        }

        /* ── MOBILE ── */
        @media (max-width: 768px) {
          .root { grid-template-columns: 1fr; }
          .sidebar {
            position: relative;
            height: auto;
            overflow-y: visible;
            padding: 1.5rem 1.25rem;
          }
          .top-nav { padding: 10px 16px; }
          .nav-links { gap: 10px; flex-wrap: wrap; }
          .nav-link { font-size: 12px; padding: 12px 4px; }
          .nav-cta { font-size: 11px; padding: 10px 18px; }
          .hero { padding: 20px 16px; }
          .hero-tag { font-size: 10px; }
          .hero-h1 { font-size: clamp(24px, 6vw, 32px); }
          .hero-p { font-size: 15px; }
          .hero-btns { flex-direction: column; }
          .btn-p, .btn-s { font-size: 12px; padding: 14px 24px; text-align: center; }
          .metrics { grid-template-columns: repeat(3, 1fr); }
          .content { padding: 16px 16px 24px; }
          .exp-card { grid-template-columns: 1fr; }
          .exp-period { text-align: left; order: -1; font-size: 10px; margin-bottom: 4px; }
          .skills-grid { grid-template-columns: 1fr; }
          .s-role, .s-label, .open-pill { font-size: 11px; }
          .s-contact { font-size: 12px; }
          .skill-row { font-size: 11px; }
          .cert-name, .edu-deg { font-size: 11px; }
          .cert-iss, .edu-school { font-size: 10px; }
          .section-title { font-size: 10px; }
          .exp-title { font-size: 16px; }
          .exp-company { font-size: 10px; }
          .exp-summary { font-size: 14px; }
          .exp-tag { font-size: 9px; padding: 3px 8px; }
          .skill-group-label { font-size: 10px; }
          .skill-item { font-size: 12px; }
          .metric-l { font-size: 9px; }
        }
      `}</style>

      {/* ── SIDEBAR ── */}
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
            { name: 'Kubernetes',        pct: 95 },
            { name: 'Terraform',         pct: 92 },
            { name: 'CI/CD Pipelines',   pct: 95 },
            { name: 'AWS / GCP / Azure', pct: 90 },
            { name: 'Docker',            pct: 93 },
            { name: 'Ansible',           pct: 85 },
            { name: 'Python / Bash',     pct: 88 },
            { name: 'AI / MLOps',        pct: 78 },
          ].map(s => (
            <div key={s.name} className="skill-bar">
              <div className="skill-row">
                <span>{s.name}</span><span>{s.pct}%</span>
              </div>
              <div className="skill-track">
                <div className="skill-fill" style={{ width: `${s.pct}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div className="divider" />

        <div>
          <div className="s-label">Certifications</div>
          {[
            { name: 'Terraform Associate',          iss: 'HashiCorp' },
            { name: 'AI-900 Azure AI Fundamentals', iss: 'Microsoft · 2024' },
            { name: 'AWS Cloud Practitioner',       iss: 'Amazon Web Services' },
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

      {/* ── MAIN ── */}
      <main className="main">

        <nav className="top-nav">
          <div className="nav-links">
            <a href="/"            className="nav-link active">home</a>
            <Link href="/projects" className="nav-link">projects</Link>
            <a href="#experience"  className="nav-link">experience</a>
            <a href="#skills"      className="nav-link">skills</a>
            <Link href="/contact"  className="nav-link">contact</Link>
          </div>
          <a href="mailto:GbemigaOgele@gmail.com" className="nav-cta">HIRE ME</a>
        </nav>

        <section className="hero">
          <div className="hero-tag">8+ yrs · DevOps · AI/ML Ops · Multi-Cloud</div>
          <h1 className="hero-h1">
            Building resilient<br />infrastructure <em>at scale</em>
          </h1>
          <p className="hero-p">
            Senior DevOps Engineer specialising in Kubernetes, Terraform, CI/CD and
            AI/ML pipeline automation across AWS, Azure &amp; GCP. Cutting deploy times
            by 70% and keeping mission-critical systems running 24/7.
          </p>
          <div className="hero-btns">
            <Link href="/projects" className="btn-p">view projects</Link>
            <Link href="/contact"  className="btn-s">get in touch</Link>
          </div>
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
              <div className="metric-n">25%</div>
              <div className="metric-l">productivity gain</div>
            </div>
          </div>
        </section>

        <div className="content">

          <section className="section" id="experience">
            <div className="section-head">
              <span className="section-title">Experience</span>
              <div className="section-rule" />
            </div>

            <div className="exp-card">
              <div>
                <div className="exp-title">DevOps Specialist</div>
                <div className="exp-company">Government of Alberta (Affinity) · Edmonton, AB</div>
                <p className="exp-summary">
                  Multi-cloud IaC on AWS, Azure &amp; GCP using Terraform; Docker, Kubernetes &amp; OpenShift
                  containerisation. Designed AI/ML pipelines with Azure ML &amp; Kubeflow — automated model
                  training, versioning and deployment to production. End-to-end CI/CD automation;
                  led cross-functional DevOps team with 24/7 on-call support.
                </p>
                <div className="tag-row">
                  {['Kubernetes','Terraform','Azure ML','Kubeflow','GitHub Actions','MLflow','OpenShift','Ansible'].map(t => (
                    <span key={t} className="exp-tag">{t}</span>
                  ))}
                </div>
              </div>
              <div className="exp-period">Oct 2023 – Present</div>
            </div>

            <div className="exp-card">
              <div>
                <div className="exp-title">Senior DevOps Engineer</div>
                <div className="exp-company">OXDIT Tech · Calgary, AB</div>
                <p className="exp-summary">
                  70% reduction in deployment effort via full CI/CD pipeline automation across Jenkins,
                  Azure DevOps &amp; GitHub Actions. GKE microservices with autoscaling — 25% productivity
                  gain. Automated AI model deployment pipelines and MLOps tooling for fintech and
                  e-commerce clients.
                </p>
                <div className="tag-row">
                  {['GKE','Jenkins','Terraform','Docker','MLOps','Azure DevOps','Python','Bash'].map(t => (
                    <span key={t} className="exp-tag">{t}</span>
                  ))}
                </div>
              </div>
              <div className="exp-period">Jun 2021 – Oct 2023</div>
            </div>

            <div className="exp-card">
              <div>
                <div className="exp-title">DevOps Developer</div>
                <div className="exp-company">4Finance · Oakville, ON</div>
                <p className="exp-summary">
                  Deployment time cut from 3 days to 1 hour with Ansible. Full AWS &amp; Azure environment
                  provisioning. Kubernetes clusters with auto-scaling and load balancing.
                  70%+ productivity gain via cross-cloud automation. Led 5-member cross-functional team.
                </p>
                <div className="tag-row">
                  {['AWS','Azure','Ansible','Kubernetes','Terraform','Jenkins','Python','VMware'].map(t => (
                    <span key={t} className="exp-tag">{t}</span>
                  ))}
                </div>
              </div>
              <div className="exp-period">Nov 2017 – Mar 2021</div>
            </div>
          </section>

          <section className="section" id="skills">
            <div className="section-head">
              <span className="section-title">Full tech stack</span>
              <div className="section-rule" />
            </div>
            <div className="skills-grid">
              {[
                { label: 'CI/CD',         items: ['GitHub Actions', 'Jenkins', 'Azure DevOps', 'GitLab CI'] },
                { label: 'Containers',    items: ['Kubernetes', 'Docker', 'OpenShift', 'ECS / EKS'] },
                { label: 'Multi-cloud',   items: ['AWS (EC2, S3, EKS)', 'GCP / GKE', 'Azure (VMs, AKS)'] },
                { label: 'IaC & Config',  items: ['Terraform', 'Ansible', 'ARM Templates', 'CloudFormation'] },
                { label: 'AI / MLOps',    items: ['Azure ML', 'Kubeflow', 'MLflow', 'Model Serving'] },
                { label: 'Observability', items: ['Prometheus', 'Grafana', 'Datadog', 'Splunk / Kibana'] },
                { label: 'Languages',     items: ['Python', 'Bash', 'YAML', 'Java', 'JavaScript'] },
                { label: 'Databases',     items: ['DynamoDB', 'MongoDB', 'MySQL', 'Oracle'] },
                { label: 'Tools',         items: ['Jira', 'Confluence', 'SonarQube', 'Nexus'] },
              ].map(g => (
                <div key={g.label} className="skill-group">
                  <div className="skill-group-label">{g.label}</div>
                  {g.items.map(item => (
                    <div key={item} className="skill-item">{item}</div>
                  ))}
                </div>
              ))}
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
