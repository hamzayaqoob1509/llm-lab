import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getLLM } from "@/lib/llmProvider";
import { computeMetrics } from "@/lib/metrics";

export const runtime = "nodejs";

const CreateSchema = z.object({
	prompt: z.string().min(5),
	model: z.string().default("gpt-4o-mini"),
	tempMin: z.number().min(0).max(2).default(0.2),
	tempMax: z.number().min(0).max(2).default(1.2),
	tempStep: z.number().positive().max(1).default(0.3),
	topPMin: z.number().min(0).max(1).default(0.3),
	topPMax: z.number().min(0).max(1).default(1),
	topPStep: z.number().positive().max(1).default(0.35),
	maxTokens: z.number().int().positive().max(2000).optional(),
});

export async function GET() {
	const experiments = await prisma.experiment.findMany({
		orderBy: { createdAt: "desc" },
		select: {
			id: true, createdAt: true, prompt: true, model: true, status: true, durationMs: true, totalCombinations: true,
		},
	});
	return NextResponse.json({ experiments });
}

export async function POST(req: NextRequest) {
	const body = await req.json();
	const parsed = CreateSchema.safeParse(body);
	if (!parsed.success) {
		return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
	}
	const { prompt, model, tempMin, tempMax, tempStep, topPMin, topPMax, topPStep, maxTokens } = parsed.data;

	const temps: number[] = [];
	for (let t = tempMin; t <= tempMax + 1e-9; t += tempStep) temps.push(parseFloat(t.toFixed(2)));
	const tops: number[] = [];
	for (let p = topPMin; p <= topPMax + 1e-9; p += topPStep) tops.push(parseFloat(p.toFixed(2)));
	const combos = temps.flatMap((t) => tops.map((p) => ({ temperature: t, topP: p })));

	const startedAt = Date.now();
	const exp = await prisma.experiment.create({
		data: {
			prompt, model,
			tempMin, tempMax, tempStep,
			topPMin, topPMax, topPStep,
			totalCombinations: combos.length,
			status: "RUNNING",
		},
	});

	const llm = getLLM();
	try {
		const results = await Promise.all(
			combos.map(async ({ temperature, topP }) => {
				const gen = await llm.generate({ model, prompt, temperature, topP, maxTokens });
				const metrics = computeMetrics(prompt, gen.content);
				return { temperature, topP, gen, metrics };
			})
		);

		for (const r of results) {
			const resp = await prisma.response.create({
				data: {
					experimentId: exp.id,
					model,
					temperature: r.temperature,
					topP: r.topP,
					content: r.gen.content,
					latencyMs: r.gen.latencyMs,
					finishReason: r.gen.finishReason,
				},
			});
			await prisma.metrics.create({
				data: {
					responseId: resp.id,
					readability: r.metrics.readability,
					coverage: r.metrics.coverage,
					structure: r.metrics.structure,
					redundancy: r.metrics.redundancy,
					coherence: r.metrics.coherence,
					lengthScore: r.metrics.lengthScore,
					aggregate: r.metrics.aggregate,
				},
			});
		}

		await prisma.experiment.update({
			where: { id: exp.id },
			data: { status: "COMPLETED", durationMs: Date.now() - startedAt },
		});
	} catch (e: any) {
		await prisma.experiment.update({
			where: { id: exp.id },
			data: { status: "FAILED", errorMessage: String(e?.message ?? e) },
		});
		return NextResponse.json({ id: exp.id, status: "FAILED", error: String(e?.message ?? e) }, { status: 500 });
	}

	const full = await prisma.experiment.findUnique({
		where: { id: exp.id },
		include: { responses: { include: { metrics: true } } },
	});
	return NextResponse.json(full);
}


