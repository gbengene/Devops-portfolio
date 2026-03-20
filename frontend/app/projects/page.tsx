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
  const projects = await getProjects();

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-6 pt-24 pb-20">
        <h1 className="text-3xl font-bold mb-2">Projects</h1>
        <p className="text-gray-400 mb-12">Real infrastructure. Real deployments.</p>
        <div className="grid gap-6">
          {projects.map((p: any) => (
            <div key={p.id} className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-2">{p.title}</h2>
              <p className="text-gray-400 mb-4">{p.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {p.tags.map((t: string) => (
                  <span key={t} className="bg-gray-800 text-green-400 text-xs px-3 py-1 rounded-full">{t}</span>
                ))}
              </div>
              <div className="flex gap-4 text-sm">
                {p.github && <a href={p.github} className="text-green-400 hover:underline">GitHub →</a>}
                {p.live && <a href={p.live} className="text-blue-400 hover:underline">Live →</a>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
