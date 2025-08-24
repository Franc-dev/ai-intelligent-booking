import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  UserCheck, 
  Shield, 
  Calendar, 
  MessageSquare, 
  BarChart3,
  ArrowRight,
  Video,
  Clock,
  Star,
  Brain,
  Zap,
  Heart,
  Award,
  CheckCircle,
  Sparkles
} from "lucide-react"

export default function LandingPage() {
  // Featured counselors data
  const featuredCounselors = [
    {
      name: "Dr. Francis Mwaniki",
      specialties: ["Anxiety", "Depression", "Stress Management"],
      bio: "Licensed clinical psychologist with 8+ years of experience helping clients overcome anxiety, depression, and stress-related challenges.",
      avatar: "/placeholder-user.jpg",
      rating: 4.9,
      sessions: "500+"
    },
    {
      name: "Dr. E-Software Counselor",
      specialties: ["Relationships", "Marriage Counseling", "Communication"],
      bio: "Relationship therapist with expertise in couples counseling, communication skills, and conflict resolution.",
      avatar: "/placeholder-user.jpg",
      rating: 4.8,
      sessions: "300+"
    },
    {
      name: "Dr. Joy Kendi",
      specialties: ["Addiction", "Substance Abuse", "Recovery"],
      bio: "Addiction specialist with extensive experience in substance abuse treatment and recovery support.",
      avatar: "/placeholder-user.jpg",
      rating: 4.9,
      sessions: "400+"
    },
    {
      name: "Dr. Francis Mwaniki (Kabarak)",
      specialties: ["Family Therapy", "Parenting", "Child-Adolescent"],
      bio: "Family therapist specializing in parent-child relationships, adolescent development, and family dynamics.",
      avatar: "/placeholder-user.jpg",
      rating: 4.7,
      sessions: "250+"
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-white border-b-2 border-black shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Brand */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <span className="font-sans font-bold text-xl">AI Booking Agent</span>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/login">
                <Button variant="outline" className="border-2 border-black">
                  Login
                </Button>
              </Link>
              <Link href="/booking">
                <Button className="bg-primary text-primary-foreground">
                  Book Session
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4">
            <Badge variant="secondary" className="text-sm px-3 py-1">
              <Sparkles className="h-3 w-3 mr-1" />
              AI-Powered Booking
            </Badge>
          </div>
          <h1 className="font-sans font-bold text-5xl md:text-6xl mb-6">
            Intelligent Counseling
            <span className="block text-primary">Booking System</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Experience the future of mental health scheduling with our AI-powered platform. 
            Connect with expert counselors through intelligent conversation and instant booking.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/booking">
              <Button size="lg" className="bg-primary text-primary-foreground text-lg px-8 py-6 hover:scale-105 transition-transform">
                <Zap className="mr-2 h-5 w-5" />
                Book Your Session
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="border-2 border-black text-lg px-8 py-6 hover:bg-black hover:text-white transition-colors">
                Access Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* AI Features Highlight */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-sans font-bold text-3xl mb-4">Powered by Advanced AI</h2>
            <p className="text-lg text-muted-foreground">
              Our intelligent booking system understands your needs and books sessions instantly
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center p-6 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-sans font-bold text-lg mb-2">Natural Conversation</h3>
              <p className="text-muted-foreground text-sm">
                Chat naturally with our AI - just say what you need and we'll handle the rest
              </p>
            </div>

            <div className="text-center p-6 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-sans font-bold text-lg mb-2">Instant Booking</h3>
              <p className="text-muted-foreground text-sm">
                One-click approval buttons for immediate session confirmation
              </p>
            </div>

            <div className="text-center p-6 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-sans font-bold text-lg mb-2">Smart Matching</h3>
              <p className="text-muted-foreground text-sm">
                AI automatically finds the best counselor and time for your needs
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Counselors Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-sans font-bold text-4xl mb-4">Meet Our Expert Counselors</h2>
            <p className="text-xl text-muted-foreground">
              Licensed professionals specializing in various areas of mental health
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredCounselors.map((counselor, index) => (
              <Card key={index} className="border-2 border-black hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <CardHeader className="text-center pb-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <img 
                      src={counselor.avatar} 
                      alt={counselor.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  </div>
                  <CardTitle className="font-sans font-bold text-lg">{counselor.name}</CardTitle>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${i < Math.floor(counselor.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">({counselor.rating})</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{counselor.sessions} sessions</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground text-center">{counselor.bio}</p>
                    <div className="flex flex-wrap gap-1 justify-center">
                      {counselor.specialties.map((specialty, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Link href="/booking" className="block">
                    <Button className="w-full bg-primary hover:bg-primary/90">
                      Book Session
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/login">
              <Button variant="outline" size="lg" className="border-2 border-black px-8 py-4">
                View All Counselors
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Role-Based Access Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-sans font-bold text-4xl mb-4">Access Your Dashboard</h2>
            <p className="text-xl text-muted-foreground">
              Choose your role to access the appropriate dashboard and features
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* User Dashboard */}
            <Card className="border-2 border-black hover:shadow-lg transition-shadow group">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="font-sans font-bold text-2xl">User Dashboard</CardTitle>
                <p className="text-muted-foreground">
                  Book sessions and manage your appointments
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    <span>AI-powered booking assistant</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span>Book counseling sessions</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span>Manage your schedule</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Video className="h-4 w-4 text-blue-600" />
                    <span>Join video sessions</span>
                  </div>
                </div>
                <Link href="/login" className="block">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Login as User
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Counselor Dashboard */}
            <Card className="border-2 border-black hover:shadow-lg transition-shadow group">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <UserCheck className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="font-sans font-bold text-2xl">Counselor Dashboard</CardTitle>
                <p className="text-muted-foreground">
                  Manage sessions and client appointments
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-green-600" />
                    <span>View upcoming sessions</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-green-600" />
                    <span>Manage client information</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Video className="h-4 w-4 text-green-600" />
                    <span>Join video sessions</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MessageSquare className="h-4 w-4 text-green-600" />
                    <span>Session notes & records</span>
                  </div>
                </div>
                <Link href="/login" className="block">
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    Login as Counselor
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Admin Dashboard */}
            <Card className="border-2 border-black hover:shadow-lg transition-shadow group">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Shield className="h-8 w-8 text-red-600" />
                </div>
                <CardTitle className="font-sans font-bold text-2xl">Admin Dashboard</CardTitle>
                <p className="text-muted-foreground">
                  System management and oversight
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <BarChart3 className="h-4 w-4 text-red-600" />
                    <span>Meeting room management</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-red-600" />
                    <span>User and counselor management</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="h-4 w-4 text-red-600" />
                    <span>System analytics</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Award className="h-4 w-4 text-red-600" />
                    <span>Quality assurance</span>
                  </div>
                </div>
                <Link href="/login" className="block">
                  <Button className="w-full bg-red-600 hover:bg-red-700">
                    Login as Admin
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-sans font-bold text-4xl mb-4">Why Choose Our Platform?</h2>
            <p className="text-xl text-muted-foreground">
              Advanced features designed for modern counseling practices
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <MessageSquare className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-sans font-bold text-lg mb-2">AI Assistant</h3>
              <p className="text-muted-foreground">
                Intelligent booking with natural language processing and instant approval buttons
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Video className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-sans font-bold text-lg mb-2">Video Sessions</h3>
              <p className="text-muted-foreground">
                Integrated Google Meet video conferencing for seamless remote sessions
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-sans font-bold text-lg mb-2">Smart Scheduling</h3>
              <p className="text-muted-foreground">
                Conflict-free scheduling with automatic room assignment and double-booking prevention
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Shield className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="font-sans font-bold text-lg mb-2">Secure & Private</h3>
              <p className="text-muted-foreground">
                HIPAA-compliant platform with end-to-end encryption and secure data handling
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How to Use Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-sans font-bold text-4xl mb-4">How to Use the Platform</h2>
            <p className="text-xl text-muted-foreground">
              Simple steps to access your role-specific dashboard
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
                <h3 className="font-sans font-bold text-lg mb-2">Choose Your Role</h3>
                <p className="text-muted-foreground">
                  Select from User, Counselor, or Admin based on your needs
                </p>
              </div>

              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-2xl font-bold text-green-600">2</span>
                </div>
                <h3 className="font-sans font-bold text-lg mb-2">Login with Email</h3>
                <p className="text-muted-foreground">
                  Use your email to receive a magic link for secure access
                </p>
              </div>

              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-2xl font-bold text-purple-600">3</span>
                </div>
                <h3 className="font-sans font-bold text-lg mb-2">Access Dashboard</h3>
                <p className="text-muted-foreground">
                  Automatically redirected to your role-specific dashboard
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-primary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-sans font-bold text-4xl mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of users and counselors who trust our AI-powered platform for their mental health needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="bg-primary text-primary-foreground text-lg px-8 py-6 hover:scale-105 transition-transform">
                <Heart className="mr-2 h-5 w-5" />
                Login to Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/booking">
              <Button size="lg" variant="outline" className="border-2 border-black text-lg px-8 py-6 hover:bg-black hover:text-white transition-colors">
                <Zap className="mr-2 h-5 w-5" />
                Book Your First Session
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-12 border-t">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
              <Brain className="h-4 w-4 text-white" />
            </div>
            <span className="font-sans font-bold text-lg">AI Booking Agent</span>
          </div>
          <p className="text-muted-foreground">
            © 2024 AI Booking Agent. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
