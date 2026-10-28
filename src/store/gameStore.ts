import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { type Flashcard, FlashcardScore, generateBotName, getSex, type PlayerColor, type Question } from "../constants/types";
import SoundService from "../services/sound";
import { useProfileStore } from "./profileStore";

export type GameMode = "classic" | "final" | "solo" | "multiplayer" | "flashcards";
export type GameStage = 1 | 2 | 3;

export interface Player {
    id: number;
    username: string;
    avatar?: string;
    avatarColor?: PlayerColor;
    points: number;
    lives: number;
    active: boolean;
    isBot: boolean;
    knowledge?: number;
    sex?: 'male' | 'female';
}

interface GameStore {
    mode: GameMode | null;
    stage: GameStage;
    players: Player[];
    questions: Question[];
    flashcards: Flashcard[];
    currentQuestionIndex: number;
    questionsRemaining: number;
    flashcardTimer: number;
    flashcardStartTime: number | null;
    timeLimit: number;
    currentPlayerId: number | null;
    selectedPlayerId: number | null;
    awaitingDesignation: boolean;
    designatorId: number | null;
    flashcardScores: FlashcardScore[];
    flashcardPausedAt: number | null;
    flashcardPausedTime: number;
    soundEnabled: boolean;

    round: 1 | 2;
    currentSeat: number;

    buzzEnabled: boolean;
    buzzQueue: number[];
    buzzLocked: boolean;

    gameFinished: boolean;
    isTransitioning: boolean;

    startGame: (mode: GameMode, questions: Question[], username: string, bots?: number, avatar?: string | null, flashcards?: Flashcard[]) => void;
    nextQuestion: () => void;

    updatePlayer: (playerId: number, updates: Partial<Player>) => void;
    answerQuestion: (correct: boolean, forcedPlayerId?: number, questionIndex?: number) => void;
    buzzIn: (playerId: number) => void;
    botBuzz: () => void;
    designatePlayer: (targetId: number) => void;

    setCurrentPlayer: (playerId: number | null) => void;
    setSelectedPlayer: (playerId: number | null) => void;

    nextStage: () => void;
    setFlashcardTimer: (timer: number) => void;
    finishGame: () => void;
    resetGame: () => void;
    finishTransition: () => void;
    skipQuestion: () => void;
    startFlashcardTimer: () => void;
    stopFlashcardTimer: () => void;
    pauseGame: () => void;
    unpauseGame: () => void;
    isPaused: boolean;

    setNextPlayer: () => void;
    checkStageTransition: () => void;
    getAlivePlayers: () => Player[];
    addPlayer: (player: Player) => void;
    removePlayer: (id: number) => void;
    addFlashcardScore: (points: number, time: number) => void;
    loadFlashcardScores: () => Promise<void>;
    toggleSound: () => void;

}


const updateProfile = () => {
    const profile = useProfileStore.getState();
    const game = useGameStore.getState();
    const mainHuman = game.players.find(p => p.id === 1 && !p.isBot);

    if (game.mode === "final" || game.mode === "classic" || game.mode === "solo" || game.mode === "multiplayer" || game.mode === "flashcards") {
        if (mainHuman && mainHuman.points > profile.highestScore) {
            profile.updateHighestScore(mainHuman.points);
        }
    }

    if (game.mode === "classic" || game.mode === "final" || game.mode === "multiplayer" || game.mode === "flashcards") {
        const players = game.players;
        if (mainHuman) {
            const hasHigherScorer = players.some(p => p.id !== mainHuman.id && p.points > mainHuman.points);
            if (!hasHigherScorer) {
                profile.updateWins(profile.wins + 1);
            }
        }
    }
}

export const useGameStore = create<GameStore>((set, get) => ({
    mode: null,
    stage: 1,
    players: [],
    questions: [],
    flashcards: [],
    currentQuestionIndex: 0,
    questionsRemaining: 0,
    flashcardTimer: 0,
    flashcardStartTime: null,
    flashcardPausedAt: null,
    currentPlayerId: null,
    selectedPlayerId: null,
    awaitingDesignation: false,
    designatorId: null,
    flashcardPausedTime: 0,
    soundEnabled: true,

    round: 1,
    currentSeat: 1,

    buzzEnabled: false,
    buzzQueue: [],
    buzzLocked: false,
    timeLimit: 5,
    gameFinished: false,
    flashcardScores: [],
    isTransitioning: false,
    isPaused: false,

    startGame: (mode, questions, username, bots = 0, avatar = null, flashcards = []) => set((state) => {
        let startingStage: number = mode === "final" ? 3 : 1;
        let playersToUse: Player[] = [];

        if (mode === "multiplayer") {
            playersToUse = [...state.players].map((p, index) => ({
                ...p,
                id: index + 1,
                points: 0,
                lives: 3,
                active: true,
            }));

            for (let i = playersToUse.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [playersToUse[i], playersToUse[j]] = [playersToUse[j], playersToUse[i]];
            }

            if (playersToUse.length <= 3) {
                startingStage = 3;
                playersToUse = playersToUse.map(p => ({ ...p, points: 3 }));
            }

        } else {
            let playersCount = 0;
            if (mode === "solo" || mode === "flashcards") playersCount = 1;
            else if (mode === "final") playersCount = 3;
            else playersCount = 1 + bots;

            const botNames = generateBotName(Math.max(0, playersCount - 1));
            playersToUse = [
                { id: 1, username, avatar: avatar || undefined, points: startingStage === 3 ? 3 : 0, lives: 3, active: true, isBot: false, sex: 'male' as const },
            ];

            const colors = [
                "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16",
                "#22c55e", "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9",
                "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899", "#f43f5e"
            ];

            const shuffledColors = [...colors].sort(() => Math.random() - 0.5);

            for (let i = 0; i < playersCount - 1; i++) {
                playersToUse.push({
                    id: i + 2,
                    username: botNames[i],
                    avatarColor: shuffledColors[i % shuffledColors.length] as PlayerColor,
                    points: startingStage === 3 ? 3 : 0,
                    lives: 3,
                    active: true,
                    isBot: true,
                    knowledge: Math.floor(Math.random() * 31) + 45,
                    sex: getSex(botNames[i] as string)
                });
            }

            for (let i = playersToUse.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [playersToUse[i], playersToUse[j]] = [playersToUse[j], playersToUse[i]];
            }
        }

        const startPlayerId = startingStage === 3 ? null : playersToUse[0].id;

        return {
            mode,
            stage: startingStage as GameStage,
            players: playersToUse,
            questions: mode === "flashcards" ? [] : questions,
            flashcards: mode === "flashcards" ? (flashcards as Flashcard[]) : [],
            currentQuestionIndex: 0,
            questionsRemaining: startingStage === 3 ? 40 : 0,
            currentPlayerId: startPlayerId,
            selectedPlayerId: null,
            awaitingDesignation: false,
            flashcardTimer: 0,
            flashcardStartTime: mode === "flashcards" ? Date.now() : null,
            flashcardPausedAt: null,
            flashcardPausedTime: 0,
            designatorId: null,
            round: 1,
            currentSeat: 1,
            buzzEnabled: startingStage === 3,
            buzzQueue: [],
            buzzLocked: false,
            gameFinished: false,
            isTransitioning: false,
            isPaused: false,
        };
    }),

    nextQuestion: () => set((state) => {
        const total = state.mode === "flashcards" ? state.flashcards.length : state.questions.length;
        const nextRemaining = state.stage === 3 || state.mode === "final" ? Math.max(0, state.questionsRemaining - 1) : state.questionsRemaining;

        return {
            currentQuestionIndex: Math.min(state.currentQuestionIndex + 1, Math.max(0, total - 1)),
            questionsRemaining: nextRemaining
        };
    }),

    pauseGame: () => set((state) => {
        if (state.isPaused) return state;

        return {
            isPaused: true,
            flashcardPausedAt:
                state.mode === "flashcards" && state.flashcardStartTime !== null
                    ? Date.now()
                    : null,
        };
    }),
    unpauseGame: () => set((state) => {
        if (!state.isPaused) return state;

        let pausedTime = state.flashcardPausedTime;

        if (
            state.mode === "flashcards" &&
            state.flashcardPausedAt !== null
        ) {
            pausedTime += Date.now() - state.flashcardPausedAt;
        }

        return {
            isPaused: false,
            flashcardPausedAt: null,
            flashcardPausedTime: pausedTime,
        };
    }),

    setCurrentPlayer: (playerId) => set({ currentPlayerId: playerId }),
    setSelectedPlayer: (playerId) => set({ selectedPlayerId: playerId }),

    nextStage: () => set((state) => {
        if (state.isPaused) return state;

        const nextStage = state.stage + 1;
        if (nextStage > 3) return {};

        const isStage3 = nextStage === 3;
        const activePlayers = state.players.filter(p => p.active);
        const startPlayerId = isStage3 ? null : (activePlayers.length > 0 ? activePlayers[0].id : null);

        let updatedPlayers = state.players.map(p => {
            if (isStage3 && p.active) {
                return { ...p, points: p.lives };
            }
            return p;
        });

        if (isStage3 && (state.mode === "classic" || state.mode === "multiplayer")) {
            updatedPlayers = updatedPlayers.filter(p => p.active);
        }

        return {
            stage: nextStage as GameStage,
            players: updatedPlayers,
            currentSeat: 1,
            round: 1,
            buzzEnabled: isStage3,
            buzzQueue: [],
            buzzLocked: false,
            questionsRemaining: isStage3 ? 40 : 0,
            currentPlayerId: startPlayerId,
            selectedPlayerId: null,
            awaitingDesignation: false,
            designatorId: null,
            isTransitioning: true
        };
    }),

    finishTransition: () => set((state) => {
        const alive = state.getAlivePlayers();
        if (state.stage === 3) {
            for (let i = alive.length - 1; i >= 0; i--) {
                alive[i].lives = 3;
            }
            setTimeout(() => get().botBuzz(), 500);
        }
        return { isTransitioning: false };
    }),

    finishGame: () => {
        const state = get();
        if (state.mode === "flashcards") {
            state.stopFlashcardTimer();

            const updatedState = get();
            const player = updatedState.players.find(
                p => p.id === 1 && !p.isBot
            )

            if (player) {
                updatedState.addFlashcardScore(player.points, updatedState.flashcardTimer)
            }
        }

        updateProfile();

        set({ gameFinished: true });
    },

    skipQuestion: () => {
        const state = get();
        state.nextQuestion();

        const newState = get();
        newState.checkStageTransition();

        if (get().gameFinished || get().stage !== state.stage) {
            return;
        }

        get().setNextPlayer();

        if (get().stage === 3 || get().mode === "final") {
            get().botBuzz();
        }
    },

    setFlashcardTimer: (timer: number) => set({ flashcardTimer: timer }),

    resetGame: () => set({
        mode: null, stage: 1, players: [], questions: [], flashcards: [], currentQuestionIndex: 0,
        questionsRemaining: 0, currentPlayerId: null, selectedPlayerId: null,
        awaitingDesignation: false, designatorId: null, round: 1, currentSeat: 1, buzzEnabled: false,
        buzzQueue: [], buzzLocked: false, gameFinished: false, isTransitioning: false, flashcardTimer: 0,
        flashcardStartTime: null, flashcardPausedAt: null, flashcardPausedTime: 0, isPaused: false,
    }),

    updatePlayer: (playerId, updates) => set((state) => ({
        players: state.players.map((p) => p.id === playerId ? { ...p, ...updates } : p),
    })),

    getAlivePlayers: () => {
        return get().players.filter(p => p.active);
    },

    designatePlayer: (targetId) => set({
        awaitingDesignation: false,
        currentPlayerId: targetId,
        selectedPlayerId: null,
        buzzEnabled: false,
        buzzLocked: false
    }),

    answerQuestion: (correct: boolean, forcedPlayerId?: number, questionIndex?: number) => {
        const state = get();

        if (state.isPaused) return;

        if (questionIndex !== undefined && state.currentQuestionIndex !== questionIndex) {
            return;
        }

        const playerId = forcedPlayerId || state.currentPlayerId;
        if (!playerId) return;

        const player = state.players.find(p => p.id === playerId);
        if (!player) return;

        if (correct) {
            if (state.stage === 3) {
                state.updatePlayer(playerId, { points: player.points + 10 });
            }

            if (state.stage === 3 && state.designatorId === playerId) {
                state.updatePlayer(playerId, { points: player.points + 20 });
            }

            if (state.mode === "solo" || state.mode === "flashcards") {
                state.updatePlayer(playerId, { points: player.points + 10 });
            }

            const pPoints = state.stage === 3 ? player.points + 10 : player.points;
            const anyPlayerHas30 = (state.stage === 3 && pPoints >= 30) || state.players.some(p => p.points >= 30);

            set({ designatorId: null });

            if ((state.stage === 2 && state.mode !== "solo" && state.mode !== "flashcards") || (state.stage === 3 && anyPlayerHas30 && state.mode !== "solo" && state.mode !== "flashcards")) {
                const aliveNow = get().players.filter(p => p.active);

                if (aliveNow.length === 1) {
                    set({ designatorId: null, currentPlayerId: aliveNow[0].id, awaitingDesignation: false });
                    state.nextQuestion();
                    return;
                }

                set({ awaitingDesignation: true, designatorId: playerId });
                state.nextQuestion();
                return;
            }
        } else {
            let newLives = Math.max(player.lives - 1, 0);
            if ((state.mode !== "solo" && state.mode !== "multiplayer" && state.mode !== "flashcards") && state.stage === 1 && player.lives == 2) {
                newLives = 0;
            }

            if (newLives === 0 && state.soundEnabled) {
                SoundService.play('eliminated');
            }

            set((s) => ({
                players: s.players.map(p => p.id === playerId ? { ...p, lives: newLives, active: newLives > 0 } : p)
            }));

            if (state.mode === "solo" && newLives === 0) {
                state.nextQuestion();
                state.finishGame();
                return;
            }
            if (state.mode === "flashcards" && newLives === 0) {
                state.nextQuestion();
                state.finishGame();
                return;
            }
        }

        state.nextQuestion();

        const newState = get();
        newState.checkStageTransition();

        if (get().gameFinished || get().stage !== state.stage) {
            return;
        }

        if (!correct && newState.stage !== 1 && newState.mode !== "solo" && state.mode !== "flashcards") {
            const currentDesignatorId = newState.designatorId;
            if (playerId === currentDesignatorId) {
                set({ designatorId: null });
            } else if (currentDesignatorId) {
                const designator = newState.players.find(p => p.id === currentDesignatorId);
                if (designator && designator.active) {
                    set({ currentPlayerId: currentDesignatorId, awaitingDesignation: true });
                    return;
                }
            }
        }

        get().setNextPlayer();

        if (get().stage === 3 || get().mode === "final") {
            get().botBuzz();
        }
    },

    setNextPlayer: () => {
        const state = get();
        const alive = state.getAlivePlayers();

        if (alive.length === 0) return;

        if (state.stage === 1) {
            if (state.mode === "solo" || state.mode === "flashcards") {
                return;
            }

            let seat = state.currentSeat;
            let round = state.round;

            let found = false;
            while (!found && round <= 2) {
                seat++;
                if (seat > state.players.length) {
                    seat = 1;
                    round++;
                }

                if (round > 2) break;

                const nextP = state.players[seat - 1];
                if (nextP && nextP.active) {
                    found = true;
                }
            }

            if (round > 2) {
                set({ currentSeat: seat, round: round as 1 | 2 });
                state.nextStage();
            } else {
                set({
                    currentSeat: seat,
                    round: round as 1 | 2,
                    currentPlayerId: state.players[seat - 1].id
                });
            }
        }
        else if (state.stage === 2) {
            if (state.mode === "solo" || state.mode === "flashcards") return;

            const currentId = state.currentPlayerId;
            const currentIndex = state.players.findIndex(p => p.id === currentId);

            let nextIndex = (currentIndex + 1) % state.players.length;
            while (!state.players[nextIndex].active) {
                nextIndex = (nextIndex + 1) % state.players.length;
            }

            set({
                currentPlayerId: state.players[nextIndex].id,
                awaitingDesignation: false
            });
        }
        else if (state.stage === 3) {
            if (state.mode === "solo" || state.mode === "flashcards") return;

            set({
                currentPlayerId: null,
                selectedPlayerId: null,
                awaitingDesignation: false,
                buzzEnabled: true,
                buzzLocked: false,
                buzzQueue: []
            });
        }
    },

    checkStageTransition: () => {
        const state = get();
        const alive = state.getAlivePlayers();

        if (state.mode === "solo") {
            if (alive.length === 0) {
                state.finishGame();
            }
            return;
        }

        if (state.mode === "flashcards") {
            if (alive.length === 0) {
                state.finishGame();
                return;
            }

            if (state.flashcards.length > 0 && state.currentQuestionIndex >= state.flashcards.length - 1) {
                state.finishGame();
            }
            return;
        }

        if (state.mode === "classic" || state.mode === "multiplayer") {
            if (state.stage === 2 && alive.length <= 3) {
                state.nextStage();
                return;
            }

            if (state.stage === 3) {
                if (state.questionsRemaining <= 0) {
                    set((s) => {
                        const newPlayers = s.players.map(p => {
                            const isAlive = alive.find(a => a.id === p.id);
                            if (isAlive) {
                                return { ...p, points: p.points + (p.lives * 10) };
                            }
                            return p;
                        });
                        return { players: newPlayers };
                    });
                }
                if (alive.length < 1 || state.questionsRemaining <= 0) {
                    get().finishGame();
                }
                return;
            }
        }

        if (state.mode === "final") {
            if (state.questionsRemaining <= 0) {
                set((s) => {
                    const newPlayers = s.players.map(p => {
                        const isAlive = alive.find(a => a.id === p.id);
                        if (isAlive) {
                            return { ...p, points: p.points + (p.lives * 10) };
                        }
                        return p;
                    });
                    return { players: newPlayers };
                });
            }
            if (alive.length < 1 || state.questionsRemaining <= 0) {
                get().finishGame();
            }
        }
    },

    buzzIn: (playerId: number) => {

        const state = get();

        if (state.isPaused) return;
        if (!state.buzzEnabled || state.buzzLocked) return;
        if (state.buzzQueue.includes(playerId)) return;

        if (state.soundEnabled) {
            SoundService.play('buzz');
        }

        const newQueue = [...state.buzzQueue, playerId];
        set({ buzzQueue: newQueue });

        if (newQueue.length === 1) {
            set({
                currentPlayerId: playerId,
                buzzLocked: true,
                buzzEnabled: false
            });
        }
    },


    botBuzz: () => {
        const state = get();

        if (state.isPaused) return;
        if (!state.buzzEnabled || state.buzzLocked) return;

        const botsIds = state.players
            .filter(
                p =>
                    p.isBot &&
                    p.active &&
                    !state.buzzQueue.includes(p.id)
            )
            .map(p => p.id);

        if (botsIds.length === 0) return;

        botsIds.forEach(id => {
            const bot = state.players.find(
                p => p.id === id
            );

            const knowledge = bot?.knowledge || 75;

            const baseReaction = 4000;
            const speedFactor =
                (100 - knowledge) / 100;

            const reactionTime =
                Math.random() *
                (baseReaction * speedFactor) +
                1800;

            let elapsed = 0;

            const interval = setInterval(() => {
                const currentState = get();

                // Gra jest zapauzowana — czas NIE leci
                if (currentState.isPaused) {
                    return;
                }

                // Gra już nie czeka na buzz
                if (
                    !currentState.buzzEnabled ||
                    currentState.buzzLocked ||
                    currentState.buzzQueue.includes(id)
                ) {
                    clearInterval(interval);
                    return;
                }

                elapsed += 100;

                if (elapsed >= reactionTime) {
                    clearInterval(interval);

                    const finalState = get();

                    if (
                        finalState.buzzEnabled &&
                        !finalState.buzzLocked &&
                        !finalState.buzzQueue.includes(id) &&
                        !finalState.isPaused
                    ) {
                        get().buzzIn(id);
                    }
                }

            }, 100);
        });
    },

    addPlayer: (player: Player) => {
        set((state) => ({
            players: [...state.players, player]
        }));
    },

    removePlayer: (id: number) => {
        set((state) => ({
            players: state.players.filter(p => p.id !== id)
        }));
    },

    startFlashcardTimer: () => {
        set({
            flashcardTimer: 0,
            flashcardStartTime: Date.now(),
            flashcardPausedAt: null,
            flashcardPausedTime: 0,
        });
    },

    stopFlashcardTimer: () => {
        const state = get();

        if (state.flashcardStartTime === null) return;

        let pausedTime = state.flashcardPausedTime

        if (state.flashcardPausedAt !== null) {
            pausedTime += Date.now() - state.flashcardPausedAt;
        }


        const elapsed = Date.now() - state.flashcardStartTime - pausedTime;

        set({
            flashcardTimer: elapsed,
            flashcardStartTime: null,
            flashcardPausedAt: null,
            flashcardPausedTime: 0,
        });
    },

    addFlashcardScore: async (points, time) => {
        const newScore: FlashcardScore = {
            points,
            time: time,
            date: new Date().toISOString(),
        };

        const currentScores = get().flashcardScores;

        const scores = [...currentScores, newScore]
            .sort((a, b) => {
                if (b.points !== a.points) {
                    return b.points - a.points;
                }

                return a.time - b.time;
            })
            .slice(0, 10);

        set({
            flashcardScores: scores,
        });

        await AsyncStorage.setItem(
            "flashcard_scores",
            JSON.stringify(scores)
        );
    },

    loadFlashcardScores: async () => {
        try {
            const raw = await AsyncStorage.getItem("flashcard_scores");
            if (raw) {
                const scores = JSON.parse(raw);
                set({ flashcardScores: scores });
            }
        } catch (e) {
            console.warn("Failed to load flashcard scores", e);
        }
    },

    toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),

}));
