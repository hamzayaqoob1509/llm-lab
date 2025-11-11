import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: { id: string } } | { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Params) {
	const p = (ctx as any)?.params;
	const { id } = typeof p?.then === "function" ? await p : p ?? {};
	if (!id) {
		return new Response("Missing id", { status: 400 });
	}
	const item = await prisma.experiment.findUnique({
		where: { id },
		include: { responses: { include: { metrics: true } } },
	});
	if (!item) {
		return new Response("Not found", { status: 404 });
	}
	const filename = `experiment-${item.id}.json`;
	const body = JSON.stringify(item, null, 2);
	return new Response(body, {
		headers: {
			"Content-Type": "application/json; charset=utf-8",
			"Content-Disposition": `attachment; filename="${filename}"`,
			"Content-Length": Buffer.byteLength(body).toString(),
			"Cache-Control": "no-store",
			"X-Content-Type-Options": "nosniff",
		},
	});
}


