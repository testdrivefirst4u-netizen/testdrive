import { BrandForm } from "@/components/admin/brand-form";

export default function NewBrandPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Add Brand</h1>
        <p className="text-sm text-gray-500 mt-1">Create a new vehicle brand</p>
      </div>
      <BrandForm />
    </div>
  );
}
