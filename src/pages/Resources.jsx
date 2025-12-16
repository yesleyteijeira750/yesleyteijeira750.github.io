import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Mail, Globe, MapPin, Plus, Search, Briefcase, Home, Heart, GraduationCap, DollarSign, Scale } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ResourcesPage() {
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterResources();
  }, [resources, searchTerm, categoryFilter]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      const data = await base44.entities.Resource.list();
      setResources(data);
    } catch (error) {
      console.error("Error loading resources:", error);
      setUser(null);
    }
    setIsLoading(false);
  };

  const filterResources = () => {
    let filtered = resources;

    if (searchTerm) {
      filtered = filtered.filter(r =>
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(r => r.category === categoryFilter);
    }

    setFilteredResources(filtered);
  };

  const categoryIcons = {
    housing: Home,
    employment: Briefcase,
    healthcare: Heart,
    education: GraduationCap,
    financial: DollarSign,
    legal: Scale
  };

  const categoryColors = {
    housing: "bg-blue-100 text-blue-800",
    employment: "bg-green-100 text-green-800",
    healthcare: "bg-red-100 text-red-800",
    education: "bg-purple-100 text-purple-800",
    financial: "bg-yellow-100 text-yellow-800",
    legal: "bg-gray-100 text-gray-800",
    other: "bg-amber-100 text-amber-800"
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#8B4513] to-[#D2691E] rounded-2xl mb-3">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#5C2E0F] mb-2">
            Community Resources
          </h1>
          <p className="text-[#8B4513] text-lg">
            Find helpful services and support in our community
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8B4513]/50 w-5 h-5" />
            <Input
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-amber-300"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-48 border-amber-300">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="housing">Housing</SelectItem>
              <SelectItem value="employment">Employment</SelectItem>
              <SelectItem value="healthcare">Healthcare</SelectItem>
              <SelectItem value="education">Education</SelectItem>
              <SelectItem value="financial">Financial Aid</SelectItem>
              <SelectItem value="legal">Legal Services</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Resources Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B4513] mx-auto" />
          </div>
        ) : filteredResources.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map(resource => {
              const CategoryIcon = categoryIcons[resource.category] || Heart;
              return (
                <Card key={resource.id} className="border-amber-200 hover:shadow-lg transition-shadow">
                  <CardHeader className="bg-[#F5EFE6]">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Badge className={`${categoryColors[resource.category]} mb-2`}>
                          <CategoryIcon className="w-3 h-3 mr-1" />
                          {resource.category}
                        </Badge>
                        <CardTitle className="text-[#5C2E0F]">{resource.title}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="text-[#8B4513] mb-4">{resource.description}</p>
                    
                    <div className="space-y-2">
                      {resource.contact_name && (
                        <div className="text-sm text-[#8B4513]">
                          <strong>Contact:</strong> {resource.contact_name}
                        </div>
                      )}

                      {resource.phone && (
                        <a
                          href={`tel:${resource.phone}`}
                          className="flex items-center gap-2 text-sm text-[#8B4513] hover:text-[#5C2E0F]"
                        >
                          <Phone className="w-4 h-4" />
                          {resource.phone}
                        </a>
                      )}

                      {resource.email && (
                        <a
                          href={`mailto:${resource.email}`}
                          className="flex items-center gap-2 text-sm text-[#8B4513] hover:text-[#5C2E0F]"
                        >
                          <Mail className="w-4 h-4" />
                          {resource.email}
                        </a>
                      )}

                      {resource.website && (
                        <a
                          href={resource.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-[#8B4513] hover:text-[#5C2E0F]"
                        >
                          <Globe className="w-4 h-4" />
                          Visit Website
                        </a>
                      )}

                      {resource.address && (
                        <div className="flex items-start gap-2 text-sm text-[#8B4513]">
                          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>{resource.address}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="border-amber-200">
            <CardContent className="p-12 text-center">
              <Heart className="w-16 h-16 text-[#8B4513] opacity-30 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-[#5C2E0F] mb-2">No Resources Found</h3>
              <p className="text-[#8B4513]">
                {searchTerm || categoryFilter !== "all"
                  ? "Try adjusting your search or filter."
                  : "Resources will be added soon."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}