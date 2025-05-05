'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import LeaguesTab from './tabs/leagues-tab';
import TeamsTab from './tabs/teams-tab';
import PlayersTab from './tabs/players-tab';
import MatchesTab from './tabs/matches-tab';
import RefereesTab from './tabs/referees-tab';

export default function Dashboard() {
  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Soccer Team Management Dashboard</h1>
      
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
  );
}
