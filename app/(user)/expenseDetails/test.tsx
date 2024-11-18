import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Example icon library, you can use any you prefer

const IconPicker = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState('tree');

  // Predefined icons you want to show in the modal
  const iconOptions = ['tree', 'star', 'heart', 'gift', 'bell'];

  return (
    <View style={{ padding: 10, backgroundColor: '#DFF0D8', borderRadius: 10 }}>
      {/* Item title */}
      <Text style={{ fontSize: 16, marginBottom: 5, textAlign: 'center' }}>Christmas Tree</Text>
      {/* Price */}
      <Text style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center' }}>500,00</Text>

      {/* Icon Button */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          padding: 5,
          backgroundColor: '#A3D6A3',
          borderRadius: 5,
        }}
        onPress={() => setModalVisible(true)}
      >
        <MaterialCommunityIcons name={selectedIcon} size={24} color="black" />
      </TouchableOpacity>

      {/* Modal for icon selection */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ width: 300, padding: 20, backgroundColor: 'white', borderRadius: 10 }}>
            <Text style={{ fontSize: 18, marginBottom: 10, textAlign: 'center' }}>Select an Icon</Text>
            <FlatList
              data={iconOptions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{ padding: 10, alignItems: 'center' }}
                  onPress={() => {
                    setSelectedIcon(item);
                    setModalVisible(false);
                  }}
                >
                  <MaterialCommunityIcons name={item} size={30} color="black" />
                </TouchableOpacity>
              )}
              horizontal
            />
            <TouchableOpacity
              style={{ marginTop: 20, padding: 10, alignItems: 'center', backgroundColor: '#A3D6A3', borderRadius: 5 }}
              onPress={() => setModalVisible(false)}
            >
              <Text>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default IconPicker;