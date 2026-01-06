// screens/SignupScreen.js
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { LinearGradient } from "expo-linear-gradient";
import { auth, db } from "../firebaseConfig";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";

export default function SignupScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function assignRandomSample(uid) {
    const snap = await getDocs(collection(db, "obd-samples"));
    const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    if (all.length === 0) {
      throw new Error("No OBD samples found in Firestore!");
    }

    const random = all[Math.floor(Math.random() * all.length)];

    await setDoc(doc(db, "users", uid), {
      assigned_sample: random.id,
      email: email,
    });

    await AsyncStorage.setItem("assignedSampleId", random.id);

    return random.id;
  }

  async function handleSignup() {
    try {
      const c = await createUserWithEmailAndPassword(auth, email, password);
      await assignRandomSample(c.user.uid);
      await AsyncStorage.setItem("authToken", c.user.uid);
      // App.js auth listener handles navigation
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
            Create Account
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
            placeholder="you@oem.com"
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

          {/* Signup button */}
          <TouchableOpacity onPress={handleSignup} activeOpacity={0.85}>
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
                Sign Up
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Login link */}
          <TouchableOpacity
            onPress={() => navigation.navigate("Login")}
            style={{ marginTop: 22 }}
          >
            <Text
              style={{
                textAlign: "center",
                color: "#7ab8ff",
                fontSize: 13,
              }}
            >
              Already have an account?{" "}
              <Text style={{ color: "#00e8ff", fontWeight: "700" }}>Log in</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}
