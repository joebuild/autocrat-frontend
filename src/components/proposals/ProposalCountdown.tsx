import { useEffect, useMemo, useState } from 'react';

export const ProposalCountdown: React.FC<{
    remainingSlots: number | undefined;
}> = ({ remainingSlots }) => {
    const [secondsLeft, setSecondsLeft] = useState<number>(0);

    const timeLeft = useMemo(() => {
        if (!secondsLeft) return;
        const seconds = secondsLeft;
        const days = Math.floor(seconds / (60 * 60 * 24));
        const hours = Math.floor((seconds % (60 * 60 * 24)) / (60 * 60));
        const minutes = Math.floor((seconds % (60 * 60)) / 60);
        const secLeft = Math.floor(seconds % 60);

        const daysString = days ? String(days).padStart(2, '0') + ":" : ""
        const hoursString = hours ? String(hours).padStart(2, '0') + ":" : ""
        const minutesString = minutes ? String(minutes).padStart(2, '0') + ":" : ""

        return `${daysString}${hoursString}${minutesString}${String(secLeft).padStart(2, '0')}`;
    }, [secondsLeft]);

    useEffect(() => {
        setSecondsLeft(((remainingSlots || 0) / 25) * 10);
    }, [remainingSlots]);

    useEffect(() => {
        const interval = setInterval(
            () => (secondsLeft && secondsLeft > 0 ? setSecondsLeft((old) => old - 1) : 0),
            1000,
        );
        return () => clearInterval(interval);
    });

    return <>
        {secondsLeft > 0 ? <div className="font-bold">{timeLeft}</div> : "None"}
    </>;
};