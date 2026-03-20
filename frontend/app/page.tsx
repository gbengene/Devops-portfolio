export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-32 pb-20">
        <p className="text-green-400 font-mono text-sm mb-4">Hi, I am</p>
        <h1 className="text-5xl font-bold mb-4">Your Name</h1>
        <h2 className="text-3xl text-gray-400 mb-6">DevOps / Platform Engineer</h2>
        <p className="text-gray-300 text-lg max-w-xl leading-relaxed">
          I build reliable, automated infrastructure. Specialising in CI/CD pipelines,
          Kubernetes, Terraform, and cloud-native deployments on AWS.
        </p>
        <div className="flex gap-4 mt-8">
          <a href="/projects" className="bg-green-500 text-gray-950 px-6 py-3 rounded font-medium hover:bg-green-400 transition">
            View projects
          </a>
          <a href="/contact" className="border border-gray-600 px-6 py-3 rounded font-medium hover:border-gray-400 transition">
            Get in touch
          </a>
        </div>
      </section>

      {/* Skills */}
      <section className="max-w-4xl mx-auto px-6 py-16 border-t border-gray-800">
        <h3 className="text-xl font-semibold mb-8 text-gray-200">Core tools</h3>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {['Docker','Kubernetes','Terraform','GitHub Actions','AWS','Prometheus'].map(skill => (
            <div key={skill} className="bg-gray-800 text-center py-3 px-2 rounded text-sm text-gray-300">
              {skill}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
