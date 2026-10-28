import { SimpleLineIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pause, Play, Volume2, VolumeOff } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
    Animated,
    FlatList,
    Image,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { colorClasses, formatTime } from "../../constants/types";
import { useGameStore } from "../../store/gameStore";
import Answers from "../components/Answers";
import Stand from "../components/Stand";

const GameScreen = () => {
    const {
        players,
        mode,
        stage,
        currentPlayerId,
        awaitingDesignation,
        buzzEnabled,
        buzzLocked,
        buzzIn,
        designatePlayer,
        questionsRemaining,
        getAlivePlayers,
        gameFinished,
        resetGame,
        isTransitioning,
        finishTransition,
        skipQuestion,
        currentQuestionIndex,
        isPaused,
        pauseGame,
        unpauseGame,
        flashcardScores,
        flashcardStartTime,
        flashcardTimer,
        setFlashcardTimer,
        toggleSound,
        soundEnabled,
    } = useGameStore();

    const flatListRef = useRef<FlatList>(null);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;

    const router = useRouter();

    const BUZZ_TIMER = 5;

    const [timeLeft, setTimeLeft] = useState(BUZZ_TIMER);

    const timerIntervalRef =
        useRef<ReturnType<typeof setInterval> | null>(null);

    const currentPlayer = players.find(
        p => p.id === currentPlayerId
    );

    const isPlayerTurn =
        currentPlayer
            ? !currentPlayer.isBot
            : false;

    /*
     * Animacja przejścia między etapami
     */
    useEffect(() => {
        if (!isTransitioning) {
            return;
        }

        fadeAnim.setValue(0);
        scaleAnim.setValue(0.8);

        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),

            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 6,
                tension: 40,
                useNativeDriver: true,
            }),
        ]).start();

    }, [
        isTransitioning,
        fadeAnim,
        scaleAnim,
    ]);

    /*
     * Automatyczne scrollowanie do aktualnego gracza
     */
    useEffect(() => {
        if (
            !currentPlayerId ||
            !flatListRef.current
        ) {
            return;
        }

        const index =
            players.findIndex(
                p => p.id === currentPlayerId
            );

        if (index === -1) {
            return;
        }

        const timeout = setTimeout(() => {
            flatListRef.current?.scrollToIndex({
                index,
                animated: true,
                viewPosition: 0.5,
            });
        }, 100);

        return () => clearTimeout(timeout);

    }, [
        currentPlayerId,
        players,
    ]);

    /*
     * Bot wybierający gracza podczas designation.
     *
     * Bot czeka 2.5 sekundy.
     * Pauza zatrzymuje jego licznik.
     * Jeśli tylko 1 żywy gracz w finale/stage 3 — natychmiast wyznacza go.
     */
    useEffect(() => {
        if (
            !currentPlayerId ||
            currentPlayerId === 1
        ) {
            return;
        }

        const currentBot = players.find(
            p => p.id === currentPlayerId
        );

        if (
            !currentBot ||
            !currentBot.isBot ||
            !currentBot.active
        ) {
            return;
        }

        if (!awaitingDesignation) {
            return;
        }

        let alive = getAlivePlayers();
        if (stage !== 3) {
            alive = alive.filter(
                p => p.id !== currentPlayerId
            );
        }

        if (alive.length === 0) {
            return;
        }

        // If only 1 alive player in final/stage 3, auto-designate immediately
        const isSinglePlayerFinal =
            (mode === "final" || stage === 3) &&
            alive.length === 1;

        if (isSinglePlayerFinal) {
            designatePlayer(alive[0].id);
            return;
        }

        let elapsed = 0;

        const timer = setInterval(() => {
            const currentState =
                useGameStore.getState();

            /*
             * Pauza:
             * czas bota się nie zwiększa.
             */
            if (currentState.isPaused) {
                return;
            }

            elapsed += 100;

            if (elapsed < 2500) {
                return;
            }

            clearInterval(timer);

            let alive =
                getAlivePlayers();

            if (stage !== 3) {
                alive = alive.filter(
                    p => p.id !== currentPlayerId
                );
            }

            if (alive.length === 0) {
                return;
            }

            const target =
                alive[
                Math.floor(
                    Math.random() *
                    alive.length
                )
                ];

            designatePlayer(target.id);

        }, 100);

        return () => {
            clearInterval(timer);
        };

    }, [
        currentPlayerId,
        awaitingDesignation,
        players,
        stage,
        mode,
    ]);


    /*
     * Czy czekamy na zgłoszenie się gracza?
     */
    const isWaitingForBuzz =
        stage === 3 &&
        buzzEnabled &&
        !buzzLocked &&
        !awaitingDesignation &&
        !isTransitioning &&
        !gameFinished &&
        !currentPlayerId;

    /*
     * Timer zgłoszenia się w finale.
     *
     * Pauza zatrzymuje timer.
     */
    useEffect(() => {
        if (timerIntervalRef.current) {
            clearInterval(
                timerIntervalRef.current
            );

            timerIntervalRef.current = null;
        }

        if (!isWaitingForBuzz) {
            setTimeLeft(BUZZ_TIMER);
            return;
        }

        setTimeLeft(BUZZ_TIMER);

        timerIntervalRef.current =
            setInterval(() => {
                const currentState =
                    useGameStore.getState();

                /*
                 * PAUZA
                 */
                if (currentState.isPaused) {
                    return;
                }

                setTimeLeft(prev => {
                    if (prev <= 1) {
                        if (
                            timerIntervalRef.current
                        ) {
                            clearInterval(
                                timerIntervalRef.current
                            );

                            timerIntervalRef.current =
                                null;
                        }

                        skipQuestion();

                        return 0;
                    }

                    return prev - 1;
                });

            }, 1000);

        return () => {
            if (timerIntervalRef.current) {
                clearInterval(
                    timerIntervalRef.current
                );

                timerIntervalRef.current = null;
            }
        };

    }, [
        stage,
        buzzEnabled,
        buzzLocked,
        awaitingDesignation,
        isTransitioning,
        gameFinished,
        currentPlayerId,
        currentQuestionIndex,
    ]);

    useEffect(() => {
        if (
            mode !== "flashcards" ||
            flashcardStartTime === null ||
            gameFinished
        ) {
            return;
        }

        const interval = setInterval(() => {
            const state = useGameStore.getState();

            if (
                state.mode !== "flashcards" ||
                state.flashcardStartTime === null ||
                state.gameFinished
            ) {
                return;
            }

            let elapsed = 0;
            if (state.isPaused && state.flashcardPausedAt !== null) {
                elapsed = state.flashcardPausedAt - state.flashcardStartTime - state.flashcardPausedTime;
            } else {
                elapsed = Date.now() - state.flashcardStartTime - state.flashcardPausedTime;
            }

            setFlashcardTimer(Math.max(0, elapsed));
        }, 100);

        return () => clearInterval(interval);
    }, [
        mode,
        flashcardStartTime,
        gameFinished,
        setFlashcardTimer,
    ]);

    /*
     * Szerokość paska timera.
     */
    const timerWidth: `${number}%` =
        `${(timeLeft / BUZZ_TIMER) * 100}%`;

    const player1 =
        players.find(p => p.id === 1);

    const etap =
        stage === 1
            ? "Runda pierwsza"
            : stage === 2
                ? "Runda druga"
                : "Finał";

    /*
     * Ekran przejścia między etapami
     */
    if (isTransitioning) {
        return (
            <View className="flex-1 bg-background justify-center items-center px-8 gap-6">

                <Animated.View
                    style={{
                        opacity: fadeAnim,
                        transform: [
                            {
                                scale: scaleAnim,
                            },
                        ],
                        alignItems: "center",
                    }}
                >
                    <Text className="text-white text-5xl font-bold text-center mb-8">
                        {etap}
                    </Text>

                    <TouchableOpacity
                        onPress={finishTransition}
                        className="bg-primary px-10 py-5 rounded-2xl shadow-lg border border-primary/50"
                    >
                        <Text className="text-white font-bold text-xl uppercase tracking-widest">
                            Rozpocznij
                        </Text>
                    </TouchableOpacity>
                </Animated.View>

            </View>
        );
    }

    /*
     * Ekran końca gry
     */
    if (gameFinished) {
        return (
            <View className="flex flex-col flex-1 bg-background justify-center items-center px-8 gap-6">

                <Text className="text-white text-4xl font-bold text-center">
                    Koniec gry!
                </Text>

                {mode === "multiplayer" ? (
                    getAlivePlayers()
                        .sort(
                            (a, b) =>
                                b.points - a.points
                        )
                        .map((player, index) => (
                            <View
                                key={player.id}
                                className="flex flex-row items-center gap-2"
                            >
                                <Text className="text-white text-lg">
                                    {index + 1}.
                                </Text>

                                <View
                                    className={`
                                        w-16
                                        h-16
                                        rounded-full
                                        flex
                                        justify-center
                                        items-center
                                        overflow-hidden
                                        ${player.avatarColor
                                            ? colorClasses[
                                            player.avatarColor
                                            ]
                                            : "red"
                                        }
                                    `}
                                >
                                    {player.avatar ? (
                                        <Image
                                            source={{
                                                uri: player.avatar,
                                            }}
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                            }}
                                            resizeMode="cover"
                                        />
                                    ) : player.sex === "male" ? (
                                        <SimpleLineIcons
                                            name="user"
                                            color="white"
                                            size={30}
                                        />
                                    ) : (
                                        <SimpleLineIcons
                                            name="user-female"
                                            color="white"
                                            size={30}
                                        />
                                    )}
                                </View>

                                <Text className="text-white font-bold">
                                    {player.username}:{" "}
                                    {player.points}{" "}
                                    {player.points === 1
                                        ? "punkt"
                                        : "punkty"}
                                </Text>
                            </View>
                        ))
                ) : mode === "flashcards" ? (
                    <View className="w-full bg-backgroundLight rounded-xl overflow-hidden">

                        <View className=" bg-primary/50 flex-row justify-center p-4">
                            <Text className="text-white text-xl font-semibold">Ostatnie Wyniki</Text>
                        </View>

                        <View className="flex-row px-4 py-3 border-b border-border">
                            <Text className="text-gray-400 font-bold w-12">
                                #
                            </Text>

                            <Text className="text-gray-400 font-bold flex-1">
                                Punkty
                            </Text>

                            <Text className="text-gray-400 font-bold w-20 text-right">
                                Czas
                            </Text>

                            <Text className="text-gray-400 font-bold w-28 text-right">
                                Data
                            </Text>
                        </View>

                        {flashcardScores.map((score, index) => {
                            return (
                                <View
                                    key={`${score.date}-${index}`}
                                    className="flex-row items-center px-4 py-3 border-b border-border"
                                >
                                    <Text className="text-white w-12">
                                        {index + 1}
                                    </Text>

                                    <Text className="text-white font-bold flex-1">
                                        {score.points}
                                    </Text>

                                    <Text className="text-gray-400 w-20 text-right">
                                        {formatTime(score.time)}
                                    </Text>

                                    <Text className="text-gray-400 w-28 text-right">
                                        {new Date(score.date).toLocaleDateString("pl-PL")}
                                    </Text>
                                </View>
                            )
                        })}
                    </View>
                ) : (
                    <>
                        {player1 && (
                            <Text className="text-gray-300 text-xl text-center">
                                Twoje punkty:{" "}
                                {player1.points}
                            </Text>
                        )}
                    </>
                )}

                <TouchableOpacity
                    onPress={() => {
                        resetGame();
                        router.replace("/");
                    }}
                    className="bg-primary px-8 py-4 rounded-xl mt-5"
                >
                    <Text className="text-white font-bold text-lg">
                        Wróć do menu
                    </Text>
                </TouchableOpacity>

            </View>
        );
    }

    return (
        <View className="flex-1 pt-10">

            {/* Header */}
            <View className="flex-row justify-between px-4 py-2 items-center">

                {isPaused ? (
                    <View className="bg-gray-800 border-2 border-gray-700 rounded-xl px-3 py-2">
                        <Text className="text-white text-lg font-bold">
                            Pauza
                        </Text>
                    </View>
                ) : (
                    <View className="flex-row items-center gap-2">

                        <View>
                            {mode !== "flashcards" && (
                                <Text className="text-white text-lg font-bold">
                                    {mode === "solo"
                                        ? "Tryb Solo"
                                        : etap}
                                </Text>
                            )}

                            {mode === "flashcards" && (
                                <View className="bg-border rounded-2xl p-2">
                                    <Text className="text-white font-bold text-center">
                                        Czas: {formatTime(flashcardTimer)}
                                    </Text>
                                </View>
                            )}
                        </View>

                        {stage === 3 && (
                            <View className="bg-borderHover rounded-2xl p-2">
                                <Text className="text-white font-bold">
                                    Pytania:{" "}
                                    {questionsRemaining}
                                </Text>
                            </View>
                        )}
                    </View>
                )}

                <View className="flex flex-row gap-2">
                    {/* SOUND */}
                    <TouchableOpacity
                        onPress={toggleSound}
                        className="bg-emerald-400/80 border-2 border-emerald-400 px-3 py-2 rounded-xl"
                        activeOpacity={0.8}>
                        {soundEnabled ? (
                            <Text className="text-white font-bold">
                                <Volume2 size={24} color="white" />
                            </Text>
                        ) : (
                            <Text className="text-white font-bold">
                                <VolumeOff size={24} color="white" />
                            </Text>
                        )}
                    </TouchableOpacity>

                    {/* PAUSE / PLAY */}
                    <TouchableOpacity
                        onPress={() => {
                            if (isPaused) {
                                unpauseGame();
                            } else {
                                pauseGame();
                            }
                        }}
                        className="bg-amber-400/80 border-2 border-amber-400 px-3 py-2 rounded-xl"
                        activeOpacity={0.8}
                    >
                        {isPaused ? (
                            <Play
                                color="white"
                                size={20}
                            />
                        ) : (
                            <Pause
                                color="white"
                                size={20}
                            />
                        )}
                    </TouchableOpacity>

                    {/* EXIT */}
                    <TouchableOpacity
                        onPress={() => {
                            resetGame();
                            router.replace("/");
                        }}
                        className="bg-red-600/80 border-2 border-red-600 px-3 py-2 rounded-xl"
                        activeOpacity={0.8}
                    >
                        <Text className="text-white font-bold">
                            Wyjdź
                        </Text>
                    </TouchableOpacity>

                </View>
            </View>

            {/* Players */}
            <View className="flex-1 justify-center">
                <FlatList
                    ref={flatListRef}
                    data={players}
                    keyExtractor={(p) => `player-${p.id}`}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{
                        alignItems: "center",
                        justifyContent: "center",
                        paddingHorizontal: 16,
                        gap: 12,
                        flexGrow: 1,
                    }}
                    renderItem={({ item: p, index }) => (
                        <Stand
                            id={p.id}
                            username={p.username}
                            points={p.points}
                            lives={p.lives}
                            position={index + 1}
                            gameMode={mode}
                            active={p.active}
                            avatar={p.avatar}
                            avatarColor={p.avatarColor}
                            isBot={p.isBot}
                            sex={p.sex ?? "male"}
                            isCurrent={currentPlayerId === p.id}
                            canBeDesignated={
                                awaitingDesignation &&
                                isPlayerTurn &&
                                p.active &&
                                // Disable designation UI when only 1 alive player in final/stage 3
                                !(
                                    (mode === "final" || stage === 3) &&
                                    getAlivePlayers().length <= 1
                                ) &&
                                (
                                    stage !== 3
                                        ? p.id !== currentPlayerId
                                        : true
                                )
                            }
                            onDesignate={designatePlayer}
                        />
                    )}
                />
            </View>

            {/* Buzz buttons */}
            {buzzEnabled &&
                players.filter(
                    p =>
                        !p.isBot &&
                        p.active
                ).length > 0 && (
                    <View className="px-4 pb-3 flex-row flex-wrap justify-center gap-3">

                        {players
                            .filter(
                                p =>
                                    !p.isBot &&
                                    p.active
                            )
                            .map(p => (
                                <TouchableOpacity
                                    key={p.id}
                                    disabled={isPaused}
                                    onPress={() => buzzIn(p.id)}
                                    activeOpacity={0.8}
                                    className={`bg-orange-500 rounded-xl py-3 px-3 items-center justify-center w-[48%] min-h-[50px] shadow-lg ${isPaused ? "opacity-50" : ""}`}
                                >
                                    <Text className="text-white text-sm font-bold uppercase text-center" numberOfLines={1} adjustsFontSizeToFit>
                                        {p.username}:{" "}
                                        Zgłoś się!
                                    </Text>
                                </TouchableOpacity>
                            ))}
                    </View>
                )}

            {/* Buzz timer */}
            {isWaitingForBuzz && (
                <View className="px-4 pb-2">

                    <View className="flex-row items-center gap-3">

                        <Text className="text-white font-bold text-lg w-6 text-center">
                            {timeLeft}
                        </Text>

                        <View className="flex-1 h-3 bg-gray-700 rounded-full overflow-hidden">

                            <View
                                style={{
                                    height: "100%",
                                    backgroundColor:
                                        "#f97316",
                                    width:
                                        timerWidth,
                                }}
                            />

                        </View>

                    </View>

                </View>
            )}

            {/* Answers */}
            <View className="mt-auto">
                <Answers />
            </View>

        </View>
    );
};

export default GameScreen;