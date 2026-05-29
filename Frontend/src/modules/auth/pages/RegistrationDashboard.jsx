import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCreative } from "swiper/modules";
import { motion } from "framer-motion";
import "swiper/css";
import "swiper/css/effect-creative";
import StudentLogin from "./StudentLogin";
import AdminAuth from "./AdminLogin";
import TeacherLogin from "./TeacherLogin";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { useRef } from "react";
import TestCredentials from "@/components/auth/TestCredentials";

export default function RegistrationDashboard() {
  const swiperRef = useRef(null);

  const goToSlide = (index) => {
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.slideToLoop(index);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-zinc-200 to-white h-screen relative">
      <div className="absolute top-4 right-4 md:top-6 md:right-6 z-50">
        <TestCredentials />
      </div>

      <Swiper
        ref={swiperRef}
        modules={[EffectCreative]}
        effect="creative"
        creativeEffect={{
          prev: {
            translate: ["-50%", 0, -900],
            opacity: 0.5,
            scale: 0.8,
          },
          next: {
            translate: ["50%", 0, -900],
            opacity: 0.5,
            scale: 0.8,
          },
        }}
        initialSlide={1}
        navigation={true}
        slidesPerView={1}
        centeredSlides
        className="w-full max-w-3xl h-[600px]"
      >
        <SwiperSlide>
          <motion.div className="h-full flex items-center justify-center">
            <AdminAuth />
          </motion.div>
        </SwiperSlide>

        <SwiperSlide>
          <motion.div className="h-full flex items-center justify-center">
            <StudentLogin />
          </motion.div>
        </SwiperSlide>

        <SwiperSlide>
          <motion.div className="h-full flex items-center justify-center">
            <TeacherLogin />
          </motion.div>
        </SwiperSlide>
      </Swiper>

      <div className="mt-8">
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>Pagination</MenubarTrigger>
            <MenubarContent>
              <MenubarItem onClick={() => goToSlide(1)}>
                Student <MenubarShortcut>1</MenubarShortcut>
              </MenubarItem>
              <MenubarItem onClick={() => goToSlide(2)}>
                Teacher <MenubarShortcut>2</MenubarShortcut>
              </MenubarItem>
              <MenubarItem onClick={() => goToSlide(0)}>
                Admin <MenubarShortcut>3</MenubarShortcut>
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem onClick={() => window.location.reload()}>
                Refresh
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </div>

      <footer className="absolute bottom-4 right-4 text-xs text-gray-600">
        <p>Policy | Terms | © 2025 Classcify Edtech Limited</p>
      </footer>
    </div>
  );
}
