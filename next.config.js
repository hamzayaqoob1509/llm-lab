/** @type {import('next').NextConfig} */
module.exports = {
	// Ensure Prisma client and engine libraries are included in the serverless bundle
	outputFileTracingIncludes: {
		"/": ["node_modules/.prisma/**", "node_modules/@prisma/client/**"],
	},
};


