import { Text, View } from "react-native";

export default function OrderDetailScreen() {
  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 22 }}>Order Detail</Text>
      <Text>Status: Pending</Text>
    </View>
  );
}
