// src/screens/admin/AdminRoomManagementScreen.tsx
// Màn hình quản lý phòng học, trạng thái & khóa slot dành cho Quản trị viên VKU

import React, { useState, useMemo } from 'react';
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
import { useRoomStore } from '../../store/useRoomStore';
import { StudyRoom, RoomStatus, FacilityKey, TimeSlot } from '../../types';

export function AdminRoomManagementScreen() {
  const rooms = useRoomStore((s) => s.rooms);
  const addRoom = useRoomStore((s) => s.addRoom);
  const updateRoomStatus = useRoomStore((s) => s.updateRoomStatus);
  const toggleSlotAdminLock = useRoomStore((s) => s.toggleSlotAdminLock);
  const deleteRoom = useRoomStore((s) => s.deleteRoom);

  const [selectedBuilding, setSelectedBuilding] = useState<'all' | 'Khu V' | 'Khu A'>('all');
  const [search, setSearch] = useState('');
  const [expandedRoomId, setExpandedRoomId] = useState<string | null>(null);

  // Modal State cho Thêm phòng mới
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newBuilding, setNewBuilding] = useState<'Khu V' | 'Khu A'>('Khu V');
  const [newFloor, setNewFloor] = useState('3');
  const [newCapacity, setNewCapacity] = useState('40');
  const [newFacilities, setNewFacilities] = useState<FacilityKey[]>([
    'projector',
    'ac',
    'whiteboard',
  ]);

  // Lọc phòng
  const filteredRooms = useMemo(() => {
    return rooms.filter((r) => {
      const matchBuilding = selectedBuilding === 'all' || r.building === selectedBuilding;
      const matchSearch =
        search.trim() === '' ||
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.building.toLowerCase().includes(search.toLowerCase());
      return matchBuilding && matchSearch;
    });
  }, [rooms, selectedBuilding, search]);

  const handleToggleFacility = (key: FacilityKey) => {
    setNewFacilities((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleCreateRoom = async () => {
    if (!newName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên phòng');
      return;
    }

    const roomId = `room-${Date.now().toString().slice(-4)}`;
    const standardSlots: TimeSlot[] = [
      { id: `${roomId}-s1`, startTime: '07:00', endTime: '09:00', isBooked: false },
      { id: `${roomId}-s2`, startTime: '09:00', endTime: '11:00', isBooked: false },
      { id: `${roomId}-s3`, startTime: '13:00', endTime: '15:00', isBooked: false },
      { id: `${roomId}-s4`, startTime: '15:00', endTime: '17:00', isBooked: false },
      { id: `${roomId}-s5`, startTime: '18:00', endTime: '20:00', isBooked: false },
    ];

    const newRoom: StudyRoom = {
      id: roomId,
      name: newName.trim(),
      building: newBuilding,
      floor: parseInt(newFloor, 10) || 1,
      capacity: parseInt(newCapacity, 10) || 30,
      imageUrl:
        newBuilding === 'Khu V'
          ? 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400'
          : 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400',
      facilities: newFacilities,
      status: 'available',
      slots: standardSlots,
    };

    await addRoom(newRoom);
    setIsAddModalVisible(false);
    setNewName('');
    Alert.alert('Thành công', `Đã thêm phòng ${newRoom.name} vào hệ thống`);
  };

  const handleDeletePrompt = (room: StudyRoom) => {
    Alert.alert(
      'Xóa phòng học',
      `Bạn có chắc chắn muốn xóa "${room.name}" khỏi danh mục quản lý?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa vĩnh viễn',
          style: 'destructive',
          onPress: () => deleteRoom(room.id),
        },
      ]
    );
  };

  const handleToggleStatus = (room: StudyRoom) => {
    const nextStatus: RoomStatus =
      room.status === 'available' ? 'maintenance' : 'available';
    updateRoomStatus(room.id, nextStatus);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Quản lý Phòng học</Text>
            <Text style={styles.headerSub}>Tổng cộng {rooms.length} phòng trong danh mục</Text>
          </View>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setIsAddModalVisible(true)}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.addBtnText}>Thêm phòng</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo tên phòng, khu vực..."
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

        {/* Building Filter Pills */}
        <View style={styles.filterRow}>
          {(['all', 'Khu V', 'Khu A'] as const).map((b) => (
            <TouchableOpacity
              key={b}
              style={[
                styles.pill,
                selectedBuilding === b && styles.pillActive,
              ]}
              onPress={() => setSelectedBuilding(b)}
            >
              <Text
                style={[
                  styles.pillText,
                  selectedBuilding === b && styles.pillTextActive,
                ]}
              >
                {b === 'all' ? 'Tất cả toà' : b}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Room List */}
      <FlatList
        data={filteredRooms}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const isExpanded = expandedRoomId === item.id;
          const isMaintenance = item.status === 'maintenance';

          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.roomInfo}>
                  <View style={styles.titleRow}>
                    <Text style={styles.roomName}>{item.name}</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        isMaintenance ? styles.badgeMaint : styles.badgeAvail,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusBadgeText,
                          isMaintenance ? styles.badgeTextMaint : styles.badgeTextAvail,
                        ]}
                      >
                        {isMaintenance ? 'Đang bảo trì' : 'Hoạt động'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.roomMeta}>
                    {item.building} • Tầng {item.floor} • Sức chứa {item.capacity} chỗ
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.trashBtn}
                  onPress={() => handleDeletePrompt(item)}
                >
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>

              {/* Action Buttons Row */}
              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={[
                    styles.statusToggleBtn,
                    isMaintenance ? styles.btnActivate : styles.btnMaint,
                  ]}
                  onPress={() => handleToggleStatus(item)}
                >
                  <Ionicons
                    name={isMaintenance ? 'checkmark-circle-outline' : 'construct-outline'}
                    size={16}
                    color={isMaintenance ? '#059669' : '#D97706'}
                  />
                  <Text
                    style={[
                      styles.statusToggleBtnText,
                      isMaintenance ? { color: '#059669' } : { color: '#D97706' },
                    ]}
                  >
                    {isMaintenance ? 'Mở hoạt động' : 'Tạm bảo trì'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.slotsToggleBtn}
                  onPress={() => setExpandedRoomId(isExpanded ? null : item.id)}
                >
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'calendar-outline'}
                    size={16}
                    color="#2563EB"
                  />
                  <Text style={styles.slotsToggleBtnText}>
                    {isExpanded ? 'Đóng slots' : `Quản lý slots (${item.slots.length})`}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Collapsible Slots Management */}
              {isExpanded && (
                <View style={styles.slotsContainer}>
                  <Text style={styles.slotsSectionHeading}>
                    QUẢN LÝ KHUNG GIỜ & KHÓA SLOT (ADMIN LOCK)
                  </Text>
                  <Text style={styles.slotsSectionSub}>
                    Khóa slot sẽ ngăn sinh viên đặt phòng vào khung giờ này (dùng cho thi cử / sự kiện).
                  </Text>

                  {item.slots.map((slot) => {
                    const isAdminLocked = slot.bookedBy === 'ADMIN_LOCK';
                    const isStudentBooked = slot.isBooked && !isAdminLocked;

                    return (
                      <View key={slot.id} style={styles.slotRow}>
                        <View style={styles.slotTimeWrap}>
                          <Ionicons name="time-outline" size={16} color="#64748B" />
                          <Text style={styles.slotTimeText}>
                            {slot.startTime} - {slot.endTime}
                          </Text>
                        </View>

                        <View style={styles.slotStatusWrap}>
                          {isAdminLocked ? (
                            <View style={styles.slotTagLocked}>
                              <Ionicons name="lock-closed" size={12} color="#DC2626" />
                              <Text style={styles.slotTagLockedText}>Admin Khóa</Text>
                            </View>
                          ) : isStudentBooked ? (
                            <View style={styles.slotTagBooked}>
                              <Ionicons name="person" size={12} color="#D97706" />
                              <Text style={styles.slotTagBookedText}>Đã được đặt</Text>
                            </View>
                          ) : (
                            <View style={styles.slotTagFree}>
                              <Text style={styles.slotTagFreeText}>Trống</Text>
                            </View>
                          )}

                          <TouchableOpacity
                            style={[
                              styles.lockBtn,
                              isAdminLocked ? styles.unlockBtn : styles.lockBtnAction,
                            ]}
                            onPress={() => toggleSlotAdminLock(item.id, slot.id)}
                          >
                            <Ionicons
                              name={isAdminLocked ? 'lock-open-outline' : 'lock-closed-outline'}
                              size={14}
                              color={isAdminLocked ? '#059669' : '#DC2626'}
                            />
                            <Text
                              style={[
                                styles.lockBtnText,
                                isAdminLocked
                                  ? { color: '#059669' }
                                  : { color: '#DC2626' },
                              ]}
                            >
                              {isAdminLocked ? 'Mở' : 'Khóa'}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          );
        }}
      />

      {/* Modal Thêm phòng mới */}
      <Modal visible={isAddModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Thêm Phòng Học Mới</Text>
              <TouchableOpacity onPress={() => setIsAddModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>Tên phòng *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="VD: Lab 405, Phòng Tự Học V-201..."
                  value={newName}
                  onChangeText={setNewName}
                />
              </View>

              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>Khu vực / Tòa nhà *</Text>
                <View style={styles.radioGroup}>
                  {(['Khu V', 'Khu A'] as const).map((b) => (
                    <TouchableOpacity
                      key={b}
                      style={[
                        styles.radioBtn,
                        newBuilding === b && styles.radioBtnActive,
                      ]}
                      onPress={() => setNewBuilding(b)}
                    >
                      <Ionicons
                        name={newBuilding === b ? 'radio-button-on' : 'radio-button-off'}
                        size={18}
                        color={newBuilding === b ? '#2563EB' : '#94A3B8'}
                      />
                      <Text
                        style={[
                          styles.radioText,
                          newBuilding === b && styles.radioTextActive,
                        ]}
                      >
                        {b}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.rowFields}>
                <View style={[styles.modalField, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.modalLabel}>Tầng</Text>
                  <TextInput
                    style={styles.modalInput}
                    keyboardType="number-pad"
                    value={newFloor}
                    onChangeText={setNewFloor}
                  />
                </View>
                <View style={[styles.modalField, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.modalLabel}>Sức chứa (người)</Text>
                  <TextInput
                    style={styles.modalInput}
                    keyboardType="number-pad"
                    value={newCapacity}
                    onChangeText={setNewCapacity}
                  />
                </View>
              </View>

              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>Trang thiết bị & Tiện nghi</Text>
                <View style={styles.facilityCheckboxRow}>
                  {[
                    { key: 'projector', label: 'Máy chiếu' },
                    { key: 'pc', label: 'Máy tính' },
                    { key: 'ac', label: 'Điều hòa' },
                    { key: 'whiteboard', label: 'Bảng viết' },
                    { key: 'outlet', label: 'Ổ cắm điện' },
                  ].map((fac) => {
                    const isSelected = newFacilities.includes(fac.key as FacilityKey);
                    return (
                      <TouchableOpacity
                        key={fac.key}
                        style={[
                          styles.facilityPill,
                          isSelected && styles.facilityPillActive,
                        ]}
                        onPress={() => handleToggleFacility(fac.key as FacilityKey)}
                      >
                        <Ionicons
                          name={isSelected ? 'checkbox' : 'square-outline'}
                          size={16}
                          color={isSelected ? '#2563EB' : '#64748B'}
                        />
                        <Text
                          style={[
                            styles.facilityPillText,
                            isSelected && styles.facilityPillTextActive,
                          ]}
                        >
                          {fac.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <TouchableOpacity
                style={styles.modalSubmitBtn}
                onPress={handleCreateRoom}
              >
                <Text style={styles.modalSubmitBtnText}>Thêm Phòng Vào Hệ Thống</Text>
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
    backgroundColor: '#2563EB',
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
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
    marginLeft: 8,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  pillActive: {
    backgroundColor: '#38BDF8',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  pillTextActive: {
    color: '#0F172A',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  roomInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  roomName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  badgeAvail: {
    backgroundColor: '#DEF7EC',
  },
  badgeTextAvail: {
    fontSize: 11,
    fontWeight: '700',
    color: '#03543F',
  },
  badgeMaint: {
    backgroundColor: '#FEF3C7',
  },
  badgeTextMaint: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
  },
  roomMeta: {
    fontSize: 13,
    color: '#64748B',
  },
  trashBtn: {
    padding: 6,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  statusToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  btnActivate: {
    borderColor: '#A7F3D0',
    backgroundColor: '#ECFDF5',
  },
  btnMaint: {
    borderColor: '#FDE68A',
    backgroundColor: '#FFFBEB',
  },
  statusToggleBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  slotsToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  slotsToggleBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  slotsContainer: {
    marginTop: 14,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  slotsSectionHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 0.6,
  },
  slotsSectionSub: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 10,
  },
  slotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  slotTimeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  slotTimeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  slotStatusWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  slotTagLocked: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  slotTagLockedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#DC2626',
  },
  slotTagBooked: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  slotTagBookedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B45309',
  },
  slotTagFree: {
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  slotTagFreeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#3730A3',
  },
  lockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  lockBtnAction: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  unlockBtn: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  lockBtnText: {
    fontSize: 11,
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
  radioGroup: {
    flexDirection: 'row',
    gap: 16,
  },
  radioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  radioBtnActive: {},
  radioText: {
    fontSize: 14,
    color: '#64748B',
  },
  radioTextActive: {
    color: '#0F172A',
    fontWeight: '700',
  },
  rowFields: {
    flexDirection: 'row',
  },
  facilityCheckboxRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  facilityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  facilityPillActive: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  facilityPillText: {
    fontSize: 12,
    color: '#64748B',
  },
  facilityPillTextActive: {
    color: '#1D4ED8',
    fontWeight: '600',
  },
  modalSubmitBtn: {
    backgroundColor: '#2563EB',
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
