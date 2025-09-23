"use client";

import { FaLinkedin } from "react-icons/fa";

interface LinkedInFloatingButtonProps {
	profileUrl?: string;
}

export default function LinkedInFloatingButton({ profileUrl }: LinkedInFloatingButtonProps) {
	const href = profileUrl || "https://www.linkedin.com/in/singlarhydham/";
	return (
		<a
			href={href}
			target="_blank"
			rel="noopener noreferrer"
			className="fixed bottom-6 left-6 z-50 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 hover:scale-110 transition-transform duration-300"
			aria-label="Contact on LinkedIn"
		>
			<FaLinkedin size={28} />
		</a>
	);
}
