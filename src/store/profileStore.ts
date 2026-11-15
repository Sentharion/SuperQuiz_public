import { getAchievements } from "@/constants/achievements";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type ProfileStore = {
    avatarUrl: string | null;
    username: string;
    highestScore: number;
    flashcardsBestScore: number;
    wins: number;
    isPremium: boolean;

    unlockedAchievements: string[];
    pendingAchievements: string[];

    updateAvatar: (url: string | null) => void;
    updateUsername: (username: string) => void;
    updateHighestScore: (score: number) => void;
    updateFlashcardsBestScore: (score: number) => void;
    updateWins: (wins: number) => void;
    resetStats: () => void;
    setPremium: (isPremium: boolean) => void;
    removePendingAchievement: (id: string) => void;
};

export const useProfileStore = create<ProfileStore>()(
    persist(
        (set, get) => {
            // Sprawdza nowe osiągnięcia na podstawie statystyk
            const checkAchievements = (
                highestScore: number,
                wins: number
            ) => {
                const unlocked = get().unlockedAchievements;

                const newlyUnlocked = getAchievements(
                    highestScore,
                    wins
                )
                    .filter(
                        (achievement) =>
                            achievement.unlocked &&
                            !unlocked.includes(achievement.id)
                    )
                    .map((achievement) => achievement.id);

                if (newlyUnlocked.length > 0) {
                    set((state) => ({
                        unlockedAchievements: [
                            ...state.unlockedAchievements,
                            ...newlyUnlocked,
                        ],
                        pendingAchievements: [
                            ...state.pendingAchievements,
                            ...newlyUnlocked,
                        ],
                    }));
                }
            };

            return {
                avatarUrl: null,
                username: "Gracz",
                highestScore: 0,
                flashcardsBestScore: 0,
                wins: 0,
                isPremium: false,

                unlockedAchievements: [],
                pendingAchievements: [],

                updateAvatar: (url) => set({ avatarUrl: url }),

                updateUsername: (username) => set({ username }),

                updateHighestScore: (score) => {
                    const current = get().highestScore;
                    const newScore = Math.max(current, score);

                    set({ highestScore: newScore });

                    checkAchievements(newScore, get().wins);
                },

                updateFlashcardsBestScore: (score) =>
                    set({ flashcardsBestScore: score }),

                updateWins: (wins) => {
                    set({ wins });

                    checkAchievements(get().highestScore, wins);
                },

                resetStats: () =>
                    set({
                        highestScore: 0,
                        flashcardsBestScore: 0,
                        wins: 0,
                        pendingAchievements: [],
                        unlockedAchievements: []
                    }),

                setPremium: (isPremium) => set({ isPremium }),

                removePendingAchievement: (id) =>
                    set((state) => ({
                        pendingAchievements:
                            state.pendingAchievements.filter(
                                (item) => item !== id
                            ),
                    })),
            };
        },
        {
            name: "profile-store",
            storage: createJSONStorage(() => AsyncStorage),
            version: 2,
            migrate: (persistedState: any) => ({
                ...persistedState,
                unlockedAchievements:
                    persistedState?.unlockedAchievements ?? [],
                pendingAchievements:
                    persistedState?.pendingAchievements ?? [],
            }),
        }
    )
);