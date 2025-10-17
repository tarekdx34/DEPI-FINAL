import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Eye, Heart } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-5xl font-bold text-foreground">About Ajarly</h1>
            <p className="text-xl text-muted-foreground">
              Connecting people with their perfect coastal getaway
            </p>
          </div>

          <div className="mb-16 space-y-6 text-lg leading-relaxed text-muted-foreground">
            <p>
              Ajarly (أجارلي) is a local vacation rental platform dedicated to showcasing the
              beautiful coastal properties of Alexandria and Matrouh, Egypt. We believe that finding
              your perfect vacation home should be simple, trustworthy, and tailored to your needs.
            </p>
            <p>
              Unlike global platforms, we focus on local expertise and personal connections. Every
              property on our platform is carefully verified, and we work closely with property
              owners and guests to ensure exceptional experiences.
            </p>
          </div>

          <div className="mb-16 grid gap-8 md:grid-cols-3">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                  <Target className="h-10 w-10 text-primary" />
                </div>
                <h3 className="mb-3 text-2xl font-bold text-foreground">Our Mission</h3>
                <p className="text-muted-foreground">
                  To make vacation rental search and booking simple, transparent, and enjoyable for
                  everyone in the MENA region.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                  <Eye className="h-10 w-10 text-primary" />
                </div>
                <h3 className="mb-3 text-2xl font-bold text-foreground">Our Vision</h3>
                <p className="text-muted-foreground">
                  To become the most trusted vacation rental platform across Egypt and expand
                  throughout the MENA region.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                  <Heart className="h-10 w-10 text-primary" />
                </div>
                <h3 className="mb-3 text-2xl font-bold text-foreground">Our Values</h3>
                <p className="text-muted-foreground">
                  Trust, transparency, and exceptional service guide everything we do for our
                  community of guests and hosts.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="rounded-2xl bg-muted/30 p-8 md:p-12">
            <h2 className="mb-6 text-3xl font-bold text-foreground">Why Choose Ajarly?</h2>
            <ul className="space-y-4 text-lg text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="mt-1 text-primary">✓</span>
                <span>
                  <strong className="text-foreground">Local Expertise:</strong> We know Alexandria
                  and Matrouh like the back of our hand
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 text-primary">✓</span>
                <span>
                  <strong className="text-foreground">Verified Properties:</strong> Every listing is
                  checked and verified by our team
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 text-primary">✓</span>
                <span>
                  <strong className="text-foreground">Direct Communication:</strong> Connect directly
                  with property owners for personalized service
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 text-primary">✓</span>
                <span>
                  <strong className="text-foreground">Fair Pricing:</strong> No hidden fees or
                  unexpected charges
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 text-primary">✓</span>
                <span>
                  <strong className="text-foreground">Community First:</strong> We're building a
                  trusted community of hosts and guests
                </span>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default About;
