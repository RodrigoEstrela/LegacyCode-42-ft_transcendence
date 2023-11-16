import React from 'react';

interface SoundPlayerProps {
	src: string;
	volume?: number;
	loop?: boolean;
}

const SoundPlayer: React.FC<SoundPlayerProps> = ({ src, volume = 1, loop = false }) => {
	const audioRef = React.useRef<HTMLAudioElement>(null);

	React.useEffect(() => {
		if (audioRef.current) {
			audioRef.current.volume = volume;
			audioRef.current.loop = loop;
		}
	}, [volume, loop]);

	const playSound = () => {
		if (audioRef.current) {
			// Ensure 'current' is not null before accessing properties or methods
			if (audioRef.current.play) {
				audioRef.current.currentTime = 0;
				audioRef.current.play();
			}
		}
	};

	return <audio ref={audioRef} src={src} />;
};

export default SoundPlayer;
