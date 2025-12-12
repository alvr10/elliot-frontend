import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors, Spacing, Typography } from "../constants";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  stepText: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  currentStep,
  totalSteps,
  stepText,
  showBackButton = false,
  onBackPress,
}) => {
  return (
    <View style={styles.progressSection}>
      {showBackButton && onBackPress && (
        <View style={styles.backButton}>
          <Text style={styles.backText} onPress={onBackPress}>
            ← Atrás
          </Text>
        </View>
      )}
      <View style={styles.progressBarContainer}>
        {Array.from({ length: totalSteps }, (_, index) => (
          <View
            key={index}
            style={[
              styles.progressBar,
              index < currentStep
                ? styles.progressBarActive
                : styles.progressBarInactive,
            ]}
          />
        ))}
      </View>
      <Text style={styles.progressText}>{stepText}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  progressSection: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xs,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  backText: {
    color: Colors.white,
    fontSize: Typography.size.lg,
  },
  progressBarContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: Spacing["2xl"],
  },
  progressBar: {
    height: 2,
    borderRadius: 1,
    flex: 1,
    marginHorizontal: Spacing.xs,
  },
  progressBarActive: {
    backgroundColor: Colors.white,
  },
  progressBarInactive: {
    backgroundColor: Colors.gray700,
  },
  progressText: {
    color: Colors.gray400,
    textAlign: "center",
    fontSize: Typography.size.sm,
  },
});

export default ProgressBar;
