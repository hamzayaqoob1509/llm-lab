import syllable from "syllable";

export type MetricScores = {
	readability: number;
	coverage: number;
	structure: number;
	redundancy: number;
	coherence: number;
	lengthScore: number;
	aggregate: number;
	details: Record<string, number | string>;
};

const STOPWORDS = new Set([
	"the","is","at","which","on","and","a","to","in","for","of","with","as","by","an","be","or","it","that","this","these","those","are","was","were","from","but","if","so","we","you","they","i"
]);

export function computeMetrics(prompt: string, text: string): MetricScores {
	const readability = computeReadability(text);
	const coverage = computeCoverage(prompt, text);
	const structure = computeStructure(text);
	const redundancy = computeRedundancy(text);
	const coherence = computeCoherence(text);
	const lengthScore = computeLengthAppropriateness(prompt, text);

	// Weighted aggregate
	const aggregate =
		0.22 * readability +
		0.2 * coverage +
		0.18 * structure +
		0.18 * redundancy +
		0.12 * coherence +
		0.1 * lengthScore;

	return {
		readability,
		coverage,
		structure,
		redundancy,
		coherence,
		lengthScore,
		aggregate,
		details: {},
	};
}

function words(text: string): string[] {
	return (text.toLowerCase().match(/[a-zA-Z]+/g) ?? []);
}

function sentences(text: string): string[] {
	return (text.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(Boolean));
}

function computeReadability(text: string): number {
	const ws = words(text);
	const ss = sentences(text);
	const wordCount = Math.max(ws.length, 1);
	const sentenceCount = Math.max(ss.length, 1);
	const syllableCount = ws.reduce((sum, w) => sum + syllable(w), 0);
	// Flesch Reading Ease (approx) normalized to 0..1 (0..100 / 100)
	const readingEase = 206.835 - 1.015 * (wordCount / sentenceCount) - 84.6 * (syllableCount / wordCount);
	const normalized = clamp(readingEase / 100, 0, 1);
	return normalized;
}

function computeCoverage(prompt: string, text: string): number {
	const keyset = new Set(words(prompt).filter(w => !STOPWORDS.has(w) && w.length > 2));
	if (keyset.size === 0) return 1;
	const respWords = new Set(words(text));
	let covered = 0;
	keyset.forEach(k => { if (respWords.has(k)) covered++; });
	return covered / keyset.size;
}

function computeStructure(text: string): number {
	const lines = text.split(/\n/);
	const headings = lines.filter(l => l.trim().startsWith("#") || /^[A-Z].+:\s*$/.test(l.trim())).length;
	const lists = lines.filter(l => /^\s*[-*]\s+/.test(l) || /^\s*\d+\.\s+/.test(l)).length;
	const codeBlocks = (text.match(/```/g) || []).length / 2;
	const paragraphs = text.split(/\n{2,}/).filter(Boolean).length;
	let score = 0;
	if (headings > 0) score += 0.3;
	if (lists > 1) score += 0.3;
	if (codeBlocks > 0) score += 0.2;
	if (paragraphs >= 2) score += 0.2;
	return clamp(score, 0, 1);
}

function computeRedundancy(text: string): number {
	const ws = words(text);
	if (ws.length < 4) return 1;
	const bigrams: string[] = [];
	for (let i = 0; i < ws.length - 1; i++) {
		bigrams.push(ws[i] + " " + ws[i + 1]);
	}
	const counts = new Map<string, number>();
	bigrams.forEach(b => counts.set(b, (counts.get(b) ?? 0) + 1));
	const repeated = Array.from(counts.values()).filter(c => c > 1).reduce((a, b) => a + (b - 1), 0);
	const redundancyRate = repeated / bigrams.length;
	return clamp(1 - redundancyRate, 0, 1);
}

function computeCoherence(text: string): number {
	const ss = sentences(text);
	if (ss.length <= 1) return 0.6;
	// Presence of discourse markers
	const markers = ["however","therefore","because","first","next","then","finally","in addition","on the other hand","thus","overall"];
	const markerCount = ss.reduce((sum, s) => sum + (markers.some(m => s.toLowerCase().includes(m)) ? 1 : 0), 0);
	const markerScore = clamp(markerCount / ss.length, 0, 1);
	// Sentence length variability (moderate variance is good)
	const lengths = ss.map(s => words(s).length);
	const mean = lengths.reduce((a,b)=>a+b,0) / lengths.length;
	const variance = lengths.reduce((a,b)=> a + Math.pow(b - mean, 2), 0) / lengths.length;
	const std = Math.sqrt(variance);
	const variability = std / (mean || 1);
	const variabilityScore = 1 - Math.abs(variability - 0.5); // peak around 0.5
	const normVar = clamp(variabilityScore, 0, 1);
	return clamp(0.6 * markerScore + 0.4 * normVar, 0, 1);
}

function computeLengthAppropriateness(prompt: string, text: string): number {
	const target = inferTargetLength(prompt);
	const wc = words(text).length;
	const ratio = wc / target;
	// Score decays if outside 0.7..1.3 range
	const deviation = Math.abs(ratio - 1);
	const score = 1 - clamp(deviation / 1.0, 0, 1); // within ±100% goes to 0
	return clamp(score, 0, 1);
}

function inferTargetLength(prompt: string): number {
	const m = prompt.match(/(\d+)\s*(words|word)/i);
	if (m) return Math.max(parseInt(m[1], 10), 50);
	if (/list|bullet|steps|outline/i.test(prompt)) return 120;
	return 220;
}

function clamp(n: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, n));
}


