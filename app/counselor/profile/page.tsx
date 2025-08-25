import { getCurrentUser } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { User, Mail, Phone, MapPin, Calendar, Clock, Settings, Save, Edit, Eye, EyeOff } from "lucide-react"

export default async function CounselorProfilePage() {
  const user = await getCurrentUser()
  
  if (!user || user.role !== "COUNSELOR") {
    redirect("/dashboard")
  }

  // Get counselor details
  const counselor = await prisma.counselor.findUnique({
    where: { id: user.id }
  })

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">Manage your counselor profile and preferences</p>
        </div>
        <Button>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      {/* Profile Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <div className="w-24 h-24 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <User className="h-12 w-12 text-blue-600" />
            </div>
            <CardTitle>{counselor?.name || user.name || 'Counselor'}</CardTitle>
            <CardDescription>{counselor?.email || user.email}</CardDescription>
            <div className="flex justify-center mt-2">
              <Badge variant="secondary">Counselor</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {counselor?.specialties?.length || 0}
              </div>
              <div className="text-sm text-gray-600">Specialties</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                Active
              </div>
              <div className="text-sm text-gray-600">Status</div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Profile Statistics</CardTitle>
            <CardDescription>Your counseling practice overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">0</div>
                <div className="text-sm text-gray-600">Total Sessions</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">0</div>
                <div className="text-sm text-gray-600">Active Clients</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">0</div>
                <div className="text-sm text-gray-600">Years Experience</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">100%</div>
                <div className="text-sm text-gray-600">Availability</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
          <CardDescription>
            Update your personal details and contact information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input 
                id="firstName" 
                defaultValue={counselor?.name?.split(' ')[0] || ''} 
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input 
                id="lastName" 
                defaultValue={counselor?.name?.split(' ').slice(1).join(' ') || ''} 
                className="mt-1"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                defaultValue={counselor?.email || user.email || ''} 
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input 
                id="phone" 
                type="tel" 
                placeholder="+1 (555) 123-4567" 
                className="mt-1"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="bio">Professional Bio</Label>
            <Textarea 
              id="bio" 
              defaultValue={counselor?.bio || ''} 
              placeholder="Tell clients about your background, approach, and expertise..."
              className="mt-1"
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Professional Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Professional Information
          </CardTitle>
          <CardDescription>
            Manage your professional credentials and specialties
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="license">License Number</Label>
              <Input 
                id="license" 
                placeholder="e.g., LPC-12345" 
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="experience">Years of Experience</Label>
              <Select defaultValue="5-10">
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-2">0-2 years</SelectItem>
                  <SelectItem value="3-5">3-5 years</SelectItem>
                  <SelectItem value="5-10">5-10 years</SelectItem>
                  <SelectItem value="10-15">10-15 years</SelectItem>
                  <SelectItem value="15+">15+ years</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="specialties">Specialties</Label>
            <Textarea 
              id="specialties" 
              defaultValue={counselor?.specialties?.join(', ') || ''} 
              placeholder="e.g., Anxiety, Depression, Relationship Counseling, Trauma Therapy..."
              className="mt-1"
              rows={3}
            />
            <p className="text-sm text-gray-500 mt-1">
              Separate multiple specialties with commas
            </p>
          </div>
          
          <div>
            <Label htmlFor="education">Education & Certifications</Label>
            <Textarea 
              id="education" 
              placeholder="List your degrees, certifications, and training..."
              className="mt-1"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Availability Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Availability & Schedule
          </CardTitle>
          <CardDescription>
            Configure your working hours and availability preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="workDays">Working Days</Label>
              <Select defaultValue="weekdays">
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select working days" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekdays">Monday - Friday</SelectItem>
                  <SelectItem value="weekends">Saturday - Sunday</SelectItem>
                  <SelectItem value="all">All Days</SelectItem>
                  <SelectItem value="custom">Custom Schedule</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="sessionLength">Default Session Length</Label>
              <Select defaultValue="60">
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select session length" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                  <SelectItem value="90">90 minutes</SelectItem>
                  <SelectItem value="120">120 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime">Start Time</Label>
              <Input 
                id="startTime" 
                type="time" 
                defaultValue="09:00" 
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="endTime">End Time</Label>
              <Input 
                id="endTime" 
                type="time" 
                defaultValue="17:00" 
                className="mt-1"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch id="autoAccept" />
            <Label htmlFor="autoAccept">Auto-accept new bookings</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch id="notifications" defaultChecked />
            <Label htmlFor="notifications">Email notifications for new bookings</Label>
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Privacy & Security
          </CardTitle>
          <CardDescription>
            Manage your privacy settings and account security
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch id="profileVisibility" defaultChecked />
            <Label htmlFor="profileVisibility">Make profile visible to clients</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch id="showSpecialties" defaultChecked />
            <Label htmlFor="showSpecialties">Show specialties on profile</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch id="showExperience" defaultChecked />
            <Label htmlFor="showExperience">Show years of experience</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch id="twoFactor" />
            <Label htmlFor="twoFactor">Enable two-factor authentication</Label>
          </div>
          
          <div className="pt-4">
            <Button variant="outline" className="mr-2">
              Change Password
            </Button>
            <Button variant="outline">
              Export My Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Profile Preview</CardTitle>
            <CardDescription>See how clients view your profile</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              Preview Profile
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Profile Photo</CardTitle>
            <CardDescription>Update your profile picture</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <User className="h-4 w-4 mr-2" />
              Upload Photo
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Account Settings</CardTitle>
            <CardDescription>Manage account preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Account Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
