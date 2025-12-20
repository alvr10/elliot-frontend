import { Card } from "@/components";
import { AppTheme, Spacing, Typography } from "@/constants";
import { useNotification } from "@/context";
import { useAuth } from "@/hooks";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  Image,
  Linking,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const router = useRouter();
  const { subscription, signOut } = useAuth();
  const { showNotification } = useNotification();
  const insets = useSafeAreaInsets();

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
              <TouchableOpacity onPress={() => router.push("/daily-limit")}>
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
});
