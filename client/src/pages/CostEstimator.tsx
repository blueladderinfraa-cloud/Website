import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useContentManager } from "@/hooks/useContentManager";
import {
  Calculator,
  ArrowRight,
  Building2,
  Home as HomeIcon,
  Factory,
  Landmark,
  Info,
} from "lucide-react";

const constructionTypes = [
  { value: "residential", label: "Residential", icon: HomeIcon, description: "Homes, apartments, housing complexes" },
  { value: "commercial", label: "Commercial", icon: Building2, description: "Offices, retail, hotels" },
  { value: "industrial", label: "Industrial", icon: Factory, description: "Warehouses, factories, plants" },
  { value: "infrastructure", label: "Infrastructure", icon: Landmark, description: "Roads, bridges, utilities" },
];

const qualityLevels = [
  { value: "basic", label: "Basic", description: "Standard materials and finishes" },
  { value: "standard", label: "Standard", description: "Quality materials with modern finishes" },
  { value: "premium", label: "Premium", description: "High-end materials and custom features" },
  { value: "luxury", label: "Luxury", description: "Top-tier materials and bespoke design" },
];

export default function CostEstimator() {
  // Get pricing from admin panel
  const { getPricingContent } = useContentManager();
  const costRates = getPricingContent();

  const [area, setArea] = useState<number>(2000);
  const [constructionType, setConstructionType] = useState<string>("residential");
  const [qualityLevel, setQualityLevel] = useState<string>("standard");
  const [floors, setFloors] = useState<number>(1);
  const [includeBasement, setIncludeBasement] = useState<boolean>(false);
  const [includeLandscaping, setIncludeLandscaping] = useState<boolean>(false);

  const estimate = useMemo(() => {
    const rate = costRates[constructionType as keyof typeof costRates][qualityLevel as keyof typeof costRates.residential];
    
    // Base calculation
    let totalArea = area * floors;
    if (includeBasement) totalArea += area * 0.8; // Basement is 80% of floor area
    
    let baseCost = totalArea * rate;
    
    // Landscaping adds 5-10% (use 7.5% average)
    if (includeLandscaping) {
      baseCost *= 1.075;
    }
    
    // Multi-floor premium (5% per additional floor)
    if (floors > 1) {
      const floorPremium = 1 + ((floors - 1) * 0.05);
      baseCost *= floorPremium;
    }
    
    return {
      total: Math.round(baseCost),
      perSqFt: rate,
      totalArea,
    };
  }, [area, constructionType, qualityLevel, floors, includeBasement, includeLandscaping, costRates]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1920&h=800&fit=crop')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a1628]/95 to-[#0a1628]/80" />
        </div>
        <div className="container relative z-10">
          <div className="max-w-3xl">
            <span className="text-accent font-semibold text-sm uppercase tracking-wider">Cost Estimator</span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mt-2 mb-6">
              Estimate Your Project Cost
            </h1>
            <p className="text-lg text-white/80">
              Get an instant estimate for your construction project. Our calculator 
              provides a range based on industry standards and your specific requirements.
            </p>
          </div>
        </div>
      </section>

      {/* Calculator Section */}
      <section className="section-padding bg-secondary/30">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Input Form */}
            <div className="space-y-8">
              <Card className="border-0 shadow-elegant">
                <CardContent className="p-8">
                  <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-primary" />
                    Project Details
                  </h2>

                  {/* Construction Type */}
                  <div className="space-y-4 mb-8">
                    <Label className="text-base font-semibold">Construction Type</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {constructionTypes.map((type) => (
                        <button
                          key={type.value}
                          onClick={() => setConstructionType(type.value)}
                          className={`p-4 rounded-xl border-2 text-left transition-all ${
                            constructionType === type.value
                              ? "border-primary bg-primary text-white"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <type.icon className={`w-6 h-6 mb-2 ${
                            constructionType === type.value ? "text-white" : "text-muted-foreground"
                          }`} />
                          <div className={`font-medium ${constructionType === type.value ? "text-white" : "text-foreground"}`}>{type.label}</div>
                          <div className={`text-xs ${constructionType === type.value ? "text-white/80" : "text-muted-foreground"}`}>{type.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Area Input */}
                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-center">
                      <Label className="text-base font-semibold">Area (sq. ft.)</Label>
                      <span className="text-lg font-bold text-primary">{area.toLocaleString()}</span>
                    </div>
                    <Slider
                      value={[area]}
                      onValueChange={(value) => setArea(value[0])}
                      min={500}
                      max={50000}
                      step={100}
                      className="py-4"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>500 sq. ft.</span>
                      <span>50,000 sq. ft.</span>
                    </div>
                  </div>

                  {/* Quality Level */}
                  <div className="space-y-4 mb-8">
                    <Label className="text-base font-semibold">Quality Level</Label>
                    <Select value={qualityLevel} onValueChange={setQualityLevel}>
                      <SelectTrigger className="h-auto py-3">
                        <SelectValue>
                          <div>
                            <div className="font-medium">
                              {qualityLevels.find(l => l.value === qualityLevel)?.label}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {qualityLevels.find(l => l.value === qualityLevel)?.description}
                            </div>
                          </div>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="bg-white z-50">
                        {qualityLevels.map((level) => (
                          <SelectItem key={level.value} value={level.value} className="py-3 cursor-pointer">
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      {qualityLevels.find(l => l.value === qualityLevel)?.description}
                    </p>
                  </div>

                  {/* Number of Floors */}
                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-center">
                      <Label className="text-base font-semibold">Number of Floors</Label>
                      <span className="text-lg font-bold text-primary">{floors}</span>
                    </div>
                    <Slider
                      value={[floors]}
                      onValueChange={(value) => setFloors(value[0])}
                      min={1}
                      max={10}
                      step={1}
                      className="py-4"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>1 floor</span>
                      <span>10 floors</span>
                    </div>
                  </div>

                  {/* Additional Options */}
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Additional Options</Label>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={includeBasement}
                          onChange={(e) => setIncludeBasement(e.target.checked)}
                          className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                        />
                        <span className="text-foreground">Include Basement</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={includeLandscaping}
                          onChange={(e) => setIncludeLandscaping(e.target.checked)}
                          className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                        />
                        <span className="text-foreground">Include Landscaping</span>
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Results */}
            <div className="space-y-6">
              <Card className="border-0 shadow-elegant-lg gradient-primary text-white">
                <CardContent className="p-8">
                  <h2 className="text-xl font-bold mb-6">Estimated Project Cost</h2>
                  
                  <div className="text-center py-8">
                    <div className="text-2xl sm:text-4xl md:text-5xl font-bold mb-2 break-words">
                      {formatCurrency(estimate.total)}
                    </div>
                    <div className="text-white/80">
                      Based on {estimate.totalArea.toLocaleString()} total sq. ft.
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/20">
                    <div>
                      <div className="text-white/70 text-sm">Cost per sq. ft.</div>
                      <div className="font-semibold">
                        ₹{estimate.perSqFt}
                      </div>
                    </div>
                    <div>
                      <div className="text-white/70 text-sm">Total Area</div>
                      <div className="font-semibold">
                        {estimate.totalArea.toLocaleString()} sq. ft.
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-elegant">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div className="text-sm text-muted-foreground">
                      <p className="mb-2">
                        <strong className="text-foreground">Disclaimer:</strong> This estimate is for 
                        informational purposes only and provides a general cost range based on 
                        industry averages.
                      </p>
                      <p>
                        Actual costs may vary based on location, site conditions, material 
                        availability, labor costs, and specific project requirements. Contact us 
                        for a detailed, customized quote.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-elegant bg-accent/10">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-2">
                    Ready for an Accurate Quote?
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Our team can provide a detailed, customized estimate based on your 
                    specific requirements and site conditions.
                  </p>
                  <Link href="/contact">
                    <Button className="w-full gradient-accent text-accent-foreground font-semibold">
                      Request Detailed Quote
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Cost Breakdown */}
              <Card className="border-0 shadow-elegant">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-4">Typical Cost Breakdown</h3>
                  <div className="space-y-3">
                    {[
                      { label: "Foundation & Structure", percentage: "25-30%" },
                      { label: "Exterior & Roofing", percentage: "15-20%" },
                      { label: "Plumbing & Electrical", percentage: "15-20%" },
                      { label: "Interior Finishes", percentage: "20-25%" },
                      { label: "HVAC & Insulation", percentage: "10-15%" },
                      { label: "Permits & Fees", percentage: "5-10%" },
                    ].map((item) => (
                      <div key={item.label} className="flex justify-between items-center">
                        <span className="text-muted-foreground text-sm">{item.label}</span>
                        <span className="font-medium text-foreground text-sm">{item.percentage}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
