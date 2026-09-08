'use client';

import { useMemo, useState } from 'react';
import { recordAudit } from '@/lib/audit/provenance';
import {
  countByStatus,
  initialReconciliationTasks,
  ReconciliationStatus,
  ReconciliationTask,
  updateTaskStatus,
} from '@/lib/reconciliation/tasks';

const statusStyles: Record<ReconciliationStatus, string> = {
  Imported: 'bg-zinc-100 text-zinc-700',
  'Needs review': 'bg-amber-100 text-amber-800',
  Accepted: 'bg-emerald-100 text-emerald-800',
  Rejected: 'bg-rose-100 text-rose-800',
  Failed: 'bg-red-100 text-red-800',
};

export function ReconciliationPanel() {
  const [tasks, setTasks] = useState<ReconciliationTask[]>(initialReconciliationTasks);
  const [filter, setFilter] = useState<ReconciliationStatus | 'All'>('All');

  const counts = useMemo(() => countByStatus(tasks), [tasks]);
  const filtered = useMemo(() => {
    if (filter === 'All') return tasks;
    return tasks.filter((t) => t.status === filter);
  }, [tasks, filter]);

  const act = (
    task: ReconciliationTask,
    status: ReconciliationStatus,
    comment: string,
    assignedTo: string
  ) => {
    setTasks((prev) => updateTaskStatus(prev, task.id, { status, comment, assignedTo }));

    recordAudit({
      source: task.source,
      target: 'Harbor View Primary Care',
      action: `Reconciliation: ${status}`,
      messageType: task.resourceType,
      patientRef: `Patient/${task.patientId}`,
      status: status === 'Accepted' ? 'success' : status === 'Rejected' ? 'warning' : 'warning',
      details: `${task.display} reviewed by ${assignedTo || 'unassigned'}: ${status}. ${comment}`.trim(),
    });
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="font-semibold">Reconciliation workflow</h3>
        <div className="flex flex-wrap gap-2">
          {(['All', 'Needs review', 'Imported', 'Accepted', 'Rejected', 'Failed'] as const).map(
            (s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  filter === s
                    ? 'bg-zinc-800 text-white'
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                }`}
              >
                {s} {s !== 'All' ? `(${counts[s as ReconciliationStatus] ?? 0})` : `(${tasks.length})`}
              </button>
            )
          )}
        </div>
      </div>

      <p className="mb-4 text-sm text-zinc-600">
        Imported clinical items are held in a separate queue until a clinician or
        authorized reviewer accepts, rejects, or flags them for further review.
      </p>

      <ul className="space-y-3">
        {filtered.map((task) => (
          <TaskItem key={task.id} task={task} onAct={act} />
        ))}
        {filtered.length === 0 && (
          <li className="text-center text-sm text-zinc-500">
            No tasks match the selected filter.
          </li>
        )}
      </ul>
    </div>
  );
}

function TaskItem({
  task,
  onAct,
}: {
  task: ReconciliationTask;
  onAct: (
    task: ReconciliationTask,
    status: ReconciliationStatus,
    comment: string,
    assignedTo: string
  ) => void;
}) {
  const [comment, setComment] = useState(task.comment ?? '');
  const [assignedTo, setAssignedTo] = useState(task.assignedTo ?? '');

  return (
    <li className="rounded-lg border border-zinc-200 p-3">
      <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-medium">{task.display}</p>
          <p className="text-xs text-zinc-500">
            {task.resourceType}/{task.resourceId} &bull; {task.clinicalType} &bull;{' '}
            {task.source}
          </p>
        </div>
        <span
          className={`self-start rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[task.status]}`}
        >
          {task.status}
        </span>
      </div>

      {task.status === 'Needs review' && (
        <div className="space-y-2">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <input
              type="text"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              placeholder="Assigned to"
              className="rounded-md border border-zinc-300 px-2 py-1.5 text-sm"
            />
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Review comment"
              rows={1}
              className="rounded-md border border-zinc-300 px-2 py-1.5 text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onAct(task, 'Accepted', comment, assignedTo)}
              className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Accept
            </button>
            <button
              onClick={() => onAct(task, 'Rejected', comment, assignedTo)}
              className="rounded-md bg-rose-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-rose-700"
            >
              Reject
            </button>
            <button
              onClick={() => onAct(task, 'Failed', comment, assignedTo)}
              className="rounded-md bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-700"
            >
              Flag failed
            </button>
          </div>
        </div>
      )}

      {task.status !== 'Needs review' && (
        <div className="mt-2 text-sm text-zinc-600">
          {task.assignedTo && <p>Assigned to: {task.assignedTo}</p>}
          {task.comment && <p>Comment: {task.comment}</p>}
          <button
            onClick={() => onAct(task, 'Needs review', task.comment ?? '', task.assignedTo ?? '')}
            className="mt-2 text-xs text-riverside hover:underline"
          >
            Re-open for review
          </button>
        </div>
      )}
    </li>
  );
}
