"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface ServiceOption {
  id: string;
  name: string;
  price: number;
  logo: string;
  color: string;
}

const services: ServiceOption[] = [
  {
    id: "netflix",
    name: "Netflix",
    price: 3500,
    logo: "/Netflix Wordmark.png",
    color: "#E50914", // Rouge Netflix
  },
  {
    id: "prime",
    name: "Prime Video",
    price: 3500,
    logo: "/Prime Video.png",
    color: "#00A8E1", // Bleu Prime Video
  }
];

// Images pour le diaporama
const backgroundImages = [
  "/addams-family-wednesday-s2-hd-wallpaper-uhdpaper.com-184@5@h.jpg",
  "/peacemaker-season-2-john-cena-hd-wallpaper-uhdpaper.com-382@5@i.jpg",
  "/stranger-things-season-4-poster-hd-wallpaper-uhdpaper.com-880@1@g.jpg",
  "/the-boys-cast-hd-wallpaper-uhdpaper.com-54@0@k.jpg",
  "/rebel-moon-movie-cast-hd-wallpaper-uhdpaper.com-378@1@n.jpg",
  "/baki-the-grappler-1449081.webp"
];

// Composant Card pour les services
const ServiceCard = ({ 
  service, 
  isSelected, 
  onClick,
  onPaymentClick
}: { 
  service: ServiceOption; 
  isSelected: boolean; 
  onClick: () => void;
  onPaymentClick: (service: ServiceOption) => void;
}) => {
  return (
    <div 
      className={`service-card ${isSelected ? 'expanded' : ''} rounded-xl cursor-pointer transition-all duration-500 overflow-hidden backdrop-blur-lg
        ${isSelected 
          ? "bg-white/15 shadow-lg" 
          : "bg-white/10 hover:bg-white/15 border border-white/5"
        }`}
      style={{
        boxShadow: isSelected ? `0 8px 32px 0 rgba(31, 38, 135, 0.2)` : 'none',
        border: isSelected ? `3px solid ${service.color}30` : '',
      }}
      onClick={() => {
        onClick();
        const element = document.getElementById(`card-${service.id}`);
        if (element) {
          element.classList.remove('animate-squish');
          // Force a reflow to restart the animation
          void element.offsetWidth;
          element.classList.add('animate-squish');
        }
      }}
      id={`card-${service.id}`}
    >
      <div className="flex items-center p-4">
        <div className="w-12 h-12 relative flex-shrink-0 bg-white/90 backdrop-blur-md rounded-md flex items-center justify-center shadow-sm">
          <Image
            src={service.logo}
            alt={service.name}
            width={48}
            height={48}
          />
        </div>
        <div className="ml-4 flex-grow">
          <h3 className="text-white font-medium">{service.name}</h3>
          <p className="text-white/80">{service.price} FCFA par mois</p>
        </div>
        <div className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center">
          {isSelected && (
            <div className="w-3 h-3 rounded-full bg-white"></div>
          )}
        </div>
      </div>

      {/* Section étendue avec bouton de paiement */}
      {isSelected && (
        <div className="px-4 pb-2 animate-fade-in">
          <div className="border-t border-white/20 pt-4 mt-2">
            <button
              style={{ backgroundColor: service.color }}
              className="w-full py-3 px-4 rounded-lg text-white font-medium transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-md"
              onClick={(e) => {
                e.stopPropagation();
                onPaymentClick(service);
              }}
            >
              Payer Maintenant
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Composant pour le diaporama d'images
const Slideshow = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === backgroundImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 9000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0">
      {backgroundImages.map((image, index) => (
        <div 
          key={image}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ 
            opacity: index === currentImageIndex ? 1 : 0,
            zIndex: index === currentImageIndex ? 1 : 0
          }}
        >
          <Image
            src={image}
            alt={`Slideshow image ${index + 1}`}
            fill
            style={{ objectFit: "cover" }}
            priority={index === 0}
          />
        </div>
      ))}
      {/* Overlay dégradé (foncé en bas, clair en haut) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black to-black/50 z-10"></div>
    </div>
  );
};

export default function Home() {
  const router = useRouter();
  const [selectedService, setSelectedService] = useState<ServiceOption | null>(null);

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Diaporama d'images en arrière-plan */}
      <Slideshow />

      {/* Contenu principal */}
      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen p-8">
        <h1 className="text-4xl font-bold text-white mb-8">Bienvenue<br></br>  sur notre service de streaming 🇬🇦</h1>
        
        <div className="flex flex-col gap-4 w-full max-w-md">
          <h2 className="text-xl font-semibold text-white mb-2">Sélectionnez votre service</h2>
          
          {services.map((service) => (
            <ServiceCard 
              key={service.id}
              service={service}
              isSelected={selectedService?.id === service.id}
              onClick={() => setSelectedService(service)}
              onPaymentClick={(service) => {
                router.push(`/checkout?service=${service.id}&name=${service.name}&price=${service.price}`);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}