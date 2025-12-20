import { Card } from "@/components";
import SignOutButton from "@/components/socia-auth-buttons/sign-out-button";
import { AppTheme, Spacing, Typography } from "@/constants";
import { useNotification } from "@/context";
import { useAuth } from "@/hooks";
import { caffeineApi } from "@/services/api/v1/caffeine.api";
import { userApi } from "@/services/api/v1/user.api";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Linking,
  Modal,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const router = useRouter();
  const { subscription, signOut } = useAuth();
  const { showNotification } = useNotification();
  const insets = useSafeAreaInsets();
  const [dailyLimit, setDailyLimit] = useState<number>(0);
  const [showDailyLimitModal, setShowDailyLimitModal] = useState(false);
  const [tempDailyLimit, setTempDailyLimit] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      // Only respond to horizontal swipes
      return Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
    },
    onPanResponderRelease: (evt, gestureState) => {
      // Check if it's a swipe to the right with sufficient distance and velocity
      if (gestureState.dx > 50 && gestureState.vx > 0.3) {
        router.back();
      }
    },
  });

  // Fetch daily limit on component mount
  useEffect(() => {
    const fetchDailyLimit = async () => {
      try {
        const response = await caffeineApi.getDailyLimit();
        const limit = response?.dailyCaffeineLimit || 0;
        setDailyLimit(limit);
        setTempDailyLimit(limit.toString());
      } catch (error) {
        console.error("Error fetching daily limit:", error);
        // Set default values on error
        setDailyLimit(400);
        setTempDailyLimit("400");
      }
    };
    fetchDailyLimit();
  }, []);

  const handleDeleteAccount = async () => {
    Alert.alert(
      "Eliminar cuenta",
      "¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer y se eliminarán todos tus datos permanentemente.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);

              // Delete user data from our API
              await userApi.deleteAccount();

              // Sign out after successful deletion
              await signOut();
              showNotification("Cuenta eliminada exitosamente", "success");
            } catch (error: any) {
              console.error("Error deleting account:", error);
              showNotification(
                error.message || "Error al eliminar la cuenta",
                "error"
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleUpdateDailyLimit = async () => {
    const limit = parseInt(tempDailyLimit);

    if (isNaN(limit) || limit <= 0) {
      showNotification("Por favor ingresa un límite válido", "error");
      return;
    }

    if (limit > 1000) {
      showNotification("El límite diario no puede exceder 1000mg", "error");
      return;
    }

    try {
      setLoading(true);
      await caffeineApi.updateDailyLimit({ dailyCaffeineLimit: limit });
      setDailyLimit(limit);
      setShowDailyLimitModal(false);
      showNotification("Límite diario actualizado exitosamente", "success");
    } catch (error: any) {
      console.error("Error updating daily limit:", error);
      showNotification(
        error.message || "Error al actualizar el límite diario",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const openLink = (url: string) => {
    Linking.openURL(url).catch(() => {
      showNotification("Could not open link", "error");
    });
  };

  const getSubscriptionStatusDisplay = () => {
    switch (subscription?.status) {
      case "active":
        return { text: "ACCESO BETA ACTIVO", color: AppTheme.success };
      case "active_until_period_end":
        return {
          text: "ACCESO BETA ACTIVO",
          color: AppTheme.warning,
        };
      case "cancelled":
        return { text: "ACCESO BETA FINALIZADO", color: AppTheme.error };
      default:
        return { text: "SIN ACCESO BETA", color: AppTheme.text.disabled };
    }
  };

  const subscriptionStatus = getSubscriptionStatusDisplay();

  return (
    <View
      style={[styles.container, { paddingTop: insets.top }]}
      {...panResponder.panHandlers}
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.backButton} />
          <Text style={styles.title}>Ajustes</Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={{ paddingBottom: insets.bottom }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.imageContainer}>
            <Image
              source={require("../../assets/images/elliot.png")}
              style={styles.image}
            />
          </View>

          <View style={styles.statusCard}>
            <Text style={styles.buttonText}>Plan actual</Text>
            <Text
              style={[styles.statusText, { color: subscriptionStatus.color }]}
            >
              {subscriptionStatus.text}
            </Text>
          </View>

          <Card
            icon="star"
            title="Valóranos"
            element={
              <TouchableOpacity
                onPress={() =>
                  Linking.openURL(
                    "https://play.google.com/store/apps/details?id=com.elliot-cafe"
                  )
                }
              >
                <Text style={styles.buttonText}>Valorar</Text>
              </TouchableOpacity>
            }
          />

          {/*<Card
            icon="notifications"
            title="Notificaciones"
            element={
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
              />
            }
          />*/}

          <Card
            icon="edit"
            title="Modificar ingesta diaria"
            element={
              <TouchableOpacity
                onPress={() => {
                  setTempDailyLimit(dailyLimit.toString());
                  setShowDailyLimitModal(true);
                }}
                disabled={loading}
              >
                <View style={styles.dailyLimitContainer}>
                  <Text style={styles.dailyLimitText}>{dailyLimit}mg</Text>
                  <MaterialIcons
                    name="chevron-right"
                    size={24}
                    color={AppTheme.text.secondary}
                  />
                </View>
              </TouchableOpacity>
            }
          />

          <View style={styles.card}>
            <TouchableOpacity
              style={styles.legalRow}
              onPress={() => openLink("https://elliot-cafe.com/terms")}
            >
              <Text style={styles.legalText}>Términos y condiciones</Text>
              <MaterialIcons
                name="chevron-right"
                size={24}
                color={AppTheme.text.secondary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.legalRow}
              onPress={() => openLink("https://elliot-cafe.com/privacy")}
            >
              <Text style={styles.legalText}>Política de privacidad</Text>
              <MaterialIcons
                name="chevron-right"
                size={24}
                color={AppTheme.text.secondary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.legalRow}
              onPress={() => openLink("https://elliot-cafe.com/about")}
            >
              <Text style={styles.legalText}>Sobre nosotros</Text>
              <MaterialIcons
                name="chevron-right"
                size={24}
                color={AppTheme.text.secondary}
              />
            </TouchableOpacity>
          </View>

          <Card
            icon="logout"
            title="Cerrar sesión"
            element={
              <SignOutButton
                title="Cerrar"
                showIcon={true}
                onPress={() =>
                  showNotification("Sesión cerrada exitosamente", "info")
                }
              />
            }
          />

          <Card
            icon="delete"
            title="Eliminar cuenta"
            element={
              <TouchableOpacity
                onPress={handleDeleteAccount}
                disabled={loading}
              >
                <Text
                  style={[styles.dangerText, loading && styles.disabledText]}
                >
                  {loading ? "Eliminando..." : "Eliminar"}
                </Text>
              </TouchableOpacity>
            }
          />

          {/* Daily Limit Modal */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={showDailyLimitModal}
            onRequestClose={() => setShowDailyLimitModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Modificar Límite Diario</Text>
                <Text style={styles.modalSubtitle}>
                  Ingresa tu límite diario de cafeína en miligramos (mg)
                </Text>
                <TextInput
                  style={styles.textInput}
                  value={tempDailyLimit}
                  onChangeText={setTempDailyLimit}
                  keyboardType="numeric"
                  placeholder="Ej: 400"
                  maxLength={4}
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setShowDailyLimitModal(false)}
                    disabled={loading}
                  >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.confirmButton]}
                    onPress={handleUpdateDailyLimit}
                    disabled={loading}
                  >
                    <Text style={styles.confirmButtonText}>
                      {loading ? "Guardando..." : "Guardar"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppTheme.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  header: {
    alignItems: "center",
    paddingVertical: Spacing.md,
    position: "relative",
  },
  title: {
    color: AppTheme.secondary,
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
  },
  backButton: {
    position: "absolute",
    top: Spacing.md,
    left: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  backText: {
    color: AppTheme.secondary,
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
  },
  scrollView: {
    flex: 1,
  },
  card: {
    backgroundColor: AppTheme.secondary,
    borderRadius: 16,
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  statusCard: {
    backgroundColor: AppTheme.secondary,
    borderRadius: 16,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    alignItems: "flex-start",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  legalText: {
    color: AppTheme.text.primary,
    fontWeight: Typography.weight.semibold,
    fontSize: Typography.size.base,
  },
  imageContainer: {
    alignItems: "center",
    marginTop: Spacing.md,
    marginBottom: -Spacing["3xl"],
  },
  image: {
    width: 250,
    height: 250,
    resizeMode: "contain",
  },
  legalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  buttonText: {
    color: AppTheme.text.secondary,
    fontSize: Typography.size.base,
  },
  statusText: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
  },
  dangerText: {
    color: AppTheme.error,
    fontSize: Typography.size.base,
  },
  disabledText: {
    opacity: 0.5,
  },
  dailyLimitContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  dailyLimitText: {
    color: AppTheme.text.secondary,
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.medium,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
  },
  modalContent: {
    backgroundColor: AppTheme.secondary,
    borderRadius: 16,
    padding: Spacing.xl,
    width: "100%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
    color: AppTheme.text.primary,
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: Typography.size.base,
    color: AppTheme.text.secondary,
    marginBottom: Spacing.lg,
    textAlign: "center",
  },
  textInput: {
    backgroundColor: AppTheme.backgroundSecondary,
    borderRadius: 8,
    padding: Spacing.md,
    fontSize: Typography.size.lg,
    marginBottom: Spacing.lg,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  modalButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: AppTheme.backgroundSecondary,
  },
  confirmButton: {
    backgroundColor: AppTheme.primary,
  },
  cancelButtonText: {
    color: AppTheme.text.primary,
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.medium,
  },
  confirmButtonText: {
    color: AppTheme.secondary,
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.medium,
  },
});
