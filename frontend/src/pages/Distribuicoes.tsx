import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { DistribuicoesService } from '@/services/DistribuicoesService'
import { EntidadesService } from '@/services/EntidadesService'
import { LotesService } from '@/services/LotesService'
import { AlimentosService } from '@/services/AlimentosService'
import type { Distribuicao, DistribuicaoForm, Entidade, Lote, Alimento } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { Table } from '@/components/ui/Table'
import { Alert } from '@/components/ui/Alert'
import { formatDate, today } from '@/utils/formatDate'
import { formatQuantidade } from '@/utils/formatNumber'
import { getErrorMessage } from '@/utils/getErrorMessage'
import { DEMO_DISTRIBUICOES, DEMO_ENTIDADES, DEMO_LOTES, DEMO_ALIMENTOS } from '@/mocks/demoData'

const emptyForm: DistribuicaoForm = { id_lote: '', id_entidade: '', quantidade: 0, data: today() }

export function Distribuicoes() {
  const { usuario, isDemo } = useAuth()
  const [data, setData] = useState<Distribuicao[]>([])
  const [entidades, setEntidades] = useState<Entidade[]>([])
  const [lotes, setLotes] = useState<Lote[]>([])
  const [alimentos, setAlimentos] = useState<Alimento[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterEntidade, setFilterEntidade] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Distribuicao | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Distribuicao | null>(null)
  const [form, setForm] = useState<DistribuicaoForm>(emptyForm)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    if (isDemo) {
      setData(DEMO_DISTRIBUICOES)
      setEntidades(DEMO_ENTIDADES)
      setLotes(DEMO_LOTES.filter((l) => !l.esta_estragado && l.quantidade > 0))
      setAlimentos(DEMO_ALIMENTOS)
      setIsLoading(false); return
    }
    try {
      const [dist, ents, lots, alims] = await Promise.all([
        DistribuicoesService.listar(),
        EntidadesService.listar(),
        LotesService.listar(),
        AlimentosService.listar(),
      ])
      setData(dist)
      setEntidades(ents)
      setLotes(lots.filter((l) => !l.esta_estragado && l.quantidade > 0))
      setAlimentos(alims)
      setError('')
    } catch {
      setError('Erro ao carregar distribuições.')
    } finally {
      setIsLoading(false)
    }
  }, [isDemo])

  useEffect(() => { void fetchData() }, [fetchData])

  const entidadeMap = Object.fromEntries(entidades.map((e) => [e.id, e.nome]))
  const alimentoMap = Object.fromEntries(alimentos.map((a) => [a.id, a.nome]))
  const loteMap = Object.fromEntries(lotes.map((l) => [l.id, l]))

  const filtered = data.filter((d) =>
    !filterEntidade || d.id_entidade === filterEntidade
  )

  const loteQtdDisponivel = form.id_lote ? (loteMap[form.id_lote]?.quantidade ?? 0) : 0

  function openCreate() {
    setEditTarget(null)
    setForm({ ...emptyForm, data: today() })
    setFormError('')
    setModalOpen(true)
  }

  function openEdit(d: Distribuicao) {
    setEditTarget(d)
    setForm({ id_lote: d.id_lote, id_entidade: d.id_entidade, quantidade: d.quantidade, data: d.data })
    setFormError('')
    setModalOpen(true)
  }

  async function handleSave() {
    if (!form.id_entidade) { setFormError('Selecione a entidade.'); return }
    if (!form.id_lote) { setFormError('Selecione o lote.'); return }
    if (!form.quantidade || form.quantidade <= 0) { setFormError('Quantidade deve ser maior que zero.'); return }
    if (form.quantidade > loteQtdDisponivel) { setFormError(`Quantidade excede o disponível no lote (${formatQuantidade(loteQtdDisponivel)}).`); return }
    if (!form.data) { setFormError('Data é obrigatória.'); return }
    setSaving(true)
    try {
      const payload = { ...form, id_usuario: String(usuario?.id ?? '') }
      if (editTarget) await DistribuicoesService.atualizar(editTarget.id, form)
      else await DistribuicoesService.criar(payload as DistribuicaoForm)
      setModalOpen(false)
      await fetchData()
    } catch {
      setFormError('Erro ao salvar distribuição.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await DistribuicoesService.excluir(deleteTarget.id)
      setDeleteTarget(null)
      await fetchData()
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao excluir distribuição.'))
      setDeleteTarget(null)
    }
  }

  const columns = [
    { key: 'data', header: 'Data', render: (r: Distribuicao) => formatDate(r.data) },
    { key: 'entidade', header: 'Entidade', render: (r: Distribuicao) => entidadeMap[r.id_entidade] || r.entidade_nome || '—' },
    {
      key: 'alimento', header: 'Alimento',
      render: (r: Distribuicao) => {
        const lote = loteMap[r.id_lote]
        return lote ? (alimentoMap[lote.id_alimento] || '—') : (r.alimento_nome || '—')
      },
    },
    { key: 'quantidade', header: 'Quantidade', render: (r: Distribuicao) => formatQuantidade(r.quantidade) },
    {
      key: 'acoes', header: 'Ações', className: 'w-24',
      render: (r: Distribuicao) => (
        <div className="flex gap-1">
          <button onClick={() => openEdit(r)} className="rounded p-1 text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"><Pencil size={15} /></button>
          <button onClick={() => setDeleteTarget(r)} className="rounded p-1 text-gray-400 hover:text-status-danger hover:bg-red-50 transition-colors"><Trash2 size={15} /></button>
        </div>
      ),
    },
  ]

  const loteOptions = lotes.map((l) => ({
    value: l.id,
    label: `${alimentoMap[l.id_alimento] || l.id_alimento} — Disp: ${formatQuantidade(l.quantidade)}`,
  }))

  return (
    <>
      <PageHeader title="Distribuições" subtitle="Registro de saída de alimentos"
        action={<Button onClick={openCreate}><Plus size={16} /> Nova Distribuição</Button>}
      />

      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

      <div className="mb-4">
        <Select
          value={filterEntidade}
          onChange={(e) => setFilterEntidade(e.target.value)}
          options={[{ value: '', label: 'Todas as entidades' }, ...entidades.map((e) => ({ value: e.id, label: e.nome }))]}
          placeholder=""
          className="max-w-xs"
        />
      </div>

      <Table columns={columns} data={filtered} keyField="id" isLoading={isLoading} emptyMessage="Nenhuma distribuição registrada." />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? 'Editar Distribuição' : 'Nova Distribuição'} size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} loading={saving}>Salvar</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          {formError && <Alert variant="danger">{formError}</Alert>}
          <Select label="Entidade Beneficiária *" value={form.id_entidade} onChange={(e) => setForm({ ...form, id_entidade: e.target.value })}
            options={entidades.map((e) => ({ value: e.id, label: e.nome }))} placeholder="Selecione a entidade" />
          <Select label="Lote de Alimento *" value={form.id_lote} onChange={(e) => setForm({ ...form, id_lote: e.target.value })}
            options={loteOptions} placeholder="Selecione o lote" />
          {form.id_lote && (
            <p className="text-xs text-gray-500">Disponível no lote: <strong>{formatQuantidade(loteQtdDisponivel)}</strong></p>
          )}
          <div className="grid grid-cols-2 gap-4">
            <Input label="Quantidade *" type="number" min="0" step="0.001"
              max={loteQtdDisponivel}
              value={String(form.quantidade)}
              onChange={(e) => setForm({ ...form, quantidade: parseFloat(e.target.value) || 0 })} />
            <Input label="Data *" type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} />
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Confirmar Exclusão" size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
            <Button variant="danger" onClick={handleDelete}>Excluir</Button>
          </>
        }
      >
        <p className="text-gray-600">Deseja excluir esta distribuição? A quantidade será devolvida automaticamente ao lote de origem.</p>
      </Modal>
    </>
  )
}
