import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppTheme, Colors, Spacing, Typography } from "../constants";

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xl,
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: Spacing.xl,
  },
  progressBar: {
    height: 2,
    borderRadius: 1,
    marginHorizontal: Spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: Spacing["3xl"],
  },
  title: {
    fontSize: Typography.size["3xl"],
    fontWeight: Typography.weight.bold,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.size.lg,
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  textContainer: {
    marginBottom: Spacing.xl,
  },
  contentText: {
    fontSize: Typography.size.base,
    lineHeight: Typography.lineHeight.normal,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  warningBox: {
    padding: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
  },
  warningText: {
    fontSize: Typography.size.sm,
    fontStyle: "italic",
    textAlign: "center",
  },
  statsBox: {
    padding: Spacing.lg,
    borderRadius: 8,
    marginBottom: Spacing.xl,
  },
  statsTitle: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  statsLabel: {
    fontSize: Typography.size.base,
  },
  statsValue: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
  },
  button: {
    backgroundColor: Colors.white,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    marginHorizontal: Spacing.md,
  },
  lastButton: {
    marginBottom: Spacing.lg,
  },
  buttonText: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
    textAlign: "center",
  },
  skipButton: {
    marginTop: Spacing.md,
  },
  skipText: {
    textAlign: "center",
    fontSize: Typography.size.sm,
  },
});

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
    <SafeAreaView
      style={[styles.container, { backgroundColor: AppTheme.background }]}
    >
      <View style={styles.content}>
        {/* Progress Indicators */}
        <View style={styles.progressContainer}>
          {onboardingData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressBar,
                {
                  width: width / onboardingData.length - 16,
                  backgroundColor:
                    index <= currentIndex ? Colors.white : Colors.gray700,
                },
              ]}
            />
          ))}
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: AppTheme.text.primary }]}>
              {currentData.title}
            </Text>
            <Text style={[styles.subtitle, { color: AppTheme.text.secondary }]}>
              {currentData.subtitle}
            </Text>
          </View>

          <View style={styles.textContainer}>
            <Text
              style={[styles.contentText, { color: AppTheme.text.primary }]}
            >
              {currentData.content}
            </Text>

            <View
              style={[
                styles.warningBox,
                {
                  backgroundColor: AppTheme.surface,
                  borderColor: AppTheme.border,
                },
              ]}
            >
              <Text
                style={[styles.warningText, { color: AppTheme.text.secondary }]}
              >
                {currentData.warning}
              </Text>
            </View>
          </View>

          {/* Statistics Box */}
          {currentIndex === 1 && (
            <View style={[styles.statsBox, { backgroundColor: Colors.white }]}>
              <Text style={[styles.statsTitle, { color: Colors.black }]}>
                Daily Caffeine Facts
              </Text>
              <View style={styles.statsRow}>
                <Text style={[styles.statsLabel, { color: Colors.gray700 }]}>
                  Safe Daily Limit:
                </Text>
                <Text style={[styles.statsValue, { color: Colors.black }]}>
                  400mg
                </Text>
              </View>
              <View style={styles.statsRow}>
                <Text style={[styles.statsLabel, { color: Colors.gray700 }]}>
                  Average Consumption:
                </Text>
                <Text style={[styles.statsValue, { color: Colors.error }]}>
                  540mg
                </Text>
              </View>
              <View style={styles.statsRow}>
                <Text style={[styles.statsLabel, { color: Colors.gray700 }]}>
                  Withdrawal Timeline:
                </Text>
                <Text style={[styles.statsValue, { color: Colors.black }]}>
                  12-24 hours
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Action Button */}
        <TouchableOpacity
          onPress={handleNext}
          style={[styles.button, isLastSlide && styles.lastButton]}
        >
          <Text style={[styles.buttonText, { color: Colors.black }]}>
            {isLastSlide ? "Start Taking Control" : "Continue"}
          </Text>
        </TouchableOpacity>

        {/* Skip Option (only on first slides) */}
        {!isLastSlide && (
          <TouchableOpacity
            onPress={finishOnboarding}
            style={styles.skipButton}
          >
            <Text style={[styles.skipText, { color: AppTheme.text.disabled }]}>
              Skip Introduction
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}
