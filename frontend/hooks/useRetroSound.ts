"use client";

import { useCallback } from "react";

// Since we're setting up the environment, we'll create placeholder sounds
// In a real implementation, you'd have actual sound files
const RETRO_SOUNDS = {
  startup: "/sounds/startup.wav",
  click: "/sounds/click.wav",
  error: "/sounds/error.wav",
  success: "/sounds/success.wav",
  typing: "/sounds/typing.wav",
  shutdown: "/sounds/shutdown.wav",
  notification: "/sounds/notification.wav",
  diskInsert: "/sounds/disk-insert.wav",
} as const;

export type RetroSoundType = keyof typeof RETRO_SOUNDS;

interface UseRetroSoundOptions {
  volume?: number;
  playbackRate?: number;
  interrupt?: boolean;
}

export function useRetroSound() {
  // For now, we'll use placeholder audio context since we don't have actual sound files
  const playSound = useCallback(
    (soundType: RetroSoundType, options: UseRetroSoundOptions = {}) => {
      const { volume = 0.5, playbackRate = 1, interrupt = true } = options;

      // Create a simple beep sound for demonstration
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Different frequencies for different sound types
      const frequencies: Record<RetroSoundType, number> = {
        startup: 440,
        click: 800,
        error: 200,
        success: 600,
        typing: 1000,
        shutdown: 220,
        notification: 880,
        diskInsert: 660,
      };

      oscillator.frequency.setValueAtTime(
        frequencies[soundType],
        audioContext.currentTime
      );
      oscillator.type = "square"; // Retro square wave sound

      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(
        volume,
        audioContext.currentTime + 0.01
      );
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + 0.2
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);

      console.log(`Playing retro sound: ${soundType}`);
    },
    []
  );

  const playStartupSound = useCallback(() => {
    playSound("startup", { volume: 0.3 });
  }, [playSound]);

  const playClickSound = useCallback(() => {
    playSound("click", { volume: 0.2 });
  }, [playSound]);

  const playErrorSound = useCallback(() => {
    playSound("error", { volume: 0.4 });
  }, [playSound]);

  const playSuccessSound = useCallback(() => {
    playSound("success", { volume: 0.3 });
  }, [playSound]);

  const playTypingSound = useCallback(() => {
    playSound("typing", { volume: 0.1 });
  }, [playSound]);

  const playShutdownSound = useCallback(() => {
    playSound("shutdown", { volume: 0.3 });
  }, [playSound]);

  const playNotificationSound = useCallback(() => {
    playSound("notification", { volume: 0.3 });
  }, [playSound]);

  const playDiskInsertSound = useCallback(() => {
    playSound("diskInsert", { volume: 0.3 });
  }, [playSound]);

  return {
    playSound,
    playStartupSound,
    playClickSound,
    playErrorSound,
    playSuccessSound,
    playTypingSound,
    playShutdownSound,
    playNotificationSound,
    playDiskInsertSound,
  };
}

// Hook for creating retro sound effects
export function useRetroSoundEffects() {
  const { playSound } = useRetroSound();

  const createBeepSequence = useCallback(
    (pattern: number[], interval: number = 200) => {
      pattern.forEach((frequency, index) => {
        setTimeout(() => {
          const audioContext = new (window.AudioContext ||
            (window as any).webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);

          oscillator.frequency.setValueAtTime(
            frequency,
            audioContext.currentTime
          );
          oscillator.type = "square";

          gainNode.gain.setValueAtTime(0, audioContext.currentTime);
          gainNode.gain.linearRampToValueAtTime(
            0.3,
            audioContext.currentTime + 0.01
          );
          gainNode.gain.exponentialRampToValueAtTime(
            0.001,
            audioContext.currentTime + 0.15
          );

          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.15);
        }, index * interval);
      });
    },
    []
  );

  const playBootSequence = useCallback(() => {
    createBeepSequence([440, 550, 660, 880], 300);
  }, [createBeepSequence]);

  const playErrorSequence = useCallback(() => {
    createBeepSequence([200, 180, 160], 150);
  }, [createBeepSequence]);

  const playSuccessSequence = useCallback(() => {
    createBeepSequence([523, 659, 784, 1047], 200);
  }, [createBeepSequence]);

  return {
    createBeepSequence,
    playBootSequence,
    playErrorSequence,
    playSuccessSequence,
  };
}
