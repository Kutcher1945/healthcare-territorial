"use client"

import { Link, useLocation } from "react-router-dom"
import { HeartPulse, MapPinned, Menu, X, ChevronDown, Activity, Users } from "lucide-react"
import { useState, useEffect } from "react"
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose} from "../ui/dialog"
import DoctorsCapacityMethodology from "../Methodology/DoctorsCapacityMethodology"

export default function Header({ setSelectedDistrict, selectedDistrict }) {
  const [openDropDown, setOpenDropDown] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const location = useLocation()
  const isActive = (path) => location.pathname === path
  const [isMethodologyOpen, setIsMethodologyOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown-container")) {
        setOpenDropDown(false)
      }
    }
    document.addEventListener("click", handleClickOutside)
    return () => document.removeEventListener("click", handleClickOutside)
  }, [])

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
  ]

  const selectDistrict = (district) => {
    setSelectedDistrict(district)
    setOpenDropDown(false)
  }

  const navigationItems = [
    { to: "/", label: "Главная", icon: Activity, color: "text-blue-500" },
    { to: "/infrastructure", label: "Инфраструктура", icon: HeartPulse, color: "text-green-500" },
    { to: "/personal", label: "Персонал", icon: Users, color: "text-purple-500" },
    { to: "/recomendations", label: "Рекомендации", icon: MapPinned, color: "text-purple-500" },
  ]

  return (
    <>
    <header
      className={`pl-4 pr-4 sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-white shadow-md border-b-2 border-[#c1d3ff]"
          : "bg-white border-b border-[#e8e8e8]"
      }`}
    >
      <div className="flex h-14 sm:h-14 w-full justify-between items-center px-2">
        <div className="flex items-center gap-3 sm:gap-4">

          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-bold text-[#1b1b1b] truncate">
              Территориальное разделение поликлиник
            </h1>
          </div>

        </div>

        <div className="flex items-center gap-3">
          <nav className="hidden lg:flex items-center gap-2">
              <button
                onClick={() => setIsMethodologyOpen(true)}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-xs hover:bg-gray-50"
              >
                Методология
              </button>

            {navigationItems.map((item) => {
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`rounded-md px-4 py-1.5 text-xs font-semibold transition-colors ${
                    isActive(item.to)
                      ? "bg-[#236FFF] text-white"
                      : "bg-transparent text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span className="whitespace-nowrap">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          <div className="flex lg:hidden items-center gap-2">
            <div className="relative dropdown-container sm:hidden">
              <button
                className="flex items-center gap-1 rounded-lg border border-[#c1d3ff] bg-[#ebf1ff] px-2 py-1.5 text-xs font-semibold text-[#283353] hover:bg-[#e1eaff] transition-colors"
                onClick={() => setOpenDropDown(!openDropDown)}
              >
                <MapPinned className="h-3 w-3 text-[#3772ff]" />
                <span className="max-w-16 truncate">{selectedDistrict}</span>
                <ChevronDown
                  className={`h-3 w-3 transition-transform ${openDropDown ? "rotate-180" : ""}`}
                />
              </button>

              {openDropDown && (
                <div className="absolute top-full right-0 mt-2 w-48 rounded-lg border-2 border-[#c1d3ff] bg-white shadow-xl z-50">
                  <div className="p-1">
                    {districts.map((district) => (
                      <button
                        key={district}
                        onClick={() => selectDistrict(district)}
                        className={`w-full rounded-md px-3 py-2 text-left text-xs font-medium transition-colors ${
                          district === selectedDistrict
                            ? "bg-[#ebf1ff] text-[#3772ff] font-bold"
                            : "text-[#283353] hover:bg-[#eaebee]"
                        }`}
                      >
                        {district}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex lg:hidden items-center gap-2">
              <button
                onClick={() => {
                  setIsMethodologyOpen(true);
                  setMobileMenu(false);
                }}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-semibold text-[#283353] hover:bg-[#ebf1ff] border border-transparent hover:border-[#c1d3ff] transition-colors w-full text-left"
              >
                <span>Методология</span>
              </button>

              <button
                onClick={() => setMobileMenu(!mobileMenu)}
                className={`rounded-lg p-2 transition-all duration-200 border ${
                  mobileMenu
                    ? "bg-[#ebf1ff] text-[#3772ff] border-[#c1d3ff]"
                    : "text-[#283353] hover:bg-[#ebf1ff] border-transparent hover:border-[#c1d3ff]"
                }`}
              >
                {mobileMenu ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {mobileMenu && (
        <div className="lg:hidden border-t border-[#e8e8e8] bg-white animate-in slide-in-from-top-2 duration-300">
          <div className="py-3 px-4 space-y-2">
            {navigationItems.map((item) => {
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenu(false)}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-semibold transition-colors ${
                    isActive(item.to)
                      ? "bg-gradient-to-r from-[#3772ff] to-[#2956bf] text-white shadow-md"
                      : "text-[#283353] hover:bg-[#ebf1ff] border border-transparent hover:border-[#c1d3ff]"
                  }`}
                >
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </header>

    <Dialog open={isMethodologyOpen} onOpenChange={setIsMethodologyOpen}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto text-left">
        <DialogHeader className="sticky top-0 bg-white shadow-sm z-50">
          <DialogTitle className="text-2xl">
            Методология расчета мощности и дефицита врачей в поликлиниках города Алматы
          </DialogTitle>
          <DialogClose onOpenChange={setIsMethodologyOpen} />
        </DialogHeader>
        <div className="mt-4"><DoctorsCapacityMethodology/></div>
      </DialogContent>
    </Dialog>
    </>
  )
}
