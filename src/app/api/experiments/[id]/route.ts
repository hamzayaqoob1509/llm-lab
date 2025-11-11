import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
	const item = await prisma.experiment.findUnique({
		where: { id: params.id },
		include: { responses: { include: { metrics: true } } },
	});
	if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
	return NextResponse.json(item);
}


