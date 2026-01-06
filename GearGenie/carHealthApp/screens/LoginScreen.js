// screens/LoginScreen.js
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { signInWithEmailAndPassword } from "firebase/auth";
import { LinearGradient } from "expo-linear-gradient";
import { auth } from "../firebaseConfig";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    try {
      const c = await signInWithEmailAndPassword(auth, email, password);

      // Save auth token
      await AsyncStorage.setItem("authToken", c.user.uid);

      // Root navigator in App.js handles redirect
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <LinearGradient
      colors={["#020817", "#000814"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{ flex: 1 }}
    >
      <View
        style={{
          flex: 1,
          paddingHorizontal: 24,
          justifyContent: "center",
        }}
      >
        {/* Card */}
        <View
          style={{
            backgroundColor: "rgba(6, 15, 30, 0.96)",
            padding: 24,
            borderRadius: 24,
            borderWidth: 1,
            borderColor: "rgba(0, 229, 255, 0.35)",
            shadowColor: "#00e5ff",
            shadowOpacity: 0.45,
            shadowRadius: 22,
            elevation: 15,
          }}
        >
          {/* Heading */}
          <Text
            style={{
              fontSize: 14,
              color: "#8fb2cc",
              marginBottom: 4,
              textAlign: "center",
            }}
          >
            Welcome
          </Text>
          <Text
            style={{
              fontSize: 26,
              fontWeight: "800",
              marginBottom: 24,
              color: "#00e8ff",
              textAlign: "center",
              textShadowColor: "#00e8ff",
              textShadowRadius: 10,
            }}
          >
            GearGenie
          </Text>

          {/* Email */}
          <Text
            style={{
              fontSize: 12,
              color: "#9fb7c7",
              marginBottom: 6,
            }}
          >
            Email
          </Text>
          <TextInput
            placeholder="user@example.com"
            placeholderTextColor="#6a88a0"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            style={{
              backgroundColor: "#030b17",
              borderWidth: 1,
              borderColor: "rgba(123,178,217,0.45)",
              paddingVertical: 12,
              paddingHorizontal: 14,
              borderRadius: 12,
              marginBottom: 14,
              color: "#e6f7ff",
              fontSize: 14,
            }}
          />

          {/* Password */}
          <Text
            style={{
              fontSize: 12,
              color: "#9fb7c7",
              marginBottom: 6,
            }}
          >
            Password
          </Text>
          <TextInput
            placeholder="••••••••"
            placeholderTextColor="#6a88a0"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={{
              backgroundColor: "#030b17",
              borderWidth: 1,
              borderColor: "rgba(123,178,217,0.45)",
              paddingVertical: 12,
              paddingHorizontal: 14,
              borderRadius: 12,
              marginBottom: 20,
              color: "#e6f7ff",
              fontSize: 14,
            }}
          />

          {/* Login button */}
          <TouchableOpacity onPress={handleLogin} activeOpacity={0.85}>
            <LinearGradient
              colors={["#00e5ff", "#007bff"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                paddingVertical: 14,
                borderRadius: 16,
                alignItems: "center",
                shadowColor: "#00e5ff",
                shadowOpacity: 0.55,
                shadowRadius: 20,
                elevation: 12,
              }}
            >
              <Text
                style={{
                  color: "#00131c",
                  fontWeight: "800",
                  fontSize: 16,
                  letterSpacing: 0.3,
                }}
              >
                Login
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Signup link */}
          <TouchableOpacity
            onPress={() => navigation.navigate("Signup")}
            style={{ marginTop: 22 }}
          >
            <Text
              style={{
                textAlign: "center",
                color: "#7ab8ff",
                fontWeight: "600",
                fontSize: 13,
              }}
            >
              Don't have an account?{" "}
              <Text style={{ color: "#00e8ff", fontWeight: "700" }}>Sign Up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}
