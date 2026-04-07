import { createFileRoute } from "@tanstack/react-router";
import { AuthPanel } from "../components/AuthPanel";
import { EventInspector } from "../components/EventInspector";

function IndexPage() {
	return (
		<div className="flex h-screen bg-gray-950 text-gray-100">
			{/* Left column: Auth panel */}
			<div className="w-72 flex-shrink-0 border-r border-gray-800 flex items-center justify-center p-4">
				<AuthPanel />
			</div>

			{/* Right column: Event inspector */}
			<div className="flex-1 min-w-0">
				<EventInspector />
			</div>
		</div>
	);
}

export const Route = createFileRoute("/")({
	component: IndexPage,
});
