import { AudioPlayer, createAudioPlayer } from 'expo-audio';

class SoundService {
  private players: Record<string, AudioPlayer> = {};
  private isInitialized = false;

  async init() {
    if (this.isInitialized) return;
    const sounds = [
      { name: 'correct', file: require('../../assets/sounds/dobra.mp3') },
      { name: 'wrong', file: require('../../assets/sounds/zla.mp3') },
      { name: 'buzzer', file: require('../../assets/sounds/zgloszenie.mp3') },
      { name: 'eliminated', file: require('../../assets/sounds/odpadniencie.mp3') },
    ];

    await Promise.all(sounds.map(async (s) => {
      this.players[s.name] = createAudioPlayer(s.file);
    }));

    this.isInitialized = true;
  }

  play(name: keyof typeof this.players) {
    const player = this.players[name];

    if (!player) return;

    player.seekTo(0);
    player.play();
  }

  stop() {
    Object.values(this.players).forEach(player => player.seekTo(0));
  }

  release() {
    Object.values(this.players).forEach(player => player.release());
  }
}

export default new SoundService();