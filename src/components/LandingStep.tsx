import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, Spacing, Typography } from "../constants";
import Button from "./Button";
import FeatureList from "./FeatureList";
import TestimonialList from "./TestimonialList";

interface LandingStepProps {
  onStartJourney: () => void;
  onAlreadyHaveAccount: () => void;
}

const features = [
  "Seguimiento preciso de cafeína",
  "Base de datos personalizada de bebidas",
  "Monitoreo de límite diario",
  "Historial de consumo y tendencias",
  "Información sobre salud",
  "Cronograma de abstinencia",
  "Recomendaciones de expertos",
];

const testimonials = [
  {
    text: "No tenía idea de que consumía 600mg de cafeína al día. Esta app literalmente salvó mi sueño.",
    author: "Sarah M.",
  },
  {
    text: "Finalmente rompí mi adicción de 10 años a las bebidas energéticas. El seguimiento me hizo responsable.",
    author: "Mike R.",
  },
];

const LandingStep: React.FC<LandingStepProps> = ({
  onStartJourney,
  onAlreadyHaveAccount,
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
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

        {/* Social Proof */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resultados Reales</Text>
          <TestimonialList testimonials={testimonials} />
        </View>

        {/* Pricing */}
        <View style={styles.pricingBox}>
          <View style={styles.pricingCard}>
            <Text style={styles.pricingAmount}>€2.99/mes</Text>
            <Text style={styles.pricingDescription}>
              Acceso completo a todas las funciones
            </Text>
            <Text style={styles.pricingNote}>
              Menos que el costo de 3 cafés. Invierte en tu salud.
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

          <Text style={styles.footerText}>
            Cancela en cualquier momento. Tu salud lo vale.
          </Text>
        </View>

        {__DEV__ && (
          <Button
            variant="error"
            onPress={async () => {
              await AsyncStorage.removeItem("hasSeenOnboarding");
              // TODO: Replace with toast
              alert("Debug: Onboarding reset! Restart the app.");
            }}
          >
            DEPURACIÓN: Restablecer Incorporación
          </Button>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 48,
    paddingBottom: Spacing.xl,
  },
  title: {
    color: Colors.white,
    fontSize: Typography.size["4xl"],
    fontWeight: Typography.weight.bold,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  subtitle: {
    color: Colors.gray300,
    fontSize: Typography.size.xl,
    textAlign: "center",
  },
  urgencyBox: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: 8,
    marginBottom: Spacing.xl,
  },
  urgencyTitle: {
    color: Colors.black,
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  urgencyText: {
    color: Colors.gray700,
    textAlign: "center",
    fontSize: Typography.size.base,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    color: Colors.white,
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
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    borderRadius: 8,
  },
  pricingAmount: {
    color: Colors.black,
    fontSize: Typography.size["2xl"],
    fontWeight: Typography.weight.bold,
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
  pricingDescription: {
    color: Colors.gray600,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  pricingNote: {
    color: Colors.gray700,
    fontSize: Typography.size.sm,
    textAlign: "center",
  },
  ctaSection: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  footerText: {
    color: Colors.gray500,
    fontSize: Typography.size.xs,
    textAlign: "center",
    marginTop: Spacing.lg,
  },
});

export default LandingStep;
