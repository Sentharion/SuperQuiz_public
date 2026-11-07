import { Question } from '@/constants/types';
import { getQuestionsForGame } from '@/services/supa';
import { Link, useRouter } from 'expo-router';
import { CircleCheck, Gamepad2, Gem, Minus, Plus, UserRoundPen, UsersRound } from 'lucide-react-native';
import { useState } from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGameStore } from '../store/gameStore';
import { useProfileStore } from '../store/profileStore';

export default function HomeScreen() {

  const [openModal, setOpenModal] = useState(false);
  const [gameMode, setGameMode] = useState<string>("");
  const [botsCount, setBotsCount] = useState<number>(10);
  const [module, setModule] = useState<number | null>(null);

  const modalHandler = () => {
    setOpenModal(!openModal);
    setGameMode("")
  }
  const setGameModeHandler = (mode: string) => {
    if (gameMode !== mode) {
      setGameMode(mode);
      setModule(null)
    } else {
      setGameMode("");
    }
  }
  const startGame = useGameStore(state => state.startGame);
  const username = useProfileStore(state => state.username);
  const avatarUrl = useProfileStore(state => state.avatarUrl); const router = useRouter();

  const gameStartHandler = async () => {
    const questions = await getQuestionsForGame();
    startGame(gameMode as any, questions as Question[], username, botsCount, avatarUrl);
    setOpenModal(false);
    router.replace("/screens/GameScreen");
  }

  return (
    <SafeAreaView className='flex-1 justify-center items-center'>
      <Modal
        visible={openModal}
        transparent
        animationType="fade"
      >
        <View className="flex-1 bg-black/70 justify-center items-center">

          {/* modal box */}
          <View className="w-96 bg-backgroundLight p-5 rounded-2xl border border-border">

            <Text className="text-white text-xl font-bold mb-2">
              Wybierz tryb gry
            </Text>

            <View className='p-2'>
              <View className='flex-row gap-4 flex-wrap justify-between items-center'>
                <View className='flex-row gap-2 w-full'>
                  <TouchableOpacity
                    onPress={() => setGameModeHandler("classic")}
                    className={`flex-1 border-borderHover border px-3 py-4 rounded-xl justify-center items-center flex-row gap-1 ${gameMode === "classic" && "bg-borderHover"}`}
                  >
                    <Text className="text-white text-md text-center">Klasyczny</Text>
                    {gameMode === "classic" && <CircleCheck color="white" size={16} />}
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setGameModeHandler("final")}
                    className={`flex-1 border-borderHover border px-3 py-4 rounded-xl justify-center items-center flex-row gap-1 ${gameMode === "final" && "bg-borderHover"}`}
                  >
                    <Text className="text-white text-md text-center">Finał</Text>
                    {gameMode === "final" && <CircleCheck color="white" size={16} />}
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setGameModeHandler("solo")}
                    className={`flex-1 border-borderHover border px-3 py-4 rounded-xl justify-center items-center flex-row gap-1 ${gameMode === "solo" && "bg-borderHover"}`}
                  >
                    <Text className="text-white text-md text-center">Solo</Text>
                    {gameMode === "solo" && <CircleCheck color="white" size={16} />}
                  </TouchableOpacity>
                </View>
              </View>
              {gameMode === "classic" && (
                <View className="flex-col gap-2 mt-5">
                  <Text className="text-white text-md text-center">
                    Ilość przeciwników
                  </Text>
                  <View className='flex-row gap-2 justify-center items-center'>
                    <TouchableOpacity disabled={botsCount === 15} onPress={() => setBotsCount(botsCount + 1)} className="bg-borderHover p-1 rounded-full disabled:bg-gray-600">
                      <Plus color="white" size={20} />
                    </TouchableOpacity>
                    <View className="border border-border px-4 py-1 rounded-lg">
                      <Text className="text-white text-center font-semibold">{botsCount}</Text>
                    </View>
                    <TouchableOpacity disabled={botsCount === 3} onPress={() => setBotsCount(botsCount - 1)} className="bg-borderHover p-1 rounded-full disabled:bg-gray-600">
                      <Minus color="white" size={20} />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
            <TouchableOpacity onPress={gameStartHandler} disabled={!gameMode || (gameMode === "flashcards" && !module) || (gameMode === "classic" && !botsCount)} className={`p-3 rounded-xl mt-5 ${!gameMode || (gameMode === "flashcards" && !module) || (gameMode === "classic" && !botsCount) ? "bg-gray-600" : "bg-green-600"}`} activeOpacity={0.7}>
              <Text className="text-white text-center font-semibold">
                Rozpocznij grę!
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={modalHandler} className="bg-red-600 p-3 rounded-xl mt-5" activeOpacity={0.7}>
              <Text className="text-white text-center font-semibold">
                Powrót do menu
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View className='flex flex-col gap-2'>
        <View className='mb-10'>
          <Text className='text-5xl font-bold text-white text-center'>Super <Text className='text-yellow-400'>Quiz</Text></Text>
          <Text className='mt-2 text-yellow-400 text-center text-sm tracking-[0.25em] uppercase'>Trening do Teleturnieju</Text>
        </View>
        <View className='flex-col lg:flex-row gap-4'>
          <TouchableOpacity onPress={modalHandler} className='bg-background border border-yellow-400 px-6 py-5 rounded-xl flex flex-col justify-center items-center gap-2' activeOpacity={0.8}>
            <Gamepad2 color='white' size={25} />
            <Text className='text-center text-white font-bold text-lg lg:text-xl'>Gra jednoosobowa</Text>
          </TouchableOpacity>
          <Link href="/screens/GameRoomScreen" asChild>
            <TouchableOpacity className='bg-background border border-yellow-400 px-6 py-5 rounded-xl flex flex-col justify-center items-center gap-2' activeOpacity={0.8}>
              <UsersRound color='white' size={25} />
              <Text className='text-center text-white font-bold text-lg lg:text-xl'>Gra wieloosobowa</Text>
            </TouchableOpacity>
          </Link>
          <Link href="/screens/ProfileScreen" asChild>
            <TouchableOpacity className='bg-background border border-yellow-400 px-6 py-5 rounded-xl flex flex-col justify-center items-center gap-2' activeOpacity={0.8}>
              <UserRoundPen color='white' size={25} />
              <Text className='text-center text-white font-bold text-lg lg:text-xl'>Profil</Text>
            </TouchableOpacity>
          </Link>
          <Link href="/screens/Premium" asChild>
            <TouchableOpacity className='bg-background border border-yellow-400 px-6 py-5 rounded-xl flex flex-col justify-center items-center gap-2' activeOpacity={0.8}>
              <Gem color='#facc15' size={25} />
              <Text className='text-center text-yellow-400 font-bold text-lg lg:text-xl'>Premium</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}