import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppTheme, Spacing, Typography } from "../constants";
import { apiClient } from "../services/api";
import Button from "./Button";
import ProgressBar from "./ProgressBar";

type AuthMode = "signin" | "signup";

interface AuthStepProps {
  onBack: () => void;
  onAuth: (email: string, password: string, mode: AuthMode) => Promise<void>;
  onGoogleAuth: () => void;
  loading: boolean;
}

const AuthStep: React.FC<AuthStepProps> = ({
  onBack,
  onAuth,
  onGoogleAuth,
  loading,
}) => {
  const [authMode, setAuthMode] = useState<AuthMode>("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleAuth = async () => {
    await onAuth(email, password, authMode);
  };

  const handleDebugHealth = async () => {
    try {
      const response = await apiClient.get("/v1/health");
      Alert.alert(
        "Health Check",
        `Status: ${response.status}\nResponse: ${JSON.stringify(response.data)}`
      );
    } catch (error: any) {
      Alert.alert("Health Check Failed", error.message || "Unknown error");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoiding}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ProgressBar
          currentStep={1}
          totalSteps={2}
          stepText={`Paso 1 de 2: ${
            authMode === "signup" ? "Crear Cuenta" : "Iniciar Sesión"
          }`}
          showBackButton
          onBackPress={onBack}
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.authContent}>
            <View style={styles.authHeader}>
              <Text style={styles.authTitle}>
                {authMode === "signup"
                  ? "Crea Tu Cuenta"
                  : "Bienvenido de Vuelta"}
              </Text>
              <Text style={styles.authSubtitle}>
                {authMode === "signup"
                  ? "Únete a miles tomando control de su consumo de cafeína"
                  : "Inicia sesión para continuar tu viaje"}
              </Text>
            </View>

            <View style={styles.authForm}>
              <Button variant="error" onPress={onGoogleAuth}>
                Continuar con Google
              </Button>

              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Dirección de correo electrónico"
                placeholderTextColor="#6B7280"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.textInput}
              />

              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder={
                  authMode === "signup"
                    ? "Contraseña (mín 6 caracteres)"
                    : "Contraseña"
                }
                placeholderTextColor="#6B7280"
                secureTextEntry
                style={styles.passwordInput}
              />

              <Button
                variant="primary"
                onPress={handleAuth}
                loading={loading}
                loadingText={
                  authMode === "signup"
                    ? "Creando Cuenta..."
                    : "Iniciando Sesión..."
                }
              >
                {authMode === "signup" ? "Crear Cuenta" : "Iniciar Sesión"}
              </Button>

              <Button variant="outline" onPress={handleDebugHealth}>
                Debug Health Check
              </Button>

              <TouchableOpacity
                onPress={() =>
                  setAuthMode(authMode === "signup" ? "signin" : "signup")
                }
              >
                <Text style={styles.switchAuthText}>
                  {authMode === "signup"
                    ? "¿Ya tienes una cuenta? "
                    : "¿No tienes una cuenta? "}
                  <Text style={styles.switchAuthLink}>
                    {authMode === "signup" ? "Iniciar Sesión" : "Registrarse"}
                  </Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppTheme.background,
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
  authContent: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: "center",
  },
  authHeader: {
    marginBottom: Spacing.xl,
  },
  authTitle: {
    color: AppTheme.text.primary,
    fontSize: Typography.size["3xl"],
    fontWeight: Typography.weight.bold,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  authSubtitle: {
    color: AppTheme.text.secondary,
    fontSize: Typography.size.lg,
    textAlign: "center",
  },
  authForm: {
    backgroundColor: AppTheme.surface,
    padding: Spacing.lg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: AppTheme.border,
    marginBottom: Spacing["2xl"],
  },
  textInput: {
    backgroundColor: AppTheme.backgroundSecondary,
    color: AppTheme.text.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderRadius: 8,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: AppTheme.border,
    fontSize: Typography.size.lg,
  },
  passwordInput: {
    backgroundColor: AppTheme.backgroundSecondary,
    color: AppTheme.text.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderRadius: 8,
    marginBottom: Spacing["2xl"],
    borderWidth: 1,
    borderColor: AppTheme.border,
    fontSize: Typography.size.lg,
  },
  switchAuthText: {
    color: AppTheme.text.secondary,
    textAlign: "center",
  },
  switchAuthLink: {
    color: AppTheme.primary,
    fontWeight: Typography.weight.medium,
  },
});

export default AuthStep;
