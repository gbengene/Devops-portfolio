import { Router } from 'express';
const router = Router();

const projects = [
  {
    id: 1,
    title: 'DevOps Portfolio Site',
    description: 'This site — Next.js + Express, Dockerised, deployed via GitHub Actions CI/CD to AWS EC2.',
    tags: ['Next.js', 'Docker', 'GitHub Actions', 'AWS', 'Nginx'],
    github: 'https://github.com/youruser/devops-portfolio',
    live: 'https://yourdomain.com',
  },
  {
    id: 2,
    title: 'Microservices Platform',
    description: 'Kubernetes-based platform with ArgoCD GitOps, Prometheus/Grafana observability.',
    tags: ['Kubernetes', 'Helm', 'ArgoCD', 'Prometheus', 'Grafana'],
    github: 'https://github.com/youruser/microservices-platform',
    live: '',
  },
  {
    id: 3,
    title: 'Cloud Infra Automation',
    description: 'Reusable Terraform modules for AWS — VPC, EC2 auto-scaling, RDS, Vault secrets.',
    tags: ['Terraform', 'AWS', 'Vault', 'IAM', 'Atlantis'],
    github: 'https://github.com/youruser/cloud-infra',
    live: '',
  },
];

router.get('/', (req, res) => {
  res.json(projects);
});

router.get('/:id', (req, res) => {
  const project = projects.find((p) => p.id === Number(req.params.id));
  if (!project) return res.status(404).json({ error: 'Project not found' });
  res.json(project);
});

export default router;
