import { Calendar } from "@/components/ui/calendar"
import { Shield, CheckCircle, Clock, Award, FileText, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

const inspectionFeatures = [
  {
    icon: Shield,
    title: "200+ Point Inspection",
    description: "Comprehensive check of engine, transmission, brakes, and more",
  },
  {
    icon: CheckCircle,
    title: "Certified Technicians",
    description: "Inspections performed by ASE certified automotive experts",
  },
  {
    icon: Clock,
    title: "Quick Turnaround",
    description: "Get your inspection report within 24 hours",
  },
  {
    icon: Award,
    title: "Detailed Report",
    description: "Comprehensive report with photos and recommendations",
  },
]

const inspectionProcess = [
  {
    step: 1,
    title: "Book Inspection",
    description: "Schedule an appointment online or call us",
    icon: Calendar,
  },
  {
    step: 2,
    title: "Vehicle Assessment",
    description: "Our expert technician inspects your car thoroughly",
    icon: FileText,
  },
  {
    step: 3,
    title: "Photo Documentation",
    description: "High-quality photos of any issues or damages",
    icon: Camera,
  },
  {
    step: 4,
    title: "Detailed Report",
    description: "Receive comprehensive inspection report with recommendations",
    icon: Award,
  },
]

const inspectionChecklist = [
  "Engine Performance & Oil Analysis",
  "Transmission & Clutch System",
  "Brake System & Safety Features",
  "Suspension & Steering",
  "Electrical System & Lights",
  "Air Conditioning & Heating",
  "Exterior Body & Paint Condition",
  "Interior Condition & Electronics",
  "Tire Condition & Alignment",
  "Exhaust System & Emissions",
  "Battery & Charging System",
  "Fluid Levels & Leaks Check",
]

export default function CarInspectionPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/used-cars">Used Cars</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Car Inspection</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Professional Car Inspection</h1>
          <p className="text-xl text-gray-600 mb-8">
            Get a comprehensive inspection report before buying or selling your car
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Book Inspection Now
            </Button>
            <Button size="lg" variant="outline">
              View Sample Report
            </Button>
          </div>
        </div>

        {/* Features */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Why Choose Our Inspection Service?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {inspectionFeatures.map((feature, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <feature.icon className="w-12 h-12 mx-auto text-blue-600 mb-4" />
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Inspection Process */}
        <section className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Our Inspection Process</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {inspectionProcess.map((process, index) => (
                  <div key={index} className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-blue-600">{process.step}</span>
                    </div>
                    <h3 className="font-semibold mb-2">{process.title}</h3>
                    <p className="text-gray-600 text-sm">{process.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Inspection Checklist */}
        <section className="mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>200+ Point Inspection Checklist</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {inspectionChecklist.map((item, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Inspection Packages</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-2">Basic Inspection</h3>
                  <p className="text-2xl font-bold text-blue-600 mb-2">₹2,999</p>
                  <ul className="text-sm text-gray-600 space-y-1 mb-4">
                    <li>• 150+ Point Inspection</li>
                    <li>• Basic Report with Photos</li>
                    <li>• 24 Hour Delivery</li>
                  </ul>
                  <Button className="w-full">Choose Basic</Button>
                </div>

                <div className="border-2 border-blue-500 rounded-lg p-4 relative">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs">
                    Most Popular
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Premium Inspection</h3>
                  <p className="text-2xl font-bold text-blue-600 mb-2">₹4,999</p>
                  <ul className="text-sm text-gray-600 space-y-1 mb-4">
                    <li>• 200+ Point Inspection</li>
                    <li>• Detailed Report with HD Photos</li>
                    <li>• Market Valuation Report</li>
                    <li>• 12 Hour Delivery</li>
                    <li>• Phone Consultation</li>
                  </ul>
                  <Button className="w-full">Choose Premium</Button>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-2">Comprehensive Inspection</h3>
                  <p className="text-2xl font-bold text-blue-600 mb-2">₹7,999</p>
                  <ul className="text-sm text-gray-600 space-y-1 mb-4">
                    <li>• 250+ Point Inspection</li>
                    <li>• Complete Diagnostic Report</li>
                    <li>• Market Valuation & Trends</li>
                    <li>• 6 Hour Delivery</li>
                    <li>• Video Call Consultation</li>
                    <li>• 30-Day Warranty on Report</li>
                  </ul>
                  <Button className="w-full">Choose Comprehensive</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center bg-blue-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Ready to Get Your Car Inspected?</h2>
          <p className="text-gray-600 mb-6">Book your professional car inspection today and make informed decisions</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg">Book Inspection Now</Button>
            <Button size="lg" variant="outline">
              Call: +91 1800-123-4567
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}
