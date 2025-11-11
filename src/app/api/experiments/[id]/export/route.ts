import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
	const item = await prisma.experiment.findUnique({
		where: { id: params.id },
		include: { responses: { include: { metrics: true } } },
	});
	if (!item) {
		return new Response("Not found", { status: 404 });
	}
	const filename = `experiment-${item.id}.json`;
	return new Response(JSON.stringify(item, null, 2), {
		headers: {
			"Content-Type": "application/json",
			"Content-Disposition": `attachment; filename=${filename}`,
		},
	});
}


