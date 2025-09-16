import { addRepresentative } from "@/lib/supabase-utils";

export function AddRepresentativeModal({ isOpen, onClose, onAdd }: { isOpen: boolean; onClose: () => void; onAdd: (representative: any) => void; }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    licenseNumber: "",
    emergencyContact: "",
    vehicle: "",
    status: "active",
    coverageAreas: [] as string[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const representativeId = await generateRepresentativeId();
    const newRepresentative = {
      id: representativeId,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      license_number: formData.licenseNumber,
      emergency_contact: formData.emergencyContact,
      vehicle: formData.vehicle,
      status: formData.status,
      coverage_areas: formData.coverageAreas,
    };

    const { data, error } = await addRepresentative(newRepresentative);
    if (error) {
      console.error('Error adding representative:', error);
    } else {
      onAdd(data);
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        licenseNumber: "",
        emergencyContact: "",
        vehicle: "",
        status: "active",
        coverageAreas: [],
      });
      onClose();
    }
  };

  return (
    <div>
      <h2>Add New Representative</h2>
      {/* Form elements */}
    </div>
  );
}
