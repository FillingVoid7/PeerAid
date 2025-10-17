"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Shield, 
  Clock, 
  MessageCircle, 
  Brain, 
  Heart,
  Lock,
  Smartphone,
  UserCheck,
  Globe,
  Zap,
  Award
} from "lucide-react";

export default function FeaturesSection() {
  const mainFeatures = [
    {
      icon: <UserCheck className="w-6 h-6" />,
      title: "Verified Health Journeys",
      description: "Every guide is verified to ensure authentic health experiences and credible advice.",
      gradient: "from-emerald-500 to-cyan-600",
      benefits: ["Medical documentation", "Community validation", "Authentic experiences"]
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: "Precision Matching", 
      description: "Advanced matching based on symptoms, treatments, and health journey similarities.",
      gradient: "from-violet-500 to-purple-600",
      benefits: ["85% condition similarity", "75% symptom overlap", "70% treatment effectiveness"]
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Complete Privacy Control",
      description: "Encrypted messaging with full anonymity controls and identity protection.",
      gradient: "from-rose-500 to-pink-600",
      benefits: ["End-to-end encryption", "Random usernames", "You control visibility"]
    }
  ];

  const additionalFeatures = [
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: "Structured Health Profiles",
      description: "Organized profiles with symptom tracking for better matching.",
      color: "text-emerald-600"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Audio Support Calls",
      description: "Secure audio calls for deeper peer connections.",
      color: "text-cyan-600"
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "Identity Protection",
      description: "Random usernames with optional profile visibility.",
      color: "text-violet-600"
    },
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: "Multiple Verification",
      description: "Medical documentation and community validation.",
      color: "text-rose-600"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Community Moderation",
      description: "AI filtering with 24/7 human moderation.",
      color: "text-orange-600"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Instant Matching",
      description: "Get matched within minutes of profile completion.",
      color: "text-blue-600"
    }
  ];

  const trustMetrics = [
    {
      icon: <Users className="w-6 h-6" />,
      value: "92%",
      label: "Better Matches",
      description: "More relevant than traditional forums"
    },
    {
      icon: <Award className="w-6 h-6" />,
      value: "87%",
      label: "Confidence Boost",
      description: "Feel more confident in health decisions"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      value: "94%",
      description: "Appreciate our verification system"
    }
  ];

  return (
    <section id="features" className="py-20 bg-gradient-to-br from-muted/30 via-background to-muted/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border bg-background/70 backdrop-blur-sm px-4 py-2 text-sm shadow-sm mb-6">
            <Zap className="w-4 h-4 text-emerald-500" />
            <span className="text-emerald-700 dark:text-emerald-300 font-medium">Powerful Features</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
            <span className="block">Everything you need for</span>
            <span className="bg-gradient-to-r from-emerald-600 via-cyan-600 to-violet-600 bg-clip-text text-transparent">
              meaningful peer support
            </span>
          </h2>
        </div>

        {/* Main Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {mainFeatures.map((feature, index) => (
            <Card key={index} className="border-0 bg-card/50 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 group overflow-hidden relative">
              {/* Background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              
              <CardHeader className="relative">
                <div className={`inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-br ${feature.gradient} text-white shadow-lg mb-6 group-hover:scale-105 transition-transform duration-200`}>
                  {feature.icon}
                  <span className="font-bold text-lg">{feature.title}</span>
                </div>
              </CardHeader>
              
              <CardContent className="relative">
                <p className="text-muted-foreground mb-6 leading-relaxed text-base">
                  {feature.description}
                </p>
                
                <div className="space-y-2">
                  {feature.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-muted-foreground">{benefit}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {trustMetrics.map((metric, index) => (
            <Card key={index} className="border-0 bg-background/60 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-200 group text-center">
              <CardContent className="p-6">
                <div className="flex justify-center mb-3">
                  <div className="p-3 rounded-full bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 text-emerald-600 group-hover:scale-110 transition-transform">
                    {metric.icon}
                  </div>
                </div>
                <div className="text-2xl font-bold mb-1">{metric.value}</div>
                <div className="text-sm font-medium text-emerald-600 mb-1">{metric.label}</div>
                <div className="text-xs text-muted-foreground">{metric.description}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {additionalFeatures.map((feature, index) => (
            <Card key={index} className="border-0 bg-background/40 backdrop-blur-sm hover:bg-background/60 transition-all duration-200 group">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br from-current/10 to-current/5 ${feature.color} group-hover:scale-110 transition-transform`}>
                    {feature.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold mb-2 group-hover:text-emerald-600 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="inline-block p-8 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-cyan-500/10 to-violet-500/10 border border-emerald-200/20 dark:border-emerald-800/20">
            <h3 className="text-2xl font-bold mb-4">
              Ready to experience the difference?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Join thousands of members who have found meaningful support and lasting connections.
            </p>
            <Button 
              size="lg"
              className="bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              asChild
            >
              <a href="#hero">
                <Heart className="w-5 h-5 mr-2" />
                Get Started Today
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}