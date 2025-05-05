// app/dashboard/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import LeaguesTab from "./tabs/leagues-tab";
import TeamsTab from "./tabs/teams-tab";
import PlayersTab from "./tabs/players-tab";
import MatchesTab from "./tabs/matches-tab";
import RefereesTab from "./tabs/referees-tab";

export default function Dashboard() {
  const [username, setUsername] = useState("");
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("username");
    setUsername(stored || "");
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("username");
    router.push("/login");
  };

  return (
    <>
      {/* Logged-in badge + logout button */}
      <div className="fixed top-4 right-4 z-50">
        <div className="flex flex-col items-end space-y-2">
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

      {/* Main dashboard content */}
      <div className="container py-6">
        <h1 className="text-3xl font-bold mb-6">
          Soccer Team Management Dashboard
        </h1>

        <Tabs defaultValue="leagues" className="w-full">
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
    </>
  );
}
