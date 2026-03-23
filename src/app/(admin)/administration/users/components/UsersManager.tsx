/* Konrad Ahodan : konrad.ahodan@approbations.ca */
'use client'

import { useMemo, useState } from 'react'
import { usePrivileges } from '@/hooks/usePrivileges'
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Form,
  Modal,
  Row,
  Table,
} from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import {
  createAdminUser,
  deleteAdminUser,
  resetUserPassword,
  updateAdminUser,
} from '@/services/administrationService'
import { AdminUserType, RoleType, UserGroupType, UserStatus } from '@/types/administration'

type Props = {
  usersInit: AdminUserType[]
  roles: RoleType[]
  groups: UserGroupType[]
}

type UserFormState = {
  nom: string
  email: string
  telephone: string
  statut: UserStatus
  roleIds: string[]
  groupId: string
}

const emptyForm: UserFormState = {
  nom: '',
  email: '',
  telephone: '',
  statut: 'Actif',
  roleIds: [],
  groupId: '',
}

function formatDate(value?: string): string {
  if (!value) return '—'
  return new Date(value).toLocaleString('fr-FR')
}

export default function UsersManager({ usersInit, roles, groups }: Props) {
  const priv = usePrivileges()
  const [users, setUsers] = useState<AdminUserType[]>(usersInit)
  const [showUserModal, setShowUserModal] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUserType | null>(null)
  const [userForm, setUserForm] = useState<UserFormState>(emptyForm)

  const [showResetModal, setShowResetModal] = useState(false)
  const [userToReset, setUserToReset] = useState<AdminUserType | null>(null)
  const [temporaryPassword, setTemporaryPassword] = useState('')

  const roleById = useMemo(() => Object.fromEntries(roles.map((r) => [r.id, r])), [roles])
  const groupById = useMemo(() => Object.fromEntries(groups.map((g) => [g.id, g])), [groups])

  const openAddUser = () => {
    setEditingUser(null)
    setUserForm(emptyForm)
    setShowUserModal(true)
  }

  const openEditUser = (user: AdminUserType) => {
    setEditingUser(user)
    setUserForm({
      nom: user.nom,
      email: user.email,
      telephone: user.telephone ?? '',
      statut: user.statut,
      roleIds: [...user.roleIds],
      groupId: user.groupId ?? '',
    })
    setShowUserModal(true)
  }

  const saveUser = async () => {
    if (!userForm.nom.trim() || !userForm.email.trim()) return

    if (editingUser) {
      const updated = await updateAdminUser(editingUser.id, {
        nom: userForm.nom.trim(),
        email: userForm.email.trim().toLowerCase(),
        telephone: userForm.telephone.trim() || undefined,
        statut: userForm.statut,
        roleIds: userForm.roleIds,
        groupId: userForm.groupId || undefined,
      })
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
    } else {
      const created = await createAdminUser({
        nom: userForm.nom.trim(),
        email: userForm.email.trim().toLowerCase(),
        telephone: userForm.telephone.trim() || undefined,
        statut: userForm.statut,
        roleIds: userForm.roleIds,
        groupId: userForm.groupId || undefined,
        mustResetPassword: true,
      })
      setUsers((prev) => [...prev, created])
    }

    setShowUserModal(false)
  }

  const handleDeleteUser = async (user: AdminUserType) => {
    if (!confirm(`Supprimer l'utilisateur « ${user.nom} » ?`)) return
    await deleteAdminUser(user.id)
    setUsers((prev) => prev.filter((u) => u.id !== user.id))
  }

  const openResetModal = (user: AdminUserType) => {
    setUserToReset(user)
    setTemporaryPassword('')
    setShowResetModal(true)
  }

  const handleResetPassword = async () => {
    if (!userToReset) return
    const result = await resetUserPassword(userToReset.id)
    setTemporaryPassword(result.temporaryPassword)
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userToReset.id
          ? { ...u, mustResetPassword: true, lastPasswordResetAt: new Date().toISOString() }
          : u
      )
    )
  }

  return (
    <>
      <Card>
        <CardHeader className="d-flex justify-content-between align-items-center">
          <div>
            <h5 className="mb-0">Utilisateurs</h5>
            <p className="text-muted small mb-0">
              Gestion des utilisateurs et réinitialisation de mot de passe
            </p>
          </div>
          {priv.canEditSettings && (
            <Button variant="success" size="sm" onClick={openAddUser}>
              <IconifyIcon icon="tabler:user-plus" className="me-1" /> Ajouter un utilisateur
            </Button>
          )}
        </CardHeader>
        <CardBody className="p-0">
          <Table hover responsive className="mb-0 align-middle table-sm">
            <thead className="table-light">
              <tr>
                <th className="ps-3">Nom</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Groupe</th>
                <th>Rôles</th>
                <th className="text-center">Statut</th>
                <th className="text-center">Mot de passe</th>
                <th className="text-center pe-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="ps-3 fw-semibold">{user.nom}</td>
                  <td className="text-muted small">{user.email}</td>
                  <td className="text-muted small">{user.telephone ?? '—'}</td>
                  <td>
                    {user.groupId ? (
                      <Badge bg="light" text="dark" className="fw-normal border">
                        {groupById[user.groupId]?.nom ?? user.groupId}
                      </Badge>
                    ) : (
                      <span className="text-muted small">—</span>
                    )}
                  </td>
                  <td>
                    <div className="d-flex flex-wrap gap-1">
                      {user.roleIds.length === 0 && <span className="text-muted small">Aucun</span>}
                      {user.roleIds.map((id) => (
                        <Badge key={id} bg="light" text="dark" className="fw-normal border">
                          {roleById[id]?.nom ?? id}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="text-center">
                    <Badge bg={user.statut === 'Actif' ? 'success' : 'secondary'}>{user.statut}</Badge>
                  </td>
                  <td className="text-center">
                    <Badge bg={user.mustResetPassword ? 'warning' : 'success'} text={user.mustResetPassword ? 'dark' : undefined}>
                      {user.mustResetPassword ? 'À réinitialiser' : 'OK'}
                    </Badge>
                  </td>
                  <td className="text-center pe-3">
                    <div className="hstack gap-1 justify-content-center">
                      {priv.canEditSettings && (
                        <>
                          <Button
                            variant="soft-info"
                            size="sm"
                            className="btn-icon rounded-circle"
                            title="Réinitialiser mot de passe"
                            onClick={() => openResetModal(user)}
                          >
                            <IconifyIcon icon="tabler:key" />
                          </Button>
                          <Button variant="soft-success" size="sm" className="btn-icon rounded-circle" onClick={() => openEditUser(user)}>
                            <IconifyIcon icon="tabler:edit" />
                          </Button>
                          <Button variant="soft-danger" size="sm" className="btn-icon rounded-circle" onClick={() => handleDeleteUser(user)}>
                            <IconifyIcon icon="tabler:trash" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </CardBody>
      </Card>

      <Modal show={showUserModal} onHide={() => setShowUserModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingUser ? 'Modifier utilisateur' : 'Nouvel utilisateur'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-3">
            <Col xs={12}>
              <Form.Group>
                <Form.Label>Nom</Form.Label>
                <Form.Control value={userForm.nom} onChange={(e) => setUserForm((prev) => ({ ...prev, nom: e.target.value }))} />
              </Form.Group>
            </Col>
            <Col xs={12}>
              <Form.Group>
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" value={userForm.email} onChange={(e) => setUserForm((prev) => ({ ...prev, email: e.target.value }))} />
              </Form.Group>
            </Col>
            <Col xs={12}>
              <Form.Group>
                <Form.Label>Téléphone</Form.Label>
                <Form.Control value={userForm.telephone} onChange={(e) => setUserForm((prev) => ({ ...prev, telephone: e.target.value }))} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Statut</Form.Label>
                <Form.Select value={userForm.statut} onChange={(e) => setUserForm((prev) => ({ ...prev, statut: e.target.value as UserStatus }))}>
                  <option value="Actif">Actif</option>
                  <option value="Inactif">Inactif</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Groupe</Form.Label>
                <Form.Select value={userForm.groupId} onChange={(e) => setUserForm((prev) => ({ ...prev, groupId: e.target.value }))}>
                  <option value="">Aucun</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>{group.nom}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col xs={12}>
              <Form.Label>Rôles</Form.Label>
              {roles.map((role) => (
                <Form.Check
                  key={role.id}
                  label={role.nom}
                  checked={userForm.roleIds.includes(role.id)}
                  onChange={(e) =>
                    setUserForm((prev) => ({
                      ...prev,
                      roleIds: e.target.checked
                        ? [...prev.roleIds, role.id]
                        : prev.roleIds.filter((id) => id !== role.id),
                    }))
                  }
                />
              ))}
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={() => setShowUserModal(false)}>Annuler</Button>
          <Button variant="primary" onClick={saveUser}>Enregistrer</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showResetModal} onHide={() => setShowResetModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Réinitialiser le mot de passe</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted small mb-2">
            Utilisateur: <strong>{userToReset?.nom}</strong> ({userToReset?.email})
          </p>
          <p className="text-muted small mb-2">Dernière réinitialisation: {formatDate(userToReset?.lastPasswordResetAt)}</p>
          {temporaryPassword ? (
            <div className="alert alert-success mb-0">
              Nouveau mot de passe temporaire: <code>{temporaryPassword}</code>
            </div>
          ) : (
            <div className="alert alert-warning mb-0">
              Cette action génère un mot de passe temporaire et impose sa modification à la prochaine connexion.
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={() => setShowResetModal(false)}>Fermer</Button>
          <Button variant="primary" onClick={handleResetPassword}>Réinitialiser</Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}
