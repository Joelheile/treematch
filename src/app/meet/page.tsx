"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MapPin } from "lucide-react";

export default function MeetInPersonPage() {
  const [dinnerSpot, setDinnerSpot] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const findDinnerSpot = () => {
    setIsLoading(true);
    setDinnerSpot(null);
    // Simulate API call
    setTimeout(() => {
      const spots = [
        "Nora's Italian Cuisine",
        "The Curry House",
        "The Burger Joint",
        "Sushi Samba",
        "The Gumbo Pot",
      ];
      const randomSpot = spots[Math.floor(Math.random() * spots.length)];
      setDinnerSpot(randomSpot);
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader>
          <div className="flex justify-center items-center mb-4">
            <div className="bg-red-600 p-3 rounded-full">
              <Users className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Meet Your Match!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-6">
            Ready to meet your new project partner or friend in person? We'll
            suggest a great dinner spot for a group of four.
          </p>
          <Button
            onClick={findDinnerSpot}
            disabled={isLoading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 text-lg"
          >
            {isLoading ? "Finding a spot..." : "Suggest a Dinner Spot"}
          </Button>

          {dinnerSpot && (
            <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800">Your Dinner Spot:</h3>
              <div className="flex items-center justify-center text-red-700 mt-2">
                <MapPin className="w-5 h-5 mr-2" />
                <p className="text-xl font-bold">{dinnerSpot}</p>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                We've picked a great place for you and three other matches!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 