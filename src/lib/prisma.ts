import { PrismaClient } from "../generated/prisma/client";
import path from "path";

declare global {
    var prismaGlobal: PrismaClient | undefined;
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
	return raw;
}

export const prisma: PrismaClient =
	global.prismaGlobal ??
	new PrismaClient({
		log: ["error", "warn"],
		datasourceUrl: resolveDatabaseUrl(),
	});

if (process.env.NODE_ENV !== "production") {
	global.prismaGlobal = prisma;
}
