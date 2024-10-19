"use client"; // Indiquer que c'est un composant Client

import { db } from "@/Firebase/firebase.config";
import { collection, getDocs, doc, updateDoc, addDoc, deleteDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { LuSearch } from "react-icons/lu";
import { BiSolidCartAdd } from "react-icons/bi";
import { IoMdCloseCircle } from "react-icons/io";
import { SlBasket } from "react-icons/sl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";



type Stock = {
  id: string; // Assurez-vous que chaque item récupéré ait un champ ID
  name: string;
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

 export type SelectedItem = {
  id: string;
  name: string;
  size: string;
  color: string;
  quantity: number;
  Price: number;
};

const Ventes = () => {
  const [dataStock, setDataStock] = useState<Stock[]>([]);
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [searchTerm, setSearchTerm] = useState(""); // Termes de recherche
  const [selectedSize, setSelectedSize] = useState<string | null>(null); // Taille sélectionnée
  const [selectedColor, setSelectedColor] = useState<string | null>(null); // Couleur sélectionnée
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]); // Tableau d'articles sélectionnés

  // Filtrer les articles en fonction de la recherche
  const filteredItems = dataStock.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const updateTotalPrice = (totalQuantity: number, unitPrice: number) =>
    totalQuantity * unitPrice;

  // Gérer le changement de quantité pour chaque produit
  const handleQuantityChange = (item: Stock, quantity: number) => {
    setQuantities((prevQuantities) => ({
      ...prevQuantities,
      [item.name]: quantity,
    }));
  };

  // Gérer la sélection de la taille
  const handleSelectSize = (size: string) => {
    setSelectedSize(size);
  };

  // Gérer la sélection de la couleur
  const handleSelectColor = (color: string) => {
    setSelectedColor(color);
  };

  const handleAddToCart = (item: Stock) => {
    if (!selectedSize || !selectedColor) {
      alert("Veuillez sélectionner une taille et une couleur.");
      return;
    }

    const selectedOption = item.options.find(
      (option) => option.size === selectedSize && option.color === selectedColor
    );

    if (!selectedOption) {
      alert("Option sélectionnée non valide.");
      return;
    }

    const quantity = quantities[item.name] || 1;

    // Vérifier si l'article avec la même taille et couleur est déjà dans le tableau
    const existingItemIndex = selectedItems.findIndex(
      (selectedItem) =>
        selectedItem.id === item.id &&
        selectedItem.size === selectedSize &&
        selectedItem.color === selectedColor
    );

    if (existingItemIndex !== -1) {
      // Si l'article existe déjà, mettre à jour la quantité
      const updatedItems = [...selectedItems];
      updatedItems[existingItemIndex].quantity += quantity;
      setSelectedItems(updatedItems);
    } else {
      // Ajouter un nouvel article
      const newItem: SelectedItem = {
        id: item.id,
        name: item.name,
        size: selectedSize,
        color: selectedColor,
        quantity: quantity,
        Price: updateTotalPrice(quantity, item.unitPrice),
      };
      setSelectedItems((prevItems) => [...prevItems, newItem]);
    }

    alert(`Ajouté ${quantity} de ${item.name} (taille: ${selectedSize}, couleur: ${selectedColor}) au panier.`);
  };


  const handleRemoveFromCart = (item: SelectedItem) => {
    // Trouver l'article dans le tableau
    const existingItemIndex = selectedItems.findIndex(
      (selectedItem) =>
        selectedItem.id === item.id &&
        selectedItem.size === item.size &&
        selectedItem.color === item.color
    );
  
    if (existingItemIndex !== -1) {
      // Retirer l'article du tableau local
      setSelectedItems((prevItems) =>
        prevItems.filter((_, index) => index !== existingItemIndex)
      );
  
      alert(`Retiré ${item.quantity} de ${item.name} (taille: ${item.size}, couleur: ${item.color}) du panier.`);
    }
  };
  

  const handleAddToSales = async () => {
    if (selectedItems.length === 0) {
      alert("Aucun article sélectionné pour la vente.");
      return;
    }
  
    // Récupérer la date actuelle
    const dateOfSale = new Date();
  
    // Parcourir chaque article sélectionné pour l'ajouter à la collection 'ventes'
    for (const item of selectedItems) {
      const saleData = {
        id: item.id,
        name: item.name,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        price: item.Price,
        date: dateOfSale,
        // Ajoutez d'autres champs si nécessaire
      };
  
      // Ajouter à la collection 'ventes'
      await addDoc(collection(db, "ventes"), saleData);
  
      // Mise à jour des quantités dans Firebase après la vente
      const stockItem = dataStock.find((stockItem) => stockItem.id === item.id);
  
      if (stockItem) {
        const itemDocRef = doc(db, "stock", stockItem.id);
  
        // Mise à jour des options (taille/couleur)
        const updatedOptions = stockItem.options.map((option) =>
          option.size === item.size && option.color === item.color
            ? { ...option, quantity: option.quantity - item.quantity } // Réduire la quantité de l'option spécifique
            : option
        );
  
        // Mise à jour de la quantité totale de l'article
        const newTotalQuantity = stockItem.totalQuantity - item.quantity; // Réduire la quantité totale
  
        // Vérifiez si toutes les options de l'article ont une quantité de 0
        const allOutOfStock = updatedOptions.every((option) => option.quantity <= 0);
  
        // Si toutes les options sont épuisées, supprimer l'article du stock
        if (allOutOfStock) {
          await deleteDoc(itemDocRef); // Suppression de l'article si toutes les quantités sont épuisées
        } else {
          await updateDoc(itemDocRef, {
            options: updatedOptions,
            totalQuantity: newTotalQuantity, // Mettre à jour la quantité totale
          });
        }
      }
    }
  
    // Réinitialiser le panier après l'ajout
    setSelectedItems([]);
    alert("Articles ajoutés à la collection des ventes !");
  };
  


  useEffect(() => {
    const getAllData = async () => {
      const stockCollection = collection(db, "stock");
      const stockSnapshot = await getDocs(stockCollection);
      const stocksList = stockSnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id, // Associez l'ID du document ici
      })) as Stock[];
      setDataStock(stocksList);
    };

    getAllData();
  }, []);

  return (

    <div className="h-full w-full p-3 bg-white rounded-md border relative">
      <div className="flex justify-between">

        <h2 className="text-2xl font-bold text-center mb-6">
          Recherche et Sélection d'Articles
        </h2>
        <Dialog>
          <DialogTrigger>
            <div className="mr-9">
              <div className="relative">
                <SlBasket size={45} />
                <span className="absolute h-5 w-5 rounded-full bg-red-500 text-white top-0 right-0">
                  {selectedItems.length}
                </span>
              </div>
            </div>
          </DialogTrigger>
          <DialogContent className="mt-3">
            <h1 className="text-xl font-bold mb-2">
              Articles dans le Panier
            </h1>
            <table className="min-w-full border border-gray-300 mt-2">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2">Nom</th>
                  <th className="border border-gray-300 p-2">Couleur</th>
                  <th className="border border-gray-300 p-2">Quantité</th>
                  <th className="border border-gray-300 p-2">Taille</th>
                  <th className="border border-gray-300 p-2">Prix</th>
                  <th className="border border-gray-300 p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {selectedItems.map((option, index) => (
                  <tr key={index} className="border-b">
                    <td className="border border-gray-300 p-2">{option.name}</td>
                    <td className="border border-gray-300 p-2">
                      <div className="p-4 focus:border-black border rounded-md" style={{ backgroundColor: option.color }} />
                    </td>
                    <td className="border border-gray-300 p-2">{option.quantity}</td>
                    <td className="border border-gray-300 p-2">{option.size}</td>
                    <td className="border border-gray-300 p-2">{option.Price}</td>
                    <td className="border border-gray-300 p-2">
                      <button onClick={() => handleRemoveFromCart(option)} className="text-red-500">
                        <IoMdCloseCircle />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Ajout du bouton pour enregistrer les ventes */}
            <button
              onClick={handleAddToSales}
              className="mt-4 p-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Enregistrer les ventes
            </button>
          </DialogContent>
        </Dialog>

      </div>

      <div>
        <div className="flex items-center bg-white px-4 rounded-md py-2 w-[400px] gap-x-4 border">
          <input
            type="text"
            placeholder="Recherche"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input w-[90%] h-7 rounded outline-none"
          />
          <LuSearch size={25} />
        </div>
        <div className="mt-4">
          <h1 className="text-lg font-bold">Résultat de recherche de produit</h1>
          <div className="mt-2 flex flex-col gap-y-3 w-1/2">
            {filteredItems.map((stockItem, index) => (
              <div key={index} className="border rounded-md p-4 flex flex-col gap-y-2 relative">
                <div className="flex gap-x-3">
                  <span>nom :</span>
                  <span>{stockItem.name}</span>
                </div>
                <div className="flex gap-x-2 items-center">
                  <span>Quantité :</span>
                  <input
                    type="number"
                    min="1"
                    value={quantities[stockItem.name] || 1} // Quantité spécifique à ce produit
                    onChange={(e) =>
                      handleQuantityChange(stockItem, parseInt(e.target.value))
                    }
                    className="h-9 border outline-none rounded-md p-2 w-[80px]"
                  />
                </div>
                <div className="flex flex-col gap-y-2">
                  <span>categorie : <span>{stockItem.category}</span></span>
                  <span>Prix : {updateTotalPrice(quantities[stockItem.name] || 1, stockItem.unitPrice)} FCFA</span>
                </div>
                <div className="flex gap-x-2 items-center">
                  <span>taille :</span>
                  <div className="flex gap-x-3 items-center">
                    {stockItem.options.map((option, idx) => (
                      <div key={idx} className="flex gap-x-1 items-center">
                        <input
                          type="radio"
                          id={`${stockItem.id}-size-${option.size}`}
                          name={`${stockItem.id}-size`}
                          value={option.size}
                          onChange={() => handleSelectSize(option.size)}
                        />
                        <label htmlFor={`${stockItem.id}-size-${option.size}`}>{option.size}</label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-x-2 items-center">
                  <span>couleur :</span>
                  <div className="flex gap-x-3 items-center">
                    {stockItem.options.map((option, idx) => (
                      <div key={idx} className="flex gap-x-1 items-center" >
                        <input
                          type="radio"
                          id={`${stockItem.id}-color-${option.color}`}
                          name={`${stockItem.id}-color`}
                          value={option.color}
                          onChange={() => handleSelectColor(option.color)}
                        />
                        <div className="p-3 focus:border-black border rounded-md" style={{ backgroundColor: option.color }} />
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => handleAddToCart(stockItem)}
                  className="absolute right-3 top-2 text-green-600 hover:text-green-700 rounded-md border p-1"
                >
                  <BiSolidCartAdd size={30} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ventes;
