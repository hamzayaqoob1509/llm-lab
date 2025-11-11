import { getPrisma } from "@/lib/prisma";
import Link from "next/link";

type RespWithMetrics = {
	id: string;
	metrics: {
		aggregate: number;
		readability: number;
		coverage: number;
		structure: number;
		redundancy: number;
		coherence: number;
		lengthScore: number;
	} | null;
	temperature: number;
	topP: number;
	latencyMs: number;
	content: string;
};

export default async function ExperimentPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	if (!id) {
		return <div className="p-6 text-sm text-red-500">Missing experiment id</div>;
	}
	const prisma = await getPrisma();
	const exp = await prisma.experiment.findUnique({
		where: { id },
		include: { responses: { include: { metrics: true } }, },
	});
	if (!exp) {
		return <div className="p-6 text-sm text-red-500">Experiment not found</div>;
	}
	return (
		<div className="min-h-screen bg-zinc-50 dark:bg-black">
			<header className="border-b border-zinc-200/60 bg-white/70 backdrop-blur dark:border-zinc-800 dark:bg-black/50">
				<div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
					<Link href="/" className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white">← Back</Link>
					<a href={`/api/experiments/${exp.id}/export`} download className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm text-white hover:bg-black dark:bg-white dark:text-black">Export JSON</a>
				</div>
			</header>
			<main className="mx-auto max-w-6xl px-6 py-8">
				<h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Experiment</h1>
				<p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{exp.model} • {new Date(exp.createdAt).toLocaleString()} • {exp.totalCombinations} combos • {exp.status}</p>
				<p className="mt-4 whitespace-pre-wrap rounded-md border border-zinc-200 bg-white p-4 text-sm text-zinc-800 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100">{exp.prompt}</p>

				<section className="mt-8">
					<h2 className="mb-3 text-lg font-medium text-zinc-900 dark:text-zinc-100">Responses</h2>
					<div className="grid gap-4 md:grid-cols-2">
						{(exp.responses as RespWithMetrics[])
							.sort((a: RespWithMetrics, b: RespWithMetrics) => (b.metrics?.aggregate ?? 0) - (a.metrics?.aggregate ?? 0))
							.map((r) => (
							<article key={r.id} className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
								<header className="mb-2 flex items-center justify-between">
									<p className="text-xs text-zinc-600 dark:text-zinc-400">temp {r.temperature.toFixed(2)} • top_p {r.topP.toFixed(2)} • {r.latencyMs}ms</p>
									<span className="text-xs font-medium text-zinc-900 dark:text-zinc-100">Aggregate: {(r.metrics?.aggregate ?? 0).toFixed(2)}</span>
								</header>
								<MetricRow metrics={{
									readability: r.metrics?.readability ?? 0,
									coverage: r.metrics?.coverage ?? 0,
									structure: r.metrics?.structure ?? 0,
									redundancy: r.metrics?.redundancy ?? 0,
									coherence: r.metrics?.coherence ?? 0,
									lengthScore: r.metrics?.lengthScore ?? 0,
								}} />
								<pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap rounded-md bg-zinc-50 p-3 text-xs text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">{r.content}</pre>
							</article>
						))}
					</div>
				</section>
			</main>
		</div>
	);
}

function MetricRow({ metrics }: { metrics: Record<string, number> }) {
	const entries = Object.entries(metrics);
	return (
		<div className="grid grid-cols-3 gap-2 text-xs">
			{entries.map(([k, v])=>(
				<div key={k} className="flex items-center gap-2">
					<span className="w-24 capitalize text-zinc-600 dark:text-zinc-400">{label(k)}</span>
					<div className="h-2 flex-1 overflow-hidden rounded bg-zinc-200 dark:bg-zinc-800">
						<div className="h-full bg-zinc-900 dark:bg-white" style={{ width: `${Math.round(v * 100)}%` }} />
					</div>
					<span className="w-8 text-right tabular-nums text-zinc-700 dark:text-zinc-300">{v.toFixed(2)}</span>
				</div>
			))}
		</div>
	);
}

function label(k: string) {
	switch (k) {
		case "lengthScore": return "length";
		default: return k;
	}
}


