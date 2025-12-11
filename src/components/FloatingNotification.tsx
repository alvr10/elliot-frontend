import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, Text, View } from "react-native";

interface FloatingNotificationProps {
  message: string;
  type: "success" | "error" | "info";
  visible: boolean;
  onHide: () => void;
}

const { width } = Dimensions.get("window");

export default function FloatingNotification({
  message,
  type,
  visible,
  onHide,
}: FloatingNotificationProps) {
  const slideAnim = useRef(new Animated.Value(100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Slide up and fade in
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide after 3 seconds
      const timer = setTimeout(() => {
        hideNotification();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideNotification = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
    });
  };

  if (!visible) return null;

  const getBackgroundColor = () => {
    switch (type) {
      case "success":
        return "bg-green-600";
      case "error":
        return "bg-red-600";
      case "info":
        return "bg-blue-600";
      default:
        return "bg-gray-600";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return "✅";
      case "error":
        return "❌";
      case "info":
        return "ℹ️";
      default:
        return "";
    }
  };

  return (
    <Animated.View
      className={`absolute bottom-20 left-4 right-4 ${getBackgroundColor()} rounded-lg p-4 shadow-lg z-50`}
      style={{
        transform: [{ translateY: slideAnim }],
        opacity: opacityAnim,
      }}
    >
      <View className="flex-row items-center">
        <Text className="text-white text-lg mr-2">{getIcon()}</Text>
        <Text className="text-white font-medium flex-1">{message}</Text>
      </View>
    </Animated.View>
  );
}
