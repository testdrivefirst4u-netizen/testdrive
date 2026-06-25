// app/admin/cars/add/page.tsx
"use client";

import { useState } from "react";

export default function AddCar() {
  const [car, setCar] = useState({
    name: "",
    brand: "",
    priceDisplay: "",
    image: "",
    images: [],
    variants: [],
  });

  const addVariant = () => {
    setCar({
      ...car,
      variants: [
        ...car.variants,
        { name: "", price: 0, fuelType: "", transmission: "", mileage: "" },
      ],
    });
  };

  const updateVariant = (index: number, key: string, value: any) => {
    const updated = [...car.variants];
    updated[index][key] = value;

    setCar({ ...car, variants: updated });
  };

  const handleSubmit = async () => {
    await fetch("/api/cars", {
      method: "POST",
      body: JSON.stringify(car),
    });

    alert("Car Added ✅");
  };

  return (
    <div className="p-6">
      <h2>Add Car</h2>

      <input
        placeholder="Car Name"
        onChange={(e) => setCar({ ...car, name: e.target.value })}
      />

      <input
        placeholder="Brand"
        onChange={(e) => setCar({ ...car, brand: e.target.value })}
      />

      {/* VARIANTS */}
      <h3>Variants</h3>
      {car.variants.map((v, i) => (
        <div key={i}>
          <input placeholder="Name" onChange={(e)=>updateVariant(i,"name",e.target.value)} />
          <input placeholder="Price" onChange={(e)=>updateVariant(i,"price",e.target.value)} />
        </div>
      ))}

      <button onClick={addVariant}>+ Add Variant</button>

      <button onClick={handleSubmit}>Save</button>
    </div>
  );
}