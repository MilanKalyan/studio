import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Compass } from "lucide-react";

export default function BrowsePage() {
  return (
    <div className="flex flex-col h-full p-4 md:p-8 pb-20"> {/* Add padding-bottom */}
      <Card className="flex-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Compass className="h-6 w-6 text-primary" />
            Browse
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This is the Browse section. Discover new games, communities, and content here.
          </p>
          {/* Add browsing content, filters, search bar etc. */}
           <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {/* Placeholder cards for browse content */}
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-fade-in opacity-0" style={{ animationDelay: `${i * 100}ms`}}>
                    <CardHeader>
                        <CardTitle>Content Item {i+1}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Description for item {i+1}. Could be a game, a user, or a community.</p>
                    </CardContent>
                </Card>
              ))}
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
