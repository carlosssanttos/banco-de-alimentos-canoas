import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { AlimentosService } from '@/services/AlimentosService'
import { AuxiliaresService } from '@/services/AuxiliaresService'
import type { Alimento, AlimentoForm, Tipo, Marca, Unidade } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { Table } from '@/components/ui/Table'
import { Alert } from '@/components/ui/Alert'
import { useDebounce } from '@/hooks/useDebounce'
import { DEMO_ALIMENTOS, DEMO_TIPOS, DEMO_MARCAS, DEMO_UNIDADES } from '@/mocks/demoData'

const emptyForm: AlimentoForm = { nome: '', id_tipo: '', id_marca: '', id_unidade: '', descricao: '' }

export function Alimentos() {
  const { isDemo } = useAuth()
  const [data, setData] = useState<Alimento[]>([])
  const [tipos, setTipos] = useState<Tipo[]>([])
  const [marcas, setMarcas] = useState<Marca[]>([])
  const [unidades, setUnidades] = useState<Unidade[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filterTipo, setFilterTipo] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Alimento | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Alimento | null>(null)
  const [form, setForm] = useState<AlimentoForm>(emptyForm)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const debouncedSearch = useDebounce(search, 300)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    if (isDemo) {
      setData(DEMO_ALIMENTOS); setTipos(DEMO_TIPOS); setMarcas(DEMO_MARCAS); setUnidades(DEMO_UNIDADES)
      setIsLoading(false); return
    }
    try {
      const [alimentos, t, m, u] = await Promise.all([
        AlimentosService.listar(),
        AuxiliaresService.tipos(),
        AuxiliaresService.marcas(),
        AuxiliaresService.unidades(),
      ])
      setData(alimentos)
      setTipos(t)
      setMarcas(m)
      setUnidades(u)
      setError('')
    } catch {
      setError('Erro ao carregar alimentos.')
    } finally {
      setIsLoading(false)
    }
  }, [isDemo])

  useEffect(() => { void fetchData() }, [fetchData])

  const filtered = data.filter((a) => {
    const matchSearch = a.nome.toLowerCase().includes(debouncedSearch.toLowerCase())
    const matchTipo = !filterTipo || a.id_tipo === filterTipo
    return matchSearch && matchTipo
  })

  function openCreate() {
    setEditTarget(null)
    setForm(emptyForm)
    setFormError('')
    setModalOpen(true)
  }

  function openEdit(a: Alimento) {
    setEditTarget(a)
    setForm({
      nome: a.nome,
      id_tipo: a.id_tipo ?? '',
      id_marca: a.id_marca ?? '',
      id_unidade: a.id_unidade ?? '',
      descricao: a.descricao ?? '',
    })
    setFormError('')
    setModalOpen(true)
  }

  async function handleSave() {
    if (!form.nome.trim()) { setFormError('Nome é obrigatório.'); return }
    setSaving(true)
    const payload: AlimentoForm = {
      nome: form.nome,
      id_tipo: form.id_tipo || undefined,
      id_marca: form.id_marca || undefined,
      id_unidade: form.id_unidade || undefined,
      descricao: form.descricao || undefined,
    }
    try {
      if (editTarget) await AlimentosService.atualizar(editTarget.id, payload)
      else await AlimentosService.criar(payload)
      setModalOpen(false)
      await fetchData()
    } catch {
      setFormError('Erro ao salvar alimento.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await AlimentosService.excluir(deleteTarget.id)
      setDeleteTarget(null)
      await fetchData()
    } catch {
      setError('Erro ao excluir alimento.')
      setDeleteTarget(null)
    }
  }

  const tipoMap = Object.fromEntries(tipos.map((t) => [t.id, t.nome]))
  const marcaMap = Object.fromEntries(marcas.map((m) => [m.id, m.nome]))
  const unidadeMap = Object.fromEntries(unidades.map((u) => [u.id, u.nome]))

  const columns = [
    { key: 'nome', header: 'Nome' },
    { key: 'tipo', header: 'Tipo', render: (r: Alimento) => tipoMap[r.id_tipo ?? ''] || r.tipo_nome || '—' },
    { key: 'marca', header: 'Marca', render: (r: Alimento) => marcaMap[r.id_marca ?? ''] || r.marca_nome || '—' },
    { key: 'unidade', header: 'Unidade', render: (r: Alimento) => unidadeMap[r.id_unidade ?? ''] || r.unidade_nome || '—' },
    {
      key: 'acoes', header: 'Ações', className: 'w-24',
      render: (r: Alimento) => (
        <div className="flex gap-1">
          <button onClick={() => openEdit(r)} className="rounded p-1 text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"><Pencil size={15} /></button>
          <button onClick={() => setDeleteTarget(r)} className="rounded p-1 text-gray-400 hover:text-status-danger hover:bg-red-50 transition-colors"><Trash2 size={15} /></button>
        </div>
      ),
    },
  ]

  return (
    <>
      <PageHeader title="Alimentos" subtitle="Catálogo de alimentos gerenciados"
        action={<Button onClick={openCreate}><Plus size={16} /> Novo Alimento</Button>}
      />

      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

      <div className="mb-4 flex gap-3">
        <Input placeholder="Buscar por nome..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        <Select
          options={[{ value: '', label: 'Todos os tipos' }, ...tipos.map((t) => ({ value: t.id, label: t.nome }))]}
          value={filterTipo}
          onChange={(e) => setFilterTipo(e.target.value)}
          className="max-w-[200px]"
          placeholder=""
        />
      </div>

      <Table columns={columns} data={filtered} keyField="id" isLoading={isLoading} emptyMessage="Nenhum alimento cadastrado." />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? 'Editar Alimento' : 'Novo Alimento'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} loading={saving}>Salvar</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          {formError && <Alert variant="danger">{formError}</Alert>}
          <Input label="Nome *" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Nome do alimento" />
          <Select label="Tipo" value={form.id_tipo ?? ''} onChange={(e) => setForm({ ...form, id_tipo: e.target.value })}
            options={tipos.map((t) => ({ value: t.id, label: t.nome }))} placeholder="Selecione o tipo" />
          <Select label="Marca" value={form.id_marca ?? ''} onChange={(e) => setForm({ ...form, id_marca: e.target.value })}
            options={marcas.map((m) => ({ value: m.id, label: m.nome }))} placeholder="Selecione a marca" />
          <Select label="Unidade" value={form.id_unidade ?? ''} onChange={(e) => setForm({ ...form, id_unidade: e.target.value })}
            options={unidades.map((u) => ({ value: u.id, label: u.nome }))} placeholder="Selecione a unidade" />
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
        <p className="text-gray-600">Deseja excluir o alimento <strong>{deleteTarget?.nome}</strong>?</p>
      </Modal>
    </>
  )
}
