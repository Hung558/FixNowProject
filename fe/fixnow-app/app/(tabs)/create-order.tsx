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
  Image,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import api from "@/services/api";
import { createBooking, uploadImage } from "@/services/booking.service";
import { getStoreByCode } from "@/services/store.service";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function CreateOrderScreen() {
  const { serviceId, serviceName } = useLocalSearchParams();
  const [deviceName, setDeviceName] = useState("");
  const [deviceType, setDeviceType] = useState("");
  const [detail, setDetail] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [storeCode, setStoreCode] = useState("");
  const [storeHistory, setStoreHistory] = useState<{code: string, name: string}[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Reset fields when service changes
  React.useEffect(() => {
    setDeviceName("");
    setDeviceType("");
    setDetail("");
    setImageUrl("");
    loadStoreHistory();
  }, [serviceId]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'] as any,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUrl(result.assets[0].uri);
    }
  };

  const loadStoreHistory = async () => {
    const history = await AsyncStorage.getItem("storeHistory");
    if (history) {
      try {
        const parsed = JSON.parse(history);
        if (Array.isArray(parsed)) {
          // Backward compatibility: if it's an array of strings, convert to objects
          const normalized = parsed.map(item => {
            if (typeof item === 'string') {
              return { code: item, name: "Cửa hàng đã dùng (Chưa rõ tên)" };
            }
            return item;
          });
          setStoreHistory(normalized);
        }
      } catch(e) {
        console.error("Failed to parse history", e);
      }
    }
  };

  const saveToHistory = async (store: {code: string, name: string}) => {
    if (!store || !store.code) return;
    const newHistory = [store, ...storeHistory.filter(c => c.code !== store.code)].slice(0, 5);
    setStoreHistory(newHistory);
    await AsyncStorage.setItem("storeHistory", JSON.stringify(newHistory));
  };

  const isRepair = serviceName?.toString().toLowerCase().includes("sửa");
  const isCleaning = serviceName?.toString().toLowerCase().includes("vệ sinh");
  const isUpgrade = serviceName?.toString().toLowerCase().includes("nâng cấp");

  const handleSubmit = async () => {
    if (!detail || !storeCode.trim()) {
      setErrorMessage("Vui lòng nhập đầy đủ yêu cầu sửa chữa và Mã cửa hàng (Bắt buộc).");
      setShowErrorModal(true);
      return;
    }

    setLoading(true);
    try {
      const formattedCode = storeCode.trim().toUpperCase();
      
      // Fetch store details to secure its existence and retrieve name concurrently
      const storeInfo = await getStoreByCode(formattedCode);

      // Combine info into description for the backend
      const combinedDescription = `
Máy: ${deviceName}
Loại: ${deviceType}
Yêu cầu/Lỗi: ${detail}
      `.trim();

      let finalImageUrl = "";
      if (imageUrl && !imageUrl.startsWith('http')) {
        // Upload the selected image
        finalImageUrl = await uploadImage(imageUrl);
      } else {
        finalImageUrl = imageUrl;
      }

      await createBooking({
        serviceId: Number(serviceId),
        description: combinedDescription,
        imageUrl: finalImageUrl,
        storeCode: storeInfo.storeCode
      });

      await saveToHistory({ code: storeInfo.storeCode, name: storeInfo.name });
      
      // Reset after success
      setDeviceName("");
      setDeviceType("");
      setDetail("");
      setImageUrl("");
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error("Create booking error:", error.response?.status, error.response?.data);
      const data = error.response?.data;
      const errorMsg = data?.message || data?.error || data?.detail || "Mã cửa hàng không tồn tại hoặc có lỗi xảy ra.";
      setErrorMessage(`Lỗi (${error.response?.status || '?'}): ${errorMsg}`);
      setShowErrorModal(true);
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

          <Text style={styles.inputLabel}>Hình ảnh minh họa</Text>
          {!imageUrl ? (
            <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
              <MaterialCommunityIcons name="camera-plus" size={24} color="#0ea5e9" />
              <Text style={styles.imagePickerText}>Chọn ảnh từ thiết bị</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: imageUrl }} style={styles.imagePreview} />
              <TouchableOpacity style={styles.removeImageButton} onPress={() => setImageUrl("")}>
                <MaterialCommunityIcons name="close" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.inputLabel}>Mã cửa hàng (Store Code) - Bắt buộc</Text>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="store-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Nhập mã cửa hàng (ví dụ: ABC123)"
              placeholderTextColor="#94a3b8"
              value={storeCode}
              onChangeText={(text) => setStoreCode(text.toUpperCase())}
              onFocus={() => storeHistory.length > 0 && setShowHistory(true)}
            />
            {storeHistory.length > 0 && (
              <TouchableOpacity onPress={() => setShowHistory(!showHistory)} style={{ padding: 8 }}>
                <MaterialCommunityIcons name={showHistory ? "chevron-up" : "chevron-down"} size={20} color="#64748b" />
              </TouchableOpacity>
            )}
          </View>

          {showHistory && storeHistory.length > 0 && (
            <View style={styles.historyContainer}>
              <Text style={styles.historyLabel}>Cửa hàng đã dùng gần đây:</Text>
              {storeHistory.map((store) => (
                <TouchableOpacity
                  key={store.code}
                  style={styles.historyItem}
                  onPress={() => {
                    setStoreCode(store.code);
                    setShowHistory(false);
                  }}
                >
                  <MaterialCommunityIcons name="store" size={20} color="#0ea5e9" />
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text style={styles.historyItemName} numberOfLines={1}>{store.name}</Text>
                    <Text style={styles.historyItemCode}>Mã: {store.code}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

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

      {/* Error Modal */}
      <Modal
        visible={showErrorModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowErrorModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={[styles.successIconContainer, { backgroundColor: '#fee2e2', shadowColor: '#ef4444' }]}>
              <MaterialCommunityIcons name="alert-circle-outline" size={60} color="#ef4444" />
            </View>
            <Text style={styles.successTitle}>Thông báo</Text>
            <Text style={styles.successMessage}>{errorMessage}</Text>
            <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#ef4444' }]} onPress={() => setShowErrorModal(false)}>
              <Text style={styles.modalButtonText}>Đóng</Text>
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
  imagePickerButton: {
    backgroundColor: "#f0f9ff",
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#38bdf8",
    borderRadius: 12,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  imagePickerText: {
    color: "#0ea5e9",
    marginTop: 8,
    fontWeight: "600",
  },
  imagePreviewContainer: {
    position: "relative",
    marginBottom: 24,
    borderRadius: 12,
    overflow: "hidden",
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    resizeMode: "cover",
  },
  removeImageButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.5)",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
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
  historyContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  historyLabel: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 8,
    fontWeight: "600",
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  historyItemName: {
    color: "#1e293b",
    fontSize: 15,
    fontWeight: "700",
  },
  historyItemCode: {
    color: "#64748b",
    fontSize: 13,
    marginTop: 2,
  },
});
