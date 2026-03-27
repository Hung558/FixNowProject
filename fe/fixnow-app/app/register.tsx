import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"CUSTOMER" | "TECHNICIAN">("CUSTOMER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorAnim] = useState(new Animated.Value(0));
  const { login } = useAuth();

  const showErrorMessage = (msg: string) => {
    setError(msg);
    Animated.sequence([
      Animated.timing(errorAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(3000),
      Animated.timing(errorAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => setError(null));
  };

  const handleRegister = async () => {
    if (!name || !email || !password) {
      showErrorMessage("Please fill in all fields");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showErrorMessage("Please enter a valid email address");
      return;
    }

    // Password validation (matching backend @Size(min = 6))
    if (password.length < 6) {
      showErrorMessage("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/register", { name, email, password, role });
      const { token, userId, name: userName, email: userEmail, role: userRole, storeCode } = response.data;
      await login({ id: userId, name: userName, email: userEmail, role: userRole, storeCode }, token);
    } catch (err: any) {
      let message = "Registration failed. Please try again.";
      if (err.message === "Network Error") {
        message = "Lỗi kết nối. Vui lòng đảm bảo điện thoại và máy tính cùng chung 1 mạng Wi-Fi, và Backend đang chạy.";
      } else if (err.response?.data?.message) {
        message = err.response.data.message;
      }
      showErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#0f172a", "#1e293b"]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.innerContainer}
        >
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join FixNow today</Text>
          </View>

          <View style={styles.form}>
            {error && (
              <Animated.View
                style={[
                  styles.errorBanner,
                  {
                    opacity: errorAnim,
                    transform: [
                      {
                        translateY: errorAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-10, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <MaterialCommunityIcons name="alert-circle" size={20} color="#ef4444" />
                <Text style={styles.errorText}>{error}</Text>
              </Animated.View>
            )}

            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="account-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="#94a3b8"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="email-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor="#94a3b8"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="lock-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#94a3b8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <MaterialCommunityIcons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#94a3b8"
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>I am a:</Text>
            <View style={styles.roleContainer}>
              <TouchableOpacity
                style={[styles.roleButton, role === "CUSTOMER" && styles.roleButtonActive]}
                onPress={() => setRole("CUSTOMER")}
              >
                <MaterialCommunityIcons
                  name="account"
                  size={20}
                  color={role === "CUSTOMER" ? "#fff" : "#94a3b8"}
                />
                <Text style={[styles.roleButtonText, role === "CUSTOMER" && styles.roleButtonTextActive]}>
                  Customer
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.roleButton, role === "TECHNICIAN" && styles.roleButtonActive]}
                onPress={() => setRole("TECHNICIAN")}
              >
                <MaterialCommunityIcons
                  name="wrench"
                  size={20}
                  color={role === "TECHNICIAN" ? "#fff" : "#94a3b8"}
                />
                <Text style={[styles.roleButtonText, role === "TECHNICIAN" && styles.roleButtonTextActive]}>
                  Technician
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Sign Up</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  innerContainer: {
    flex: 1,
    padding: 24,
    paddingTop: 60,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#fff",
  },
  subtitle: {
    fontSize: 16,
    color: "#94a3b8",
    marginTop: 4,
  },
  form: {
    backgroundColor: "rgba(30, 41, 59, 0.5)",
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.2)",
    gap: 8,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e293b",
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 50,
    color: "#fff",
    fontSize: 16,
  },
  label: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
    marginTop: 8,
  },
  roleContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  roleButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    borderRadius: 12,
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    gap: 8,
  },
  roleButtonActive: {
    backgroundColor: "#38bdf8",
    borderColor: "#38bdf8",
  },
  roleButtonText: {
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: "600",
  },
  roleButtonTextActive: {
    color: "#fff",
  },
  button: {
    backgroundColor: "#38bdf8",
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#38bdf8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});
