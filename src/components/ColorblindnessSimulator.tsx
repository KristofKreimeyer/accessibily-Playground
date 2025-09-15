import { useState } from "react";
import { motion } from "framer-motion";

const images = [
  {
    src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
    alt: "Bunte Landschaft mit Gras und Himmel",
  },
  {
    src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop",
    alt: "Bunter Wald im Herbst",
  },
  {
    src: "omar-ramadan.jpg",
    alt: "Gras und Himmel Landschaft",
  },
  {
    src: "yoshihiro.jpg",
    alt: "Rote Rose",
  },
  {
    src: "anna-tarazevich.jpg",
    alt: "Rote Rose",
  },
];

const filters = [
  { name: "Normal", className: "" },
  { name: "Grayscale", className: "grayscale" },
  { name: "Protanopia", className: "protanopia" },
  { name: "Deuteranopia", className: "deuteranopia" },
  { name: "Tritanopia", className: "tritanopia" },
];

export default function ColorblindnessSimulator() {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedFilterIndex, setSelectedFilterIndex] = useState(0);

  const selectedImage = images[selectedImageIndex];
  const selectedFilter = filters[selectedFilterIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* SVG Filter Definitionen */}
      <svg className="absolute h-0 w-0" aria-hidden="true">
        <defs>
          {/* Protanopia (Rot-Blindheit) */}
          <filter id="protanopia">
            <feColorMatrix values="0.567,0.433,0,0,0  0.558,0.442,0,0,0  0,0.242,0.758,0,0  0,0,0,1,0" />
          </filter>

          {/* Deuteranopia (Grün-Blindheit) */}
          <filter id="deuteranopia">
            <feColorMatrix values="0.625,0.375,0,0,0  0.7,0.3,0,0,0  0,0.3,0.7,0,0  0,0,0,1,0" />
          </filter>

          {/* Tritanopia (Blau-Blindheit) */}
          <filter id="tritanopia">
            <feColorMatrix values="0.95,0.05,0,0,0  0,0.433,0.567,0,0  0,0.475,0.525,0,0  0,0,0,1,0" />
          </filter>
        </defs>
      </svg>

      <section className="px-6 py-20 text-center">
        <h1 className="mb-6 text-4xl font-bold text-teal-600 bg-clip-text">
          Farbfehlsichtigkeit Simulator
        </h1>
        <p className="mb-12 text-lg text-gray-600 max-w-2xl mx-auto">
          Wähle ein Bild und simuliere verschiedene Arten von
          Farbfehlsichtigkeit, um zu verstehen, wie Menschen mit
          Farbsehschwächen die Welt wahrnehmen.
        </p>

        {/* Bildauswahl */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Bildauswahl
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {images.map((img, index) => (
              <button
                key={img.src}
                onClick={() => setSelectedImageIndex(index)}
                aria-pressed={selectedImageIndex === index}
                aria-label={`Bild auswählen: ${img.alt}`}
                className={`rounded-lg border-2 p-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 hover:scale-105 ${
                  selectedImageIndex === index
                    ? "border-teal-500 shadow-lg"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className="h-20 w-32 rounded object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Hauptbild */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Aktueller Filter:{" "}
            <span className="text-teal-600">{selectedFilter.name}</span>
          </h2>
          <motion.div
            key={selectedImage.src + selectedFilter.className}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="inline-block rounded-lg overflow-hidden shadow-xl"
          >
            <img
              src={selectedImage.src}
              alt={`${selectedImage.alt} mit ${selectedFilter.name} Filter`}
              className={`max-w-full h-auto max-h-96 ${selectedFilter.className}`}
              style={{ maxWidth: "600px" }}
            />
          </motion.div>
        </div>

        {/* Filter Buttons */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Filter auswählen
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {filters.map((filter, index) => (
              <button
                key={filter.name}
                onClick={() => setSelectedFilterIndex(index)}
                aria-pressed={selectedFilterIndex === index}
                aria-label={`Filter anwenden: ${filter.name}`}
                className={`rounded-full px-6 py-3 font-medium shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 hover:shadow-lg ${
                  selectedFilterIndex === index
                    ? "bg-teal-500 text-white shadow-teal-200"
                    : "bg-white text-gray-800 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                {filter.name}
              </button>
            ))}
          </div>
        </div>

        {/* Informationen */}
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6 text-left">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-semibold text-red-600 mb-2">Protanopia</h3>
            <p className="text-gray-600 text-sm">
              Schwierigkeit beim Unterscheiden von Rot- und Grüntönen. Betrifft
              etwa 1% der Männer.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-semibold text-green-600 mb-2">Deuteranopia</h3>
            <p className="text-gray-600 text-sm">
              Die häufigste Form der Farbblindheit. Schwierigkeit beim
              Unterscheiden von Grün- und Rottönen.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-semibold text-blue-600 mb-2">Tritanopia</h3>
            <p className="text-gray-600 text-sm">
              Seltene Form der Farbblindheit. Schwierigkeit beim Unterscheiden
              von Blau- und Gelbtönen.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
