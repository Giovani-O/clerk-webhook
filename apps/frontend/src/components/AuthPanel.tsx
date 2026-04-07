import { SignIn, UserProfile, useUser } from "@clerk/react";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as
	| string
	| undefined;

function ClerkAuthContent() {
	const { isLoaded, isSignedIn } = useUser();

	if (!isLoaded) {
		return (
			<div className="flex items-center justify-center h-full">
				<div className="w-6 h-6 rounded-full border-2 border-gray-600 border-t-gray-300 animate-spin" />
			</div>
		);
	}

	if (!isSignedIn) {
		return (
			<div className="flex items-center justify-center h-full">
				<SignIn />
			</div>
		);
	}

	return (
		<div className="flex items-center justify-center h-full overflow-auto">
			<UserProfile />
		</div>
	);
}

export function AuthPanel() {
	if (!PUBLISHABLE_KEY) {
		// Mock mode — no Clerk key available
		return (
			<div className="flex items-center justify-center h-full border-2 border-dashed border-gray-700 rounded-lg">
				<div className="text-center">
					<p className="text-gray-500 text-sm font-mono">Auth panel</p>
					<p className="text-gray-600 text-xs mt-1">
						Set VITE_CLERK_PUBLISHABLE_KEY to enable
					</p>
				</div>
			</div>
		);
	}

	return <ClerkAuthContent />;
}
