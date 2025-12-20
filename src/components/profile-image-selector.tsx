import { AppTheme, Spacing, Typography } from "@/constants";
import React from "react";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface ProfileImageSelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelectImage: (imageUrl: string) => void;
  currentImageUrl?: string;
  googleProfileUrl?: string;
}

export default function ProfileImageSelector({
  visible,
  onClose,
  onSelectImage,
  currentImageUrl,
  googleProfileUrl,
}: ProfileImageSelectorProps) {
  const profileImages = [
    {
      id: "profile-1",
      source: require("../../assets/images/profile/profile.png"),
    },
    {
      id: "profile-2",
      source: require("../../assets/images/profile/profile-2.png"),
    },
    {
      id: "profile-3",
      source: require("../../assets/images/profile/profile-3.png"),
    },
    {
      id: "profile-4",
      source: require("../../assets/images/profile/profile-4.png"),
    },
    {
      id: "profile-5",
      source: require("../../assets/images/profile/profile-5.png"),
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[styles.container, { backgroundColor: AppTheme.background }]}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: AppTheme.text.primary }]}>
              Seleccionar imagen de perfil
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text
                style={[styles.closeText, { color: AppTheme.text.secondary }]}
              >
                ✕
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Google Profile Option */}
            {googleProfileUrl && (
              <View style={styles.section}>
                <Text
                  style={[
                    styles.sectionTitle,
                    { color: AppTheme.text.secondary },
                  ]}
                >
                  Imagen de Google
                </Text>
                <TouchableOpacity
                  style={[
                    styles.imageOption,
                    currentImageUrl === googleProfileUrl && {
                      borderColor: AppTheme.primary,
                      borderWidth: 2,
                    },
                  ]}
                  onPress={() => onSelectImage(googleProfileUrl)}
                >
                  <Image
                    source={{ uri: googleProfileUrl }}
                    style={styles.profileImage}
                  />
                </TouchableOpacity>
              </View>
            )}

            {/* Default Profile Options */}
            <View style={styles.section}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: AppTheme.text.secondary },
                ]}
              >
                Imágenes predeterminadas
              </Text>
              <View style={styles.imageGrid}>
                {profileImages.map(image => (
                  <TouchableOpacity
                    key={image.id}
                    style={[
                      styles.imageOption,
                      currentImageUrl === image.id && {
                        borderColor: AppTheme.primary,
                        borderWidth: 2,
                      },
                    ]}
                    onPress={() => onSelectImage(image.id)}
                  >
                    <Image source={image.source} style={styles.profileImage} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "90%",
    maxHeight: "80%",
    borderRadius: 16,
    padding: Spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  closeText: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
  },
  scrollView: {
    flexGrow: 1,
  },
  scrollViewContent: {
    paddingBottom: Spacing.md,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.medium,
    marginBottom: Spacing.sm,
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  imageOption: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    borderColor: "transparent",
    borderWidth: 2,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
});
