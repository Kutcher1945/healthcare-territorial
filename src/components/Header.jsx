import { Link, useLocation } from "react-router-dom";
import { Shield, HeartPulse, MapPinned, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Header({ setSelectedDistrict, selectedDistrict }) {
  const [openDropDown, setOpenDropDown] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const districts = [
    "Все районы",
    "Алатауский",
    "Алмалинский",
    "Ауэзовский",
    "Бостандыкский",
    "Жетысуский",
    "Медеуский",
    "Наурызбайский",
    "Турксибский",
  ];

  const selectDistrict = (district) => {
    setSelectedDistrict(district);
    setOpenDropDown(false);
  };

  return (
    <header className="flex items-center justify-between px-4 sm:px-8 bg-blue-500 shadow-lg border-b relative p-4">
      {/* Logo & District Selector */}
      <div className="flex items-center gap-4">
        <div className="p-2 sm:p-3 bg-white/20 rounded-xl backdrop-blur-sm">
          <HeartPulse className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
        </div>
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-white">
            Здравоохранение
          </h1>
          <button
            className="text-white font-sans flex gap-2 items-center hover:text-gray-300 text-sm sm:text-base"
            onClick={() => setOpenDropDown(!openDropDown)}
          >
            <MapPinned className="w-4 h-4" />
            {selectedDistrict === "Все районы"
              ? `${selectedDistrict} • Алматы`
              : `${selectedDistrict} район • Алматы`}
          </button>

          {/* Dropdown */}
          {openDropDown && (
            <div className="absolute mt-2 w-48 bg-white rounded-xl shadow-lg z-10">
              {districts.map((district) => (
                <div
                  key={district}
                  onClick={() => selectDistrict(district)}
                  className={`px-4 py-2 hover:bg-blue-100 cursor-pointer border-b ${
                    district === selectedDistrict ? "bg-blue-200" : ""
                  }`}
                >
                  {district}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Desktop Nav */}
      <nav className="hidden md:flex items-center gap-4">
        {[
          { to: "/", label: "Home" },
          { to: "/infrastructure", label: "Infra" },
          { to: "/personal", label: "Personal" },
        ].map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`font-semibold rounded-xl px-3 py-2 transition-colors ${
              isActive(link.to)
                ? "bg-blue-700 text-white"
                : "text-white hover:bg-blue-400"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenu(!mobileMenu)}
        className="md:hidden text-white focus:outline-none"
      >
        {mobileMenu ? <X size={28} /> : <Menu size={28} />}
      </button>

      {/* Mobile Nav */}
      {mobileMenu && (
        <div className="absolute z-10 top-full left-0 w-full bg-blue-500 shadow-md flex flex-col md:hidden">
          {[
            { to: "/", label: "Home" },
            { to: "/infrastructure", label: "Infra" },
            { to: "/personal", label: "Personal" },
          ].map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileMenu(false)}
              className={`px-4 py-3 border-t border-blue-400 ${
                isActive(link.to)
                  ? "bg-blue-700 text-white"
                  : "text-white hover:bg-blue-400"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
