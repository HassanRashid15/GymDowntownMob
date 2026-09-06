import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import ScreenScrollView from '../components/ScreenScrollView';
import HorizontalScrollView from '../components/HorizontalScrollView';
import { useTheme } from '../context/ThemeContext';
import Button from '../components/Button';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { allEquipment, equipmentCategories } from '../data/equipment';

const EquipmentScreen: React.FC = ({ navigation }: any) => {
  const { colors } = useTheme();
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredEquipment = activeCategory === 'All'
    ? allEquipment
    : allEquipment.filter((e) => e.category === activeCategory);

  const renderEquipmentItem = ({ item }: { item: typeof allEquipment[0] }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('EquipmentDetail', { equipmentId: item.id })}
      style={styles.equipmentCard}
    >
      <Image source={{ uri: item.image }} style={styles.equipmentImage} />
      <View style={[styles.equipmentOverlay, { backgroundColor: colors.background }]} />
      <View style={styles.equipmentContent}>
        <Badge variant="secondary" size="small" style={styles.categoryBadge}>
          {item.category}
        </Badge>
        <Text style={[styles.equipmentName, { color: colors.foreground }]}>{item.name}</Text>
        <Text style={[styles.equipmentDescription, { color: colors.mutedForeground }]} numberOfLines={2}>
          {item.shortDescription}
        </Text>
        <View style={styles.equipmentInfo}>
          <Text style={[styles.equipmentInfoText, { color: colors.mutedForeground }]}>
            Quantity: {item.quantity}
          </Text>
        </View>
        <Button
          title="View Details"
          onPress={() => navigation.navigate('EquipmentDetail', { equipmentId: item.id })}
          size="small"
          variant="outline"
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenScrollView style={{ backgroundColor: colors.background }}>
      {/* Hero */}
      <View style={[styles.hero, { backgroundColor: colors.card }]}>
        <Text style={[styles.heroTitle, { color: colors.foreground }]}>
          OUR <Text style={{ color: colors.primary }}>EQUIPMENT</Text>
        </Text>
        <Text style={[styles.heroSubtitle, { color: colors.mutedForeground }]}>
          State-of-the-art equipment for every fitness goal
        </Text>
      </View>

      {/* Category Filters */}
      <View style={[styles.filters, { backgroundColor: colors.background }]}>
        <HorizontalScrollView>
          {equipmentCategories.map((category) => (
            <Button
              key={category}
              title={category}
              onPress={() => setActiveCategory(category)}
              variant={activeCategory === category ? 'primary' : 'ghost'}
              size="small"
              style={styles.categoryButton}
            />
          ))}
        </HorizontalScrollView>
      </View>

      {/* Equipment Grid */}
      <View style={styles.equipmentSection}>
        <FlatList
          data={filteredEquipment}
          renderItem={renderEquipmentItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          scrollEnabled={false}
        />
      </View>

      {/* CTA */}
      <View style={[styles.ctaSection, { backgroundColor: colors.card }]}>
        <Text style={[styles.ctaTitle, { color: colors.foreground }]}>
          NEED GUIDANCE?
        </Text>
        <Text style={[styles.ctaDescription, { color: colors.mutedForeground }]}>
          Our trainers can help you make the most of our equipment
        </Text>
        <Button
          title="Book a Session"
          onPress={() => navigation.navigate('Trainers')}
          size="large"
        />
      </View>
    </ScreenScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hero: {
    padding: 24,
    paddingTop: 32,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '400',
    marginBottom: 8,
    fontFamily: 'Bebas Neue',
  },
  heroSubtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  filters: {
    padding: 16,
  },
  categoryButton: {
    marginRight: 8,
  },
  equipmentSection: {
    padding: 16,
  },
  row: {
    justifyContent: 'space-between',
  },
  equipmentCard: {
    width: '48%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    height: 240,
  },
  equipmentImage: {
    ...StyleSheet.absoluteFill,
  },
  equipmentOverlay: {
    ...StyleSheet.absoluteFill,
    opacity: 0.3,
  },
  equipmentContent: {
    ...StyleSheet.absoluteFill,
    padding: 12,
    justifyContent: 'flex-end',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  equipmentName: {
    fontSize: 18,
    fontWeight: '400',
    marginBottom: 4,
    fontFamily: 'Bebas Neue',
  },
  equipmentDescription: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 8,
  },
  equipmentInfo: {
    marginBottom: 8,
  },
  equipmentInfoText: {
    fontSize: 10,
  },
  ctaSection: {
    padding: 32,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 28,
    fontWeight: '400',
    marginBottom: 8,
    fontFamily: 'Bebas Neue',
  },
  ctaDescription: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
    maxWidth: 400,
  },
});

export default EquipmentScreen;