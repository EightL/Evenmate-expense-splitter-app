// /api/profiles/index.ts
// ITU Project, "Evenmate"
// Author(s): Martin Ševčík, Jakub Lůčný
// VUT FIT 2024

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { useGetCurrentUserId } from '@/api/getCurrentUserId';


// Retrieve all info of specific user
export const useUserInfo = (userId: string | null) => {
    return useQuery({
        queryKey: ['userinfo', userId],
        queryFn: async () => {

            const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
            if(error) {
                throw new Error(error.message);
            }
            
            return data;
        },
    });
}


type UpdateUserProfileParams = {
    id: string;
    username: string;
    bankAccount: string;
    avatar_url: string;
};

// Update user profile
export const useUpdateProfile = async ({ id, username, bankAccount, avatar_url }: UpdateUserProfileParams): Promise<void> => {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      username: username,
      bank_account: bankAccount,
      avatar_url: avatar_url,
    })
    .eq('id', id);
    
    console.log("avatar_url", avatar_url);
  if (error) {
    throw new Error(`Error updating profile: ${error.message}`);
  }
  console.log("dataAAAAAAAA", data);
};


// Fetch the image blob
export const fetchBlob = async (uri: string): Promise<Uint8Array> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      const arrayBuffer = xhr.response;
      const uint8Array = new Uint8Array(arrayBuffer);
      resolve(uint8Array);
    };
    xhr.onerror = function (e) {
      console.error('XHR Error:', e);
      reject(new TypeError('Network request failed'));
    };
    xhr.responseType = 'arraybuffer';
    xhr.open('GET', uri, true);
    xhr.send(null);
  });
};


// Upload the image to Supabase
export const uploadImageToStorage = async (fileName: string, currentUserId: string, selectedImage) => {
    const uint8Array = await fetchBlob(selectedImage);
    if (uint8Array.length === 0) {
      throw new Error('Blob is empty.');
    }
  
    // Generate a unique file name
    console.log('Uploading to Supabase:', fileName);

    
    // Upload the image to Supabase
    const { data, error } = await supabase
      .storage
      .from('avatars')
      .upload(fileName, uint8Array, {
        cacheControl: '3600',
        upsert: true,
        contentType: 'image/jpeg',
      });

    if (error) {
      console.error('Upload Error:', error);
      throw error;
    }

    // Retrieve the public URL of the uploaded image
    const publicURL = `https://fcxvtpbbexwjimojbbcy.supabase.co/storage/v1/object/public/avatars/${data.path}`;

    return publicURL;
  }

// Upload the group image to Supabase
export const uploadGroupImage = async (fileName: string, currentUserId: string, selectedImage) => {
  const uint8Array = await fetchBlob(selectedImage);
  if (uint8Array.length === 0) {
    throw new Error('Blob is empty.');
  }

  // Generate a unique file name
  console.log('Uploading to Supabase:', fileName);

  const { data, error: uploadError } = await supabase
    .storage
    .from('group-images')
    .upload(fileName, uint8Array, {
      cacheControl: '3600',
      upsert: true,
      contentType: 'image/jpeg',
    });

  if (uploadError) {
    console.error('Upload Error:', uploadError);
    throw uploadError;
  }

  console.log('Upload successful:', data);

  const publicURL = `https://fcxvtpbbexwjimojbbcy.supabase.co/storage/v1/object/public/group-images/${data.path}`;
  
  return publicURL;
};