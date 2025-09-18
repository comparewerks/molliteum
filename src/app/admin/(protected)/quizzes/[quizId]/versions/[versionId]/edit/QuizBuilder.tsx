// src/app/admin/(protected)/quizzes/[quizId]/versions/[versionId]/edit/QuizBuilder.tsx
"use client";

import { useState } from "react";
import { Tables } from "@/types/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { updateQuizVersionData } from "../../../../actions";

// Define the structure of our quiz data for type safety
type QuizData = {
  questions: Question[];
};
type Question = {
  id: string;
  text: string;
  metric: string;
  choices: Choice[];
};
type Choice = {
  id: string;
  text: string;
  value: number;
};

type QuizVersion = Tables<'quiz_versions'>;

const playerMetrics = [
  'resilience_profile', 'reliability', 'self_belief', 'focus', 'adversity', 'driver', 'coaching_style'
];

export function QuizBuilder({ version }: { version: QuizVersion }) {
  const [quizData, setQuizData] = useState<QuizData>(
    version.quiz_data as QuizData || { questions: [] }
  );

  // --- Question Handlers ---
  const addQuestion = () => {
    const newQuestion: Question = {
      id: `q_${Date.now()}`,
      text: "",
      metric: "",
      choices: [{ id: `c_${Date.now()}`, text: "", value: 0 }],
    };
    setQuizData(prev => ({ questions: [...prev.questions, newQuestion] }));
  };

  const updateQuestion = (qIndex: number, field: 'text' | 'metric', value: string) => {
    const newQuestions = [...quizData.questions];
    newQuestions[qIndex][field] = value;
    setQuizData({ questions: newQuestions });
  };

  const removeQuestion = (qIndex: number) => {
    setQuizData(prev => ({
      questions: prev.questions.filter((_, i) => i !== qIndex),
    }));
  };

  // --- Choice Handlers ---
  const addChoice = (qIndex: number) => {
    const newChoice: Choice = { id: `c_${Date.now()}`, text: "", value: 0 };
    const newQuestions = [...quizData.questions];
    newQuestions[qIndex].choices.push(newChoice);
    setQuizData({ questions: newQuestions });
  };

  const updateChoice = (qIndex: number, cIndex: number, field: 'text' | 'value', value: string | number) => {
    const newQuestions = [...quizData.questions];
    newQuestions[qIndex].choices[cIndex][field] = value as never;
    setQuizData({ questions: newQuestions });
  };

  const removeChoice = (qIndex: number, cIndex: number) => {
    const newQuestions = [...quizData.questions];
    newQuestions[qIndex].choices = newQuestions[qIndex].choices.filter((_, i) => i !== cIndex);
    setQuizData({ questions: newQuestions });
  };

  const handleSave = () => {
    toast.promise(updateQuizVersionData(version.id, quizData), {
        loading: "Saving quiz...",
        success: "Quiz saved successfully!",
        error: "Failed to save quiz."
    });
  };

  return (
    <div className="space-y-6">
      {quizData.questions.map((q, qIndex) => (
        <Card key={q.id}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Question {qIndex + 1}</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => removeQuestion(qIndex)}><Trash2 className="h-4 w-4" /></Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Question Text</Label>
              <Input value={q.text} onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Associated Metric</Label>
              <Select value={q.metric} onValueChange={(val) => updateQuestion(qIndex, 'metric', val)}>
                <SelectTrigger><SelectValue placeholder="Select a metric..." /></SelectTrigger>
                <SelectContent>{playerMetrics.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2 pt-4">
              <Label>Answer Choices</Label>
              {q.choices.map((c, cIndex) => (
                <div key={c.id} className="flex items-center gap-2">
                  <Input placeholder="Choice text" value={c.text} onChange={(e) => updateChoice(qIndex, cIndex, 'text', e.target.value)} />
                  <Input type="number" placeholder="Score" className="w-24" value={c.value} onChange={(e) => updateChoice(qIndex, cIndex, 'value', Number(e.target.value))} />
                  <Button variant="ghost" size="icon" onClick={() => removeChoice(qIndex, cIndex)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => addChoice(qIndex)}><PlusCircle className="h-4 w-4 mr-2"/>Add Choice</Button>
            </div>
          </CardContent>
        </Card>
      ))}
      <div className="flex justify-between">
        <Button variant="outline" onClick={addQuestion}><PlusCircle className="h-4 w-4 mr-2"/>Add Question</Button>
        <Button onClick={handleSave}>Save Quiz</Button>
      </div>
    </div>
  );
}