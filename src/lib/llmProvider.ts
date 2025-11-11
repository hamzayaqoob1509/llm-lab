import OpenAI from "openai";

export type GenerateParams = {
	model: string;
	prompt: string;
	temperature: number;
	topP: number;
	maxTokens?: number;
	signal?: AbortSignal;
};

export type GenerateResult = {
	content: string;
	latencyMs: number;
	finishReason?: string;
};

export interface LLMProvider {
	generate(params: GenerateParams): Promise<GenerateResult>;
}

class OpenAILLM implements LLMProvider {
	private client: OpenAI;

	constructor() {
		this.client = new OpenAI({
			apiKey: process.env.OPENAI_API_KEY,
		});
	}

	async generate(params: GenerateParams): Promise<GenerateResult> {
		const startedAt = Date.now();
		const res = await this.client.chat.completions.create(
			{
				model: params.model,
				messages: [{ role: "user", content: params.prompt }],
				temperature: params.temperature,
				top_p: params.topP,
				max_tokens: params.maxTokens ?? 400,
			},
			{ signal: params.signal }
		);
		const content = res.choices?.[0]?.message?.content ?? "";
		const finishReason = res.choices?.[0]?.finish_reason;
		return {
			content,
			latencyMs: Date.now() - startedAt,
			finishReason: finishReason ?? undefined,
		};
	}
}

// Simple mock: generates deterministic variations based on parameters
class MockLLM implements LLMProvider {
	async generate(params: GenerateParams): Promise<GenerateResult> {
		const startedAt = Date.now();
		const { prompt, temperature, topP } = params;
		const variability = Math.round((temperature * 7 + topP * 5) % 10);
		const bullets = Array.from({ length: 3 + (variability % 4) })
			.map((_, i) => `- Insight ${i + 1}: ${this.mutateText(prompt, i + variability)}`)
			.join("\n");
		const content = [
			`### Response (temp=${temperature.toFixed(2)}, top_p=${topP.toFixed(2)})`,
			"",
			this.mutateText(prompt, variability),
			"",
			"Key points:",
			bullets,
			"",
			"Conclusion:",
			this.mutateText("In summary, the response balances clarity and detail.", variability + 2),
		].join("\n");
		await new Promise((r) => setTimeout(r, 200 + variability * 20));
		return { content, latencyMs: Date.now() - startedAt, finishReason: "stop" };
	}

	private mutateText(text: string, seed: number): string {
		const synonyms: Record<string, string[]> = {
			good: ["strong", "effective", "robust"],
			bad: ["weak", "poor", "limited"],
			important: ["crucial", "significant", "notable"],
			fast: ["quick", "rapid", "swift"],
			slow: ["gradual", "measured", "leisurely"],
			example: ["illustration", "instance", "case"],
			explain: ["clarify", "describe", "elaborate"],
			steps: ["process", "sequence", "stages"],
		};
		const words = text.split(/\b/);
		return words
			.map((w, idx) => {
				const key = w.toLowerCase();
				if (synonyms[key]) {
					const list = synonyms[key];
					return list[(seed + idx) % list.length];
				}
				return w;
			})
			.join("");
	}
}

export function getLLM(): LLMProvider {
	if (process.env.OPENAI_API_KEY) {
		return new OpenAILLM();
	}
	return new MockLLM();
}


