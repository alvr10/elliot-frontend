import React from "react";
import {
  ActivityIndicator,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { Spacing, Typography } from "../constants";
import { AppTheme } from "../constants/theme";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "success"
  | "error"
  | "outline"
  | "ghost";

interface ButtonProps {
  variant?: ButtonVariant;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  onPress,
  disabled = false,
  loading = false,
  loadingText,
  children,
  style,
  textStyle,
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      paddingVertical: Spacing.lg,
      paddingHorizontal: Spacing.lg,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      opacity: disabled || loading ? 0.6 : 1,
    };

    switch (variant) {
      case "primary":
        return {
          ...baseStyle,
          backgroundColor: AppTheme.primary,
        };
      case "secondary":
        return {
          ...baseStyle,
          backgroundColor: AppTheme.secondary,
        };
      case "success":
        return {
          ...baseStyle,
          backgroundColor: AppTheme.success,
        };
      case "error":
        return {
          ...baseStyle,
          backgroundColor: AppTheme.error,
        };
      case "outline":
        return {
          ...baseStyle,
          backgroundColor: "transparent",
          borderWidth: 1,
          borderColor: AppTheme.primary,
        };
      case "ghost":
        return {
          ...baseStyle,
          backgroundColor: "transparent",
        };
      default:
        return baseStyle;
    }
  };

  const getTextStyle = (): TextStyle => {
    const baseTextStyle: TextStyle = {
      fontSize: Typography.size.lg,
      fontWeight: Typography.weight.medium,
      textAlign: "center",
    };

    switch (variant) {
      case "primary":
      case "secondary":
      case "success":
      case "error":
        return {
          ...baseTextStyle,
          color: AppTheme.text.inverse,
          fontWeight: Typography.weight.bold,
        };
      case "outline":
        return {
          ...baseTextStyle,
          color: AppTheme.primary,
          fontWeight: Typography.weight.bold,
        };
      case "ghost":
        return {
          ...baseTextStyle,
          color: AppTheme.primary,
        };
      default:
        return baseTextStyle;
    }
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        loadingText ? (
          <Text style={[getTextStyle(), textStyle]}>{loadingText}</Text>
        ) : (
          <ActivityIndicator
            size="small"
            color={getTextStyle().color as string}
          />
        )
      ) : (
        <Text style={[getTextStyle(), textStyle]}>{children}</Text>
      )}
    </TouchableOpacity>
  );
};

export default Button;
