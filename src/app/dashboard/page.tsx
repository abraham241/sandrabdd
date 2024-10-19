'use client'
import React, { useEffect, useState } from 'react';
import Section from './_components/section';
import { Badge } from "@/components/ui/badge";
import { LiaFileInvoiceDollarSolid } from "react-icons/lia";
import { AiOutlineProduct } from "react-icons/ai";
import { Chart } from './_components/chart';
import { db } from '@/Firebase/firebase.config'; // Assurez-vous que Firebase est correctement configuré
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { SelectedItem } from './ventes/page';

const page = () => {
  // State pour stocker les ventes récentes
  const [recentSales, setRecentSales] = useState<SelectedItem[]>([]);

  // Fonction pour récupérer les ventes récentes
  useEffect(() => {
    const salesCollection = collection(db, "ventes");
    const q = query(salesCollection, orderBy("date", "desc"), limit(5)); // Limiter à 5 ventes récentes

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sales = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as SelectedItem[];
      setRecentSales(sales); // Mettre à jour le state avec les ventes récentes
    });

    return () => unsubscribe();
  }, []);

  return (
    <main className='flex w-full gap-x-5 h-[100vh] flex-none'>
      <div className='w-[70%] h-full flex flex-col justify-between gap-y-10'>
        <div className='w-full flex flex-col gap-y-3'>
          <div className='flex justify-between w-full'>
            <Section className='bg-white flex-none p-4 w-[47%] flex flex-col gap-y-2 justify-between'>
              <div className='flex justify-between items-center'>
                <div className='bg-[#f8f8f8] p-3 rounded-2xl'>
                  <LiaFileInvoiceDollarSolid size={25} />
                </div>
                <Badge className='bg-[#78f080] p-1'>
                  +2,06%
                </Badge>
              </div>
              <div className='flex flex-col gap-2'>
                <span>
                  Total du Mois
                </span>
                <div className='text-3xl font-bold'>
                  0 FCFA
                </div>
              </div>
            </Section>
            <Section className='bg-white flex-none p-4 w-[47%] gap-y-2  flex flex-col justify-between'>
              <div className='flex justify-between items-center'>
                <div className='bg-[#f8f8f8] p-3 rounded-2xl'>
                  <LiaFileInvoiceDollarSolid size={25} />
                </div>
                <Badge className='bg-[#78f080] p-1'>
                  +12,06%
                </Badge>
              </div>
              <div className='flex flex-col gap-2'>
                <span>
                  Total de la Semaine
                </span>
                <div className='text-3xl font-bold'>
                  0 FCFA
                </div>
              </div>
            </Section>
          </div>
          <div className='flex justify-between w-full'>
            <Section className='bg-white flex-none p-4 w-[47%] gap-y-2  flex flex-col justify-between'>
              <div className='flex justify-between items-center'>
                <div className='bg-[#f8f8f8] p-3 rounded-2xl'>
                  <AiOutlineProduct size={25} />
                </div>
                <Badge className='bg-[#78f080] p-1'>
                  +2,06%
                </Badge>
              </div>
              <div className='flex flex-col gap-2'>
                <span>
                  Total d'article vendu dans le mois
                </span>
                <div className='font-bold'>
                  <span className='text-3xl'>
                    0
                  </span>
                  <span>
                    Articles
                  </span>
                </div>
              </div>
            </Section>
            <Section className='bg-white flex-none p-4 w-[47%] gap-y-2 flex flex-col justify-between'>
              <div className='flex justify-between items-center'>
                <div className='bg-[#f8f8f8] p-3 rounded-2xl'>
                  <AiOutlineProduct size={25} />
                </div>
                <Badge className='bg-[#78f080] p-1'>
                  +2,06%
                </Badge>
              </div>
              <div className='flex flex-col gap-2'>
                <span>
                  Total d'article vendu de la semaine
                </span>
                <div className='font-bold'>
                  <span className='text-3xl'>
                    0
                  </span>
                  <span>
                    Articles
                  </span>
                </div>
              </div>
            </Section>
          </div>
        </div>
        <div className='h-[47%] w-full bg-white flex-none rounded-lg border'>
          <Chart />
        </div>
      </div>

      {/* Section pour les produits récemment vendus */}
      <div className='w-[28%] h-full flex flex-col justify-between'>
        <Section className='h-[58%] w-full bg-white flex-none p-2'>
          <h1 className='text-xl font-bold'>
            Produit récemment vendu
          </h1>
          <div className='mt-4 flex flex-col gap-4'>
            {recentSales.length > 0 ? (
              recentSales.slice(0, 3).map((sale) => (
                <div key={sale.id} className='flex justify-between p-2 bg-[#f5f5f5] rounded-md'>
                  <div>
                    <p className='font-bold'>{sale.name}</p>
                    <p>Quantité : {sale.quantity}</p>
                    <p>Couleur : {sale.color}</p>
                  </div>
                </div>
              ))
            ) : (
              <p>Aucune vente récente</p>
            )}
          </div>
        </Section>

        <Section className='h-[40%] w-full bg-white flex-none'>
          <h1>Autres statistiques</h1>
        </Section>
      </div>
    </main>
  );
};

export default page;
