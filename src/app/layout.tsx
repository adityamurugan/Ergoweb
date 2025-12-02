export const metadata = {
	title: "ErgoWeb RULA",
	description: "RULA analysis from images or video"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body>
				{children}
			</body>
		</html>
	);
}


