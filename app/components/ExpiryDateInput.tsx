import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

interface ExpiryDateInputProps {
    value: string;
    onChange: (date: string) => void;
}

export function ExpiryDateInput({ value, onChange }: ExpiryDateInputProps) {

    // Auto-format date input: YYYY-MM-DD
    const handleDateChange = (text: string) => {
        // Remove non-numeric characters
        const cleaned = text.replace(/[^0-9]/g, '');

        let formatted = cleaned;
        if (cleaned.length > 4) {
            formatted = `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
        }
        if (cleaned.length > 6) {
            formatted = `${cleaned.slice(0, 4)}-${cleaned.slice(4, 6)}-${cleaned.slice(6, 8)}`;
        }

        // Limit length to YYYY-MM-DD (10 chars)
        if (formatted.length > 10) {
            formatted = formatted.slice(0, 10);
        }

        onChange(formatted);
    };

    // Helper to calculate future dates
    const addDays = (days: number) => {
        const date = new Date();
        date.setDate(date.getDate() + days);
        return date.toISOString().split('T')[0];
    };

    const addMonths = (months: number) => {
        const date = new Date();
        date.setMonth(date.getMonth() + months);
        return date.toISOString().split('T')[0];
    };

    return (
        <View>
            <TextInput
                style={styles.input}
                value={value}
                onChangeText={handleDateChange}
                placeholder="YYYY-MM-DD"
                keyboardType="numeric"
                maxLength={10}
            />
            <View style={styles.quickButtons}>
                <TouchableOpacity style={styles.quickButton} onPress={() => onChange(addDays(7))}>
                    <Text style={styles.quickButtonText}>+7일</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickButton} onPress={() => onChange(addMonths(1))}>
                    <Text style={styles.quickButtonText}>+1달</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickButton} onPress={() => onChange(addMonths(6))}>
                    <Text style={styles.quickButtonText}>+6달</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    input: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#FAFAFA',
    },
    quickButtons: {
        flexDirection: 'row',
        marginTop: 8,
        gap: 8,
    },
    quickButton: {
        backgroundColor: '#F0F7FF',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#D0E4FF',
    },
    quickButtonText: {
        fontSize: 12,
        color: '#0066CC',
        fontWeight: '600',
    },
});
