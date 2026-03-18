import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import api from "@/services/api";

export default function CreateOrderScreen() {
  const { serviceId, serviceName } = useLocalSearchParams();
  const [deviceName, setDeviceName] = useState("");
  const [deviceType, setDeviceType] = useState("");
  const [detail, setDetail] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Reset fields when service changes
  React.useEffect(() => {
    setDeviceName("");
    setDeviceType("");
    setDetail("");
    setImageUrl("");
  }, [serviceId]);

  const isRepair = serviceName?.toString().toLowerCase().includes("sửa");
  const isCleaning = serviceName?.toString().toLowerCase().includes("vệ sinh");
  const isUpgrade = serviceName?.toString().toLowerCase().includes("nâng cấp");

  const handleSubmit = async () => {
    if (!detail) {
      if (Platform.OS === 'web') {
        alert("Vui lòng nhập đầy đủ thông tin yêu cầu");
      } else {
        Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin yêu cầu");
      }
      return;
    }

    setLoading(true);
    try {
      // Combine info into description for the backend
      const combinedDescription = `
Máy: ${deviceName}
Loại: ${deviceType}
Yêu cầu/Lỗi: ${detail}
      `.trim();

      await api.post("/bookings", {
        serviceId: Number(serviceId),
        description: combinedDescription,
        imageUrl,
      });
      
      // Reset after success
      setDeviceName("");
      setDeviceType("");
      setDetail("");
      setImageUrl("");
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error(error);
      const errorMsg = error.response?.data?.message || "Không thể tạo đơn hàng. Vui lòng thử lại.";
      if (Platform.OS === 'web') {
        alert("Lỗi: " + errorMsg);
      } else {
        Alert.alert("Lỗi", errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
    router.push("/(tabs)");
  };

  const getDetailLabel = () => {
    if (isCleaning) return "Bạn muốn vệ sinh phần nào?";
    if (isUpgrade) return "Bạn muốn nâng cấp phần nào?";
    return "Mô tả tình trạng lỗi";
  };

  const getDetailPlaceholder = () => {
    if (isCleaning) return "Ví dụ: Vệ sinh quạt, thay keo tản nhiệt...";
    if (isUpgrade) return "Ví dụ: Nâng cấp RAM 8GB, SSD 512GB...";
    return "Ví dụ: Màn hình bị sọc xanh, không cảm ứng được...";
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#38bdf8", "#0ea5e9"]} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Đặt lịch dịch vụ</Text>
          <View style={{ width: 44 }} />
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.serviceInfo}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons 
              name={isRepair ? "tools" : isCleaning ? "broom" : isUpgrade ? "rocket-launch" : "hammer-wrench"} 
              size={32} color="#38bdf8" 
            />
          </View>
          <View>
            <Text style={styles.serviceLabel}>Dịch vụ đã chọn:</Text>
            <Text style={styles.serviceName}>{serviceName}</Text>
          </View>
        </View>

        <View style={styles.form}>
          <Text style={styles.inputLabel}>Tên máy (Model)</Text>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="cellphone-text" size={20} color="#94a3b8" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Ví dụ: iPhone 13 Pro Max, Dell XPS 15..."
              placeholderTextColor="#94a3b8"
              value={deviceName}
              onChangeText={setDeviceName}
            />
          </View>

          <Text style={styles.inputLabel}>Loại máy / Đời máy</Text>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="tag-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Ví dụ: Apple, Samsung, Dell..."
              placeholderTextColor="#94a3b8"
              value={deviceType}
              onChangeText={setDeviceType}
            />
          </View>

          <Text style={styles.inputLabel}>{getDetailLabel()}</Text>
          <View style={styles.textAreaContainer}>
            <TextInput
              style={styles.textArea}
              placeholder={getDetailPlaceholder()}
              placeholderTextColor="#94a3b8"
              multiline
              numberOfLines={4}
              value={detail}
              onChangeText={setDetail}
              textAlignVertical="top"
            />
          </View>

          <Text style={styles.inputLabel}>Hình ảnh minh họa (Link)</Text>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="image-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Dán link hình ảnh tình trạng máy"
              placeholderTextColor="#94a3b8"
              value={imageUrl}
              onChangeText={setImageUrl}
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.submitButtonText}>Xác nhận yêu cầu</Text>
                <MaterialCommunityIcons name="send" size={20} color="#fff" style={{ marginLeft: 8 }} />
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.noteBox}>
          <MaterialCommunityIcons name="information-outline" size={20} color="#0ea5e9" />
          <Text style={styles.noteText}>
            FixNow sẽ cử kỹ thuật viên liên hệ lại ngay để tư vấn chi tiết và báo giá chính xác cho loại máy của bạn.
          </Text>
        </View>
      </ScrollView>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={handleCloseSuccess}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.successIconContainer}>
              <MaterialCommunityIcons name="check-decagram" size={80} color="#10b981" />
            </View>
            <Text style={styles.successTitle}>Đặt lịch thành công!</Text>
            <Text style={styles.successMessage}>
              Cảm ơn bạn đã tin tưởng FixNow. Kỹ thuật viên sẽ liên hệ với bạn trong thời gian sớm nhất.
            </Text>
            <TouchableOpacity style={styles.modalButton} onPress={handleCloseSuccess}>
              <Text style={styles.modalButtonText}>Về trang chủ</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
  },
  scrollContent: {
    padding: 24,
  },
  serviceInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 20,
    marginBottom: 24,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: "#f0f9ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  serviceLabel: {
    fontSize: 12,
    color: "#64748b",
  },
  serviceName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
  },
  form: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 24,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 8,
  },
  textAreaContainer: {
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  textArea: {
    height: 120,
    color: "#1e293b",
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 48,
    color: "#1e293b",
  },
  submitButton: {
    backgroundColor: "#0ea5e9",
    height: 56,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#0ea5e9",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  noteBox: {
    flexDirection: "row",
    backgroundColor: "#f0f9ff",
    padding: 16,
    borderRadius: 16,
    marginTop: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0f2fe",
  },
  noteText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 13,
    color: "#0369a1",
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 32,
    padding: 32,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  successIconContainer: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 12,
  },
  successMessage: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  modalButton: {
    backgroundColor: "#0ea5e9",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    width: "100%",
    alignItems: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
