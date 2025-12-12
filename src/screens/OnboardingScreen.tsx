import Button from "@/components/Button";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppTheme, Colors, Spacing, Typography } from "../constants";

const { width } = Dimensions.get("window");

const onboardingData = [
  {
    title: "El Peligro Oculto",
    subtitle: "La adicción a la cafeína es real y afecta a millones",
    content:
      "Más del 90% de los adultos consumen cafeína diariamente, a menudo sin darse cuenta de que son dependientes. Los síntomas de abstinencia, la ansiedad y los trastornos del sueño son solo el comienzo.",
    warning: "¿Estás en control, o es la cafeína la que te controla?",
  },
  {
    title: "Tu Salud en Riesgo",
    subtitle: "El consumo excesivo de cafeína tiene consecuencias graves",
    content:
      "Palpitaciones cardíacas, insomnio, problemas digestivos y mayor ansiedad. El límite recomendado es de 400mg diarios; la mayoría de las personas lo exceden sin saberlo.",
    warning: "Cada miligramo extra te acerca más a la dependencia.",
  },
  {
    title: "Recupera el Control",
    subtitle: "El seguimiento profesional lo cambia todo",
    content:
      "Los estudios muestran que las personas que rastrean su consumo de cafeína reducen el consumo en un 40% en el primer mes. El conocimiento es poder y libertad.",
    warning:
      "La pregunta no es si necesitas ayuda. Es si estás listo para ayudarte a ti mismo.",
  },
  {
    title: "Tu Yo Futuro",
    subtitle: "Imagina despertarte con energía, de forma natural",
    content:
      "Mejor sueño. Energía estable. Sin caídas vespertinas. Sin dependencia. Esto no es solo posible, es inevitable con el sistema adecuado.",
    warning:
      "El precio del cambio siempre es menor que el costo de permanecer igual.",
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
                Datos Diarios de Cafeína
              </Text>
              <View style={styles.statsRow}>
                <Text style={[styles.statsLabel, { color: Colors.gray700 }]}>
                  Límite Diario Seguro:
                </Text>
                <Text style={[styles.statsValue, { color: Colors.black }]}>
                  400mg
                </Text>
              </View>
              <View style={styles.statsRow}>
                <Text style={[styles.statsLabel, { color: Colors.gray700 }]}>
                  Consumo Promedio:
                </Text>
                <Text style={[styles.statsValue, { color: Colors.error }]}>
                  540mg
                </Text>
              </View>
              <View style={styles.statsRow}>
                <Text style={[styles.statsLabel, { color: Colors.gray700 }]}>
                  Cronograma de Abstinencia:
                </Text>
                <Text style={[styles.statsValue, { color: Colors.black }]}>
                  12-24 horas
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Action Button */}
        <Button variant="primary" onPress={handleNext}>
          {isLastSlide ? "Comenzar a Tomar Control" : "Continuar"}
        </Button>

        {/* Skip Option (only on first slides) */}
        {!isLastSlide && (
          <Button
            variant="ghost"
            onPress={finishOnboarding}
            style={styles.skipButton}
          >
            Omitir Introducción
          </Button>
        )}
      </View>
    </SafeAreaView>
  );
}

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
