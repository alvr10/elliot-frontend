import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const loadingMessages = [
  "Loading your account...",
  "Checking subscription status...",
  "Preparing your caffeine dashboard...",
  "Almost ready...",
];

export default function LoadingScreen() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % loadingMessages.length);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-black justify-center items-center">
      <View className="items-center">
        {/* App Logo/Icon */}
        <View className="bg-white w-20 h-20 rounded-full justify-center items-center mb-8">
          <Text className="text-black text-3xl">☕</Text>
        </View>

        <ActivityIndicator size="large" color="#FFFFFF" />

        <Text className="text-white text-lg mt-6 text-center px-8">
          {loadingMessages[messageIndex]}
        </Text>

        {/* Progress indicator */}
        <View className="flex-row mt-4 space-x-2">
          {loadingMessages.map((_, index) => (
            <View
              key={index}
              className={`h-2 w-2 rounded-full ${
                index === messageIndex ? "bg-white" : "bg-gray-600"
              }`}
            />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}
