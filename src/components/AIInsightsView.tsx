import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Loader2, 
  ShieldAlert, 
  Lightbulb, 
  CheckCircle2, 
  RefreshCw, 
  Target, 
  TrendingUp 
} from 'lucide-react';
import { AISpendingInsight, BudgetProfile, Expense } from '../types';

interface AIInsightsViewProps {
  expenses: Expense[];
  currentProfile: BudgetProfile;
  currency: string;
}

export const AIInsightsView: React.FC<AIInsightsViewProps> = ({
  expenses,
  currentProfile,
  currency,
}) => {
  const [insight, setInsight] = useState<AISpendingInsight | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const profileExpenses = expenses.filter((e) => e.profileId === currentProfile.id);
  const totalSpent = profileExpenses.reduce((s, e) => s + e.amount, 0);
  const remaining = currentProfile.totalLimit - totalSpent;

  const fetchInsights = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ai-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expenses: profileExpenses,
          profile: currentProfile,
          totalSpent,
          remaining,
          currency,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to fetch AI insights from server');
      }

      const data = await res.json();
      setInsight(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to generate AI insights');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [currentProfile.id, expenses.length]);

  return (
    <div className="space-y-6 pb-20 md:pb-8 animate-fadeIn max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-emerald-500 text-white flex items-center justify-center font-bold shadow-md shadow-amber-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Gemini AI Financial Advisor
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Personalized spending analysis & tailored savings strategies
            </p>
          </div>
        </div>

        <button
          onClick={fetchInsights}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm transition-all shrink-0"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          Re-Analyze
        </button>
      </div>

      {isLoading ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-3">
          <Loader2 className="w-10 h-10 mx-auto text-emerald-500 animate-spin" />
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Gemini AI is analyzing your transactions...
          </p>
          <p className="text-xs text-slate-500">
            Evaluating category distribution, period budget health, and savings opportunities.
          </p>
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-3xl text-rose-700 dark:text-rose-300 text-xs font-medium">
          {error}
        </div>
      ) : insight ? (
        <div className="space-y-6">
          
          {/* Health Score & Overview Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            
            {/* Score dial */}
            <div className="flex flex-col items-center justify-center text-center p-4 bg-slate-800/80 rounded-2xl border border-slate-700/60">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Financial Health Score
              </span>
              <div className="text-5xl font-black text-emerald-400 my-2">
                {insight.score}
                <span className="text-lg text-slate-400 font-normal">/100</span>
              </div>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                {insight.score >= 80 ? 'Excellent' : insight.score >= 50 ? 'Moderate' : 'Needs Attention'}
              </span>
            </div>

            {/* AI Summary Text */}
            <div className="md:col-span-2 space-y-3">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="w-4 h-4" /> AI Overview
              </span>
              <p className="text-sm text-slate-200 leading-relaxed font-medium">
                {insight.overview}
              </p>
              
              {insight.suggestedAction && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-800/80 rounded-xl text-xs text-emerald-300 font-semibold flex items-center gap-2 mt-2">
                  <Target className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>Actionable Target: {insight.suggestedAction}</span>
                </div>
              )}
            </div>

          </div>

          {/* Warnings & Suggestions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Savings Tips Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                Personalized Savings Suggestions
              </h3>

              <div className="space-y-3">
                {insight.savingsTips?.map((tip, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 flex items-start gap-3"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Warnings Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-500" />
                Spending Risk Flags
              </h3>

              {insight.warnings?.length === 0 ? (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                  🎉 No critical spending risks flagged! Your current budget management is healthy.
                </div>
              ) : (
                <div className="space-y-3">
                  {insight.warnings?.map((warn, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-rose-50 dark:bg-rose-950/40 rounded-2xl border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200 flex items-start gap-3"
                    >
                      <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <span>{warn}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      ) : null}

    </div>
  );
};
