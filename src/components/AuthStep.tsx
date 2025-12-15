import { FontAwesome } from "@expo/vector-icons";
import React, { useState } from "react";
import {
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
import Button from "./Button";
import ProgressBar from "./ProgressBar";

type AuthMode = "signin" | "signup";

interface AuthStepProps {
  onBack: () => void;
  onAuth: (email: string, password: string, mode: AuthMode) => Promise<void>;
  onGoogleAuth: () => void;
  loading: boolean;
  initialMode?: AuthMode;
}

const AuthStep: React.FC<AuthStepProps> = ({
  onBack,
  onAuth,
  onGoogleAuth,
  loading,
  initialMode = "signup",
}) => {
  const [authMode, setAuthMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleAuth = async () => {
    await onAuth(email, password, authMode);
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

            <TouchableOpacity
              style={[styles.googleButton, { marginBottom: Spacing.lg }]}
              onPress={onGoogleAuth}
              activeOpacity={0.8}
            >
              <FontAwesome name="google" size={24} color={AppTheme.primary} />
              <Text style={styles.googleButtonText}>Continuar con Google</Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>o</Text>
              <View style={styles.dividerLine} />
            </View>

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
              style={[styles.textInput, styles.passwordInput]}
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
  gradient: {
    flex: 1,
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
  textInput: {
    backgroundColor: AppTheme.backgroundSecondary,
    color: AppTheme.text.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    marginTop: Spacing.md,
    borderRadius: 8,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: AppTheme.border,
    fontSize: Typography.size.lg,
  },
  passwordInput: {
    marginBottom: Spacing["2xl"],
  },
  switchAuthText: {
    paddingTop: Spacing.md,
    color: AppTheme.text.secondary,
    textAlign: "center",
  },
  switchAuthLink: {
    color: AppTheme.primary,
    fontWeight: Typography.weight.medium,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: AppTheme.border,
  },
  dividerText: {
    marginHorizontal: Spacing.md,
    color: AppTheme.text.secondary,
    fontSize: Typography.size.sm,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    borderRadius: 16,
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: AppTheme.primary,
    gap: Spacing.md,
  },
  googleButtonText: {
    color: AppTheme.primary,
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
    textAlign: "center",
  },
});

export default AuthStep;
