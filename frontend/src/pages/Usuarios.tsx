import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { UsuariosService } from '@/services/UsuariosService'
import type { UsuarioCompleto, UsuarioForm } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { PageHeader } from '@/components/layout/PageHeader'
import { DEMO_USUARIOS } from '@/mocks/demoData'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Table } from '@/components/ui/Table'
import { Alert } from '@/components/ui/Alert'
import { formatDatetime } from '@/utils/formatDate'

const emptyForm: UsuarioForm = { nome: '', sobrenome: '', email: '', senha: '', permissao: 'operador' }

export function Usuarios() {
  const { usuario: currentUser, isDemo } = useAuth()
  const [data, setData] = useState<UsuarioCompleto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<UsuarioCompleto | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<UsuarioCompleto | null>(null)
  const [form, setForm] = useState<UsuarioForm>(emptyForm)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    if (isDemo) { setData(DEMO_USUARIOS); setIsLoading(false); return }
    try {
      setData(await UsuariosService.listar())
      setError('')
    } catch {
      setError('Erro ao carregar usuários.')
    } finally {
      setIsLoading(false)
    }
  }, [isDemo])

  useEffect(() => { void fetchData() }, [fetchData])

  function openCreate() {
    setEditTarget(null)
    setForm(emptyForm)
    setFormError('')
    setModalOpen(true)
  }

  function openEdit(u: UsuarioCompleto) {
    setEditTarget(u)
    setForm({ nome: u.nome, sobrenome: u.sobrenome ?? '', email: u.email, senha: '', permissao: u.permissao ?? 'operador' })
    setFormError('')
    setModalOpen(true)
  }

  async function handleSave() {
    if (!form.nome.trim()) { setFormError('Nome é obrigatório.'); return }
    if (!form.email.trim()) { setFormError('E-mail é obrigatório.'); return }
    if (!editTarget && !form.senha) { setFormError('Senha é obrigatória para novos usuários.'); return }
    if (form.senha && form.senha.length < 6) { setFormError('A senha deve ter ao menos 6 caracteres.'); return }
    setSaving(true)
    const payload: UsuarioForm = {
      ...form,
      senha: form.senha || undefined,
    }
    try {
      if (editTarget) await UsuariosService.atualizar(editTarget.id, payload)
      else await UsuariosService.criar(payload)
      setModalOpen(false)
      await fetchData()
    } catch {
      setFormError('Erro ao salvar usuário.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await UsuariosService.excluir(deleteTarget.id)
      setDeleteTarget(null)
      await fetchData()
    } catch {
      setError('Erro ao excluir usuário.')
      setDeleteTarget(null)
    }
  }

  const columns = [
    { key: 'nome', header: 'Nome', render: (r: UsuarioCompleto) => `${r.nome}${r.sobrenome ? ' ' + r.sobrenome : ''}` },
    { key: 'email', header: 'E-mail' },
    {
      key: 'permissao', header: 'Permissão',
      render: (r: UsuarioCompleto) => (
        <Badge variant={r.permissao === 'admin' ? 'info' : 'neutral'}>
          {r.permissao === 'admin' ? 'Administrador' : 'Operador'}
        </Badge>
      ),
    },
    { key: 'criado_em', header: 'Criado em', render: (r: UsuarioCompleto) => formatDatetime(r.criado_em) },
    {
      key: 'acoes', header: 'Ações', className: 'w-24',
      render: (r: UsuarioCompleto) => (
        <div className="flex gap-1">
          <button onClick={() => openEdit(r)} className="rounded p-1 text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"><Pencil size={15} /></button>
          {String(r.id) !== String(currentUser?.id) && (
            <button onClick={() => setDeleteTarget(r)} className="rounded p-1 text-gray-400 hover:text-status-danger hover:bg-red-50 transition-colors"><Trash2 size={15} /></button>
          )}
        </div>
      ),
    },
  ]

  return (
    <>
      <PageHeader title="Usuários" subtitle="Gerenciamento de acessos ao sistema"
        action={<Button onClick={openCreate}><Plus size={16} /> Novo Usuário</Button>}
      />

      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

      <Table columns={columns} data={data} keyField="id" isLoading={isLoading} emptyMessage="Nenhum usuário cadastrado." />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? 'Editar Usuário' : 'Novo Usuário'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} loading={saving}>Salvar</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          {formError && <Alert variant="danger">{formError}</Alert>}
          <div className="grid grid-cols-2 gap-4">
            <Input label="Nome *" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Primeiro nome" />
            <Input label="Sobrenome" value={form.sobrenome ?? ''} onChange={(e) => setForm({ ...form, sobrenome: e.target.value })} placeholder="Sobrenome" />
          </div>
          <Input label="E-mail *" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@exemplo.com" />
          <Select label="Permissão" value={form.permissao ?? 'operador'} onChange={(e) => setForm({ ...form, permissao: e.target.value })}
            options={[{ value: 'operador', label: 'Operador' }, { value: 'admin', label: 'Administrador' }]} placeholder="" />
          <Input
            label={editTarget ? 'Nova Senha (deixe em branco para não alterar)' : 'Senha *'}
            type="password" value={form.senha ?? ''}
            onChange={(e) => setForm({ ...form, senha: e.target.value })}
            placeholder="Mínimo 6 caracteres"
          />
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
        <p className="text-gray-600">Deseja excluir o usuário <strong>{deleteTarget?.nome}</strong>? Esta ação não pode ser desfeita.</p>
      </Modal>
    </>
  )
}
