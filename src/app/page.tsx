import Image from "next/image";
import Link from "next/link";
import { ExperimentForm } from "@/components/ExperimentForm";
import { ExperimentsList } from "@/components/ExperimentsList";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
			<header className="sticky top-0 z-10 border-b border-zinc-200/60 bg-white/80 backdrop-blur dark:bg-black/50 dark:border-zinc-800">
				<div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
					<div className="flex items-center gap-2">
						<Image className="dark:invert" src="/next.svg" alt="logo" width={36} height={10} />
						<span className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">LLM Lab</span>
					</div>
					<nav className="text-sm text-zinc-600 dark:text-zinc-300">
						<Link href="/" className="hover:text-zinc-900 dark:hover:text-white">Home</Link>
					</nav>
				</div>
			</header>
			<main className="mx-auto grid max-w-6xl gap-10 px-6 py-10 md:grid-cols-5">
				<section className="md:col-span-2">
					<h2 className="mb-3 text-xl font-semibold text-zinc-900 dark:text-zinc-100">New Experiment</h2>
					<ExperimentForm />
				</section>
				<section className="md:col-span-3">
					<h2 className="mb-3 text-xl font-semibold text-zinc-900 dark:text-zinc-100">Recent Experiments</h2>
					<ExperimentsList />
				</section>
			</main>
		</div>
  );
}
