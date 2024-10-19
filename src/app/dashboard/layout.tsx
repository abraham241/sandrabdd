import React, { Suspense } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { Auth } from "@/Firebase/firebase.config";

import NavBar from '@/components/navBar';
import SideBar from '@/components/sideBar';
import { ScrollArea } from '@/components/ui/scroll-area';
import Loading from "./loading";



const layout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  const verifedSingIn = () => {
    const auth = Auth;
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/auth.user
        const uid = user.uid;
        // ...
      } else {
        // User is signed out
        // ...
      }
    });
  };

  return (
    <Suspense fallback={<Loading />}>
      <main className="h-[100vh] w-full p-8 flex gap-x-8">
        <div className="h-full w-[180px] flex">
          <SideBar />
        </div>
        <div className='h-full flex-1 flex flex-col gap-y-5'>
          <NavBar className='' />
          <ScrollArea className='h-[100vh] flex-1 py-2 px-4'>
            {children}
          </ScrollArea>

        </div>
      </main>
    </Suspense>
  );
};

export default layout;
