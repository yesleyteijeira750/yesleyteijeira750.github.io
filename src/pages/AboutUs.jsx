import React from "react";
import { motion } from "framer-motion";
import { Heart, Users, HandHeart, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function AboutUsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#8B4513] via-[#A0522D] to-[#D2691E] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1200')] bg-cover bg-center opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl mb-6">
              <Heart className="w-10 h-10 fill-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              About Bountiful Blessings
            </h1>
            <p className="text-xl sm:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              Serving Charlotte County with love and compassion
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <Card className="border-2 border-amber-200 shadow-xl">
            <CardContent className="p-8 sm:p-12">
              <h2 className="text-3xl font-bold text-[#5C2E0F] mb-6">Our Mission</h2>
              <p className="text-lg text-[#8B4513] leading-relaxed mb-4">
                At <strong>Bountiful Blessings of Charlotte County Inc.</strong>, our mission is simple yet profound: 
                <span className="block mt-4 text-xl font-semibold text-[#5C2E0F]">
                  "Our goal is that no one goes to bed hungry."
                </span>
              </p>
              <p className="text-lg text-[#8B4513] leading-relaxed">
                We are dedicated to fighting hunger in our community by providing nutritious food, resources, 
                and support to families and individuals in need. Through compassion, collaboration, and commitment, 
                we strive to make a meaningful difference in the lives of those we serve.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Values Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-amber-200 hover:shadow-xl transition-shadow h-full">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[#8B4513] to-[#D2691E] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-white fill-white" />
                </div>
                <h3 className="text-xl font-bold text-[#5C2E0F] mb-3">Compassion</h3>
                <p className="text-[#8B4513]">
                  We serve our community with empathy, kindness, and genuine care for every individual.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-amber-200 hover:shadow-xl transition-shadow h-full">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[#8B4513] to-[#D2691E] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#5C2E0F] mb-3">Community</h3>
                <p className="text-[#8B4513]">
                  Together, we build a stronger community where everyone has access to nutritious food.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="border-amber-200 hover:shadow-xl transition-shadow h-full">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[#8B4513] to-[#D2691E] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <HandHeart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#5C2E0F] mb-3">Service</h3>
                <p className="text-[#8B4513]">
                  We are committed to serving those in need with dignity, respect, and unwavering dedication.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* What We Do */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="border-2 border-amber-200 shadow-xl">
            <CardContent className="p-8 sm:p-12">
              <div className="flex items-center gap-3 mb-6">
                <Target className="w-8 h-8 text-[#8B4513]" />
                <h2 className="text-3xl font-bold text-[#5C2E0F]">What We Do</h2>
              </div>
              <div className="space-y-4 text-lg text-[#8B4513]">
                <p className="flex items-start gap-3">
                  <span className="text-2xl">🍎</span>
                  <span><strong>Food Distribution:</strong> We provide regular food distributions to ensure families have access to fresh, nutritious meals.</span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="text-2xl">🤝</span>
                  <span><strong>Community Events:</strong> We organize events that bring our community together and raise awareness about food insecurity.</span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="text-2xl">💝</span>
                  <span><strong>Volunteer Opportunities:</strong> We welcome volunteers who share our passion for helping others and making a difference.</span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="text-2xl">📦</span>
                  <span><strong>Donation Drives:</strong> We accept and distribute donations of food, funds, and other essential resources to those in need.</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-12 text-center bg-gradient-to-r from-[#8B4513] to-[#D2691E] rounded-2xl p-8 sm:p-12 text-white shadow-xl"
        >
          <h2 className="text-3xl font-bold mb-4">Join Us in Making a Difference</h2>
          <p className="text-xl mb-6 opacity-90">
            Whether through volunteering, donating, or spreading the word, you can help us ensure that no one in our community goes to bed hungry.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+19418838439"
              className="inline-flex items-center justify-center px-8 py-3 bg-white text-[#8B4513] rounded-xl font-semibold hover:bg-amber-100 transition-colors"
            >
              📞 Call Us: (941) 883-8439
            </a>
            <a
              href="mailto:aguilesa@gmail.com"
              className="inline-flex items-center justify-center px-8 py-3 bg-white text-[#8B4513] rounded-xl font-semibold hover:bg-amber-100 transition-colors"
            >
              📧 Email Us
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}