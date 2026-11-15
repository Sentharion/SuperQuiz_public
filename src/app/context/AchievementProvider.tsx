import React, { useMemo } from "react";

import { getAchievements } from "@/constants/achievements";
import { useProfileStore } from "../../store/profileStore";
import AchievementToast from "../components/AchievementToast";

type Props = {
    children: React.ReactNode;
};

export function AchievementToastProvider({ children }: Props) {
    const pendingAchievements = useProfileStore(
        (state) => state.pendingAchievements
    );

    const removePendingAchievement = useProfileStore(
        (state) => state.removePendingAchievement
    );

    const highestScore = useProfileStore((state) => state.highestScore);
    const wins = useProfileStore((state) => state.wins);

    const currentId = pendingAchievements[0];

    const achievement = useMemo(() => {
        if (!currentId) return null;
        return (
            getAchievements(highestScore, wins).find(
                (item) => item.id === currentId
            ) ?? null
        );
    }, [currentId, highestScore, wins]);

    return (
        <>
            {children}

            <AchievementToast
                achievement={achievement}
                onHide={() => {
                    if (currentId) {
                        removePendingAchievement(currentId);
                    }
                }}
            />
        </>
    );
}
