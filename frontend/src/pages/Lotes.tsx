import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, AlertOctagon } from 'lucide-react'
import { LotesService } from '@/services/LotesService'
import { AlimentosService } from '@/services/AlimentosService'
import { ParceirosService } from '@/services/ParceirosService'
import type { Lote, LoteForm, Alimento, Parceiro } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Table } from '@/components/ui/Table'
import { Alert } from '@/components/ui/Alert'
import { useDebounce } from '@/hooks/useDebounce'
import { formatDate, daysUntil, today } from '@/utils/formatDate'
import { formatQuantidade } from '@/utils/formatNumber'
import { DEMO_LOTES, DEMO_ALIMENTOS, DEMO_PARCEIROS } from '@/mocks/demoData'
import { getErrorMessage } from '@/utils/getErrorMessage'

const emptyForm: LoteForm = {
  id_alimento: '',
  id_parceiro: '',
  quantidade: 0,
  data_chegada: today(),
  data_validade: '',
  foi_comprado: false,
  esta_estragado: false,
}

function validadeBadge(lote: Lote) {
  if (lote.esta_estragado) return <Badge variant="danger">Estragado</Badge>
  if (!lote.data_validade) return <span className="text-gray-400 text-sm">—</span>
  const dias = daysUntil(lote.data_validade) ?? 999
  if (dias <= 0) return <Badge variant="danger">Vencido</Badge>
  if (dias <= 7) return <Badge variant="danger">{dias}d</Badge>
  if (dias <= 30) return <Badge variant="warning">{dias}d</Badge>
  return <Badge variant="success">{formatDate(lote.data_validade)}</Badge>
}

export function Lotes() {
  const { isDemo } = useAuth()
  const [data, setData] = useState<Lote[]>([])
  const [alimentos, setAlimentos] = useState<Alimento[]>([])
  const [parceiros, setParceiros] = useState<Parceiro[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Lote | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Lote | null>(null)
  const [estragadoTarget, setEstragadoTarget] = useState<Lote | null>(null)
  const [form, setForm] = useState<LoteForm>(emptyForm)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const debouncedSearch = useDebounce(search, 300)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    if (isDemo) {
      setData(DEMO_LOTES); setAlimentos(DEMO_ALIMENTOS); setParceiros(DEMO_PARCEIROS)
      setIsLoading(false); return
    }
    try {
      const [lotes, alims, parcs] = await Promise.all([
        LotesService.listar(),
        AlimentosService.listar(),
        ParceirosService.listar(),
      ])
      setData(lotes)
      setAlimentos(alims)
      setParceiros(parcs)
      setError('')
    } catch {
      setError('Erro ao carregar lotes.')
    } finally {
      setIsLoading(false)
    }
  }, [isDemo])

  useEffect(() => { void fetchData() }, [fetchData])

  const alimentoMap = Object.fromEntries(alimentos.map((a) => [a.id, a.nome]))
  const parceiroMap = Object.fromEntries(parceiros.map((p) => [p.id, p.nome]))

  const filtered = data.filter((l) => {
    const nome = alimentoMap[l.id_alimento] ?? l.alimento_nome ?? ''
    const matchSearch = nome.toLowerCase().includes(debouncedSearch.toLowerCase())
    if (!filterStatus) return matchSearch
    if (filterStatus === 'estragado') return matchSearch && l.esta_estragado
    if (filterStatus === 'vencendo') {
      const dias = daysUntil(l.data_validade ?? null) ?? 999
      return matchSearch && !l.esta_estragado && dias >= 0 && dias <= 30
    }
    if (filterStatus === 'ok') {
      const dias = daysUntil(l.data_validade ?? null) ?? 999
      return matchSearch && !l.esta_estragado && dias > 30
    }
    return matchSearch
  })

  function openCreate() {
    setEditTarget(null)
    setForm(emptyForm)
    setFormError('')
    setModalOpen(true)
  }

  function openEdit(l: Lote) {
    setEditTarget(l)
    setForm({
      id_alimento: l.id_alimento,
      id_parceiro: l.id_parceiro ?? '',
      quantidade: l.quantidade,
      data_chegada: l.data_chegada,
      data_validade: l.data_validade ?? '',
      foi_comprado: l.foi_comprado,
      esta_estragado: l.esta_estragado,
    })
    setFormError('')
    setModalOpen(true)
  }

  async function handleSave() {
    if (!form.id_alimento) { setFormError('Selecione o alimento.'); return }
    if (!form.quantidade || form.quantidade <= 0) { setFormError('Quantidade deve ser maior que zero.'); return }
    if (!form.data_chegada) { setFormError('Data de chegada é obrigatória.'); return }
    setSaving(true)
    const payload: LoteForm = {
      ...form,
      id_parceiro: form.id_parceiro || undefined,
      data_validade: form.data_validade || undefined,
    }
    try {
      if (editTarget) await LotesService.atualizar(editTarget.id, payload)
      else await LotesService.criar(payload)
      setModalOpen(false)
      await fetchData()
    } catch {
      setFormError('Erro ao salvar lote.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await LotesService.excluir(deleteTarget.id)
      setDeleteTarget(null)
      await fetchData()
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao excluir lote.'))
      setDeleteTarget(null)
    }
  }

  async function handleEstragado() {
    if (!estragadoTarget) return
    try {
      await LotesService.marcarEstragado(estragadoTarget.id)
      setEstragadoTarget(null)
      await fetchData()
    } catch {
      setError('Erro ao marcar lote como estragado.')
      setEstragadoTarget(null)
    }
  }

  const columns = [
    { key: 'alimento', header: 'Alimento', render: (r: Lote) => alimentoMap[r.id_alimento] || r.alimento_nome || r.id_alimento },
    { key: 'quantidade', header: 'Quantidade', render: (r: Lote) => formatQuantidade(r.quantidade) },
    { key: 'validade', header: 'Validade', render: (r: Lote) => validadeBadge(r) },
    { key: 'chegada', header: 'Chegada', render: (r: Lote) => formatDate(r.data_chegada) },
    { key: 'parceiro', header: 'Parceiro', render: (r: Lote) => parceiroMap[r.id_parceiro ?? ''] || r.parceiro_nome || '—' },
    {
      key: 'acoes', header: 'Ações', className: 'w-32',
      render: (r: Lote) => (
        <div className="flex gap-1">
          <button onClick={() => openEdit(r)} className="rounded p-1 text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors" title="Editar"><Pencil size={15} /></button>
          {!r.esta_estragado && (
            <button onClick={() => setEstragadoTarget(r)} className="rounded p-1 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 transition-colors" title="Marcar como estragado"><AlertOctagon size={15} /></button>
          )}
          <button onClick={() => setDeleteTarget(r)} className="rounded p-1 text-gray-400 hover:text-status-danger hover:bg-red-50 transition-colors" title="Excluir"><Trash2 size={15} /></button>
        </div>
      ),
    },
  ]

  return (
    <>
      <PageHeader title="Estoque / Lotes" subtitle="Controle de lotes de alimentos recebidos"
        action={<Button onClick={openCreate}><Plus size={16} /> Novo Lote</Button>}
      />

      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

      <div className="mb-4 flex gap-3 flex-wrap">
        <Input placeholder="Buscar por alimento..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        <Select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          options={[
            { value: '', label: 'Todos os status' },
            { value: 'ok', label: 'Em dia (> 30 dias)' },
            { value: 'vencendo', label: 'Vencendo (≤ 30 dias)' },
            { value: 'estragado', label: 'Estragado' },
          ]}
          placeholder=""
          className="max-w-[200px]"
        />
      </div>

      <Table columns={columns} data={filtered} keyField="id" isLoading={isLoading} emptyMessage="Nenhum lote cadastrado." />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? 'Editar Lote' : 'Novo Lote'} size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} loading={saving}>Salvar</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          {formError && <Alert variant="danger">{formError}</Alert>}
          <Select label="Alimento *" value={form.id_alimento} onChange={(e) => setForm({ ...form, id_alimento: e.target.value })}
            options={alimentos.map((a) => ({ value: a.id, label: a.nome }))} placeholder="Selecione o alimento" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Quantidade *" type="number" min="0" step="0.001" value={String(form.quantidade)}
              onChange={(e) => setForm({ ...form, quantidade: parseFloat(e.target.value) || 0 })} />
            <Input label="Data de Chegada *" type="date" value={form.data_chegada}
              onChange={(e) => setForm({ ...form, data_chegada: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Data de Validade" type="date" value={form.data_validade ?? ''}
              onChange={(e) => setForm({ ...form, data_validade: e.target.value })} />
            <Select label="Parceiro Doador" value={form.id_parceiro ?? ''} onChange={(e) => setForm({ ...form, id_parceiro: e.target.value })}
              options={parceiros.map((p) => ({ value: p.id, label: p.nome }))} placeholder="Sem parceiro" />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" checked={form.foi_comprado} onChange={(e) => setForm({ ...form, foi_comprado: e.target.checked })} className="rounded border-surface-border" />
            Foi comprado (não doado)
          </label>
        </div>
      </Modal>

      <Modal isOpen={!!estragadoTarget} onClose={() => setEstragadoTarget(null)} title="Marcar como Estragado" size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEstragadoTarget(null)}>Cancelar</Button>
            <Button variant="danger" onClick={handleEstragado}>Confirmar</Button>
          </>
        }
      >
        <p className="text-gray-600">Confirma que o lote de <strong>{alimentoMap[estragadoTarget?.id_alimento ?? ''] || 'alimento'}</strong> está estragado e deve ser descartado?</p>
      </Modal>

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Confirmar Exclusão" size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
            <Button variant="danger" onClick={handleDelete}>Excluir</Button>
          </>
        }
      >
        <p className="text-gray-600">Deseja excluir este lote permanentemente?</p>
      </Modal>
    </>
  )
}
