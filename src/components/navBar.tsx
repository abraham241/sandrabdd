import React from "react";
import { IoIosNotifications } from "react-icons/io";
import { LuSearch } from "react-icons/lu";
import { FaUserCircle } from "react-icons/fa";
import Image from "next/image";
import { cn } from "@/lib/utils";
// import profil from "../public/images/profil.jpg";

type navBarProps = {
  className?: string;
};

const NavBar: React.FC<navBarProps> = ({ className }) => {
  return (
    <div className={cn(className, "flex items-center justify-between")}>
      <div className="">
        <a className="btn-ghost text-3xl font-bold ">Dashboard</a>
      </div>
      <div className="flex items-center bg-white px-4 rounded-md py-2 w-[350px] gap-x-4 shadow-xl">
        <input
          type="text"
          placeholder="Recherche"
          className="input  w-[90%] h-7 rounded outline-none"
        />
        <LuSearch size={25} />
      </div>
      <div className="flex gap-5 items-center">
        <button className=" h-[50px] w-[50px] rounded-full bg-white flex items-center justify-center shadow">
          <IoIosNotifications size={30} />
        </button>

        <div className=" flex items-center gap-x-3">
          <button className=" h-[50px] w-[50px] rounded-full bg-white flex items-center justify-center shadow">
            <FaUserCircle size={40} />
          </button>
          <div className="flex flex-col gap-y-0 justify-center">
            <span className="font-bold text-[16px]">Audrey Amanda</span>
            <span className="text-[14px]">Vendeur</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavBar;
