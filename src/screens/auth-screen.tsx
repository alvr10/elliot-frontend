import { Button } from "@/components";
import { AppTheme, Spacing, Typography } from "@/constants";
import { useNotification } from "@/context";
import { useAuth } from "@/hooks";
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

type AuthMode = "signin" | "signup";

export default function AuthScreen() {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const { showNotification } = useNotification();

  const [authMode, setAuthMode] = useState<AuthMode>("signup");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Email validation function
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Name validation function
  const validateName = (name: string): boolean => {
    return name.trim().length >= 2;
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

  const handleAuth = async () => {
    // Reset errors
    setEmailError("");

    // Validate email
    if (!email) {
      setEmailError("El correo electrónico es requerido");
      return;
    }

    if (!validateEmail(email)) {
      setEmailError("Por favor ingresa un correo electrónico válido");
      return;
    }

    // Validate name for signup
    if (authMode === "signup" && !validateName(name)) {
      setEmailError("El nombre debe tener al menos 2 caracteres");
      return;
    }

    setIsSubmitting(true);
    try {
      if (authMode === "signup") {
        await signUpWithEmail(email, name);
      } else {
        await signInWithEmail(email);
      }
    } catch (error: any) {
      console.error("Authentication error:", error);
      showNotification(error.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      await signInWithGoogle();
    } catch (error: any) {
      console.log("Google auth error:", error);
      showNotification(
        error.message || "Error al iniciar sesión con Google",
        "error"
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoiding}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Elliot</Text>
              <Text style={styles.subtitle}>
                Toma el control de tu consumo de cafeína
              </Text>
            </View>

            {/* Auth Form */}
            <View style={styles.authContent}>
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

              <TouchableOpacity
                style={[styles.googleButton, { marginBottom: Spacing.lg }]}
                onPress={handleGoogleAuth}
                activeOpacity={0.8}
                disabled={isSubmitting}
                accessibilityLabel="Continuar con Google"
                accessibilityRole="button"
              >
                <FontAwesome name="google" size={24} color={AppTheme.primary} />
                <Text style={styles.googleButtonText}>
                  Continuar con Google
                </Text>
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

              {authMode === "signup" && (
                <View>
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="Nombre completo"
                    placeholderTextColor="#6B7280"
                    autoCapitalize="words"
                    style={[
                      styles.textInput,
                      emailError ? styles.inputError : null,
                      isSubmitting ? styles.inputDisabled : null,
                    ]}
                    editable={!isSubmitting}
                    accessibilityLabel="Nombre completo"
                    accessibilityHint="Ingresa tu nombre completo"
                  />
                </View>
              )}

              <Button
                variant="primary"
                onPress={handleAuth}
                loading={isSubmitting}
                loadingText={
                  authMode === "signup"
                    ? "Enviando enlace mágico..."
                    : "Enviando enlace mágico..."
                }
                disabled={
                  !!emailError ||
                  !email ||
                  (authMode === "signup" && !validateName(name))
                }
              >
                {authMode === "signup" ? "Registrarse" : "Enviar enlace mágico"}
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
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppTheme.backgroundSecondary,
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
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: "center",
    paddingVertical: Spacing.xl,
  },
  header: {
    marginBottom: Spacing["3xl"],
  },
  title: {
    color: AppTheme.text.primary,
    fontSize: Typography.size["4xl"],
    fontWeight: Typography.weight.bold,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  subtitle: {
    color: AppTheme.text.secondary,
    fontSize: Typography.size.xl,
    textAlign: "center",
  },
  authContent: {
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
    marginBottom: Spacing.xl,
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
