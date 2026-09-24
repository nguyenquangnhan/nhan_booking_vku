// src/screens/admin/AdminUserManagementScreen.tsx
// Màn hình Quản lý & Cấp tài khoản cho Sinh viên (Dành riêng cho Admin)

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '../../store/useUserStore';
import { useAuthStore } from '../../store/useAuthStore';
import { AppUser } from '../../types';

export function AdminUserManagementScreen() {
  const adminUser = useAuthStore((s) => s.user);
  const users = useUserStore((s) => s.users);
  const loadUsersFromSupabase = useUserStore((s) => s.loadUsersFromSupabase);
  const addUser = useUserStore((s) => s.addUser);
  const updateUserPassword = useUserStore((s) => s.updateUserPassword);
  const deleteUser = useUserStore((s) => s.deleteUser);

  const [search, setSearch] = useState('');
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

  // Form cấp tài khoản mới
  const [name, setName] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Khoa Công nghệ Thông tin & Truyền thông');
  const [password, setPassword] = useState('sv123456');

  useEffect(() => {
    loadUsersFromSupabase();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (
        u.name.toLowerCase().includes(q) ||
        (u.code && u.code.toLowerCase().includes(q)) ||
        (u.studentId && u.studentId.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q))
      );
    });
  }, [users, search]);

  const handleCreateUser = async () => {
    if (!name.trim() || !studentCode.trim() || !email.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập đầy đủ Họ tên, MSSV và Email của sinh viên.');
      return;
    }

    const cleanCode = studentCode.trim().toUpperCase();
    const cleanEmail = email.trim().toLowerCase();

    // Kiểm tra trùng
    const isExisted = users.some(
      (u) =>
        (u.code && u.code.toUpperCase() === cleanCode) ||
        (u.email && u.email.toLowerCase() === cleanEmail)
    );

    if (isExisted) {
      Alert.alert('Trùng lặp', 'MSSV hoặc Email này đã tồn tại trong hệ thống!');
      return;
    }

    const newUser: AppUser = {
      id: `usr-sv-${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      studentId: cleanCode,
      code: cleanCode,
      email: cleanEmail,
      password: password.trim() || 'sv123456',
      role: 'user',
      department: department.trim(),
    };

    await addUser(newUser, adminUser?.id);

    setIsAddModalVisible(false);
    setName('');
    setStudentCode('');
    setEmail('');
    setPassword('sv123456');

    Alert.alert(
      'Thành công',
      `Đã cấp tài khoản cho sinh viên ${newUser.name}!\nMSSV: ${newUser.code}\nMật khẩu: ${newUser.password}`
    );
  };

  const handleResetPassword = (user: AppUser) => {
    Alert.prompt
      ? Alert.prompt(
          'Đổi mật khẩu cho sinh viên',
          `Nhập mật khẩu mới cho ${user.name} (${user.code}):`,
          [
            { text: 'Hủy', style: 'cancel' },
            {
              text: 'Lưu mật khẩu mới',
              onPress: (newPass?: string) => {
                if (newPass && newPass.trim().length >= 6) {
                  updateUserPassword(user.id, newPass.trim());
                  Alert.alert('Thành công', 'Đã cập nhật mật khẩu mới!');
                } else {
                  Alert.alert('Lỗi', 'Mật khẩu phải từ 6 ký tự trở lên.');
                }
              },
            },
          ]
        )
      : Alert.alert('Đổi mật khẩu', 'Đặt lại mật khẩu mặc định: sv123456?', [
          { text: 'Hủy', style: 'cancel' },
          {
            text: 'Đặt lại',
            onPress: () => {
              updateUserPassword(user.id, 'sv123456');
              Alert.alert('Thành công', 'Mật khẩu đã đặt lại về: sv123456');
            },
          },
        ]);
  };

  const handleDeleteUser = (user: AppUser) => {
    Alert.alert(
      'Thu hồi tài khoản',
      `Bạn có chắc muốn thu hồi tài khoản của sinh viên ${user.name} (${user.code})? Sinh viên sẽ không thể đăng nhập đặt phòng nữa.`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Thu hồi',
          style: 'destructive',
          onPress: () => deleteUser(user.id),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Cấp Tài Khoản Sinh Viên</Text>
            <Text style={styles.headerSub}>
              {users.length} tài khoản sinh viên được cấp trong hệ thống
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setIsAddModalVisible(true)}
          >
            <Ionicons name="person-add" size={18} color="#FFFFFF" />
            <Text style={styles.addBtnText}>Cấp tài khoản</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo MSSV, họ tên, email..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* User List */}
      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={48} color="#94A3B8" />
            <Text style={styles.emptyTitle}>Không tìm thấy tài khoản sinh viên nào</Text>
            <Text style={styles.emptySub}>Bấm "Cấp tài khoản" ở góc trên để tạo mới</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
              </View>

              <View style={styles.userInfo}>
                <View style={styles.userTitleRow}>
                  <Text style={styles.userName}>{item.name}</Text>
                  <View style={styles.roleBadge}>
                    <Text style={styles.roleBadgeText}>Sinh viên</Text>
                  </View>
                </View>
                <Text style={styles.userCode}>MSSV: {item.code || item.studentId}</Text>
              </View>

              <TouchableOpacity
                style={styles.trashBtn}
                onPress={() => handleDeleteUser(item)}
              >
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
              </TouchableOpacity>
            </View>

            {/* Details */}
            <View style={styles.detailBox}>
              <View style={styles.detailRow}>
                <Ionicons name="mail-outline" size={15} color="#64748B" />
                <Text style={styles.detailText}>{item.email}</Text>
              </View>
              {item.department && (
                <View style={styles.detailRow}>
                  <Ionicons name="school-outline" size={15} color="#64748B" />
                  <Text style={styles.detailText}>{item.department}</Text>
                </View>
              )}
              <View style={styles.detailRow}>
                <Ionicons name="key-outline" size={15} color="#D97706" />
                <Text style={[styles.detailText, { color: '#B45309', fontWeight: '600' }]}>
                  Mật khẩu cấp: {item.password || 'sv123456'}
                </Text>
              </View>
            </View>

            {/* Card actions */}
            <View style={styles.cardActions}>
              <TouchableOpacity
                style={styles.resetPassBtn}
                onPress={() => handleResetPassword(item)}
              >
                <Ionicons name="refresh" size={15} color="#2563EB" />
                <Text style={styles.resetPassBtnText}>Đổi / Reset mật khẩu</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Modal Cấp tài khoản mới */}
      <Modal visible={isAddModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cấp Tài Khoản Mới Cho Sinh Viên</Text>
              <TouchableOpacity onPress={() => setIsAddModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>Họ và tên sinh viên *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="VD: Trần Văn Bình"
                  placeholderTextColor="#94A3B8"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>Mã số sinh viên (MSSV) *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="VD: VKU22IT100"
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="characters"
                  value={studentCode}
                  onChangeText={setStudentCode}
                />
              </View>

              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>Email sinh viên VKU *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="binh.tran@student.vku.udn.vn"
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>Khoa / Viện đào tạo</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="VD: Khoa Công nghệ Thông tin & Truyền thông"
                  placeholderTextColor="#94A3B8"
                  value={department}
                  onChangeText={setDepartment}
                />
              </View>

              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>Mật khẩu khởi tạo ban đầu</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="sv123456"
                  placeholderTextColor="#94A3B8"
                  value={password}
                  onChangeText={setPassword}
                />
                <Text style={styles.fieldHint}>
                  Sinh viên sẽ dùng MSSV và mật khẩu này để đăng nhập vào app đặt phòng.
                </Text>
              </View>

              <TouchableOpacity
                style={styles.modalSubmitBtn}
                onPress={handleCreateUser}
              >
                <Text style={styles.modalSubmitBtnText}>Xác Nhận & Cấp Tài Khoản</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerSub: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D97706',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 4,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
    marginLeft: 8,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#475569',
    marginTop: 12,
  },
  emptySub: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  userInfo: {
    flex: 1,
  },
  userTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  roleBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  userCode: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 1,
  },
  trashBtn: {
    padding: 6,
  },
  detailBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    gap: 5,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 12,
    color: '#475569',
  },
  cardActions: {
    flexDirection: 'row',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  resetPassBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    paddingVertical: 8,
  },
  resetPassBtnText: {
    color: '#1D4ED8',
    fontSize: 12,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalField: {
    marginBottom: 14,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 14,
    color: '#0F172A',
  },
  fieldHint: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
  },
  modalSubmitBtn: {
    backgroundColor: '#D97706',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  modalSubmitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
