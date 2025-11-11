import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type Params = { params: { id: string } } | { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Params) {
	const p = (ctx as any)?.params;
	const { id } = typeof p?.then === "function" ? await p : p ?? {};
	if (!id) {
		return NextResponse.json({ error: "Missing id" }, { status: 400 });
	}
	const item = await prisma.experiment.findUnique({
		where: { id },
		include: { responses: { include: { metrics: true } } },
	});
	if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
	return NextResponse.json(item);
}


