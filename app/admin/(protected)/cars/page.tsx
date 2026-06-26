"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Car {
  _id: string;
  name: string;
}

export default function Cars() {
  const [cars, setCars] = useState<Car[]>([]);

  useEffect(() => {
    fetch("/api/cars").then(res => res.json()).then(setCars);
  }, []);

  const deleteCar = async (id: string) => {
    await fetch(`/api/cars/${id}`, { method: "DELETE" });
    setCars(cars.filter(c => c._id !== id));
  };

  return (
    <div className="p-6">
      {cars.map((car) => (
        <div key={car._id} className="flex justify-between">
          <span>{car.name}</span>
          <div>
            <Link href={`/admin/cars/edit/${car._id}`}>Edit</Link>
            <button onClick={() => deleteCar(car._id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}
