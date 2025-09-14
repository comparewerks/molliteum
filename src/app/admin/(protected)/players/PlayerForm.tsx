"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import TiptapEditor from '@/components/TipTapEditor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { toast } from 'sonner';
import { Tables } from '@/types/supabase';
import { DeletePlayerButton } from "./DeletePlayerButton";

type Coach = Tables<'profiles'>;
type Player = Tables<'players'>;

const playerMetrics = [
  { name: 'resilience_profile', label: 'Resilience Profile' },
  { name: 'reliability', label: 'Reliability' },
  { name: 'self_belief', label: 'Self Belief' },
  { name: 'focus', label: 'Focus' },
  { name: 'adversity', label: 'Adversity' },
  { name: 'driver', label: 'Driver' },
  { name: 'coaching_style', label: 'Coaching Style' },
];

type ActionResult = {
  success: boolean;
  message: string;
};

export default function PlayerForm({
  player,
  coaches,
  onSave,
}: {
  player?: Player;
  coaches: Coach[];
  onSave: (formData: FormData) => Promise<ActionResult>;
}) {
  const router = useRouter();
  const [playbookType, setPlaybookType] = useState<'pdf' | 'text'>(
    player?.playbook_url ? 'pdf' : 'text'
  );
  
  const [metricValues, setMetricValues] = useState<{ [key: string]: string }>(() => {
    if (!player) return {};
    return {
      resilience_profile: player.resilience_profile || '',
      reliability: player.reliability || '',
      self_belief: player.self_belief || '',
      focus: player.focus || '',
      adversity: player.adversity || '',
      driver: player.driver || '',
      coaching_style: player.coaching_style || '',
    };
  });

  const handleMetricChange = (name: string, value: string) => {
    setMetricValues(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFormSubmit = async (formData: FormData) => {
    const toastId = toast.loading('Saving player data...');

    const result = await onSave(formData);

    if (result.success) {
      toast.success(result.message, { id: toastId });
      router.push('/admin/players');
    } else {
      toast.error(result.message, { id: toastId });
    }
  };

  return (
    <form action={handleFormSubmit} className="space-y-6 max-w-2xl">
      {player && <input type="hidden" name="playerId" value={player.id} />}

      <Card>
        <CardHeader><CardTitle>{player ? 'Edit Player Details' : 'Player Details'}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2"><Label htmlFor="firstName">First Name</Label><Input id="firstName" name="firstName" required defaultValue={player?.first_name} /></div>
            <div className="space-y-2"><Label htmlFor="lastName">Last Name</Label><Input id="lastName" name="lastName" required defaultValue={player?.last_name} /></div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="coachId">Assign Coach</Label>
            <Select name="coachId" required defaultValue={player?.coach_id || undefined}>
              <SelectTrigger><SelectValue placeholder="Select a coach" /></SelectTrigger>
              <SelectContent>{coaches.map(coach => (<SelectItem key={coach.id} value={coach.id}>{coach.first_name} {coach.last_name}</SelectItem>))}</SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader><CardTitle>Player Playbook</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup defaultValue={playbookType} onValueChange={(value: 'pdf' | 'text') => setPlaybookType(value)} name="playbookType">
            <div className="flex items-center space-x-2"><RadioGroupItem value="text" id="r-text" /><Label htmlFor="r-text">Write Document</Label></div>
            <div className="flex items-center space-x-2"><RadioGroupItem value="pdf" id="r-pdf" /><Label htmlFor="r-pdf">Upload PDF</Label></div>
          </RadioGroup>
          {playbookType === 'text' ? (<TiptapEditor name="playbookText" initialContent={player?.playbook_text || ''} />) : (<Input id="playbookFile" name="playbookFile" type="file" accept=".pdf" />)}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Player Assessment</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {playerMetrics.map((metric) => (
            <div key={metric.name} className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b pb-4 last:border-b-0 last:pb-0">
              <Label>{metric.label}</Label>
              <ToggleGroup type="single" variant="outline" defaultValue={metricValues[metric.name]} onValueChange={(value) => { if (value) handleMetricChange(metric.name, value); }}>
                <ToggleGroupItem value="Low">Low</ToggleGroupItem>
                <ToggleGroupItem value="Medium">Medium</ToggleGroupItem>
                <ToggleGroupItem value="High">High</ToggleGroupItem>
              </ToggleGroup>
              <input type="hidden" name={metric.name} value={metricValues[metric.name] || ''} />
            </div>
          ))}
        </CardContent>
      </Card>
      
      <div className="flex justify-between items-center gap-4">
        <div>{player && <DeletePlayerButton playerId={player.id} />}</div>
        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit">Save Changes</Button>
        </div>
      </div>
    </form>
  );
}

