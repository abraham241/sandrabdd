'use client';
import React, { useEffect, useState } from 'react';
import { BiSpreadsheet } from "react-icons/bi";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { File, MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { LuSearch } from 'react-icons/lu';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/Firebase/firebase.config';
import { isSameDay } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";



type Stock = {
  id: string;
  name: string;
  dateAdded: Date;
  category: string;
  unitPrice: number;
  totalQuantity: number;
  totalPrice: number;
  options: {
    size: string;
    color: string;
    quantity: number;
    seuil: number;
    imageUrl: string;
  }[];
};

function formatDateToFrench(dateString: string): string {
  const date = new Date(dateString);

  const joursSemaine = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const mois = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

  const jour = joursSemaine[date.getUTCDay()];
  const jourDuMois = date.getUTCDate();
  const moisFrancais = mois[date.getUTCMonth()];
  const annee = date.getUTCFullYear();
  const heures = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');

  return `${jour} ${jourDuMois} ${moisFrancais} ${annee} à ${heures}h${minutes}`;
}

function formatDatetoFrench(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  return date.toLocaleDateString('fr-FR', options);
}

const Page = () => {
  const [date, setDate] = useState<Date>();
  const [categories, setCategories] = useState([]);
  const [categorieSelected, setCategorieSelected] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [dataStock, setDataStock] = useState<Stock[]>([]);
  const [dataFliter, setDataFilter] = useState<Stock[]>([]);

  useEffect(() => {
    const getAllData = async () => {
      const categoriesCollection = collection(db, "Catégorie");
      const categoriesSnapshot = await getDocs(categoriesCollection);
      const categoriesList = categoriesSnapshot.docs.map((doc) => doc.data());
      setCategories(categoriesList[0].Catégories);

      const stockCollection = collection(db, "stock");
      const stockSnapshot = await getDocs(stockCollection);
      const stocksList = stockSnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as Stock[];
      setDataStock(stocksList);
      setDataFilter(stocksList);
    };

    getAllData();
  }, []);

  useEffect(() => {
    const filteredData = dataStock.filter(stock => {
      const isCategoryMatch = categorieSelected ? stock.category.toLowerCase() === categorieSelected.toLowerCase() : true;
      const isSearchMatch = searchTerm ? stock.name.toLowerCase().includes(searchTerm.toLowerCase()) : true;
      const isDateMatch = date ? isSameDay(stock.dateAdded, date) : true;
      return isCategoryMatch && isSearchMatch && isDateMatch;
    });
    setDataFilter(filteredData);
  }, [categorieSelected, searchTerm, date, dataStock]);

  // Fonction pour gérer la suppression
  const handleDelete = async (id: string) => {
    const stockDocRef = doc(db, "stock", id);
    await deleteDoc(stockDocRef);
    setDataStock(prevData => prevData.filter(stock => stock.id !== id));
    setDataFilter(prevData => prevData.filter(stock => stock.id !== id));
  };

  return (
    <div className="w-full">
      <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 w-full">
        <Tabs defaultValue="all">
          <TabsContent value="all">
            <Card x-chunk="dashboard-06-chunk-0">
              <CardHeader className="flex flex-row justify-between items-center">
                <div>
                  <CardTitle>Products</CardTitle>
                  <CardDescription>
                    Manage your products and view their sales performance.
                  </CardDescription>
                </div>
                <div className="flex flex-col items-center gap-y-4">
                  <div className='flex justify-between gap-x-10'>
                    <div className="flex items-center bg-white px-4 rounded-md py-2 w-[250px] gap-x-4 shadow-xl border justify-end">
                      <input
                        type="text"
                        placeholder="Recherche"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input w-[90%] h-7 rounded outline-none"
                      />
                      <LuSearch size={25} />
                    </div>
                    <div>
                      <button className='border px-3 py-2 rounded-md' onClick={() => { setDataFilter(dataStock); setCategorieSelected('') }}>
                        <BiSpreadsheet size={35} />
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-x-3">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-[280px] justify-start text-left font-normal',
                            !date && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? formatDatetoFrench(date) : <span>cliquer sur une date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="p-0">
                        <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                      </PopoverContent>
                    </Popover>
                    <Select name="categorieProduit" value={categorieSelected} onValueChange={(value) => setCategorieSelected(value)}>
                      <SelectTrigger className="flex-none  h-9 w-1/2 border border-gray-300">
                        <SelectValue placeholder="Categorie" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.length !== 0 && categories.map((categorie) => (
                          <SelectItem key={categorie} value={categorie}>
                            {categorie}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom du produit</TableHead>
                      <TableHead className="hidden md:table-cell">Prix</TableHead>
                      <TableHead className="hidden md:table-cell">Quantité totale</TableHead>
                      <TableHead className="hidden md:table-cell">Date d'ajout</TableHead>
                      <TableHead>
                        <span className="sr-only">Actions</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dataFliter.length !== 0 && dataFliter.map((stoc, index: number) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{stoc.name}</TableCell>
                        <TableCell className="hidden md:table-cell">{stoc.unitPrice}{' '}FCFA</TableCell>
                        <TableCell className="hidden md:table-cell">{stoc.totalQuantity}</TableCell>
                        <TableCell className="hidden md:table-cell">{formatDateToFrench(stoc.dateAdded.toLocaleString())}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button aria-haspopup="true" size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" >
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <Dialog>
                                <DropdownMenuLabel>
                                  <DialogTrigger>
                                    <span>
                                      Détaille
                                    </span>
                                  </DialogTrigger>
                                </DropdownMenuLabel>

                                <DialogContent>
                                  <table className="min-w-full border border-gray-300 mt-7">
                                    <thead>
                                      <tr className="bg-gray-100">
                                        <th className="border border-gray-300 p-2">Nom</th>
                                        <th className="border border-gray-300 p-2">Couleur</th>
                                        <th className="border border-gray-300 p-2">Quantité</th>
                                        <th className="border border-gray-300 p-2">Seuil d'alerte</th>
                                        <th className="border border-gray-300 p-2">Taille</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {stoc.options.map((option, index) => (
                                        <tr key={index} className="border-b">
                                          <td className="border border-gray-300 p-2">{stoc.name}</td>
                                          <td className="border border-gray-300 p-2">
                                            <div className="p-4 focus:border-black border rounded-md" style={{ backgroundColor: option.color }} />
                                          </td>
                                          <td className="border border-gray-300 p-2">{option.quantity}</td>
                                          <td className="border border-gray-300 p-2">{option.seuil}</td>
                                          <td className="border border-gray-300 p-2">{option.size}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </DialogContent>
                              </Dialog>
                              <DropdownMenuItem onClick={() => handleDelete(stoc.id)}>Supprimer</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter>
                <div className="text-xs text-muted-foreground">
                  Showing <strong>1-10</strong> of <strong>32</strong> products
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Page;
