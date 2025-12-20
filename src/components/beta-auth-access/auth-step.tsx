import { Button, ProgressBar } from "@/components";
import { AppTheme, Spacing, Typography } from "@/constants";
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

interface AuthStepProps {
  onBack: () => void;
  onAuth: (email: string, name: string, mode: AuthMode) => Promise<void>;
  onGoogleAuth: () => void;
  loading: boolean;
  initialMode?: AuthMode;
}

const AuthStep: React.FC<AuthStepProps> = ({
  onBack,
  onAuth,
  loading,
  initialMode = "signup",
}) => {
  const [authMode, setAuthMode] = useState<AuthMode>(initialMode);
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
    console.log("handleAuth called with:", { email, name, authMode });

    // Reset errors
    setEmailError("");

    // Validate email
    if (!email) {
      console.log("Email validation failed: empty email");
      setEmailError("El correo electrónico es requerido");
      return;
    }

    if (!validateEmail(email)) {
      console.log("Email validation failed: invalid format", email);
      setEmailError("Por favor ingresa un correo electrónico válido");
      return;
    }

    // Validate name for signup
    if (authMode === "signup" && !validateName(name)) {
      console.log("Name validation failed for signup", name);
      setEmailError("El nombre debe tener al menos 2 caracteres");
      return;
    }

    console.log("Validation passed, setting submitting to true");
    setIsSubmitting(true);
    try {
      console.log("Calling onAuth with:", { email, name, authMode });
      await onAuth(email, name, authMode);
      console.log("onAuth completed successfully");
    } catch (error) {
      console.error("Authentication error:", error);
    } finally {
      console.log("Setting submitting to false");
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

            {/*<TouchableOpacity
              style={[styles.googleButton, { marginBottom: Spacing.lg }]}
              onPress={onGoogleAuth}
              activeOpacity={0.8}
              disabled={isSubmitting}
              accessibilityLabel="Continuar con Google"
              accessibilityRole="button"
            >
              <FontAwesome name="google" size={24} color={AppTheme.primary} />
              <Text style={styles.googleButtonText}>Continuar con Google</Text>
            </TouchableOpacity>*/}

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>o</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.fieldsContainer}>
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
              <View style={styles.fieldsContainer}>
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
              loading={loading || isSubmitting}
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
              {authMode === "signup" ? "Registrarse" : "Iniciar sesión"}
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
  fieldsContainer: {
    marginBottom: Spacing.md,
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
