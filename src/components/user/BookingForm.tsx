// src/components/user/BookingForm.tsx
import React from 'react';
import {
  View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';

interface FormData {
  studentName: string;
  studentId: string;
  purpose: string;
}

interface Props {
  form: FormData;
  onChange: (field: keyof FormData, value: string) => void;
}

export const BookingForm: React.FC<Props> = ({ form, onChange }) => {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Thông tin đặt phòng</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Họ tên sinh viên *</Text>
          <TextInput
            style={styles.input}
            value={form.studentName}
            onChangeText={(v) => onChange('studentName', v)}
            placeholder="Nhập họ tên đầy đủ"
            placeholderTextColor="#9CA3AF"
            returnKeyType="next"
            accessibilityLabel="Họ tên sinh viên"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Mã số sinh viên (MSSV) *</Text>
          <TextInput
            style={styles.input}
            value={form.studentId}
            onChangeText={(v) => onChange('studentId', v)}
            placeholder="VD: 21T1020001"
            placeholderTextColor="#9CA3AF"
            keyboardType="default"
            returnKeyType="next"
            accessibilityLabel="Mã số sinh viên"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Mục đích sử dụng *</Text>
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            value={form.purpose}
            onChangeText={(v) => onChange('purpose', v)}
            placeholder="VD: Ôn thi cuối kỳ, Họp nhóm đồ án..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={3}
            returnKeyType="done"
            accessibilityLabel="Mục đích sử dụng phòng"
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  field: { gap: 6 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#F9FAFB',
  },
  inputMultiline: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 11,
  },
});
