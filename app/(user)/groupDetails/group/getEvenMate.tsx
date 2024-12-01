import React, { useEffect, useState } from 'react';
import { View, TextInput, Text, StyleSheet, Alert, Keyboard, TouchableWithoutFeedback, Image, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import defaultProfilePic from '@/assets/images/defaultProfilePic.png';
import { FontAwesome6 } from '@expo/vector-icons';
import { useLayoutEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import evenmatelogo from '@/assets/images/Evenmatelogo_1.png';
import { handleUpdateBalances } from '@/api/updateBalances';
import { useGetCurrentUserId } from '@/api/getCurrentUserId';
import { useGetBalance } from '@/api/getBalance';


export default function GetEvenInput() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const navigation = useNavigation();
  const { name, mateId, groupId, myAvatar } = useLocalSearchParams<{ name: string; mateId: string; groupId: string; myAvatar: string }>();

  const [isImageLoading, setImageLoading] = useState(true);
  const [amount, setAmount] = useState('');

  const { data: currentUserId, error: currentUserError } = useGetCurrentUserId();
  const { data: balance } = useGetBalance(currentUserId, mateId);

  const avatar_url = null;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Image source={evenmatelogo} style={styles.evenmatelogo}></Image>
      ),
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityLabel="Go Back"
          accessibilityRole="button"
        >
          <Ionicons
          name='arrow-back'
          size={30}
          color="#4CAF50" 
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    if (balance?.balance) {
      setAmount((-parseFloat(balance.balance)).toString()); // Invert the balance sign
    }
  }, [balance]);

  // Adds getEven as expense
  const handleAdd = async () => {
    if (amount.trim() !== '') {
      const numericAmount = parseFloat(amount);
      if (isNaN(numericAmount)) {
        Alert.alert('Invalid Amount', 'Please enter a valid number.');
        return;
      }

      try {
        await handleUpdateBalances({
          currentUserId: currentUserId!,
          mateIds: [mateId],
          share: numericAmount,
        });
        // Refetch data next time request is made
        queryClient.invalidateQueries({ queryKey: ['mates', currentUserId] });
        queryClient.invalidateQueries({ queryKey: ['mates', mateId] });
        queryClient.invalidateQueries({ queryKey: ['groupMembersWithBalance', groupId] });

        router.back();
        router.back();
      } catch (error: any) {
        console.error('Error updating balance:', error.message);
        Alert.alert('Error', error.message);
      }
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
    <View style={styles.container}>
      <Text style={styles.title}>
        Get Even with: <Text style={styles.boldText}>{name}</Text>
      </Text>

      <View style={styles.balanceContainer}>
        {/* Left Profile */}
        <View style={styles.profileContainer}>
        <Image
            source={
              myAvatar && !isImageLoading
                ? { uri: myAvatar }
                : defaultProfilePic
            }
            style={styles.profileImage}
            onLoadEnd={() => setImageLoading(false)}
            onError={() => setImageLoading(false)}
          />
          <Text style={styles.profileText}>You</Text>
        </View>

        {/* Middle Equal Sign */}
        <View style={styles.equalContainer}>
          <FontAwesome6 name="equals" size={40} color="black"/>
        </View>

        {/* Right Profile */}
        <View style={styles.profileContainer}>
          <Image
              source={
                avatar_url && !isImageLoading
                  ? { uri: avatar_url }
                  : defaultProfilePic
              }
              style={styles.profileImage}
              onLoadEnd={() => setImageLoading(false)}
              onError={() => setImageLoading(false)}
            />
          <Text style={styles.profileText}>{name}</Text>
        </View>
      </View>

      {/* Amount Input */}
      <View style={styles.amountContainer}>
        <TextInput
            style={styles.input}
            value={amount}
            placeholder='Amount'
            onChangeText={setAmount}
            keyboardType="numeric"
        />
        <View style={styles.currencyContainer}>
          <Text style={styles.currencyText}>CZK</Text>
        </View>
      </View>

      {/* Get Even Button */}
      <TouchableOpacity style={styles.button} onPress={() => handleAdd()} disabled={amount.trim() === ''}>
        <Text style={styles.buttonText}>Get Even</Text>
      </TouchableOpacity>
    </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    marginBottom: 20,
  },
  boldText: {
    fontWeight: 'bold',
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileContainer: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 5,
  },
  profileText: {
    fontSize: 14,
  },
  equalContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    width: 205,
    textAlign: 'center',
    marginRight: 10,
    fontSize: 18,
  },
  currencyContainer: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderRadius: 10,
    backgroundColor: '#D4F0DD',
  },
  currencyText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 20,
    paddingHorizontal: 100,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  evenmatelogo: {
    width: 33,
    height: 27,
    marginRight: 0,
    resizeMode: 'cover',
    overflow: 'hidden',
  },
});