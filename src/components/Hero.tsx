
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Hero = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleButtonClick = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/auth");
    }
  };

  return (
    <section className="pt-24 pb-16 md:pt-32 lg:pt-40 md:pb-20 lg:pb-28 bg-gradient-to-b from-primary to-secondary text-white">
      <div className="container mx-auto px-4 md:px-6 text-center relative">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            zIndex: -1
          }}
        />

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 max-w-4xl mx-auto leading-tight">
          Experience <span className="relative group">
            <span className="gold-gradient underline-animation">Exclusive</span>
          </span> Education Like Never Before
        </h1>

        <p className="text-base sm:text-lg md:text-xl text-white/80 mb-6 sm:mb-8 md:mb-10 max-w-2xl mx-auto px-2">
          Join India's most elite learning platform with personalized mentorship, premium resources, and a community of high achievers.
        </p>

        <Button
          size="lg"
          onClick={handleButtonClick}
          className="bg-transparent text-gold hover:bg-gold hover:text-primary border-2 border-gold transition-all duration-300 rounded-full px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg font-semibold"
        >
          {user ? "Go to Dashboard" : "Begin Your Journey"}
        </Button>
      </div>
    </section>
  );
};

export default Hero;
