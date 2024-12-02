// /app/(user)/groupDetails/group/index.tsx
// ITU Project, "Evenmate"
// Author(s): Jakub Lůčný
// VUT FIT 2024


import { Redirect } from 'expo-router';

export default function TabIndex () {
  return <Redirect href={'./groupDetails/group/[id]'} />;
};