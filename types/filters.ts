export interface FilterState {
  priceRange: [number, number];
  selectedBrands: string[];
  selectedFuelTypes: string[];
  selectedTransmissions: string[];
  selectedBodyTypes: string[];
  selectedSegments?: string[];
  searchQuery: string;
}
