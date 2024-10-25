// app/(user)/index.tsx
import { Redirect } from 'expo-router';

export default function TabIndex () {
  return <Redirect href={'/(user)/friendDetails'} />;
};