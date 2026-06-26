"use client";

import { useState } from "react";

interface Variant {
  name: string;
  price: number;
  fuelType: string;
  transmission: string;
  mileage: string;
}

interface CarForm {
  name: string;
  brand: string;
  priceDisplay: string;
  image: string;
  images: string[];
  variants: Variant[];
}

export default function AddCar() {
  const [car, setCar] = useState<CarForm>({
    name: "", brand: "", priceDisplay: "", image: "", images: [], variants: [],
  });

  const addVariant = () => {
    setCar({ ...car, variants: [...car.variants, { name: "", price: 0, fuelType: "", transmission: "", mileage: "" }] });
  };

  const updateVariant = (index: number, key: keyof Variant, value: string | number) => {
    const updated = [...car.variants];
    updated[index] = { ...updated[index], [key]: value };
    setCar({ ...car, variants: updated });
  };

  const handleSubmit = async () => {
    await fetch("/api/cars", { method: "POST", body: JSON.stringify(car) });
    alert("Car Added ✅");
  };

  return (
    <div className="p-6">
      <h2>Add Car</h2>
      <input placeholder="Car Name" onChange={(e) => setCar({ ...car, name: e.target.value })} />
      <input placeholder="Brand" onChange={(e) => setCar({ ...car, brand: e.target.value })} />
      <h3>Variants</h3>
      {car.variants.map((v, i) => (
        <div key={i}>
          <input placeholder="Name" onChange={(e) => updateVariant(i, "name", e.target.value)} />
          <input placeholder="Price" onChange={(e) => updateVariant(i, "price", Number(e.target.value))} />
        </div>
      ))}
      <button onClick={addVariant}>+ Add Variant</button>
      <button onClick={handleSubmit}>Save</button>
    </div>
  );
}
