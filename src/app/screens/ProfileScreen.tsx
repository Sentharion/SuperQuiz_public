import { Text, TouchableOpacity, View, TextInput, ScrollView, Alert, Image } from "react-native";
import { UserRound, Pencil, ArrowLeft } from "lucide-react-native";
import {useRouter} from "expo-router";
import * as ImagePicker from 'expo-image-picker';
import {useProfileStore,type ProfileStore} from "../../store/profileStore";
import { useState } from "react";

export default function ProfileScreen(){
    const [avatarDraft,setAvatarDraft] = useState<string|null>(null);
    const router = useRouter();
    const image = useProfileStore((state:ProfileStore) => state.avatarUrl);
    const updateAvatar = useProfileStore((state:ProfileStore) => state.updateAvatar);
    const username = useProfileStore((state:ProfileStore) => state.username);
    const updateUsername = useProfileStore((state:ProfileStore) => state.updateUsername);
    const highestScore = useProfileStore((state:ProfileStore) => state.highestScore);
    const wins = useProfileStore((state:ProfileStore) => state.wins);
    const [usernameDraft,setUsernameDraft] = useState<string>(username);

    const handleEditPhoto=async()=>{
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if(!permissionResult.granted){
            Alert.alert("Potrzebne jest pozwolenie na dostęp do galerii!");
            return;
        }
        let result= await ImagePicker.launchImageLibraryAsync({
            mediaTypes:['images'],
            allowsEditing:true,
            aspect:[4,3],
            quality:1,
        })
        if(!result.canceled){
            setAvatarDraft(result.assets[0].uri);
        }       
    }

    const handleSave=()=>{
        if(avatarDraft){
            updateAvatar(avatarDraft)
        }
        updateUsername(usernameDraft);
        setAvatarDraft(null);
        Alert.alert("Profil został zaktualizowany!");
    }

    return(
        <ScrollView>
            <View className="relative mt-5">
                <TouchableOpacity className="absolute left-6 top-48 flex-row items-center gap-1" onPress={() => router.back()}>
                    <ArrowLeft color="white" size={25}/>
                    <Text className="text-white text-xl font-bold">Wróć do menu</Text>
                </TouchableOpacity>
            </View>

            <View className="bg-backgroundLight p-5 rounded-lg border border-border mx-auto mt-72 w-3/4 min-w-3xs justify-center">
                <Text className="text-2xl font-bold text-white text-center">
                    Edytuj swój profil
                </Text>
                <View className="flex-row justify-center my-3">
                    <View className="w-24 h-24 rounded-full bg-border border-2 border-borderHover flex justify-center items-center">
                        {avatarDraft || image ? <Image source={{uri:avatarDraft ?? image ?? undefined }} className="w-full h-full rounded-full"/>:
                            <UserRound color="white" size={48}/>
                        }
                        <TouchableOpacity onPress={handleEditPhoto} className="absolute bottom-0 right-0 w-8 h-8 bg-green-600 rounded-full flex justify-center items-center">
                            <Pencil color="white" size={15}/>
                        </TouchableOpacity>
                    </View>
                </View>
                <View className="flex-col justify-center gap-3">
                    <View className="flex-col items-center">
                        <Text className="text-muted text-md my-2">Nazwa użytkownika</Text>
                        <TextInput
                            placeholder="Nazwa użytkownika"
                            placeholderTextColor="#9ca3af"
                            value={usernameDraft} 
                            onChangeText={setUsernameDraft}
                            className="border border-border rounded-lg p-2 w-64 text-white"
                        />
                    </View>
                    <TouchableOpacity className="bg-green-600 mx-auto p-3 rounded-xl w-64" onPress={handleSave}>
                        <Text className="text-white text-center font-semibold">
                            Zapisz
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View className="bg-backgroundLight p-5 rounded-lg border border-border mt-10 mx-auto w-3/4 min-w-3xs justify-center">
                <Text className="text-white text-center text-xl font-bold">Statystyki</Text>
                <View className="flex-row justify-between mt-3">
                    <Text className="text-white">Wygrane:</Text>
                    <Text className="text-white">{wins}</Text>
                </View>
                <View className="flex-row justify-between mt-3">
                    <Text className="text-white">Największa ilość punktów:</Text>
                    <Text className="text-white">{highestScore}</Text>
                </View>
            </View>
        </ScrollView>
    )
}