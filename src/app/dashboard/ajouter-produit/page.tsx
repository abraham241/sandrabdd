"use client";
import { addDoc, collection, getDocs } from "firebase/firestore";
import React, { useState, useEffect } from "react";
import { db } from "@/Firebase/firebase.config";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IoMdCloseCircle } from "react-icons/io";
import { FaPlusCircle } from "react-icons/fa";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/Firebase/firebase.config"; // Assurez-vous d'importer correctement votre instance Firebase Storage


const colors = ['red', 'black', 'white', 'gray', 'blue', 'green', 'yellow', 'purple', 'pink', 'brown'];
const sizes = ['S', 'M', 'L', 'XL', '2XL', '3XL'];

const Page = () => {
  const [categories, setCategories] = useState([]);
  const [productName, setProductName] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [selectedSeuilAlerte, setSelectedSeuilAlerte] = useState(1);
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [productOptions, setProductOptions] = useState<any[]>([]);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getCategories = async () => {
      const categoriesCollection = collection(db, "Catégorie");
      const categoriesSnapshot = await getDocs(categoriesCollection);
      const categoriesList = categoriesSnapshot.docs.map((doc) => doc.data());
      setCategories(categoriesList[0].Catégories);
    };
    getCategories();
  }, []);

  const handleAddOption = async () => {
    if (!selectedSize || !selectedColor || quantity <= 0 || selectedSeuilAlerte <= 0 || !imageFile) return;

    try {
      // 1. Téléverser l'image dans Firebase Storage
      const storageRef = ref(storage, `productOptions/${imageFile.name}`);
      const uploadTask = uploadBytesResumable(storageRef, imageFile);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Gestion de la progression si nécessaire
        },
        (error) => {
          console.error("Erreur lors du téléversement de l'image:", error);
        },
        async () => {
          // 2. Obtenir l'URL de téléchargement de l'image
          const imageUrl = await getDownloadURL(uploadTask.snapshot.ref);

          // 3. Ajouter l'option de produit avec l'URL de l'image
          const existingOption = productOptions.find(option => option.size === selectedSize && option.color === selectedColor);

          if (existingOption) {
            existingOption.quantity += quantity;
            existingOption.imageUrl = imageUrl; // Mettre à jour l'URL de l'image pour l'option existante
            setProductOptions([...productOptions]);
          } else {
            const newOption = { size: selectedSize, color: selectedColor, quantity, seuil: selectedSeuilAlerte, imageUrl };
            setProductOptions([...productOptions, newOption]);
          }

          updateTotalQuantity();
          setSelectedColor("");
          setQuantity(1);
          setSelectedSeuilAlerte(1);
        }
      );
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'option de produit:", error);
    }
    console.log()
  };


  const updateTotalQuantity = () => {
    const total = productOptions.reduce((acc, option) => acc + option.quantity, 0);
    setTotalQuantity(total + quantity);
  };

  const updateTotalPrice = () => {
    setTotalPrice(totalQuantity * unitPrice);
  };

  useEffect(() => {
    updateTotalPrice();
  }, [totalQuantity, unitPrice]);

  const handleDeleteOption = (index: any) => {
    const updatedOptions = productOptions.filter((_, i) => i !== index);
    setProductOptions(updatedOptions);
    const newTotal = updatedOptions.reduce((acc, option) => acc + option.quantity, 0);
    setTotalQuantity(newTotal);
  };

  const handleAddProduct = async () => {
    if (!productName || !selectedCategory || unitPrice <= 0 || totalQuantity <= 0 || !imageFile) {
      return;
    }

    setIsLoading(true);

    try {
      // 3. Ajouter le produit avec l'URL de l'image à Firestore
      const newProduct = {
        name: productName,
        category: selectedCategory,
        unitPrice,
        totalQuantity,
        totalPrice,
        options: productOptions,
        dateAdded: new Date().toISOString(), // Ajouter la date d'ajout
      };

      await addDoc(collection(db, "stock"), newProduct);

      setIsLoading(false);
      alert("Produit ajouté avec succès !");
      // Réinitialiser les champs
      setProductName("");
      setSelectedCategory("");
      setUnitPrice(0);
      setProductOptions([]);
      setTotalQuantity(0);
      setTotalPrice(0);
      setImageFile(null); // Réinitialiser l'image
    } catch (error) {
      setIsLoading(false);
      console.error("Erreur lors de l'ajout du produit:", error);
    }
  };

  const isButtonDisabled = !productName || !selectedCategory || unitPrice <= 0 || totalQuantity <= 0 || isLoading;

  return (
    <div className="bg-white rounded-md border h-full p-4 flex flex-col justify-between">
      <div>
        <h1 className="text-xl font-bold">Ajouter les produits</h1>
        <div className="w-full flex gap-x-5 mt-10">
          <div className="flex flex-col gap-y-3">
            <label>Nom du Produit</label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="h-10 border outline-none rounded-md p-2"
            />
          </div>
          <div className="flex flex-col gap-y-3">
            <label>Catégories</label>
            <Select name="categorieProduit" onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px] h-10 border border-gray-300">
                <SelectValue placeholder="Choisir" />
              </SelectTrigger>
              <SelectContent>
                {categories.length !== 0 &&
                  categories.map((categorie) => (
                    <SelectItem key={categorie} value={categorie}>
                      {categorie}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-y-3">
            <label>Prix unitaire de l'article</label>
            <div className="h-10 border outline-none rounded-md p-2 flex items-center w-[180px]">
              <input
                type="number"
                value={unitPrice}
                onChange={(e) => setUnitPrice(parseFloat(e.target.value))}
                className="h-full outline-none p-2 w-[90%]"
              />
              <span>FCFA</span>
            </div>
          </div>
          <div className="flex flex-col gap-y-3">
            <label>Prix Total du produit</label>
            <div className="h-10 border outline-none bg-[#fafafa] rounded-md p-2 flex items-center w-[180px]">
              <input
                disabled={true}
                type="text"
                value={totalPrice.toFixed(2)}
                className="h-full outline-none bg-[#fafafa] p-2 w-[90%]"
              />
              <span>FCFA</span>
            </div>
          </div>
          <div className="flex flex-col gap-y-3">
            <label>Quantité totale</label>
            <input
              type="number"
              value={totalQuantity}
              className="h-10 border outline-none rounded-md p-2 w-[80px] bg-[#fafafa]"
              disabled={true}
            />
          </div>
        </div>

        {/* Rest of your form */}
        <div className="flex w-full gap-x-7 mt-6">
          <div className="flex flex-col gap-y-3">
            <label>Tailles</label>
            <Select name="Taille" onValueChange={setSelectedSize}>
              <SelectTrigger className="w-[100px] h-10 border border-gray-300">
                <SelectValue placeholder="Choisir" />
              </SelectTrigger>
              <SelectContent>
                {sizes.map((size) => (
                  <SelectItem key={size} value={size}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Affichage des sélecteurs de couleur et quantité uniquement si une taille est sélectionnée */}
          {selectedSize && (
            <div className="flex gap-x-5 items-center">
              <div className="flex flex-col gap-y-3">
                <label>Couleurs</label>
                <Select name="Couleur" value={selectedColor} onValueChange={setSelectedColor}>
                  <SelectTrigger className="w-[100px] h-10 border border-gray-300">
                    <SelectValue placeholder="Choisir" />
                  </SelectTrigger>
                  <SelectContent>
                    {colors.map((color) => (
                      <SelectItem key={color} value={color} style={{ backgroundColor: color }} className="p-1 rounded-md border">
                        {color}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-y-3">
                <label>Quantité</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="h-10 border outline-none rounded-md p-2 w-[80px]"
                />
              </div>
              <div className="flex flex-col gap-y-3">
                <label>Seuil d'alerte</label>
                <input
                  type="number"
                  min="1"
                  value={selectedSeuilAlerte}
                  onChange={(e) => setSelectedSeuilAlerte(parseInt(e.target.value))}
                  className="h-10 border outline-none rounded-md p-2 w-[80px]"
                />
              </div>
              <div className="flex flex-col gap-y-3">
                <label>Image du Produit</label>
                <input
                  type="file"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setImageFile(e.target.files[0]);
                    }
                  }}
                  className="h-10 border outline-none rounded-md p-2 flex-1"
                />
              </div>
              <button onClick={handleAddOption} className="self-end py-1 px-2 rounded-md border">
                <FaPlusCircle size={30} />
              </button>
            </div>
          )}
        </div>

        {/* Affichage des options ajoutées */}
        <div className="my-4">
          {productOptions.length > 0 && (
            <h2 className="font-bold">Options de produit:</h2>
          )}
          {productOptions.length > 0 && (
            <table className="min-w-full border border-gray-300 mt-2">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2">Taille</th>
                  <th className="border border-gray-300 p-2">Couleur</th>
                  <th className="border border-gray-300 p-2">Quantité</th>
                  <th className="border border-gray-300 p-2">Seuil d'alerte</th>
                  <th className="border border-gray-300 p-2">Image</th>
                  <th className="border border-gray-300 p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {productOptions.map((option, index) => (
                  <tr key={index} className="border-b">
                    <td className="border border-gray-300 p-2">{option.size}</td>
                    <td className="border border-gray-300 p-2">{option.color}</td>
                    <td className="border border-gray-300 p-2">{option.quantity}</td>
                    <td className="border border-gray-300 p-2">{option.seuil}</td>
                    <td className="border border-gray-300 p-2">
                      {option.imageUrl ? (
                        <img src={option.imageUrl} alt="Product" className="w-10 h-10 object-cover" />
                      ) : (
                        "Pas d'image"
                      )}
                    </td>
                    <td className="border border-gray-300 p-2">
                      <button onClick={() => handleDeleteOption(index)} className="text-red-500">
                        <IoMdCloseCircle />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <button
        onClick={handleAddProduct}
        className={`flex justify-center gap-x-6 text-white rounded-md items-center px-3 py-2 bg-[#4956f4] ${isButtonDisabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
        disabled={isButtonDisabled}
      >
        {isLoading ? (
          <span className="font-bold text-xl">Chargement...</span>
        ) : (
          <>
            <FaPlusCircle size={28} />
            <span className="font-bold text-xl">Ajouter un Produit</span>
          </>
        )}
      </button>
    </div>
  );
};

export default Page;
