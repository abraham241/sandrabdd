"use client";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { LuLayoutDashboard } from "react-icons/lu";
import { TbLayoutDashboardFilled } from "react-icons/tb";

import { RiMoneyDollarCircleFill } from "react-icons/ri";
import { RiMoneyDollarCircleLine } from "react-icons/ri";

import { BsDatabaseAdd } from "react-icons/bs";
import { BsDatabaseFillAdd } from "react-icons/bs";

import { AiFillDatabase } from "react-icons/ai";
import { AiOutlineDatabase } from "react-icons/ai";

import { PiSignOutBold } from "react-icons/pi";
import { PiSignOut } from "react-icons/pi";

import { useRouter, usePathname } from 'next/navigation';


type sideBarProps = {
  className?: string;
};

const SideBar: React.FC<sideBarProps> = ({ className }) => {
  const router = useRouter();
  const pathname = usePathname();

  const handleLink = (link: string) => {
    router.push(link);

  }

  const verifedPath = (link: string) => {
    if (pathname.toLowerCase() === link.toLowerCase()) {
      return true;
    } else {
      return false;
    }
  }

  return (
    <div
      className={cn(
        className,
        "rounded-3xl bg-white w-full shadow-xl h-full flex flex-col justify-between items-center py-5 px-2"
      )}
    >
      <div className="w-full flex flex-col items-center">
        <div></div>

        <ul className="flex flex-col gap-y-5 w-full">
          <li>

            <button onClick={() => handleLink('/dashboard')} className={`flex items-center gap-x-1 mx-auto w-full px-1 py-2 ${verifedPath('/dashboard') && 'bg-[#4956f4] text-white rounded-md'}`}>
              {verifedPath('/dashboard') ? (
                <TbLayoutDashboardFilled size={30} />
              ) : (
                <LuLayoutDashboard size={30} />
              )}

              <span>
                Dashboard
              </span>
            </button>
          </li>
          <li>
            <button onClick={() => handleLink('/dashboard/ventes')} className={`flex items-center gap-x-1 mx-auto w-full px-1 py-2 ${verifedPath('/dashboard/ventes') && 'bg-[#4956f4] text-white rounded-md'}`}>
              {verifedPath('/dashboard/ventes') ? (
                <RiMoneyDollarCircleFill size={30} />
              ) : (
                <RiMoneyDollarCircleLine size={30} />
              )}

              <span>
                Ventes
              </span>
            </button>
          </li>
          <li>
            <button onClick={() => handleLink('/dashboard/ajouter-produit')} className={`flex items-center gap-x-1 mx-auto w-full px-1 py-2 ${verifedPath('/dashboard/ajouter-produit') && 'bg-[#4956f4] text-white rounded-md'}`}>
              {verifedPath('/dashboard/ajouter-produit') ? (
                <BsDatabaseFillAdd size={30} />
              ) : (
                <BsDatabaseAdd size={30} />
              )}

              <span>
                Ajouter Produit
              </span>
            </button>
          </li>
          <li>
            <button onClick={() => handleLink('/dashboard/stock')} className={`flex items-center gap-x-1 mx-auto w-full px-1 py-2 ${verifedPath('/dashboard/stock') && 'bg-[#4956f4] text-white rounded-md'}`}>
              {verifedPath('/dashboard/stock') ? (
                <AiFillDatabase size={30} />
              ) : (
                <AiOutlineDatabase size={30} />
              )}
              <span>
                Stocks
              </span>

            </button>
          </li>
        </ul>
      </div>
      <button className="flex items-center gap-x-1 focus:bg-[#4956f4] focus:text-white focus:rounded-md mx-auto w-full px-1 py-2">
        <PiSignOut />
        <span>se déconnecter</span>
      </button>
    </div>
  );
};

export default SideBar;
