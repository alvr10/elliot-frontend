import Card from "@/components/Card";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppTheme, Spacing, Typography } from "../constants";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "90%",
    backgroundColor: AppTheme.primary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: Spacing.md,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
  title: {
    color: AppTheme.secondary,
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
  },
  closeButton: {
    position: "absolute",
    top: Spacing.md,
    right: Spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeText: {
    color: AppTheme.secondary,
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
  },
  scrollView: {
    flex: 1,
  },
  card: {
    backgroundColor: AppTheme.background,
    borderRadius: 16,
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  subscriptionCard: {
    backgroundColor: AppTheme.background,
    borderRadius: 16,
    marginBottom: Spacing.md,
  },
  subscriptionContent: {
    padding: Spacing.md,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  warningCard: {
    backgroundColor: AppTheme.backgroundSecondary,
    padding: Spacing.md,
    borderRadius: 8,
    marginBottom: Spacing.md,
  },
  warningText: {
    color: AppTheme.text.primary,
    textAlign: "center",
    fontSize: Typography.size.sm,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: AppTheme.error,
    padding: Spacing.md,
    borderRadius: 8,
  },
  cancelButtonActive: {
    backgroundColor: AppTheme.error,
  },
  cancelButtonDisabled: {
    backgroundColor: AppTheme.text.disabled,
  },
  cancelText: {
    color: AppTheme.error,
    textAlign: "center",
    fontWeight: Typography.weight.medium,
  },
  reactivateButton: {
    borderWidth: 1,
    borderColor: AppTheme.success,
    padding: Spacing.md,
    borderRadius: 8,
  },
  reactivateButtonActive: {
    backgroundColor: AppTheme.success,
  },
  reactivateButtonDisabled: {
    backgroundColor: AppTheme.text.disabled,
  },
  reactivateText: {
    color: AppTheme.success,
    textAlign: "center",
    fontWeight: Typography.weight.medium,
  },
  legalText: {
    color: AppTheme.text.primary,
    fontWeight: Typography.weight.semibold,
    fontSize: Typography.size.base,
  },
  imageContainer: {
    alignItems: "center",
    marginVertical: Spacing.md,
  },
  image: {
    width: 200,
    height: 200,
    resizeMode: "contain",
  },
  lightLabel: {
    color: AppTheme.text.secondary,
    fontSize: Typography.size.sm,
  },
  lightValue: {
    color: AppTheme.text.primary,
    fontSize: Typography.size.base,
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
  dangerText: {
    color: AppTheme.error,
    fontSize: Typography.size.base,
  },
});

export default function SettingsScreen() {
  const [cancelling, setCancelling] = useState(false);
  const [reactivating, setReactivating] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const navigation = useNavigation();
  const { subscription, signOut, getCurrentToken, refreshSubscription } =
    useAuth();
  const { showNotification } = useNotification();

  const handleSignOut = () => {
    Alert.alert(
      "Cerrar sesión",
      "¿Estás seguro de que quieres cerrar sesión?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Cerrar sesión",
          style: "destructive",
          onPress: async () => {
            await signOut();
            showNotification("Sesión cerrada exitosamente", "info");
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Eliminar cuenta",
      "¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            // Implement delete account logic
            showNotification("Cuenta eliminada", "info");
          },
        },
      ]
    );
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      "Cancel Subscription",
      "Your subscription will be cancelled at the end of your current billing period. You'll keep access until then and won't be charged again.",
      [
        { text: "Keep Subscription", style: "cancel" },
        {
          text: "Cancel at Period End",
          style: "destructive",
          onPress: cancelSubscription,
        },
      ]
    );
  };

  const handleReactivateSubscription = () => {
    Alert.alert(
      "Reactivate Subscription",
      "This will resume your subscription and you'll be charged at the next billing cycle.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reactivate",
          onPress: reactivateSubscription,
        },
      ]
    );
  };

  const cancelSubscription = async () => {
    setCancelling(true);
    try {
      const token = await getCurrentToken();
      if (!token) {
        showNotification("Please sign in again", "error");
        return;
      }

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/subscription/cancel`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        await refreshSubscription(); // Refresh to get new status
        showNotification(
          "Subscription cancelled - access until period end",
          "success"
        );
      } else {
        const errorData = await response.json();
        showNotification(
          errorData.error || "Failed to cancel subscription",
          "error"
        );
      }
    } catch (error) {
      console.error("Failed to cancel subscription:", error);
      showNotification("Failed to cancel subscription", "error");
    } finally {
      setCancelling(false);
    }
  };

  const reactivateSubscription = async () => {
    setReactivating(true);
    try {
      const token = await getCurrentToken();
      if (!token) {
        showNotification("Please sign in again", "error");
        return;
      }

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/subscription/reactivate`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        await refreshSubscription(); // Refresh to get new status
        showNotification("Subscription reactivated successfully", "success");
      } else {
        const errorData = await response.json();
        showNotification(
          errorData.error || "Failed to reactivate subscription",
          "error"
        );
      }
    } catch (error) {
      console.error("Failed to reactivate subscription:", error);
      showNotification("Failed to reactivate subscription", "error");
    } finally {
      setReactivating(false);
    }
  };

  const openLink = (url: string) => {
    Linking.openURL(url).catch(() => {
      showNotification("Could not open link", "error");
    });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Invalid date";
    }
  };

  const getSubscriptionStatusDisplay = () => {
    switch (subscription?.status) {
      case "active":
        return { text: "Active", color: AppTheme.success };
      case "active_until_period_end":
        return {
          text: "Cancelled (Active until period end)",
          color: AppTheme.warning,
        };
      case "cancelled":
        return { text: "Cancelled", color: AppTheme.error };
      default:
        return { text: "Inactive", color: AppTheme.text.disabled };
    }
  };

  const subscriptionStatus = getSubscriptionStatusDisplay();
  const isCancelledButActive =
    subscription?.status === "active_until_period_end";

  return (
    <View style={styles.container}>
      <View style={styles.bottomSheet}>
        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Ajustes</Text>
          </View>

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.closeButton}
          >
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>

          <ScrollView style={styles.scrollView}>
            <View style={styles.imageContainer}>
              <Image
                source={require("../../assets/images/elliot.png")}
                style={styles.image}
              />
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

            <Card
              icon="notifications"
              title="Notificaciones"
              element={
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                />
              }
            />

            <Card
              icon="edit"
              title="Modificar ingesta diaria"
              element={
                <TouchableOpacity
                  onPress={() => navigation.navigate("DailyLimit" as never)}
                >
                  <MaterialIcons
                    name="chevron-right"
                    size={24}
                    color={AppTheme.text.secondary}
                  />
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
                <TouchableOpacity onPress={handleSignOut}>
                  <Text style={styles.buttonText}>Cerrar</Text>
                </TouchableOpacity>
              }
            />

            <Card
              icon="delete"
              title="Eliminar cuenta"
              element={
                <TouchableOpacity onPress={handleDeleteAccount}>
                  <Text style={styles.dangerText}>Eliminar</Text>
                </TouchableOpacity>
              }
            />
          </ScrollView>
        </SafeAreaView>
      </View>
    </View>
  );
}
