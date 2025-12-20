import React from "react";
import { View } from "react-native";
import Svg, { Circle } from "react-native-svg";

interface CircularProgressProps {
  size: number;
  strokeWidth: number;
  progress: number; // 0-100
  backgroundColor: string;
  progressColor: string;
  centerFillColor?: string;
  children?: React.ReactNode;
  backgroundCircleColor?: string;
}

export default function CircularProgress({
  size,
  strokeWidth,
  progress,
  backgroundColor,
  progressColor,
  centerFillColor = "transparent",
  children,
  backgroundCircleColor = "#e0e0e0",
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  const backgroundRadius = (size - strokeWidth * 2) / 2;

  return (
    <View
      style={{
        width: size,
        height: size,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Svg width={size} height={size} style={{ position: "absolute" }}>
        {/* Large Background Circle with low opacity */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={backgroundRadius}
          stroke={backgroundCircleColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          opacity={0.2}
        />

        {/* Main Background Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />

        {/* Progress Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={progressColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />

        {/* Center Fill - only render if not transparent */}
        {centerFillColor !== "transparent" && (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius - strokeWidth - 2}
            fill={centerFillColor}
            stroke="transparent"
            strokeWidth={0}
          />
        )}
      </Svg>
      {children}
    </View>
  );
}
