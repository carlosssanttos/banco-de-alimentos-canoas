import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { ParceirosService } from '@/services/ParceirosService'
import type { Parceiro } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Table } from '@/components/ui/Table'
import { Alert } from '@/components/ui/Alert'
import { useDebounce } from '@/hooks/useDebounce'
import { DEMO_PARCEIROS } from '@/mocks/demoData'
import { getErrorMessage } from '@/utils/getErrorMessage'

type FormData = Omit<Parceiro, 'id'>

const empty: FormData = { nome: '', tipo: '', contato: '', descricao: '' }

export function Parceiros() {
  const { isDemo } = useAuth()
  const [data, setData] = useState<Parceiro[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Parceiro | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Parceiro | null>(null)
  const [form, setForm] = useState<FormData>(empty)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const debouncedSearch = useDebounce(search, 300)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    if (isDemo) { setData(DEMO_PARCEIROS); setIsLoading(false); return }
    try {
      const res = await ParceirosService.listar()
      setData(res)
      setError('')
    } catch {
      setError('Erro ao carregar parceiros.')
    } finally {
      setIsLoading(false)
    }
  }, [isDemo])

  useEffect(() => { void fetchData() }, [fetchData])

  const filtered = data.filter((p) =>
    p.nome.toLowerCase().includes(debouncedSearch.toLowerCase())
  )

  function openCreate() {
    setEditTarget(null)
    setForm(empty)
    setFormError('')
    setModalOpen(true)
  }

  function openEdit(p: Parceiro) {
    setEditTarget(p)
    setForm({ nome: p.nome, tipo: p.tipo ?? '', contato: p.contato ?? '', descricao: p.descricao ?? '' })
    setFormError('')
    setModalOpen(true)
  }

  async function handleSave() {
    if (!form.nome.trim()) { setFormError('Nome é obrigatório.'); return }
    setSaving(true)
    try {
      if (editTarget) await ParceirosService.atualizar(editTarget.id, form)
      else await ParceirosService.criar(form)
      setModalOpen(false)
      await fetchData()
    } catch {
      setFormError('Erro ao salvar parceiro.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await ParceirosService.excluir(deleteTarget.id)
      setDeleteTarget(null)
      await fetchData()
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao excluir parceiro.'))
      setDeleteTarget(null)
    }
  }

  const columns = [
    { key: 'nome',    header: 'Nome' },
    { key: 'tipo',    header: 'Tipo',    render: (r: Parceiro) => r.tipo    || '—' },
    { key: 'contato', header: 'Contato', render: (r: Parceiro) => r.contato || '—' },
    {
      key: 'acoes',
      header: 'Ações',
      className: 'w-24',
      render: (r: Parceiro) => (
        <div className="flex gap-1">
          <button onClick={() => openEdit(r)} className="rounded p-1 text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors" title="Editar">
            <Pencil size={15} />
          </button>
          <button onClick={() => setDeleteTarget(r)} className="rounded p-1 text-gray-400 hover:text-status-danger hover:bg-red-50 transition-colors" title="Excluir">
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Parceiros"
        subtitle="Empresas e organizações doadoras"
        action={
          <Button onClick={openCreate}>
            <Plus size={16} /> Novo Parceiro
          </Button>
        }
      />

      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

      <div className="mb-4">
        <Input
          placeholder="Buscar por nome..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Table
        columns={columns}
        data={filtered}
        keyField="id"
        isLoading={isLoading}
        emptyMessage="Nenhum parceiro cadastrado."
      />

      {/* Form Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTarget ? 'Editar Parceiro' : 'Novo Parceiro'}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} loading={saving}>Salvar</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          {formError && <Alert variant="danger">{formError}</Alert>}
          <Input label="Nome *" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Nome do parceiro" />
          <Input label="Tipo" value={form.tipo ?? ''} onChange={(e) => setForm({ ...form, tipo: e.target.value })} placeholder="Ex: Supermercado, Indústria..." />
          <Input label="Contato" value={form.contato ?? ''} onChange={(e) => setForm({ ...form, contato: e.target.value })} placeholder="Telefone ou e-mail" />
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Confirmar Exclusão"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
            <Button variant="danger" onClick={handleDelete}>Excluir</Button>
          </>
        }
      >
        <p className="text-gray-600">
          Deseja excluir o parceiro <strong>{deleteTarget?.nome}</strong>? Esta ação não pode ser desfeita.
        </p>
      </Modal>
    </>
  )
}
