"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ExperimentForm() {
	const router = useRouter();
	const [prompt, setPrompt] = useState("");
	const [model, setModel] = useState("gpt-4o-mini");
	const [tempMin, setTempMin] = useState(0.2);
	const [tempMax, setTempMax] = useState(1.0);
	const [tempStep, setTempStep] = useState(0.4);
	const [topPMin, setTopPMin] = useState(0.3);
	const [topPMax, setTopPMax] = useState(1.0);
	const [topPStep, setTopPStep] = useState(0.35);
	const [submitting, setSubmitting] = useState(false);

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		setSubmitting(true);
		try {
			const res = await fetch("/api/experiments", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					prompt,
					model,
					tempMin,
					tempMax,
					tempStep,
					topPMin,
					topPMax,
					topPStep,
				}),
			});
			const data = await res.json();
			if (!res.ok) {
				throw new Error(data?.error ?? "Failed to create experiment");
			}
			router.push(`/experiments/${data.id}`);
		} catch (err: any) {
			alert(err.message);
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<form onSubmit={onSubmit} className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
			<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Prompt</label>
			<textarea
				value={prompt}
				onChange={(e) => setPrompt(e.target.value)}
				required
				rows={6}
				placeholder="Explain the trade-offs between temperature and top_p for creative writing vs factual QA..."
				className="mt-1 w-full resize-y rounded-md border border-zinc-300 bg-white p-2 text-sm outline-none ring-0 placeholder:text-zinc-400 focus:border-zinc-400 dark:border-zinc-700 dark:bg-black dark:text-zinc-100"
			/>
			
			<div className="mt-4 grid grid-cols-2 gap-3">
				<div>
					<label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">Model</label>
					<select value={model} onChange={(e) => setModel(e.target.value)} className="mt-1 w-full rounded-md border border-zinc-300 bg-white p-2 text-sm dark:border-zinc-700 dark:bg-black dark:text-zinc-100">
						<option value="gpt-4o-mini">gpt-4o-mini</option>
						<option value="gpt-4o">gpt-4o</option>
					</select>
				</div>
			</div>

			<div className="mt-4 grid grid-cols-3 gap-3">
				<NumberField label="Temperature Min" value={tempMin} setValue={setTempMin} step={0.1} min={0} max={2} />
				<NumberField label="Temperature Max" value={tempMax} setValue={setTempMax} step={0.1} min={0} max={2} />
				<NumberField label="Temperature Step" value={tempStep} setValue={setTempStep} step={0.1} min={0.05} max={1} />
			</div>
			<div className="mt-3 grid grid-cols-3 gap-3">
				<NumberField label="Top_p Min" value={topPMin} setValue={setTopPMin} step={0.05} min={0} max={1} />
				<NumberField label="Top_p Max" value={topPMax} setValue={setTopPMax} step={0.05} min={0} max={1} />
				<NumberField label="Top_p Step" value={topPStep} setValue={setTopPStep} step={0.05} min={0.05} max={1} />
			</div>

			<button type="submit" disabled={submitting} className="mt-5 w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-black disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-200">
				{submitting ? "Running…" : "Run Experiment"}
			</button>
			<p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">We’ll auto-fallback to a local mock if no API key is set.</p>
		</form>
	);
}

function NumberField(props: { label: string; value: number; setValue: (n: number) => void; step: number; min: number; max: number }) {
	const { label, value, setValue, step, min, max } = props;
	return (
		<div>
			<label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">{label}</label>
			<input
				type="number"
				step={step}
				min={min}
				max={max}
				value={Number.isFinite(value) ? value : 0}
				onChange={(e) => setValue(e.target.value === "" ? 0 : parseFloat(e.target.value))}
				className="mt-1 w-full rounded-md border border-zinc-300 bg-white p-2 text-sm dark:border-zinc-700 dark:bg-black dark:text-zinc-100"
			/>
		</div>
	);
}


