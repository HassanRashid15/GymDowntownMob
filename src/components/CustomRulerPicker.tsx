import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

const SALMON = '#E88E83';

interface CustomRulerPickerProps {
  visible: boolean;
  title: string;
  type: 'age' | 'gender' | 'height' | 'weight';
  selectedValue: string;
  onClose: () => void;
  onSelect: (value: string) => void;
}

const CustomRulerPicker: React.FC<CustomRulerPickerProps> = ({
  visible,
  title,
  type,
  selectedValue,
  onClose,
  onSelect,
}) => {
  const [showModal, setShowModal] = useState(false);
  const scrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);

  useEffect(() => {
    setShowModal(visible);
  }, [visible]);

  const handleSelect = (value: string) => {
    onSelect(value);
    onClose();
  };

  // Generate options based on type
  const getOptions = () => {
    switch (type) {
      case 'age':
        return Array.from({ length: 80 }, (_, i) => ({
          label: `${i + 18}`,
          value: `${i + 18}`,
        }));
      case 'gender':
        return ['Male', 'Female', 'Other'].map((g) => ({
          label: g,
          value: g,
        }));
      case 'height':
        return Array.from({ length: 121 }, (_, i) => ({
          label: `${i + 80}`,
          value: `${i + 80}`,
        }));
      case 'weight':
        return Array.from({ length: 201 }, (_, i) => ({
          label: `${i + 40}`,
          value: `${i + 40}`,
        }));
      default:
        return [];
    }
  };

  const options = getOptions();
  const selectedIndex = options.findIndex((opt) => opt.value === selectedValue);

  useEffect(() => {
    if (showModal && selectedIndex >= 0 && scrollRef.current) {
      // Scroll to selected item with slight offset for centering
      const itemHeight = 48; // height of each item
      const offset = selectedIndex * itemHeight - (SCREEN_HEIGHT * 0.3);
      scrollRef.current?.scrollTo({ y: Math.max(0, offset), animated: false });
    }
  }, [showModal, selectedIndex]);

  return (
    <Modal visible={showModal} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={[styles.modal, { borderColor: SALMON }]}>
          <Text style={[styles.title, { color: SALMON }]}>{title}</Text>

          {/* Ruler Indicator */}
          <View style={styles.rulerIndicator}>
            <View style={styles.indicatorLine} />
            <View style={styles.indicatorTriangle} />
            <Text style={[styles.indicatorValue, { color: SALMON }]}>
              {type === 'gender' ? (options.find((o) => o.value === selectedValue)?.label || 'Select') : `${selectedValue || '-'}`}
            </Text>
          </View>

          <ScrollView
            ref={scrollRef}
            style={styles.optionsContainer}
            showsVerticalScrollIndicator={false}
            snapToInterval={48}
            decelerationRate="fast"
          >
            {options.map((option, index) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => handleSelect(option.value)}
                style={[
                  styles.optionItem,
                  {
                    borderBottomColor: index === options.length - 1 ? 'transparent' : '#333',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.optionText,
                    {
                      color: option.value === selectedValue ? SALMON : '#FFF',
                      fontFamily: option.value === selectedValue ? 'Inter_700Bold' : 'Inter_500Medium',
                    },
                  ]}
                >
                  {option.label}
                  {type === 'height' && ' cm'}
                  {type === 'weight' && ' kg'}
                  {type === 'age' && ' years'}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.actions}>
            <TouchableOpacity onPress={onClose} style={[styles.cancelBtn, { borderColor: '#555' }]}>
              <Text style={[styles.cancelBtnText, { color: '#FFF' }]}>CANCEL</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modal: {
    borderWidth: 2,
    borderRadius: 16,
    padding: 20,
    maxHeight: '75%',
    backgroundColor: '#1a1a1a',
  },
  title: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 28,
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 24,
  },
  rulerIndicator: {
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 12,
  },
  indicatorLine: {
    width: 120,
    height: 2,
    backgroundColor: SALMON,
  },
  indicatorTriangle: {
    width: 0,
    height: 0,
    borderBottomWidth: 8,
    borderBottomColor: SALMON,
    borderLeftWidth: 6,
    borderLeftColor: 'transparent',
    borderRightWidth: 6,
    borderRightColor: 'transparent',
    marginTop: -2,
  },
  indicatorValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    marginTop: 8,
    letterSpacing: 1,
  },
  optionsContainer: {
    maxHeight: 300,
    marginBottom: 16,
  },
  optionItem: {
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  optionText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    letterSpacing: 0.6,
  },
});

export default CustomRulerPicker;
