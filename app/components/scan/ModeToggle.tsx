import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

type ScanMode = 'barcode' | 'receipt';

interface ModeToggleProps {
  scanMode: ScanMode;
  onModeChange: (mode: ScanMode) => void;
}

export const ModeToggle: React.FC<ModeToggleProps> = ({ scanMode, onModeChange }) => {
  const modes = [
    { key: 'barcode' as ScanMode, label: '바코드' },
    { key: 'receipt' as ScanMode, label: '영수증' }
  ];

  return (
    <View style={styles.segmentContainer}>
      <View style={styles.segmentButtons}>
        {modes.map((mode) => (
          <TouchableOpacity
            key={mode.key}
            style={[
              styles.segmentButton,
              scanMode === mode.key ? styles.segmentButtonActive : styles.segmentButtonInactive
            ]}
            onPress={() => onModeChange(mode.key)}
          >
            <Text style={[
              styles.segmentButtonText,
              scanMode === mode.key ? styles.segmentButtonTextActive : styles.segmentButtonTextInactive
            ]}>
              {mode.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  segmentContainer: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    padding: 8,
  },
  segmentButtons: {
    flexDirection: 'row',
    borderRadius: 6,
    backgroundColor: 'rgba(200, 200, 200, 0.5)',
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
  },
  segmentButtonActive: {
    backgroundColor: '#007AFF',
  },
  segmentButtonInactive: {
    backgroundColor: 'transparent',
  },
  segmentButtonText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
  segmentButtonTextActive: {
    color: '#fff',
  },
  segmentButtonTextInactive: {
    color: '#333',
  },
});
