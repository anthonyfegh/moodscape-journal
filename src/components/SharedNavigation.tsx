import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export const SharedNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const isJournalPage = location.pathname.includes("/journal");

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 backdrop-blur-2xl bg-background/20 border-b border-border/10 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        <Link
          to="/"
          className="text-xl font-semibold text-foreground/90 hover:text-foreground transition-colors font-cormorand"
        >
          Telos
        </Link>

        <div className="flex items-center gap-4">
          {!isJournalPage && user && (
            <Button variant="ghost" asChild className="text-foreground/80 hover:text-foreground hover:bg-background/20">
              <Link to="/journals">Journal</Link>
            </Button>
          )}

          {!user ? (
            <>
              <Button
                variant="ghost"
                asChild
                className="text-foreground/80 hover:text-foreground hover:bg-background/20"
              >
                <Link to="/login">Log in</Link>
              </Button>

              <Button
                asChild
                className="bg-foreground/10 hover:bg-foreground/20 text-foreground border border-border/20"
              >
                <Link to="/signup">Sign up</Link>
              </Button>
            </>
          ) : (
            <Button
              onClick={handleSignOut}
              variant="ghost"
              className="text-foreground/80 hover:text-foreground hover:bg-background/20"
            >
              Log out
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};
