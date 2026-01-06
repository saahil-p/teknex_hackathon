import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { BACKEND_URL } from "../config";


export default function BookingVisitScreen({ route, navigation }) {
  const { centre, type, obdData } = route?.params ?? {};

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
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

  async function submitBooking() {
    if (!name || !phone || !date || !time) {
      alert("Complete all details");
      return;
    }

    const bookingPayload = {
      customerName: name,
      phone,
      preferredDate: date,
      preferredTime: time,
      serviceType: "visit",
      centreName: centre.tags?.name ?? "Service Centre",
      location: { lat: centre.lat, lon: centre.lon },
      issueType: type,
      obdData, // FULL SAMPLE / REAL OBD LATER
    };

    try {
      const res = await fetch("http://192.168.1.6:5000/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingPayload),
      });

      const json = await res.json();
      alert(json.message);
    } catch (err) {
      alert("Booking failed: " + err.message);
    }
  }

  return (
    <ScrollView style={{ flex:1, backgroundColor:"#06212c", padding:25 }}>
      <Text style={{ color:"white", fontSize:26, marginBottom:15 }}>
        Book a Visit
      </Text>

      <Text style={{ color:"#7dbde8", marginBottom:20 }}>
        {centre?.tags?.name ?? "Service Centre"} — {(type ?? "unknown").toUpperCase()}
      </Text>

      <Text style={{ color:"white", fontSize:16 }}>Your Name</Text>
      <TextInput placeholder="Enter name"
        value={name} onChangeText={setName}
        style={{ backgroundColor:"#0f2f3b", color:"white", padding:12, borderRadius:6, marginBottom:15 }}
        placeholderTextColor="#88a"
      />

      <Text style={{ color:"white", fontSize:16 }}>Phone</Text>
      <TextInput placeholder="Enter phone"
        value={phone} onChangeText={setPhone}
        keyboardType="phone-pad"
        style={{ backgroundColor:"#0f2f3b", color:"white", padding:12, borderRadius:6, marginBottom:15 }}
        placeholderTextColor="#88a"
      />

      <Text style={{ color:"white", fontSize:16 }}>Preferred Date</Text>
      <TextInput placeholder="YYYY-MM-DD"
        value={date} onChangeText={setDate}
        style={{ backgroundColor:"#0f2f3b", color:"white", padding:12, borderRadius:6, marginBottom:15 }}
        placeholderTextColor="#88a"
      />

      <Text style={{ color:"white", fontSize:16 }}>Preferred Time</Text>
      <TextInput placeholder="10:00 AM"
        value={time} onChangeText={setTime}
        style={{ backgroundColor:"#0f2f3b", color:"white", padding:12, borderRadius:6, marginBottom:15 }}
        placeholderTextColor="#88a"
      />

      <TouchableOpacity
        onPress={submitBooking}
        style={{ backgroundColor:"#2ecc71", padding:15, borderRadius:8, marginTop:10 }}
      >
        <Text style={{ textAlign:"center", color:"#06212c", fontWeight:"bold", fontSize:18 }}>
          Submit Booking
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
