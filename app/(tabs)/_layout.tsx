import { MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#FFFFFF",
        tabBarInactiveTintColor: "rgba(202, 202, 202, 1)",
        tabBarStyle: {
          backgroundColor: "#795757",
          borderTopColor: "#795757",
          paddingBottom: 20,
          paddingTop: 10,
          height: 80,
        },
        headerShown: false,
        tabBarShowLabel: true,
        animation: "shift",
      }}
    >
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="bar-chart" size={32} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="add-intake"
        options={{
          title: "Add Intake",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="add-circle" size={32} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="person" size={32} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
