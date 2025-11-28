import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthAndRedirect();
  }, []);

  const checkAuthAndRedirect = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      navigate("/journals");
    } else {
      navigate("/auth");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#c0b6ac" }}>
      <p className="text-foreground">Redirecting...</p>
    </div>
  );
}
