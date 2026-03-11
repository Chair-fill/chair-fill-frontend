"use client";

import { useState, useEffect } from "react";
import { useTechnician } from "@/app/providers/TechnicianProvider";
import { getApiErrorMessage } from "@/lib/api-client";
import { MessageSquare, Plus, Trash2, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import FormError from "@/app/components/ui/FormError";
import { BTN_PRIMARY_INLINE } from "@/lib/constants/ui";

interface Example {
  context: string;
  response: string;
}

export default function ChatStyleSettings() {
  const { technician, updateTechnician, isTechnicianLoading } = useTechnician();
  const [examples, setExamples] = useState<Example[]>([]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (technician?.conversational_style) {
      setExamples(technician.conversational_style as Example[]);
    }
  }, [technician]);

  const handleAddExample = () => {
    setExamples([...examples, { context: "", response: "" }]);
    setSuccess(false);
  };

  const handleRemoveExample = (index: number) => {
    const newExamples = examples.filter((_, i) => i !== index);
    setExamples(newExamples);
    setSuccess(false);
  };

  const handleExampleChange = (index: number, field: keyof Example, value: string) => {
    const newExamples = [...examples];
    newExamples[index][field] = value;
    setExamples(newExamples);
    setSuccess(false);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setIsSaving(true);

    try {
      // Filter out empty examples
      const validExamples = examples.filter(ex => ex.context.trim() && ex.response.trim());
      
      if (validExamples.length < 5) {
        setError("Please provide at least 5 conversational examples.");
        setIsSaving(false);
        return;
      }
      
      await updateTechnician({
        conversational_style: validExamples,
      });
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1">
        <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">Chat Style</h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Customize how your AI agent talks to clients by giving it examples of your real conversational style.
        </p>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <p className="text-xs font-medium text-blue-700 dark:text-blue-300">
            Provide at least 5 examples for the best results.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {examples.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/20">
            <MessageSquare className="w-8 h-8 text-zinc-400 mb-2" />
            <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center max-w-xs">
              No examples added yet. Add a few to help the AI match your voice.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {examples.map((example, index) => (
              <div 
                key={index} 
                className="group relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 transition-all hover:border-zinc-300 dark:hover:border-zinc-700"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                      Context (e.g. Client says)
                    </label>
                    <textarea
                      value={example.context}
                      onChange={(e) => handleExampleChange(index, "context", e.target.value)}
                      placeholder="Hi, are you free this Friday?"
                      className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none min-h-[60px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                      Response (How you'd say it)
                    </label>
                    <textarea
                      value={example.response}
                      onChange={(e) => handleExampleChange(index, "response", e.target.value)}
                      placeholder="Yo! Yeah I got a few slots left. What time you thinking?"
                      className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none min-h-[60px]"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveExample(index)}
                  className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={handleAddExample}
          className="w-full py-3 flex items-center justify-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Example
        </button>
      </div>

      {error && <FormError message={error} />}
      {success && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
          <p className="text-sm text-green-600 dark:text-green-400">
            Chat style updated successfully.
          </p>
        </div>
      )}

      <div className="flex justify-end pt-4">
        <button 
          type="submit" 
          disabled={isSaving || isTechnicianLoading} 
          className={BTN_PRIMARY_INLINE}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </button>
      </div>
    </form>
  );
}
