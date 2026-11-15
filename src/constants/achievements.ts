
import {
    Sparkles,
    Trophy,
    Crown,
    ShieldCheck,
    Flame,
    Award,
    Brain,
    Medal,
} from "lucide-react-native";

import type { LucideIcon } from "lucide-react-native";

export type Achievement = {
    id: string;
    title: string;
    desc: string;
    unlocked: boolean;
    progress: number;
    progressLabel: string;
    icon: LucideIcon;
    color: string;
    category: string;
};

export const getAchievements = (
    highestScore: number,
    wins: number
): Achievement[] => [
    // POCZĄTKI
    {
        id: "first_game",
        title: "Pierwsze Kroki",
        desc: "Zagraj swoją pierwszą partię",
        unlocked: highestScore > 0 || wins > 0,
        progress: highestScore > 0 || wins > 0 ? 100 : 0,
        progressLabel: `${wins > 0 || highestScore > 0 ? 1 : 0} / 1`,
        icon: Sparkles,
        color: "#60a5fa",
        category: "Początki",
    },
    {
        id: "first_win",
        title: "Smak Zwycięstwa",
        desc: "Wygraj swój pierwszy teleturniej",
        unlocked: wins >= 1,
        progress: Math.min(100, wins * 100),
        progressLabel: `${Math.min(wins, 1)} / 1`,
        icon: Trophy,
        color: "#facc15",
        category: "Zwycięstwa",
    },

    // ZWYCIĘSTWA
    {
        id: "triple_champ",
        title: "Potrójna Korona",
        desc: "Wygraj 3 teleturnieje",
        unlocked: wins >= 3,
        progress: Math.min(100, Math.round((wins / 3) * 100)),
        progressLabel: `${Math.min(wins, 3)} / 3`,
        icon: Crown,
        color: "#eab308",
        category: "Zwycięstwa",
    },
    {
        id: "final_master",
        title: "Mistrz Finału",
        desc: "Wygraj 5 teleturniejów",
        unlocked: wins >= 5,
        progress: Math.min(100, Math.round((wins / 5) * 100)),
        progressLabel: `${Math.min(wins, 5)} / 5`,
        icon: Trophy,
        color: "#f59e0b",
        category: "Zwycięstwa",
    },
    {
        id: "champion",
        title: "Niepokonany",
        desc: "Wygraj 10 teleturniejów",
        unlocked: wins >= 10,
        progress: Math.min(100, Math.round((wins / 10) * 100)),
        progressLabel: `${Math.min(wins, 10)} / 10`,
        icon: ShieldCheck,
        color: "#a78bfa",
        category: "Zwycięstwa",
    },
    {
        id: "legend",
        title: "Król Teleturnieju",
        desc: "Wygraj 20 teleturniejów",
        unlocked: wins >= 20,
        progress: Math.min(100, Math.round((wins / 20) * 100)),
        progressLabel: `${Math.min(wins, 20)} / 20`,
        icon: Crown,
        color: "#fbbf24",
        category: "Zwycięstwa",
    },

    // WIEDZA
    {
        id: "hundred_pts",
        title: "Setka Pękła",
        desc: "Zdobądź 100+ pkt w jednej grze",
        unlocked: highestScore >= 100,
        progress: Math.min(100, Math.round((highestScore / 100) * 100)),
        progressLabel: `${Math.min(highestScore, 100)} / 100`,
        icon: Flame,
        color: "#fb923c",
        category: "Wiedza",
    },
    {
        id: "scholar",
        title: "Ekspert Quizu",
        desc: "Zdobądź 300+ punktów",
        unlocked: highestScore >= 300,
        progress: Math.min(100, Math.round((highestScore / 300) * 100)),
        progressLabel: `${Math.min(highestScore, 300)} / 300`,
        icon: Award,
        color: "#c084fc",
        category: "Wiedza",
    },
    {
        id: "genius",
        title: "Umysł Geniusza",
        desc: "Zdobądź 600+ punktów",
        unlocked: highestScore >= 600,
        progress: Math.min(100, Math.round((highestScore / 600) * 100)),
        progressLabel: `${Math.min(highestScore, 600)} / 600`,
        icon: Brain,
        color: "#818cf8",
        category: "Wiedza",
    },
    {
        id: "perfect_score",
        title: "Absolutna Dominacja",
        desc: "Zdobądź 1000+ punktów",
        unlocked: highestScore >= 1000,
        progress: Math.min(100, Math.round((highestScore / 1000) * 100)),
        progressLabel: `${Math.min(highestScore, 1000)} / 1000`,
        icon: Medal,
        color: "#facc15",
        category: "Wiedza",
    },
];
