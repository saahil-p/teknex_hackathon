// ================= IMPORTS =================
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Modal,
  Platform,
} from "react-native";
import Svg, { Circle } from "react-native-svg";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HealthCard from "./components/HealthCard";
import styles, { headerTheme } from "./styles";
import SignupScreen from "./screens/SignupScreen";
import { LinearGradient } from "expo-linear-gradient";
import { Animated } from "react-native";
import ChatbotWidget from "./components/ChatbotWidget";



// FIREBASE
import {
  collection,
  getDocs,
  query,
  orderBy,
  getDoc,
  doc,
} from "firebase/firestore";
import { auth, db } from "./firebaseConfig";
import MLLoading from "./components/MLLoading";

import DoorstepPickupScreen from "./screens/DoorstepPickupScreen";
import OEMGaragesScreen from "./screens/OEMGaragesScreen";
import BookingChoiceScreen from "./screens/BookingChoiceScreen";
import BookingVisitScreen from "./screens/BookingVisitScreen";
import BookingPickupScreen from "./screens/BookingPickupScreen";
import LoginScreen from "./screens/LoginScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Stack = createNativeStackNavigator();
const PREDICT_URL = "http://127.0.0.1:8000/predict";
const ESTIMATE_URL = "http://127.0.0.1:8000/service-estimate";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);


// ===================================================================
// 🔥 FINAL UNIVERSAL BLACK DROPDOWN (Android + Web + Scrollable)
// ===================================================================
// function DarkDropdown({ items, value, onChange }) {
//   const [open, setOpen] = useState(false);

//   return (
//     <View style={{ width:160, marginTop:6 }}>
      
//       <TouchableOpacity
//         onPress={()=>setOpen(true)}
//         style={{
//           backgroundColor:"#03131b",
//           borderColor:"#00e5ff80",
//           borderWidth:1,
//           borderRadius:8,
//           paddingVertical:8,
//           paddingHorizontal:10,
//         }}
//       >
//         <Text style={{color:"#00e5ff"}}>
//           {items.length ? `Sample ${value+1}` : "Sample"}
//         </Text>
//       </TouchableOpacity>

//       <Modal visible={open} transparent animationType="fade">
//         <TouchableOpacity
//           activeOpacity={1}
//           onPress={()=>setOpen(false)}
//           style={{
//             flex:1,
//             backgroundColor:"rgba(0,0,0,0.5)",
//             justifyContent:"center",
//             alignItems:"center"
//           }}
//         >
//           <View style={{
//             width:160,
//             backgroundColor:"#03131b",
//             borderRadius:8,
//             borderColor:"#00e5ff80",
//             borderWidth:1,
//             maxHeight:200,
//             overflow:"hidden"
//           }}>
//             <ScrollView
//               showsVerticalScrollIndicator={true}
//               persistentScrollbar={true}
//               nestedScrollEnabled
//             >
//               {items.map((label,i)=>(
//                 <TouchableOpacity
//                   key={i}
//                   onPress={()=>{
//                     onChange(i);
//                     setOpen(false);
//                   }}
//                   style={{
//                     padding:10,
//                     backgroundColor:i===value?"#004450":"transparent"
//                   }}
//                 >
//                   <Text style={{color:"#00e5ff"}}>{label}</Text>
//                 </TouchableOpacity>
//               ))}
//             </ScrollView>
//           </View>

//         </TouchableOpacity>
//       </Modal>

//     </View>
//   );
// }
function DarkDropdown({ items, value, onChange }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({x:0,y:0});
  const ref = React.useRef(null);

  function openMenu(){
    ref.current.measure((fx, fy, width, height, px, py)=>{
      setPos({x:px, y:py + height + 6});   // dropdown opens below the button
      setOpen(true);
    });
  }

  return (
    <View ref={ref} style={{ width:160, marginTop:6 }}>
      
      {/* Click to open */}
      <TouchableOpacity
        onPress={openMenu}
        style={{
          backgroundColor:"#03131b",
          borderColor:"#00e5ff80",
          borderWidth:1,
          borderRadius:8,
          paddingVertical:8,
          paddingHorizontal:10,
        }}
      >
        <Text style={{color:"#00e5ff"}}>Sample {value+1}</Text>
      </TouchableOpacity>


      {/* FULL SCREEN LAYER BUT DROPDOWN POSITIONED EXACTLY UNDER BUTTON */}
      <Modal visible={open} transparent animationType="fade">
        <TouchableOpacity
          activeOpacity={1}
          style={{flex:1}}
          onPress={()=>setOpen(false)}
        >
          <View style={{
            position:"absolute",
            top:pos.y,
            left:pos.x,
            width:160,
            backgroundColor:"#03131b",
            borderRadius:8,
            borderColor:"#00e5ff80",
            borderWidth:1,
            maxHeight:200,
            overflow:"hidden",
            elevation:12,
            zIndex:9999
          }}>
            <ScrollView
              showsVerticalScrollIndicator={true}
              persistentScrollbar={true}
              nestedScrollEnabled
            >
              {items.map((label,i)=>(
                <TouchableOpacity
                  key={i}
                  onPress={()=>{
                    onChange(i);
                    setOpen(false);
                  }}
                  style={{
                    padding:10,
                    backgroundColor:i===value?"#004450":"transparent"
                  }}
                >
                  <Text style={{color:"#00e5ff"}}>{label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}




// ================= HOME SCREEN =================
function HomeScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [samples, setSamples] = useState([]);
  const [selectedSampleIndex, setSelectedSampleIndex] = useState(0);
  const [mlLoading, setMlLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const overallAnim = useRef(new Animated.Value(0)).current;


  // ========== Load samples ==========
  useEffect(() => {
    async function loadSamples() {
      try {
        let assignedID = await AsyncStorage.getItem("assignedSampleId");

        if (!assignedID && auth.currentUser) {
          const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
          if (userDoc.exists()) {
            assignedID = userDoc.data().assigned_sample;
            await AsyncStorage.setItem("assignedSampleId", assignedID);
          }
        }
        if (!assignedID) return;

        const assignedSnap = await getDoc(doc(db, "obd-samples", assignedID));
        const assignedSample = assignedSnap.exists()
          ? { id: assignedSnap.id, ...assignedSnap.data() }
          : null;

        const q = query(collection(db, "obd-samples"), orderBy("label"));
        const snap = await getDocs(q);
        const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

        const ordered = assignedSample
          ? [assignedSample, ...all.filter((s) => s.id !== assignedSample.id)]
          : all;

        setSamples(ordered);
      } catch (e) {}
    }
    loadSamples();
  }, []);



  // ========== SYNC sample ==========
  async function syncSelectedSample() {
    if (!samples.length) return alert("No samples found");

    setMlLoading(true);
    setLoading(true);

    const selected = samples[selectedSampleIndex];
    const { id, label, ...dataWithoutId } = selected;

    try {
      const r = await fetch(PREDICT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: dataWithoutId }),
      });

      if (!r.ok) throw new Error("Network Error");
      const j = await r.json();
      setResults(j);
    } catch (e) {
      alert(e.message);
    } finally {
      setTimeout(() => {
        setMlLoading(false);
        setLoading(false);
      }, 1500);
    }
  }


  // ========== DOWNLOAD ESTIMATE ==========
  async function downloadEstimate() {
    if (!samples.length) return alert("No samples found");
    if (!results) return alert("Please sync data first to get a prediction.");

    setDownloading(true);

    const selected = samples[selectedSampleIndex];
    const { label, ...dataWithoutId } = selected;

    try {
      const r = await fetch(ESTIMATE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: dataWithoutId }),
      });

      if (!r.ok) throw new Error("Network Error generating estimate");
      
      const blob = await r.blob();

      if (Platform.OS === 'web') {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = "service_estimate.pdf";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      } else {
        alert("PDF download is only available on the web version.");
      }

    } catch (e) {
      alert(e.message);
    } finally {
      setDownloading(false);
    }
  }



  // Animate ring
  useEffect(() => {
    if (results) {
      const avg = Math.round(
        (results.engine.health_percent +
          results.battery.health_percent +
          results.brake.health_percent) /
          3
      );

      Animated.timing(overallAnim, {
        toValue: avg,
        duration: 700,
        useNativeDriver: false,
      }).start();
    }
  }, [results]);


  const size=115, stroke=10;
  const radius=(size-stroke)/2;
  const circ=2*Math.PI*radius;
  const animatedRing=overallAnim.interpolate({
    inputRange:[0,100], outputRange:[circ,0]
  });

  const currentSample=samples[selectedSampleIndex];
  const overallHealth = results
    ? Math.round(
        (results.engine.health_percent +
         results.battery.health_percent +
         results.brake.health_percent) / 3
      )
    : 92;



  // ================= UI =================
  return (
    <View style={{ flex:1 }}>
      <ScrollView style={styles.container} contentContainerStyle={{paddingBottom:120}}>

        {mlLoading && <MLLoading/>}

        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>CURRENT VEHICLE</Text>
            <Text style={styles.subtitle}>Model S Dual Motor</Text>
          </View>

          <TouchableOpacity onPress={()=>{AsyncStorage.clear();auth.signOut();}}>
            <MaterialCommunityIcons name="logout" size={22} color="#9fb7c7"/>
          </TouchableOpacity>
        </View>



        <View style={styles.topArea}>
          <View style={styles.leftSummary}>
            <Text style={styles.overallLabel}>Overall Health</Text>
            <Text style={styles.overallLarge}>{overallHealth}%</Text>

            <Text style={{marginTop:12,color:"#87a4b6",fontSize:14}}>Sample:</Text>

            
            {/* 🔥 Final black dropdown here */}
            <DarkDropdown
              items={samples.map((s,i)=>`Sample ${i+1}`)}
              value={selectedSampleIndex}
              onChange={setSelectedSampleIndex}
            />


            <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 14}}>
              <TouchableOpacity onPress={syncSelectedSample} activeOpacity={0.85}>
                <LinearGradient colors={["#00e5ff","#007aff"]} style={styles.syncButton}>
                  {loading ? <ActivityIndicator color="#001a22"/> : <Text style={styles.syncText}>Sync OBD Data</Text>}
                </LinearGradient>
              </TouchableOpacity>

              {results && (
                <TouchableOpacity onPress={downloadEstimate} activeOpacity={0.85} style={{marginLeft: 10}}>
                  <LinearGradient colors={["#7a7a7a", "#4a4a4a"]} style={styles.syncButton}>
                    {downloading ? <ActivityIndicator color="#ffffff"/> : <MaterialCommunityIcons name="download" size={20} color="white" />}
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          </View>


          <View style={styles.ringBox}>
            <Svg width={size} height={size}>
              <Circle cx={size/2} cy={size/2} r={radius} stroke="#27323f" strokeWidth={stroke} fill="transparent"/>
              <AnimatedCircle cx={size/2} cy={size/2} r={radius} stroke="#00e5ff" strokeWidth={stroke}
                strokeDasharray={`${circ} ${circ}`} strokeDashoffset={animatedRing}
                strokeLinecap="round" fill="transparent"
                transform={`rotate(-90 ${size/2} ${size/2})`}
              />
            </Svg>
          </View>
        </View>



        <View style={{paddingTop:20,paddingBottom:120}}>
          {results?
          <>
            <HealthCard title="Engine" iconName="engine"
              health={results.engine.health_percent}
              recommendation={results.engine.status} rul={results.engine.rul_km}
              onHelpPress={()=>navigation.navigate("OEMGarages",{type:"engine",obdData:currentSample})}/>

            <HealthCard title="Battery" iconName="battery"
              health={results.battery.health_percent}
              recommendation={results.battery.status} rul={results.battery.rul_km}
              onHelpPress={()=>navigation.navigate("OEMGarages",{type:"battery",obdData:currentSample})}/>

            <HealthCard title="Brakes" iconName="car-brake-abs"s
              health={results.brake.health_percent}
              recommendation={results.brake.status} rul={results.brake.rul_km}
              onHelpPress={()=>navigation.navigate("OEMGarages",{type:"brakes",obdData:currentSample})}/>
          </>
          :
          <Text style={{color:"#87a4b6",textAlign:"center"}}>Press Sync to load data</Text>}
        </View>
      </ScrollView>


      <View style={styles.bottomServiceWrapper}>
        <TouchableOpacity
          style={styles.bottomServiceButton}
          onPress={()=>navigation.navigate("OEMGarages",{type:"general",obdData:currentSample})}
        >
          <Text style={styles.bottomServiceText}>⚙ Contact Service</Text>
        </TouchableOpacity>

      </View>
      
      <ChatbotWidget />
    </View>
  );
}



// ================= AUTH ROUTING =================
export default function App() {
  const [authenticated,setAuthenticated]=useState(false);
  const [checkingAuth,setCheckingAuth]=useState(true);

  useEffect(()=>{
    return auth.onAuthStateChanged(async(user)=>{
      if(user){await AsyncStorage.setItem("authToken",user.uid);setAuthenticated(true);}
      else{await AsyncStorage.removeItem("authToken");setAuthenticated(false);}
      setCheckingAuth(false);
    });
  },[]);

  if(checkingAuth) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={headerTheme}>
        {!authenticated?
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{headerShown:false}}/>
          <Stack.Screen name="Signup" component={SignupScreen} options={{title:"Create Account"}}/>
        </>:
        <>
          <Stack.Screen name="App" component={HomeScreen} options={{headerShown:false}}/>
          <Stack.Screen name="OEMGarages" component={OEMGaragesScreen} options={{title:"Service Centres"}}/>
          <Stack.Screen name="BookingChoice" component={BookingChoiceScreen} options={{title:"Choose Booking Type"}}/>
          <Stack.Screen name="BookingVisit" component={BookingVisitScreen} options={{title:"Visit Booking"}}/>
          <Stack.Screen name="BookingPickup" component={BookingPickupScreen} options={{title:"Pickup Booking"}}/>
        </>}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
