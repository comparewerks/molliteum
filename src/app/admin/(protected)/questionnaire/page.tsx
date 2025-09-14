// src/app/admin/(protected)/questionnaire/page.tsx
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { saveQuestionnaireTemplate } from "../players/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export default function QuestionnaireAdminPage() {
  const [questions, setQuestions] = useState<string[]>([""]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLatestTemplate = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('questionnaire_templates')
        .select('questions')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (data && data.questions) {
        setQuestions(data.questions as string[]);
      }
      setIsLoading(false);
    };
    fetchLatestTemplate();
  }, []);

  const handleQuestionChange = (index: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[index] = value;
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions([...questions, ""]);
  };
  
  const removeQuestion = (index: number) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
  };
  
  const handleSave = async () => {
    try {
      await saveQuestionnaireTemplate(questions.filter(q => q.trim() !== ''));
      toast.success("Questionnaire template saved!");
    } catch (error) {
      toast.error("Failed to save template.");
    }
  };

  if (isLoading) return <p>Loading template...</p>;

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Questionnaire Template</CardTitle>
        <CardDescription>
          Manage the questions that will be sent out to coaches weekly. Saving creates a new version.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {questions.map((q, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={q}
                onChange={(e) => handleQuestionChange(index, e.target.value)}
                placeholder={`Question ${index + 1}`}
              />
              <Button variant="ghost" size="icon" onClick={() => removeQuestion(index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        <div className="flex justify-between">
          <Button variant="outline" onClick={addQuestion}>Add Question</Button>
          <Button onClick={handleSave}>Save Template</Button>
        </div>
      </CardContent>
    </Card>
  );
}