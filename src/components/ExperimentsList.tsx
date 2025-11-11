"use client";

import useSWR from "swr";
import Link from "next/link";

type Item = {
	id: string;
	createdAt: string;
	prompt: string;
	model: string;
	status: "RUNNING" | "COMPLETED" | "FAILED";
	durationMs: number | null;
	totalCombinations: number;
};

export function ExperimentsList() {
	const { data, isLoading, error } = useSWR<{ experiments: Item[] }>(
		"/api/experiments",
		(url) => fetch(url).then((r) => r.json()),
		{ refreshInterval: 4000 }
	);
	if (isLoading) return <div className="text-sm text-zinc-500">Loading…</div>;
	if (error) return <div className="text-sm text-red-500">Failed to load experiments</div>;
	if (!data || data.experiments?.length === 0) return <div className="text-sm text-zinc-500">No experiments yet.</div>;
	return (
		<div className="divide-y divide-zinc-200 overflow-hidden rounded-lg border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
			{data.experiments?.map((e: Item) => (
				<Link key={e.id} href={`/experiments/${e.id}`} className="block px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900">
					<div className="flex items-center justify-between gap-3">
						<div className="min-w-0">
							<p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">{e.prompt}</p>
							<p className="truncate text-xs text-zinc-500">{new Date(e.createdAt).toLocaleString()} • {e.model} • {e.totalCombinations} combos</p>
						</div>
						<span
							className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
								e.status === "COMPLETED"
									? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
									: e.status === "RUNNING"
									? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
									: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
							}`}
						>
							{e.status}
						</span>
					</div>
				</Link>
			))}
		</div>
	);
}


