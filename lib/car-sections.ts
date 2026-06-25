import { carsDatabase } from "./cars-database"

export const mostSearchedCars = carsDatabase
  .filter(car => car.isPopular)
  .slice(0, 8)

export const electricCars = carsDatabase
  .filter(car => car.isElectric)

export const upcomingCars = carsDatabase
  .filter(car => car.isUpcoming)

export const suvCars = carsDatabase
  .filter(car => car.bodyType === "SUV")

export const hatchbackCars = carsDatabase
  .filter(car => car.bodyType === "Hatchback")

export const sedanCars = carsDatabase
  .filter(car => car.bodyType === "Sedan")

export const marutiCars = carsDatabase
  .filter(car => car.brand === "Maruti Suzuki")

export const latestCars = carsDatabase
  .sort((a,b)=> b.launchYear - a.launchYear)
  .slice(0,8)