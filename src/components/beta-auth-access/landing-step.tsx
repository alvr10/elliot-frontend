import { Button, FeatureList } from "@/components";
import { AppTheme, Spacing, Typography } from "@/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface LandingStepProps {
  onStartJourney: () => void;
  onAlreadyHaveAccount: () => void;
}

const features = [
  "Seguimiento preciso de cafeína",
  "Base de datos personalizada de bebidas",
  "Monitoreo de límite diario",
  "Historial de consumo y tendencias",
  "Cronograma de abstinencia",
];

const LandingStep: React.FC<LandingStepProps> = ({
  onStartJourney,
  onAlreadyHaveAccount,
}) => {
  const isDev = __DEV__;

  const clearAllStorage = async () => {
    Alert.alert(
      "Clear All Storage (Dev Only)",
      "This will clear all stored data including auth tokens. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              Alert.alert(
                "Success",
                "All storage cleared. Please restart the app."
              );
            } catch {
              Alert.alert("Error", "Failed to clear storage");
            }
          },
        },
      ]
    );
  };
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoiding}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Elliot</Text>
            <Text style={styles.subtitle}>
              Toma el control de tu consumo de cafeína
            </Text>
          </View>

          {/* Urgency Message */}
          <View style={styles.urgencyBox}>
            <Text style={styles.urgencyTitle}>Tu Salud No Puede Esperar</Text>
            <Text style={styles.urgencyText}>
              Cada día sin un seguimiento adecuado es otro día de posible
              sobreconsumo.
            </Text>
          </View>

          {/* Features */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Todo Lo Que Necesitas</Text>
            <FeatureList features={features} />
          </View>

          {/* Pricing */}
          <View style={styles.pricingBox}>
            <View style={styles.pricingCard}>
              <Text style={styles.pricingAmount}>Gratis durante la beta</Text>
              <Text style={styles.pricingDescription}>
                Acceso completo a todas las funciones
              </Text>
            </View>
          </View>

          {/* CTA Buttons */}
          <View style={styles.ctaSection}>
            <Button variant="primary" onPress={onStartJourney}>
              Comienza Tu Viaje
            </Button>

            <Button variant="outline" onPress={onAlreadyHaveAccount}>
              Ya Tengo una Cuenta
            </Button>

            {isDev && (
              <Button
                variant="outline"
                onPress={clearAllStorage}
                style={styles.devButton}
              >
                🧹 Clear All Storage (Dev)
              </Button>
            )}

            <Text style={styles.footerText}>
              Cancela en cualquier momento. Tu salud lo vale.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppTheme.backgroundSecondary,
  },
  keyboardAvoiding: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 48,
    paddingBottom: Spacing.xl,
  },
  title: {
    color: AppTheme.text.primary,
    fontSize: Typography.size["4xl"],
    fontWeight: Typography.weight.bold,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  subtitle: {
    color: AppTheme.text.secondary,
    fontSize: Typography.size.xl,
    textAlign: "center",
  },
  urgencyBox: {
    backgroundColor: AppTheme.surface,
    marginHorizontal: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: 8,
    marginBottom: Spacing.xl,
  },
  urgencyTitle: {
    color: AppTheme.text.inverse,
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  urgencyText: {
    color: AppTheme.text.secondary,
    textAlign: "center",
    fontSize: Typography.size.base,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    color: AppTheme.text.primary,
    fontSize: Typography.size["2xl"],
    fontWeight: Typography.weight.bold,
    textAlign: "center",
    marginBottom: Spacing["2xl"],
  },
  pricingBox: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  pricingCard: {
    backgroundColor: AppTheme.surface,
    padding: Spacing.lg,
    borderRadius: 8,
  },
  pricingAmount: {
    color: AppTheme.text.inverse,
    fontSize: Typography.size["2xl"],
    fontWeight: Typography.weight.bold,
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
  pricingDescription: {
    color: AppTheme.text.secondary,
    textAlign: "center",
  },
  pricingNote: {
    color: AppTheme.text.secondary,
    fontSize: Typography.size.sm,
    textAlign: "center",
  },
  ctaSection: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  devButton: {
    borderColor: AppTheme.error,
    borderWidth: 1,
  },
  footerText: {
    color: AppTheme.text.disabled,
    fontSize: Typography.size.xs,
    textAlign: "center",
    marginTop: Spacing.lg,
  },
});

export default LandingStep;
