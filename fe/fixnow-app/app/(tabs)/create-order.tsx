import { Button, Text, TextInput, View } from "react-native";

export default function CreateOrderScreen() {
  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 22 }}>Create Repair Order</Text>

      <TextInput placeholder="Device Type" />
      <TextInput placeholder="Problem Description" />

      <Button title="Submit Order" />
    </View>
  );
}
