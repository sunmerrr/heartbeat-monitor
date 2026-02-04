import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './lib/api';
import type { Target } from './lib/api';
import { useForm } from '@tanstack/react-form';
import { Plus, Trash2, Activity, Globe, Clock } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const queryClient = useQueryClient();

  // Queries
  const { data: targets, isLoading } = useQuery({
    queryKey: ['targets'],
    queryFn: () => api.get('targets').json<Target[]>(),
    refetchInterval: 5000 // Auto-refresh every 5s
  });

  // Mutations
  const addTarget = useMutation({
    mutationFn: (json: { name: string; url: string }) => 
      api.post('targets', { json }).json(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['targets'] });
    }
  });

  const deleteTarget = useMutation({
    mutationFn: (id: string) => api.delete(`targets/${id}`).json(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['targets'] });
    }
  });

  // Form
  const form = useForm({
    defaultValues: {
      name: '',
      url: ''
    },
    onSubmit: async ({ value }) => {
      await addTarget.mutateAsync(value);
      form.reset();
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-200">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Heartbeat Monitor</h1>
              <p className="text-gray-500">Real-time server health dashboard</p>
            </div>
          </div>
        </header>

        {/* Add Form */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-gray-400" /> New Monitor
          </h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="flex gap-4 items-end"
          >
            <form.Field
              name="name"
              children={(field) => (
                <div className="flex-1 space-y-1">
                  <label className="text-sm font-medium text-gray-700">Service Name</label>
                  <input
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="e.g. API Server"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            />
            <form.Field
              name="url"
              children={(field) => (
                <div className="flex-[2] space-y-1">
                  <label className="text-sm font-medium text-gray-700">Endpoint URL</label>
                  <input
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="https://example.com/health"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            />
            <button
              type="submit"
              disabled={addTarget.isPending}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-md shadow-blue-100 disabled:opacity-50 disabled:cursor-not-allowed h-[42px]"
            >
              {addTarget.isPending ? 'Adding...' : 'Add Monitor'}
            </button>
          </form>
        </div>

        {/* Monitor List */}
        <div className="grid gap-4">
          {isLoading ? (
            <div className="text-center py-12 text-gray-400 animate-pulse">Loading monitors...</div>
          ) : targets?.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200 text-gray-400">
              No monitors configured. Add one above!
            </div>
          ) : (
            targets?.map((target) => (
              <div
                key={target.id}
                className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-5">
                  <div className={cn(
                    "w-3 h-3 rounded-full ring-4",
                    target.status === 'up' ? "bg-green-500 ring-green-100" :
                    target.status === 'down' ? "bg-red-500 ring-red-100 animate-pulse" :
                    "bg-gray-400 ring-gray-100"
                  )} />
                  
                  <div>
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      {target.name}
                      <a href={target.url} target="_blank" rel="noreferrer" className="text-gray-300 hover:text-blue-500 transition-colors">
                        <Globe className="w-4 h-4" />
                      </a>
                    </h3>
                    <div className="text-sm text-gray-500 flex items-center gap-3 mt-1">
                      <span className="font-mono bg-gray-50 px-2 py-0.5 rounded text-xs border border-gray-100">
                        {target.url}
                      </span>
                      {target.lastChecked && (
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock className="w-3 h-3" />
                          checked {new Date(target.lastChecked).toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                    target.status === 'up' ? "bg-green-50 text-green-700" :
                    target.status === 'down' ? "bg-red-50 text-red-700" :
                    "bg-gray-100 text-gray-600"
                  )}>
                    {target.status}
                  </div>
                  <button
                    onClick={() => deleteTarget.mutate(target.id)}
                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
