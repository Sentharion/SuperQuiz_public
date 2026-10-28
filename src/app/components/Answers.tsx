import { useEffect, useMemo, useRef, useState } from "react";
import { Text, TouchableOpacity, View, type DimensionValue } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SoundService from "../../services/sound";
import { useGameStore } from "../../store/gameStore";

const TIME_LIMIT = 15;

const Answers = () => {
    const insets = useSafeAreaInsets();

    const {
        questions,
        currentQuestionIndex,
        answerQuestion,
        currentPlayerId,
        awaitingDesignation,
        players,
        mode,
        flashcards,
        isPaused,
    } = useGameStore();

    const [selectedState, setSelectedState] = useState<{
        answer: string;
        questionIndex: number;
    } | null>(null);

    const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const botTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const answerTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const answerSubmittedRef = useRef(false);

    const currentPlayer = players.find(
        p => p.id === currentPlayerId
    );

    const isCurrentPlayerHuman =
        !!currentPlayer && !currentPlayer.isBot;

    const question =
        questions?.[currentQuestionIndex];

    const flashcard =
        flashcards?.[currentQuestionIndex];

    const selectedAnswer =
        selectedState?.questionIndex === currentQuestionIndex
            ? selectedState.answer
            : null;

    /*
     * Answers
     */
    const allAnswers = useMemo(() => {
        if (mode === "flashcards") {
            if (!flashcard?.correct_answer) {
                return [];
            }

            const answers = [
                flashcard.correct_answer,
                ...(flashcard.distractors || []),
            ];

            return answers.sort(() => Math.random() - 0.5);
        }

        if (!question?.correct_answer) {
            return [];
        }

        const answers = [question.correct_answer, ...(question.distractors || [])];

        return answers.sort(() => Math.random() - 0.5);
    }, [question, flashcard, mode]);

    /*
     * Current answer
     */
    const correctAnswer = mode === "flashcards" ? flashcard?.correct_answer : question?.correct_answer;

    /*
     * Human timer
     *
     * Timer działa cały czas, ale podczas pauzy
     * po prostu nie zmniejsza timeLeft.
     */
    useEffect(() => {
        answerSubmittedRef.current = false;

        setTimeLeft(TIME_LIMIT);

        const activeItem =
            mode === "flashcards"
                ? flashcard
                : question;

        if (
            !isCurrentPlayerHuman ||
            awaitingDesignation ||
            !activeItem
        ) {
            return;
        }

        timerRef.current = setInterval(() => {
            const currentState =
                useGameStore.getState();

            // PAUZA → nic nie robimy
            if (currentState.isPaused) {
                return;
            }

            setTimeLeft(prev => {
                if (prev <= 1) {
                    if (timerRef.current) {
                        clearInterval(timerRef.current);
                        timerRef.current = null;
                    }

                    handleAnswer("__timeout__");

                    return 0;
                }

                return prev - 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }

            if (answerTimeoutRef.current) {
                clearTimeout(answerTimeoutRef.current);
                answerTimeoutRef.current = null;
            }
        };
    }, [
        currentQuestionIndex,
        currentPlayerId,
        awaitingDesignation,
        mode,
    ]);

    /*
     * Bot AI
     *
     * Bot ma 3 sekundy reakcji.
     * Pauza zatrzymuje odliczanie.
     */
    useEffect(() => {
        const activeItem =
            mode === "flashcards"
                ? flashcard
                : question;

        if (
            isCurrentPlayerHuman ||
            awaitingDesignation ||
            !activeItem
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

        let elapsed = 0;

        botTimerRef.current = setInterval(() => {
            const currentState =
                useGameStore.getState();

            // PAUZA → czas bota się nie zwiększa
            if (currentState.isPaused) {
                return;
            }

            elapsed += 100;

            if (elapsed < 3000) {
                return;
            }

            if (botTimerRef.current) {
                clearInterval(botTimerRef.current);
                botTimerRef.current = null;
            }

            if (answerSubmittedRef.current) {
                return;
            }

            const isCorrect =
                Math.random() * 100 <
                (currentBot.knowledge || 50);

            let chosenAnswer = "";

            if (isCorrect) {
                chosenAnswer =
                    activeItem.correct_answer;
            } else {
                const wrongAnswers =
                    activeItem.distractors || [];

                if (wrongAnswers.length > 0) {
                    chosenAnswer =
                        wrongAnswers[
                        Math.floor(
                            Math.random() *
                            wrongAnswers.length
                        )
                        ];
                } else {
                    chosenAnswer =
                        allAnswers.find(
                            answer =>
                                answer !==
                                activeItem.correct_answer
                        ) ||
                        activeItem.correct_answer;
                }
            }

            const finalIsCorrect =
                chosenAnswer ===
                activeItem.correct_answer;

            answerSubmittedRef.current = true;

            setSelectedState({
                answer: chosenAnswer,
                questionIndex: currentQuestionIndex,
            });

            if (useGameStore.getState().soundEnabled) {
                SoundService.play(finalIsCorrect ? "correct" : "wrong");
            }

            /*
             * Po pokazaniu odpowiedzi czekamy 1.5 sekundy.
             * Ten czas również jest zatrzymywany przez pauzę.
             */
            let answerElapsed = 0;

            answerTimeoutRef.current =
                setInterval(() => {
                    const state =
                        useGameStore.getState();

                    if (state.isPaused) {
                        return;
                    }

                    answerElapsed += 100;

                    if (answerElapsed < 1500) {
                        return;
                    }

                    if (answerTimeoutRef.current) {
                        clearInterval(
                            answerTimeoutRef.current
                        );
                        answerTimeoutRef.current = null;
                    }

                    answerQuestion(
                        finalIsCorrect,
                        currentPlayerId as number,
                        currentQuestionIndex
                    );
                }, 100);

        }, 100);

        return () => {
            if (botTimerRef.current) {
                clearInterval(botTimerRef.current);
                botTimerRef.current = null;
            }

            if (answerTimeoutRef.current) {
                clearInterval(
                    answerTimeoutRef.current
                );
                answerTimeoutRef.current = null;
            }
        };
    }, [
        currentQuestionIndex,
        currentPlayerId,
        awaitingDesignation,
        question,
        flashcard,
        players,
        allAnswers,
        mode,
        isCurrentPlayerHuman,
    ]);

    /*
     * Human answer
     */
    const handleAnswer = (answer: string) => {
        /*
         * Nie pozwalamy odpowiedzieć podczas pauzy.
         */
        if (isPaused) {
            return;
        }

        if (
            selectedAnswer ||
            !isCurrentPlayerHuman ||
            answerSubmittedRef.current
        ) {
            return;
        }

        answerSubmittedRef.current = true;

        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        setSelectedState({
            answer,
            questionIndex: currentQuestionIndex,
        });

        /*
         * Timeout
         */
        const isCorrect = answer === correctAnswer;

        if (useGameStore.getState().soundEnabled) {
            SoundService.play(isCorrect ? "correct" : "wrong");
        }

        let answerElapsed = 0;

        answerTimeoutRef.current =
            setInterval(() => {
                const state =
                    useGameStore.getState();

                if (state.isPaused) {
                    return;
                }

                answerElapsed += 100;

                if (answerElapsed < 1500) {
                    return;
                }

                if (answerTimeoutRef.current) {
                    clearInterval(
                        answerTimeoutRef.current
                    );

                    answerTimeoutRef.current = null;
                }

                answerQuestion(
                    isCorrect,
                    currentPlayerId as number,
                    currentQuestionIndex
                );
            }, 100);
    };

    /*
     * Timeout
     */
    const isTimedOut =
        timeLeft === 0;

    /*
     * Timer bar
     */
    const barWidth: DimensionValue =
        `${(timeLeft / TIME_LIMIT) * 100}%`;

    const barColor =
        timeLeft <= 5
            ? "#ef4444"
            : timeLeft <= 10
                ? "#f59e0b"
                : "#22c55e";

    /*
     * No question
     */
    if (
        mode !== "flashcards" &&
        !question
    ) {
        return null;
    }

    if (
        mode === "flashcards" &&
        !flashcard
    ) {
        return null;
    }

    return (
        <View
            className="w-full p-3 bg-background border-t border-border"
            style={{
                paddingBottom:
                    insets.bottom + 8,
            }}
        >

            {/* Designation */}
            {awaitingDesignation && (
                <View className="w-full items-center justify-center py-5">
                    <Text className="text-white font-bold text-xl text-center">
                        {isCurrentPlayerHuman
                            ? "Wybierz kto odpowiada!"
                            : "Czekaj na wybór gracza..."}
                    </Text>
                </View>
            )}

            {/* Question */}
            {!awaitingDesignation &&
                mode !== "flashcards" && (
                    <View className="px-3 mt-2 mb-4 min-h-[90px] justify-center items-center">

                        <Text className="text-muted text-base text-center mb-1">
                            {question?.category}
                        </Text>

                        <Text
                            className="text-white text-center text-lg font-bold"
                            numberOfLines={4}
                            adjustsFontSizeToFit
                        >
                            {question?.question}
                        </Text>

                    </View>
                )}

            {/* Flashcard */}
            {mode === "flashcards" && (
                <View className="px-3 mt-2 mb-4 min-h-[90px] justify-center items-center">

                    <Text
                        className="text-white text-center text-lg font-bold"
                        numberOfLines={4}
                        adjustsFontSizeToFit
                    >
                        {flashcard?.flashcard}
                    </Text>

                </View>
            )}

            {/* Answers */}
            {!awaitingDesignation && (
                <View
                    className={`flex-row flex-wrap justify-center px-2 ${!isCurrentPlayerHuman ||
                        isPaused
                        ? "opacity-50"
                        : ""
                        }`}
                >
                    {allAnswers.map(
                        (answer, index) => {

                            let bgColor =
                                "bg-backgroundLight";

                            let borderColor =
                                "border-border";

                            if (
                                selectedAnswer ||
                                isTimedOut
                            ) {
                                if (
                                    answer ===
                                    correctAnswer
                                ) {
                                    bgColor =
                                        "bg-green-600";

                                    borderColor =
                                        "border-green-400";
                                } else if (
                                    answer ===
                                    selectedAnswer
                                ) {
                                    bgColor =
                                        "bg-red-600";

                                    borderColor =
                                        "border-red-400";
                                }
                            }

                            return (
                                <View
                                    key={`${answer}-${index}`}
                                    className="w-[50%] px-1.5 mb-3"
                                >
                                    <TouchableOpacity
                                        disabled={
                                            !!selectedAnswer ||
                                            isTimedOut ||
                                            !isCurrentPlayerHuman ||
                                            isPaused
                                        }
                                        onPress={() =>
                                            handleAnswer(
                                                answer
                                            )
                                        }
                                        activeOpacity={0.8}
                                        className={`
                                            min-h-[70px]
                                            ${bgColor}
                                            rounded-xl
                                            border
                                            ${borderColor}
                                            px-2
                                            py-3
                                            justify-center
                                            items-center
                                        `}
                                    >
                                        <Text
                                            className="text-white text-center text-sm font-semibold"
                                            numberOfLines={3}
                                            adjustsFontSizeToFit
                                        >
                                            {answer}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            );
                        }
                    )}
                </View>
            )}

            {/* Timer */}
            <View className="w-full px-2 pt-2 pb-1">
                {isCurrentPlayerHuman &&
                    !awaitingDesignation && (
                        <View className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                            <View
                                style={{
                                    height: "100%",
                                    backgroundColor:
                                        barColor,
                                    width:
                                        barWidth,
                                }}
                            />
                        </View>
                    )}
            </View>

        </View>
    );
};

export default Answers;