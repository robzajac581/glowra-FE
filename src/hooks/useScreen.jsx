import { useEffect, useState } from "react";
const useScreen = () => {
	const [screen, setScreen] = useState(window.innerWidth);
	const handleResize = () => {
		setScreen(window.innerWidth);
	};
	useEffect(() => {
		window.addEventListener("resize", handleResize);
		return () => {
			window.removeEventListener("resize", handleResize);
		};
	}, []);
	return screen;
};

export default useScreen;
