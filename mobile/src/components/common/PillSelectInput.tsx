import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, FONTS } from '../../constants/theme';

interface PillSelectInputProps {
  label?: string;
  placeholder?: string;
  leadingIcon?: keyof typeof Ionicons.glyphMap;
  value: string;
  options: string[];
  onSelect: (value: string) => void;
  error?: string;
  modalTitle?: string;
}

export function PillSelectInput({
  label,
  placeholder = 'Select an option',
  leadingIcon,
  value,
  options,
  onSelect,
  error,
  modalTitle,
}: PillSelectInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.container}>
      {label ? (
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
        </View>
      ) : null}

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setVisible(true)}
        style={[styles.inputWrapper, error ? styles.inputErrorBorder : null]}
      >
        {leadingIcon && (
          <Ionicons
            name={leadingIcon}
            size={20}
            color={COLORS.textSecondary}
            style={styles.leadingIcon}
          />
        )}

        <Text
          style={value ? styles.valueText : styles.placeholderText}
          numberOfLines={1}
          ellipsizeMode="tail"
          allowFontScaling={false}
        >
          {value || placeholder}
        </Text>

        <Ionicons name="chevron-down" size={18} color={COLORS.textSecondary} />
      </TouchableOpacity>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Modal visible={visible} animationType="slide" transparent onRequestClose={() => setVisible(false)}>
        <View style={styles.modalOverlay}>
          <SafeAreaView style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{modalTitle || label || 'Select'}</Text>
              <TouchableOpacity onPress={() => setVisible(false)} hitSlop={10}>
                <Ionicons name="close" size={22} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={options}
              keyExtractor={(item) => item}
              style={styles.optionsList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.optionRow}
                  onPress={() => {
                    onSelect(item);
                    setVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      item === value ? styles.optionTextSelected : null,
                    ]}
                  >
                    {item}
                  </Text>
                  {item === value && (
                    <Ionicons name="checkmark" size={18} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    fontFamily: FONTS.bodyMedium,
    fontWeight: '500',
    color: '#333333',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
  },
  inputErrorBorder: {
    borderColor: COLORS.error,
  },
  leadingIcon: {
    marginRight: 10,
  },
  valueText: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.bodyRegular,
    color: '#222222',
  },
  placeholderText: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.bodyRegular,
    color: COLORS.placeholderText,
  },
  errorText: {
    fontSize: 12,
    fontFamily: FONTS.bodyRegular,
    color: COLORS.error,
    marginTop: 4,
    marginLeft: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.card,
    borderTopRightRadius: RADIUS.card,
    maxHeight: '65%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: FONTS.headingSemiBold,
    fontWeight: '600',
    color: COLORS.primary,
  },
  optionsList: {
    paddingHorizontal: 8,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F7',
  },
  optionText: {
    fontSize: 14,
    fontFamily: FONTS.bodyRegular,
    color: '#333333',
  },
  optionTextSelected: {
    fontFamily: FONTS.bodyMedium,
    fontWeight: '500',
    color: COLORS.primary,
  },
});
