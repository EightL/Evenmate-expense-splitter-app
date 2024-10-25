// providers/AuthProvider.tsx
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import { createContext, PropsWithChildren, useEffect, useState } from "react";
import { useContext } from "react";

type AuthData = {
    session: Session | null;
    loading: boolean;
};

const AuthContext = createContext<AuthData>({
    session: null,
    loading: true,
});

export default function AuthProvider({children} : PropsWithChildren){
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSession = async() => {
            const { data } = await supabase.auth.getSession();
            setSession(data.session);
            setLoading(false);
        };

        fetchSession();
        supabase.auth.onAuthStateChange((__event, session) => {
            setSession(session);
        });
    }, []);

    return <AuthContext.Provider value={{session, loading}}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);