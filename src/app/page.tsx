"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

// Définition de l'interface pour les options de service
interface ServiceOption {
  id: string;
  name: string;
  logo: string;
  color: string;
  price: string;
}

// Définition des services disponibles
const services: ServiceOption[] = [
  {
    id: "netflix",
    name: "Netflix",
    logo: "/Netflix Wordmark.png",
    color: "var(--netflix-color)",
    price: "3500"
  },
  {
    id: "prime",
    name: "Prime Video",
    logo: "/Prime Video.png",
    color: "var(--prime-color)",
    price: "3500"
  }
];

// Composant de diaporama pour les images de fond
function Slideshow() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = [
    "/addams-family-wednesday-s2-hd-wallpaper-uhdpaper.com-184@5@h.jpg",
    "/peacemaker-season-2-john-cena-hd-wallpaper-uhdpaper.com-382@5@i.jpg"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000); // Changer l'image toutes les 5 secondes

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 z-0">
      {images.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentImageIndex ? "opacity-100" : "opacity-0"
          }`}
          style={{
            backgroundImage: `url(${image})`,
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/80" />
    </div>
  );
}

// Composant pour la carte de service
function ServiceCard({
  service,
  isSelected,
  onClick
}: {
  service: ServiceOption;
  isSelected: boolean;
  onClick: () => void;
}) {
  const router = useRouter();

  const handlePayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/checkout?service=${service.id}&name=${service.name}&price=${service.price}`);
  };

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
          void element.offsetWidth;
          element.classList.add('animate-squish');
        }
      }}
      id={`card-${service.id}`}
    >
      <div className="p-6">
        <div className="flex items-center justify-center h-16 mb-4">
          <Image
            src={service.logo}
            alt={service.name}
            width={120}
            height={60}
            style={{ objectFit: "contain" }}
          />
        </div>
        <div className="text-center">
          <h3 className="text-white text-lg font-medium">Vos films et séries préférés</h3>
          <p className="text-white/70 mt-1">{service.price} FCFA/mois</p>
        </div>
      </div>
      
      {isSelected && (
        <div 
          className="p-4 bg-gradient-to-r animate-fade-in"
          style={{ 
            backgroundImage: `linear-gradient(to right, ${service.color}20, ${service.color}40)`
          }}
        >
          <button
            className="w-full py-2 px-4 rounded-lg text-white font-medium transition-all"
            style={{ backgroundColor: service.color }}
            onClick={handlePayClick}
          >
            Payer maintenant
          </button>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const handleServiceSelect = (serviceId: string) => {
    if (selectedService === serviceId) {
      setSelectedService(null);
    } else {
      setSelectedService(serviceId);
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-4 sm:p-8">
      {/* Diaporama d'images en arrière-plan */}
      <Slideshow />
      
      {/* Contenu principal */}
      <div className="relative z-10 w-full max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Bienvenue sur notre service de streaming
          </h1>
          <p className="text-xl text-white/70">
            Choisissez votre service préféré
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              isSelected={selectedService === service.id}
              onClick={() => handleServiceSelect(service.id)}
            />
          ))}
        </div>
      </div>
    </main>
  );
}