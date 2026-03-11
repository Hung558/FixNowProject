import { router } from "expo-router";
import { Button, Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 22 }}>FixNow Home</Text>
      <Button
        title="Create Repair Order"
        onPress={() => router.push("/(tabs)/create-order")}
      />
    </View>
  );
}
