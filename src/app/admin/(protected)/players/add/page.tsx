// src/app/admin/players/add/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { addPlayer } from '../actions';
// Import components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import TiptapEditor from '@/components/TipTapEditor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';


type Coach = {
  id: string;
  first_name: string | null;
  last_name: string | null;
};

// Define our metrics in an array for easy mapping
const playerMetrics = [
  { name: 'resilience_profile', label: 'Resilience Profile' },
  { name: 'reliability', label: 'Reliability' },
  { name: 'self_belief', label: 'Self Belief' },
  { name: 'focus', label: 'Focus' },
  { name: 'adversity', label: 'Adversity' },
  { name: 'driver', label: 'Driver' },
  { name: 'coaching_style', label: 'Coaching Style' },
];

export default function AddPlayerPage() {
  const router = useRouter();
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [playbookType, setPlaybookType] = useState<'pdf' | 'text'>('text');
  
  // State to manage the values of our toggle groups
  const [metricValues, setMetricValues] = useState<{[key: string]: string}>({});

  useEffect(() => {
    const fetchCoaches = async () => {
      const supabase = createClient();
      const { data } = await supabase.from('profiles').select('id, first_name, last_name').eq('role', 'coach');
      if (data) setCoaches(data);
    };
    fetchCoaches();
  }, []);

  const handleMetricChange = (name: string, value: string) => {
    setMetricValues(prev => ({...prev, [name]: value}));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Add New Player</h1>
      <form action={addPlayer} className="space-y-6 max-w-2xl">
        {/* Basic Info and Coach Assignment... */}
        <Card>
          <CardHeader><CardTitle>Player Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" name="firstName" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" name="lastName" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="coachId">Assign Coach</Label>
              <Select name="coachId" required>
                <SelectTrigger><SelectValue placeholder="Select a coach" /></SelectTrigger>
                <SelectContent>
                  {coaches.map(coach => (
                    <SelectItem key={coach.id} value={coach.id}>{coach.first_name} {coach.last_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        
        {/* Playbook Section */}
        <Card>
          <CardHeader><CardTitle>Player Playbook</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup defaultValue="text" onValueChange={(value: 'pdf' | 'text') => setPlaybookType(value)} name="playbookType">
              <div className="flex items-center space-x-2"><RadioGroupItem value="text" id="r-text" /><Label htmlFor="r-text">Write Document</Label></div>
              <div className="flex items-center space-x-2"><RadioGroupItem value="pdf" id="r-pdf" /><Label htmlFor="r-pdf">Upload PDF</Label></div>
            </RadioGroup>
            {playbookType === 'text' ? (
              <TiptapEditor name="playbookText" />
            ) : (
              <Input id="playbookFile" name="playbookFile" type="file" accept=".pdf" />
            )}
          </CardContent>
        </Card>

        {/* --- NEW & IMPROVED METRICS SECTION --- */}
        <Card>
          <CardHeader><CardTitle>Player Assessment</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {playerMetrics.map((metric) => (
              <div key={metric.name} className="flex justify-between items-center border-b pb-4">
                <Label>{metric.label}</Label>
                <ToggleGroup
                  type="single"
                  variant="outline"
                  onValueChange={(value) => { if (value) handleMetricChange(metric.name, value); }}
                >
                  <ToggleGroupItem value="Low">Low</ToggleGroupItem>
                  <ToggleGroupItem value="Medium">Medium</ToggleGroupItem>
                  <ToggleGroupItem value="High">High</ToggleGroupItem>
                </ToggleGroup>
                {/* Hidden input to submit the value with the form */}
                <input type="hidden" name={metric.name} value={metricValues[metric.name] || ''} />
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit">Save Player</Button>
        </div>
      </form>
    </div>
  );
}