// Type shim so TS resolves the generated Prisma client path alias
declare module "@/generated/prisma" {
	export { PrismaClient } from "@prisma/client";
}


