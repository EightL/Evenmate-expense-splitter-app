// /app/(user)/index.tsx
// ITU Project, "Evenmate"
// Author(s): Jakub Lůčný, Martin Ševčík
// VUT FIT 2024

import { Redirect } from 'expo-router';

export default function TabIndex () {
  return <Redirect href={'/(user)/friendDetails'} />;
};