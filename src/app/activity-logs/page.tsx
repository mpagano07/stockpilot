'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import { Card } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Loader2, ScrollText } from 'lucide-react';

interface ActivityLog {
  id: string;
  user_name: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, any>;
  created_at: string;
}

const ENTITY_LABELS: Record<string, string> = {
  product: 'Producto',
  sale: 'Venta',
  supplier: 'Proveedor',
  purchase_order: 'Pedido',
  category: 'Categoría',
  customer: 'Cliente',
  import: 'Importación',
};

const ACTION_LABELS: Record<string, string> = {
  created: 'creó',
  updated: 'actualizó',
  deleted: 'eliminó',
  imported: 'importó',
  adjusted: 'ajustó',
  received: 'recibió',
  cancelled: 'canceló',
  sold: 'vendió',
};

function buildDescription(log: ActivityLog): string {
  const action = ACTION_LABELS[log.action] || log.action;
  const entity = ENTITY_LABELS[log.entity_type] || log.entity_type;
  const detail = log.details?.name
    ? `"${log.details.name}"`
    : log.details?.folio
    ? `#${log.details.folio}`
    : '';
  return `${action} ${entity} ${detail}`.trim();
}

export default function ActivityLogsPage() {
  const { role } = useAuth();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [entityFilter, setEntityFilter] = useState('');
  const [page, setPage] = useState(0);
  const limit = 50;

  const fetchLogs = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const headers: Record<string, string> = {};
    if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`;

    const params = new URLSearchParams({ limit: String(limit), offset: String(page * limit) });
    if (entityFilter) params.set('entity_type', entityFilter);

    const res = await fetch(`/api/activity-logs?${params}`, { headers });
    if (!res.ok) {
      if (res.status === 403) setLoading(false);
      return;
    }
    const json = await res.json();
    setLogs(json.data || []);
    setTotal(json.total || 0);
  }, [entityFilter, page]);

  useEffect(() => {
    setLoading(true);
    fetchLogs().finally(() => setLoading(false));
  }, [fetchLogs]);

  const totalPages = Math.ceil(total / limit);

  if (role !== 'owner' && role !== 'manager') {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">No tienes permisos para ver esta página.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <ScrollText className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            Historial de Actividad
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Registro detallado de todas las acciones realizadas en el sistema.
          </p>
        </div>
      </div>

      <Card className="p-4 border border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
            Filtrar por:
          </label>
          <Select value={entityFilter} onChange={(e) => { setEntityFilter(e.target.value); setPage(0); }} className="max-w-xs">
            <option value="">Todos</option>
            {Object.entries(ENTITY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </Select>
          <span className="text-xs text-gray-400 ml-auto">
            {total} registro{total !== 1 ? 's' : ''}
          </span>
        </div>
      </Card>

      <Card className="overflow-hidden border border-gray-100 dark:border-gray-800 p-0">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-16">
            <ScrollText className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-gray-500">No hay actividad registrada</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Usuario</th>
                  <th className="py-4 px-6">Acción</th>
                  <th className="py-4 px-6">Detalle</th>
                  <th className="py-4 px-6 text-right">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20">
                    <td className="py-4 px-6">
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {log.user_name || 'Usuario'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                        {buildDescription(log)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-gray-500 max-w-xs truncate">
                      {log.details?.name || log.details?.folio || log.details?.sku || '—'}
                    </td>
                    <td className="py-4 px-6 text-right text-xs text-gray-500 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleDateString('es-ES', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            disabled={page === 0}
            onClick={() => setPage(p => Math.max(0, p - 1))}
            className="px-3 py-1.5 text-sm rounded-md border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Anterior
          </button>
          <span className="text-sm text-gray-500">
            Página {page + 1} de {totalPages}
          </span>
          <button
            disabled={page >= totalPages - 1}
            onClick={() => setPage(p => p + 1)}
            className="px-3 py-1.5 text-sm rounded-md border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
