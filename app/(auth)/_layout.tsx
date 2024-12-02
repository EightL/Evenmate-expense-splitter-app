// /app/(auth)/_layout.tsx
// ITU Project, "Evenmate"
// Author(s): Jakub Lůčný
// VUT FIT 2024

import { Redirect, Stack } from "expo-router";
import { useAuth } from "@/providers/AuthProvider";

export default function AuthLayout(){
    const {session} = useAuth();

    if (session){
        return <Redirect href={'/'}/>;
    }

    return <Stack />;
}