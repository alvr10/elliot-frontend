import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppTheme, Spacing, Typography } from "../constants";
import Button from "./Button";
import FeatureList from "./FeatureList";
import ProgressBar from "./ProgressBar";

interface SubscriptionStepProps {
  userEmail?: string;
  onSubscribe: () => Promise<void>;
  loading: boolean;
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

const SubscriptionStep: React.FC<SubscriptionStepProps> = ({
  userEmail,
  onSubscribe,
  loading,
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <ProgressBar
        currentStep={2}
        totalSteps={2}
        stepText="Paso 2 de 2: Completa Tu Suscripción"
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.authContent}>
          <View style={styles.subscriptionHeader}>
            <Text style={styles.subscriptionTitle}>¡Ya Casi!</Text>
            <Text style={styles.subscriptionSubtitle}>
              Bienvenido, {userEmail}
            </Text>
            <Text style={styles.subscriptionNote}>
              Completa tu suscripción para desbloquear todas las funciones
            </Text>
          </View>

          {/* Subscription Benefits */}
          <View style={styles.benefitsBox}>
            <Text style={styles.benefitsTitle}>Lo Que Obtienes</Text>
            <FeatureList features={features.slice(0, 4)} />
          </View>

          {/* Pricing Card */}
          <View style={styles.pricingCard}>
            <Text style={styles.pricingAmount}>€2.99/month</Text>
            <Text style={styles.pricingDescription}>
              Acceso completo • Cancela en cualquier momento
            </Text>
            <Text style={styles.pricingNote}>
              Comienza tu transformación hoy
            </Text>
          </View>

          {/* Subscribe Button */}
          <Button
            variant="primary"
            onPress={onSubscribe}
            loading={loading}
            loadingText="Procesando Pago..."
          >
            Completar Suscripción
          </Button>

          <Text style={styles.subscriptionFooter}>
            Pago seguro • Cancela en cualquier momento • Sin tarifas ocultas
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppTheme.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  authContent: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: "center",
  },
  subscriptionHeader: {
    marginBottom: Spacing.xl,
  },
  subscriptionTitle: {
    color: AppTheme.text.primary,
    fontSize: Typography.size["3xl"],
    fontWeight: Typography.weight.bold,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  subscriptionSubtitle: {
    color: AppTheme.text.secondary,
    fontSize: Typography.size.lg,
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
  subscriptionNote: {
    color: AppTheme.text.secondary,
    textAlign: "center",
  },
  benefitsBox: {
    backgroundColor: AppTheme.surface,
    padding: Spacing.lg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: AppTheme.border,
    marginBottom: Spacing["2xl"],
  },
  benefitsTitle: {
    color: AppTheme.text.primary,
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  pricingCard: {
    backgroundColor: AppTheme.surface,
    padding: Spacing.lg,
    borderRadius: 8,
    marginBottom: Spacing.lg,
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
    marginBottom: Spacing.lg,
  },
  pricingNote: {
    color: AppTheme.text.secondary,
    fontSize: Typography.size.sm,
    textAlign: "center",
  },
  subscriptionFooter: {
    color: AppTheme.text.disabled,
    fontSize: Typography.size.xs,
    textAlign: "center",
  },
});

export default SubscriptionStep;
