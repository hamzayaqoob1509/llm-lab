import path from "path";

declare global {
	// eslint-disable-next-line no-var
	var prismaGlobal: any | undefined;
}

function resolveDatabaseUrl(): string | undefined {
	const raw = process.env.DATABASE_URL;
	// For Postgres in production just return the URL. Keep local sqlite fallback for dev.
	if (!raw) {
		const abs = path.join(process.cwd(), "prisma", "dev.db");
		return `file:${abs}`;
	}
	if (raw.startsWith("file:./")) {
		const rel = raw.replace(/^file:\.\//, "");
		const abs = path.join(process.cwd(), rel);
		return `file:${abs}`;
	}
	// Neon tip: remove channel_binding if present (can fail on some Node runtimes)
	if (raw.startsWith("postgres")) {
		try {
			const u = new URL(raw);
			if (u.searchParams.get("channel_binding")) {
				u.searchParams.delete("channel_binding");
				return u.toString();
			}
		} catch {
			// no-op, fall back to raw
		}
	}
	return raw;
}

export async function getPrisma() {
	if (global.prismaGlobal) return global.prismaGlobal;
	let PrismaClientCtor: any;
	try {
		const prismaModule: any = await import("@prisma/client");
		PrismaClientCtor =
			prismaModule?.PrismaClient ??
			prismaModule?.default?.PrismaClient ??
			prismaModule?.default;
	} catch {
		// Fallback: load generated client directly from node_modules/.prisma/client
		const generatedPath = path.join(process.cwd(), "node_modules", ".prisma", "client", "index.js");
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const generatedModule = await import(`file://${generatedPath}`);
		PrismaClientCtor =
			(generatedModule as any)?.PrismaClient ??
			(generatedModule as any)?.default?.PrismaClient ??
			(generatedModule as any)?.default;
	}
	const client = new PrismaClientCtor({
		log: ["error", "warn"],
		datasourceUrl: resolveDatabaseUrl(),
	});
	if (process.env.NODE_ENV !== "production") {
		global.prismaGlobal = client;
	}
	return client;
}

