'use client';

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import LeaguesTab from "./tabs/leagues-tab";
import TeamsTab from "./tabs/teams-tab";
import PlayersTab from "./tabs/players-tab";
import MatchesTab from "./tabs/matches-tab";
import RefereesTab from "./tabs/referees-tab";

export default function Dashboard() {
  const [username, setUsername] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  const tabParam = searchParams.get("tab") || "leagues";
  const [currentTab, setCurrentTab] = useState(tabParam);

  const handleTabChange = (value) => {
    setCurrentTab(value);
    router.push(`/dashboard?tab=${value}`);
  };

  useEffect(() => {
    const stored = localStorage.getItem("username");
    setUsername(stored || "");
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("username");
    router.push("/login");
  };

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6 relative">
        <img src="/teamLogo.png" alt="Team Logo" className="logo-fixed-left" />
        <div className="flex items-center space-x-4">
          <h1 className="text-3xl font-bold ml-0">Soccer Team Management Dashboard</h1>
          <button
            onClick={() => router.push("/queries")}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            View Advanced Queries
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <span className="bg-white text-gray-800 text-sm px-3 py-1 rounded shadow">
            {username ? `Logged in as ${username}` : "Not logged in"}
          </span>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white text-sm px-3 py-1 rounded shadow"
          >
            Logout
          </button>
        </div>
      </div>

      <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="leagues">Leagues</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="players">Players</TabsTrigger>
          <TabsTrigger value="matches">Matches</TabsTrigger>
          <TabsTrigger value="referees">Referees</TabsTrigger>
        </TabsList>

        <TabsContent value="leagues" className="mt-4">
          <LeaguesTab />
        </TabsContent>
        <TabsContent value="teams" className="mt-4">
          <TeamsTab />
        </TabsContent>
        <TabsContent value="players" className="mt-4">
          <PlayersTab />
        </TabsContent>
        <TabsContent value="matches" className="mt-4">
          <MatchesTab />
        </TabsContent>
        <TabsContent value="referees" className="mt-4">
          <RefereesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
