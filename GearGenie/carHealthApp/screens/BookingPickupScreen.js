import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { BACKEND_URL } from "../config"; // <-- you already made this in last step

export default function BookingPickupScreen({ route, navigation }) {
  const { centre, type, obdData } = route?.params ?? {};

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  // Safety check - redirect if no data
  if (!centre || !type) {
    return (
      <View style={{ flex: 1, backgroundColor: "#06212c", justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "white", fontSize: 18 }}>No booking data found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20, padding: 10, backgroundColor: "#2ecc71", borderRadius: 6 }}>
          <Text style={{ color: "#06212c", fontWeight: "bold" }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  async function submitPickup() {
    if (!name || !phone || !address || !date || !time) {
      alert("Fill all details");
      return;
    }

    const payload = {
      customerName: name,
      phone,
      pickupAddress: address,
      preferredDate: date,
      preferredTime: time,
      centreName: centre.tags?.name ?? "Service Centre",
      serviceType: "pickup",
      address: address,
      issueType: type,
      pickup: true,
      location: { lat: centre.lat, lon: centre.lon },
      obdData,
    };

    try {
      const res = await fetch(`${BACKEND_URL}/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      alert(json.message);
    } catch (e) {
      alert("Error booking pickup");
    }
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#06212c", padding: 25 }}>
      <Text style={{ color: "white", fontSize: 26, fontWeight: "600" }}>
        Doorstep Pickup Request
      </Text>
      <Text style={{ color: "#8fc7dd", marginBottom: 25 }}>
        {centre?.tags?.name ?? "Service Centre"} — {(type ?? "unknown").toUpperCase()}
      </Text>

      <Text style={{ color: "white" }}>Name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Your Name"
        placeholderTextColor="#88a"
        style={{
          backgroundColor: "#0f2f3b",
          color: "white",
          padding: 12,
          borderRadius: 6,
          marginBottom: 15,
        }}
      />

      <Text style={{ color: "white" }}>Phone</Text>
      <TextInput
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        placeholder="Phone Number"
        placeholderTextColor="#88a"
        style={{
          backgroundColor: "#0f2f3b",
          color: "white",
          padding: 12,
          borderRadius: 6,
          marginBottom: 15,
        }}
      />

      <Text style={{ color: "white" }}>Pickup Address</Text>
      <TextInput
        value={address}
        onChangeText={setAddress}
        placeholder="House No, Street, City"
        placeholderTextColor="#88a"
        multiline
        style={{
          backgroundColor: "#0f2f3b",
          color: "white",
          padding: 12,
          borderRadius: 6,
          marginBottom: 15,
          height: 80,
        }}
      />

      <Text style={{ color: "white" }}>Date</Text>
      <TextInput
        value={date}
        onChangeText={setDate}
        placeholder="YYYY-MM-DD"
        placeholderTextColor="#88a"
        style={{
          backgroundColor: "#0f2f3b",
          color: "white",
          padding: 12,
          borderRadius: 6,
          marginBottom: 15,
        }}
      />

      <Text style={{ color: "white" }}>Time</Text>
      <TextInput
        value={time}
        onChangeText={setTime}
        placeholder="10:00 AM"
        placeholderTextColor="#88a"
        style={{
          backgroundColor: "#0f2f3b",
          color: "white",
          padding: 12,
          borderRadius: 6,
          marginBottom: 20,
        }}
      />

      <TouchableOpacity
        onPress={submitPickup}
        style={{ backgroundColor: "#2ecc71", padding: 15, borderRadius: 8 }}
      >
        <Text
          style={{
            color: "#06212c",
            fontWeight: "700",
            textAlign: "center",
            fontSize: 18,
          }}
        >
          Confirm Pickup
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
