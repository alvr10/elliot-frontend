import { Card } from "@/components";
import { AppTheme, Spacing, Typography } from "@/constants";
import { useNotification } from "@/context";
import { useAuth } from "@/hooks";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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
    marginVertical: Spacing.md,
  },
  image: {
    width: 200,
    height: 200,
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
  dangerText: {
    color: AppTheme.error,
    fontSize: Typography.size.base,
  },
});

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const router = useRouter();
  const { subscription, signOut } = useAuth();
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

  const openLink = (url: string) => {
    Linking.openURL(url).catch(() => {
      showNotification("Could not open link", "error");
    });
  };

  const getSubscriptionStatusDisplay = () => {
    switch (subscription?.status) {
      case "active":
        return { text: "Beta Access Active", color: AppTheme.success };
      case "active_until_period_end":
        return {
          text: "Beta Access Active",
          color: AppTheme.warning,
        };
      case "cancelled":
        return { text: "Beta Access Ended", color: AppTheme.error };
      default:
        return { text: "No Beta Access", color: AppTheme.text.disabled };
    }
  };

  const subscriptionStatus = getSubscriptionStatusDisplay();

  return (
    <View style={styles.container}>
      <View style={styles.bottomSheet}>
        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Ajustes</Text>
          </View>

          <TouchableOpacity
            onPress={() => router.back()}
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
        </SafeAreaView>
      </View>
    </View>
  );
}
