import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import { Lora_600SemiBold } from "@expo-google-fonts/lora";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { theme } from "./src/theme";
import { HomeScreen } from "./src/screens/HomeScreen";
import { PermissionScreen } from "./src/screens/PermissionScreen";
import { DeniedScreen } from "./src/screens/DeniedScreen";
import { ReviewScreen } from "./src/screens/ReviewScreen";
import { DoneScreen } from "./src/screens/DoneScreen";

type Route = "home" | "permission" | "denied" | "review" | "done";

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Lora_600SemiBold,
  });
  const [route, setRoute] = useState<Route>("home");

  if (!fontsLoaded && !fontError) {
    return <View style={styles.boot} />;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style={route === "review" ? "light" : "dark"} />
      <View style={styles.desk}>
        <View style={styles.phone}>
          {route === "home" ? (
            <HomeScreen onStart={() => setRoute("permission")} />
          ) : null}
          {route === "permission" ? (
            <PermissionScreen
              onGranted={() => setRoute("review")}
              onDenied={() => setRoute("denied")}
            />
          ) : null}
          {route === "denied" ? (
            <DeniedScreen onHome={() => setRoute("home")} />
          ) : null}
          {route === "review" ? (
            <ReviewScreen onFinish={() => setRoute("done")} />
          ) : null}
          {route === "done" ? (
            <DoneScreen
              onHome={() => setRoute("home")}
              onRepeat={(granted) => setRoute(granted ? "review" : "permission")}
            />
          ) : null}
        </View>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  desk: {
    flex: 1,
    backgroundColor: theme.desk,
    alignItems: "center",
  },
  phone: {
    flex: 1,
    width: "100%",
    maxWidth: 430,
    backgroundColor: theme.bg,
    overflow: "hidden",
  },
});
