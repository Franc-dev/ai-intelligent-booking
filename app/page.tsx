import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MessageSquare, Users, Clock, CheckCircle, ArrowRight } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-sans font-bold text-5xl md:text-6xl mb-6">
            AI-Powered
            <br />
            <span className="text-primary">Counseling</span>
            <br />
            <span className="text-primary">Scheduling</span>
          </h1>
          <p className="text-xl text-muted-foreground font-sans mb-8 max-w-2xl mx-auto">
            Experience intelligent, automated booking for your counseling sessions. 
            Our AI understands your needs and finds the perfect time with expert counselors.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/booking">
              <Button size="lg" className="border-2 border-black shadow-sm font-sans font-semibold text-lg px-8 py-6">
                Start Booking Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="lg" className="border-2 border-black shadow-sm font-sans font-semibold text-lg px-8 py-6">
                View Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-sans font-bold text-3xl md:text-4xl mb-4">
              Why Choose AI Booking?
            </h2>
            <p className="text-lg text-muted-foreground font-sans max-w-2xl mx-auto">
              Our intelligent system makes scheduling counseling sessions effortless and personalized
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 border-black shadow-sm">
              <CardHeader>
                <CardTitle>
                  <div className="w-12 h-12 bg-primary text-primary-foreground flex items-center justify-center border-2 border-black mb-4">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <span className="font-sans font-bold">AI Conversation</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground font-sans">
                  Chat naturally with our AI to describe your needs. It understands context and suggests the best counselors and times.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-black shadow-sm">
              <CardHeader>
                <CardTitle>
                  <div className="w-12 h-12 bg-primary text-primary-foreground flex items-center justify-center border-2 border-black mb-4">
                    <Calendar className="w-6 h-6" />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground font-sans">
                  Automatic meeting room assignment ensures no conflicts. Your sessions are scheduled with precision and efficiency.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-black shadow-sm">
              <CardHeader>
                <CardTitle>
                  <div className="w-12 h-12 bg-primary text-primary-foreground flex items-center justify-center border-2 border-black mb-4">
                    <Users className="w-6 h-6" />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground font-sans">
                  Expert counselors specialized in various areas: anxiety, depression, relationships, family therapy, and more.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-black shadow-sm">
              <CardHeader>
                <CardTitle>
                  <div className="w-12 h-12 bg-primary text-primary-foreground flex items-center justify-center border-2 border-black mb-4">
                    <Clock className="w-6 h-6" />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground font-sans">
                  Flexible scheduling with your preferred time slots. Morning, afternoon, or evening - we work around your schedule.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-black shadow-sm">
              <CardHeader>
                <CardTitle>
                  <div className="w-12 h-12 bg-primary text-primary-foreground flex items-center justify-center border-2 border-black mb-4">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground font-sans">
                  Instant confirmations with beautiful email templates. All meeting details and video conference links included.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-black shadow-sm">
              <CardHeader>
                <CardTitle>
                  <div className="w-12 h-12 bg-primary text-primary-foreground flex items-center justify-center border-2 border-black mb-4">
                    <Badge className="w-6 h-6 p-0 bg-transparent text-primary-foreground">AI</Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground font-sans">
                  Smart conflict detection prevents double-booking. Our system ensures smooth scheduling for everyone.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-sans font-bold text-3xl md:text-4xl mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground font-sans">
              Simple steps to get your counseling session scheduled
            </p>
          </div>

          <div className="space-y-8">
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-primary text-primary-foreground flex items-center justify-center border-2 border-black rounded-full font-sans font-bold text-lg flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="font-sans font-bold text-xl mb-2">Start a Conversation</h3>
                <p className="text-muted-foreground font-sans">
                  Visit the booking page and start chatting with our AI. Tell it about your counseling needs, concerns, or what you're looking for.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-primary text-primary-foreground flex items-center justify-center border-2 border-black rounded-full font-sans font-bold text-lg flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="font-sans font-bold text-xl mb-2">AI Recommendations</h3>
                <p className="text-muted-foreground font-sans">
                  Our AI analyzes your needs and suggests the best counselors and available time slots. It considers your preferences and counselor specialties.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-primary text-primary-foreground flex items-center justify-center border-2 border-black rounded-full font-sans font-bold text-lg flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="font-sans font-bold text-xl mb-2">Confirm & Schedule</h3>
                <p className="text-muted-foreground font-sans">
                  Review the suggested options and confirm your booking. The system automatically assigns a meeting room and sends you a confirmation email.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-primary text-primary-foreground flex items-center justify-center border-2 border-black rounded-full font-sans font-bold text-lg flex-shrink-0">
                4
              </div>
              <div>
                <h3 className="font-sans font-bold text-xl mb-2">Join Your Session</h3>
                <p className="text-muted-foreground font-sans">
                  On the day of your session, use the meeting link from your confirmation email to join your video conference with your counselor.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-sans font-bold text-3xl md:text-4xl mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg mb-8 opacity-90 font-sans">
            Join thousands of users who have simplified their counseling scheduling with AI
          </p>
          <Link href="/booking">
            <Button size="lg" variant="secondary" className="border-2 border-black shadow-sm font-sans font-semibold text-lg px-8 py-6">
              Book Your First Session
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
