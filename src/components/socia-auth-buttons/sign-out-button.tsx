import { AppTheme, Typography } from "@/constants";
import { useAuth } from "@/hooks";
import React from "react";
import { Button, StyleSheet, Text, TouchableOpacity } from "react-native";

interface SignOutButtonProps {
  onPress?: () => void;
  style?: any;
  textStyle?: any;
  showIcon?: boolean;
  title?: string;
}

export default function SignOutButton({
  onPress,
  style,
  textStyle,
  showIcon = false,
  title = "Sign out",
}: SignOutButtonProps) {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      onPress?.();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (showIcon) {
    return (
      <TouchableOpacity
        style={[styles.iconButton, style]}
        onPress={handleSignOut}
      >
        <Text style={[styles.iconButtonText, textStyle]}>{title}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <Button title={title} onPress={handleSignOut} color={AppTheme.error} />
  );
}

const styles = StyleSheet.create({
  iconButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  iconButtonText: {
    color: AppTheme.text.secondary,
    fontSize: Typography.size.base,
  },
});
