import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState } from "react";
import {
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const onboardingData = [
  {
    title: "The Hidden Danger",
    subtitle: "Caffeine addiction is real—and it's affecting millions",
    content:
      "Over 90% of adults consume caffeine daily, often without realizing they're dependent. Withdrawal symptoms, anxiety, and sleep disruption are just the beginning.",
    warning: "Are you in control, or is caffeine controlling you?",
  },
  {
    title: "Your Health at Risk",
    subtitle: "Excessive caffeine consumption has serious consequences",
    content:
      "Heart palpitations, insomnia, digestive issues, and increased anxiety. The recommended limit is 400mg daily—most people exceed this without knowing.",
    warning: "Every extra milligram pushes you closer to dependency.",
  },
  {
    title: "Take Back Control",
    subtitle: "Professional tracking changes everything",
    content:
      "Studies show people who track their caffeine intake reduce consumption by 40% within the first month. Knowledge is power—and freedom.",
    warning:
      "The question isn't whether you need help. It's whether you're ready to help yourself.",
  },
  {
    title: "Your Future Self",
    subtitle: "Imagine waking up energized—naturally",
    content:
      "Better sleep. Stable energy. No afternoon crashes. No dependency. This isn't just possible—it's inevitable with the right system.",
    warning:
      "The price of change is always less than the cost of staying the same.",
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      finishOnboarding();
    }
  };

  const finishOnboarding = async () => {
    try {
      await AsyncStorage.setItem("hasSeenOnboarding", "true");
      // Don't navigate manually - let App.tsx handle the state change
      // The useEffect in App.tsx will detect the change and re-render
    } catch (error) {
      console.error("Failed to save onboarding status:", error);
    }
  };

  const currentData = onboardingData[currentIndex];
  const isLastSlide = currentIndex === onboardingData.length - 1;

  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="flex-1 justify-between px-6 py-8">
        {/* Progress Indicators */}
        <View className="flex-row justify-center space-x-2 mb-8">
          {onboardingData.map((_, index) => (
            <View
              key={index}
              className={`h-2 rounded-full ${
                index <= currentIndex ? "bg-white" : "bg-gray-700"
              }`}
              style={{ width: width / onboardingData.length - 16 }}
            />
          ))}
        </View>

        {/* Content */}
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="items-center mb-12">
            <Text className="text-white text-3xl font-bold text-center mb-4">
              {currentData.title}
            </Text>
            <Text className="text-gray-300 text-lg text-center mb-8">
              {currentData.subtitle}
            </Text>
          </View>

          <View className="mb-8">
            <Text className="text-white text-base leading-6 text-center mb-6">
              {currentData.content}
            </Text>

            <View className="bg-gray-900 p-4 rounded-lg border border-gray-700">
              <Text className="text-gray-300 text-sm italic text-center">
                {currentData.warning}
              </Text>
            </View>
          </View>

          {/* Statistics Box */}
          {currentIndex === 1 && (
            <View className="bg-white p-6 rounded-lg mb-8">
              <Text className="text-black text-lg font-bold text-center mb-4">
                Daily Caffeine Facts
              </Text>
              <View className="space-y-3">
                <View className="flex-row justify-between">
                  <Text className="text-gray-700">Safe Daily Limit:</Text>
                  <Text className="text-black font-semibold">400mg</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-700">Average Consumption:</Text>
                  <Text className="text-red-600 font-semibold">540mg</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-700">Withdrawal Timeline:</Text>
                  <Text className="text-black font-semibold">12-24 hours</Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Action Button */}
        <TouchableOpacity
          onPress={handleNext}
          className={`bg-white py-4 rounded-lg mx-4 ${
            isLastSlide ? "mb-6" : "mb-0"
          }`}
        >
          <Text className="text-black text-lg font-bold text-center">
            {isLastSlide ? "Start Taking Control" : "Continue"}
          </Text>
        </TouchableOpacity>

        {/* Skip Option (only on first slides) */}
        {!isLastSlide && (
          <TouchableOpacity onPress={finishOnboarding} className="mt-4">
            <Text className="text-gray-500 text-center">Skip Introduction</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}
