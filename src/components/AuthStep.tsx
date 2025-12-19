import { FontAwesome } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
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
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Email validation function
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Password validation function
  const validatePassword = (
    password: string
  ): { isValid: boolean; message: string } => {
    if (password.length < 6) {
      return {
        isValid: false,
        message: "La contraseña debe tener al menos 6 caracteres",
      };
    }

    // Check for at least one number
    if (!/\d/.test(password)) {
      return {
        isValid: false,
        message: "La contraseña debe incluir al menos un número",
      };
    }

    // Check for at least one letter
    if (!/[a-zA-Z]/.test(password)) {
      return {
        isValid: false,
        message: "La contraseña debe incluir al menos una letra",
      };
    }

    return { isValid: true, message: "" };
  };

  // Validate form on input change
  useEffect(() => {
    if (email) {
      if (!validateEmail(email)) {
        setEmailError("Por favor ingresa un correo electrónico válido");
      } else {
        setEmailError("");
      }
    }
  }, [email]);

  useEffect(() => {
    if (password) {
      const validation = validatePassword(password);
      setPasswordError(validation.message);
    } else {
      setPasswordError("");
    }
  }, [password]);

  const handleAuth = async () => {
    // Reset errors
    setEmailError("");
    setPasswordError("");

    // Validate email
    if (!email) {
      setEmailError("El correo electrónico es requerido");
      return;
    }

    if (!validateEmail(email)) {
      setEmailError("Por favor ingresa un correo electrónico válido");
      return;
    }

    // Validate password
    if (!password) {
      setPasswordError("La contraseña es requerida");
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setPasswordError(passwordValidation.message);
      return;
    }

    setIsSubmitting(true);
    try {
      await onAuth(email, password, authMode);
    } catch (error) {
      console.error("Authentication error:", error);
    } finally {
      setIsSubmitting(false);
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

            <TouchableOpacity
              style={[styles.googleButton, { marginBottom: Spacing.lg }]}
              onPress={onGoogleAuth}
              activeOpacity={0.8}
              disabled={isSubmitting}
              accessibilityLabel="Continuar con Google"
              accessibilityRole="button"
            >
              <FontAwesome name="google" size={24} color={AppTheme.primary} />
              <Text style={styles.googleButtonText}>Continuar con Google</Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>o</Text>
              <View style={styles.dividerLine} />
            </View>

            <View>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Dirección de correo electrónico"
                placeholderTextColor="#6B7280"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={[
                  styles.textInput,
                  emailError ? styles.inputError : null,
                  isSubmitting ? styles.inputDisabled : null,
                ]}
                editable={!isSubmitting}
                accessibilityLabel="Correo electrónico"
                accessibilityHint="Ingresa tu dirección de correo electrónico"
              />
              {emailError ? (
                <Text style={styles.errorText}>{emailError}</Text>
              ) : null}
            </View>

            <View>
              <View style={styles.passwordContainer}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder={
                    authMode === "signup"
                      ? "Contraseña (mín 6 caracteres, 1 número, 1 letra)"
                      : "Contraseña"
                  }
                  placeholderTextColor="#6B7280"
                  secureTextEntry={!showPassword}
                  style={[
                    styles.textInput,
                    styles.passwordInputField,
                    passwordError ? styles.inputError : null,
                    isSubmitting ? styles.inputDisabled : null,
                  ]}
                  editable={!isSubmitting}
                  accessibilityLabel="Contraseña"
                  accessibilityHint="Ingresa tu contraseña"
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting}
                  accessibilityLabel={
                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                  accessibilityRole="button"
                >
                  <FontAwesome
                    name={showPassword ? "eye-slash" : "eye"}
                    size={20}
                    color={AppTheme.text.secondary}
                  />
                </TouchableOpacity>
              </View>
              {passwordError ? (
                <Text style={styles.errorText}>{passwordError}</Text>
              ) : null}
            </View>

            <Button
              variant="primary"
              onPress={handleAuth}
              loading={loading || isSubmitting}
              loadingText={
                authMode === "signup"
                  ? "Creando Cuenta..."
                  : "Iniciando Sesión..."
              }
              disabled={!!emailError || !!passwordError || !email || !password}
            >
              {authMode === "signup" ? "Crear Cuenta" : "Iniciar Sesión"}
            </Button>

            <TouchableOpacity
              onPress={() =>
                setAuthMode(authMode === "signup" ? "signin" : "signup")
              }
              disabled={isSubmitting}
              accessibilityLabel={
                authMode === "signup"
                  ? "Cambiar a inicio de sesión"
                  : "Cambiar a registro"
              }
              accessibilityRole="button"
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
    borderWidth: 1,
    borderColor: AppTheme.border,
    fontSize: Typography.size.lg,
  },
  inputError: {
    borderColor: "#EF4444", // red-500
  },
  inputDisabled: {
    opacity: 0.5,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  passwordInputField: {
    flex: 1,
    marginBottom: 0,
  },
  passwordToggle: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    position: "absolute",
    right: 0,
  },
  errorText: {
    color: "#EF4444", // red-500
    fontSize: Typography.size.sm,
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
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
