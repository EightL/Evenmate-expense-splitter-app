// providers/QueryProvider.ts
// ITU Project, "Evenmate"
// Author(s): Jakub Lůčný, Martin Ševčík
// VUT FIT 2024

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PropsWithChildren } from 'react';

const client = new QueryClient();

export default function QueryProvider({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={client}>
    {children}
    </QueryClientProvider>);
}