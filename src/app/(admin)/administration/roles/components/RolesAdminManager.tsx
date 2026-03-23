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
  createPrivilege,
  createRole,
  createUserGroup,
  deletePrivilege,
  deleteRole,
  deleteUserGroup,
  updatePrivilege,
  updateRole,
  updateUserGroup,
} from '@/services/administrationService'
import { PrivilegeRules, PrivilegeType, RoleType, UserGroupType } from '@/types/administration'

type Props = {
  privilegesInit: PrivilegeType[]
  rolesInit: RoleType[]
  groupsInit: UserGroupType[]
}

const EMPTY_RULES: PrivilegeRules = {
  canConsult: false,
  canCreate: false,
  canValidate: false,
  canAccessSettings: false,
  canEditSettings: false,
  canAccessAll: false,
}

const RULE_LABELS: Array<{ key: keyof PrivilegeRules; label: string }> = [
  { key: 'canConsult', label: 'Consulter' },
  { key: 'canCreate', label: 'Créer' },
  { key: 'canValidate', label: 'Valider' },
  { key: 'canAccessSettings', label: 'Accès paramètres' },
  { key: 'canEditSettings', label: 'Modifier paramètres' },
  { key: 'canAccessAll', label: 'Accès global' },
]

function RoleNames({ roleIds, roles }: { roleIds: string[]; roles: RoleType[] }) {
  if (roleIds.length === 0) return <span className="text-muted small">Aucun rôle</span>
  return (
    <div className="d-flex flex-wrap gap-1">
      {roleIds.map((id) => {
        const role = roles.find((r) => r.id === id)
        return (
          <Badge bg="light" text="dark" key={id} className="fw-normal border">
            {role?.nom ?? id}
          </Badge>
        )
      })}
    </div>
  )
}

export default function RolesAdminManager({ privilegesInit, rolesInit, groupsInit }: Props) {
  const priv = usePrivileges()
  const [privileges, setPrivileges] = useState<PrivilegeType[]>(privilegesInit)
  const [roles, setRoles] = useState<RoleType[]>(rolesInit)
  const [groups, setGroups] = useState<UserGroupType[]>(groupsInit)

  const [showPrivilegeModal, setShowPrivilegeModal] = useState(false)
  const [editingPrivilege, setEditingPrivilege] = useState<PrivilegeType | null>(null)
  const [privilegeForm, setPrivilegeForm] = useState({
    code: '',
    nom: '',
    description: '',
    rules: { ...EMPTY_RULES },
  })

  const [showRoleModal, setShowRoleModal] = useState(false)
  const [editingRole, setEditingRole] = useState<RoleType | null>(null)
  const [roleForm, setRoleForm] = useState({
    nom: '',
    description: '',
    privilegeIds: [] as string[],
    actif: true,
  })

  const [showGroupModal, setShowGroupModal] = useState(false)
  const [editingGroup, setEditingGroup] = useState<UserGroupType | null>(null)
  const [groupForm, setGroupForm] = useState({
    nom: '',
    description: '',
    roleIds: [] as string[],
    actif: true,
  })

  const privilegeById = useMemo(() => Object.fromEntries(privileges.map((p) => [p.id, p])), [privileges])

  const openAddPrivilege = () => {
    setEditingPrivilege(null)
    setPrivilegeForm({ code: '', nom: '', description: '', rules: { ...EMPTY_RULES } })
    setShowPrivilegeModal(true)
  }

  const openEditPrivilege = (privilege: PrivilegeType) => {
    setEditingPrivilege(privilege)
    setPrivilegeForm({
      code: privilege.code,
      nom: privilege.nom,
      description: privilege.description,
      rules: { ...privilege.rules },
    })
    setShowPrivilegeModal(true)
  }

  const savePrivilege = async () => {
    if (!privilegeForm.nom.trim() || !privilegeForm.code.trim()) return

    if (editingPrivilege) {
      const updated = await updatePrivilege(editingPrivilege.id, {
        code: privilegeForm.code.trim(),
        nom: privilegeForm.nom.trim(),
        description: privilegeForm.description.trim(),
        rules: privilegeForm.rules,
      })
      setPrivileges((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
    } else {
      const created = await createPrivilege({
        code: privilegeForm.code.trim().toUpperCase(),
        nom: privilegeForm.nom.trim(),
        description: privilegeForm.description.trim(),
        rules: privilegeForm.rules,
        system: false,
      })
      setPrivileges((prev) => [...prev, created])
    }

    setShowPrivilegeModal(false)
  }

  const handleDeletePrivilege = async (privilege: PrivilegeType) => {
    if (privilege.system) return
    if (!confirm(`Supprimer le privilège « ${privilege.nom} » ?`)) return
    await deletePrivilege(privilege.id)
    setPrivileges((prev) => prev.filter((p) => p.id !== privilege.id))
    setRoles((prev) => prev.map((r) => ({ ...r, privilegeIds: r.privilegeIds.filter((id) => id !== privilege.id) })))
  }

  const openAddRole = () => {
    setEditingRole(null)
    setRoleForm({ nom: '', description: '', privilegeIds: [], actif: true })
    setShowRoleModal(true)
  }

  const openEditRole = (role: RoleType) => {
    setEditingRole(role)
    setRoleForm({
      nom: role.nom,
      description: role.description,
      privilegeIds: [...role.privilegeIds],
      actif: role.actif,
    })
    setShowRoleModal(true)
  }

  const saveRole = async () => {
    if (!roleForm.nom.trim()) return

    if (editingRole) {
      const updated = await updateRole(editingRole.id, {
        nom: roleForm.nom.trim(),
        description: roleForm.description.trim(),
        privilegeIds: roleForm.privilegeIds,
        actif: roleForm.actif,
      })
      setRoles((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
    } else {
      const created = await createRole({
        nom: roleForm.nom.trim(),
        description: roleForm.description.trim(),
        privilegeIds: roleForm.privilegeIds,
        actif: roleForm.actif,
        system: false,
      })
      setRoles((prev) => [...prev, created])
    }

    setShowRoleModal(false)
  }

  const handleDeleteRole = async (role: RoleType) => {
    if (role.system) return
    if (!confirm(`Supprimer le rôle « ${role.nom} » ?`)) return
    await deleteRole(role.id)
    setRoles((prev) => prev.filter((r) => r.id !== role.id))
    setGroups((prev) => prev.map((g) => ({ ...g, roleIds: g.roleIds.filter((id) => id !== role.id) })))
  }

  const openAddGroup = () => {
    setEditingGroup(null)
    setGroupForm({ nom: '', description: '', roleIds: [], actif: true })
    setShowGroupModal(true)
  }

  const openEditGroup = (group: UserGroupType) => {
    setEditingGroup(group)
    setGroupForm({
      nom: group.nom,
      description: group.description,
      roleIds: [...group.roleIds],
      actif: group.actif,
    })
    setShowGroupModal(true)
  }

  const saveGroup = async () => {
    if (!groupForm.nom.trim()) return

    if (editingGroup) {
      const updated = await updateUserGroup(editingGroup.id, {
        nom: groupForm.nom.trim(),
        description: groupForm.description.trim(),
        roleIds: groupForm.roleIds,
        actif: groupForm.actif,
      })
      setGroups((prev) => prev.map((g) => (g.id === updated.id ? updated : g)))
    } else {
      const created = await createUserGroup({
        nom: groupForm.nom.trim(),
        description: groupForm.description.trim(),
        roleIds: groupForm.roleIds,
        actif: groupForm.actif,
      })
      setGroups((prev) => [...prev, created])
    }

    setShowGroupModal(false)
  }

  const handleDeleteGroup = async (group: UserGroupType) => {
    if (!confirm(`Supprimer le groupe « ${group.nom} » ?`)) return
    await deleteUserGroup(group.id)
    setGroups((prev) => prev.filter((g) => g.id !== group.id))
  }

  return (
    <>
      <Row className="g-3 mb-3">
        <Col md={3}><Badge bg="primary">Lecteur: consulter + créer, sans validation</Badge></Col>
        <Col md={3}><Badge bg="success">Validation: autorise la validation</Badge></Col>
        <Col md={3}><Badge bg="danger">Super Admin: accès complet</Badge></Col>
        <Col md={3}><Badge bg="secondary">Consult Admin: paramètres en lecture seule</Badge></Col>
      </Row>

      <Card className="mb-4">
        <CardHeader className="d-flex justify-content-between align-items-center">
          <div>
            <h5 className="mb-0">Privilèges</h5>
            <p className="text-muted small mb-0">Privilèges et règles d'accès</p>
          </div>
          {/* <Button variant="success" size="sm" onClick={openAddPrivilege}>
            <IconifyIcon icon="tabler:plus" className="me-1" /> Ajouter un privilège
          </Button> */}
        </CardHeader>
        <CardBody className="p-0">
          <Table responsive hover className="mb-0 align-middle table-sm">
            <thead className="table-light">
              <tr>
                <th className="ps-3">Code</th>
                <th>Nom</th>
                <th>Description</th>
                <th>Règles</th>
                <th className="text-center">Type</th>
                <th className="text-center pe-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {privileges.map((privilege) => (
                <tr key={privilege.id}>
                  <td className="ps-3"><code>{privilege.code}</code></td>
                  <td className="fw-semibold">{privilege.nom}</td>
                  <td className="text-muted small">{privilege.description}</td>
                  <td>
                    <div className="d-flex flex-wrap gap-1">
                      {RULE_LABELS.filter((rule) => privilege.rules[rule.key]).map((rule) => (
                        <Badge key={rule.key} bg="light" text="dark" className="fw-normal border">{rule.label}</Badge>
                      ))}
                    </div>
                  </td>
                  <td className="text-center">
                    <Badge bg={privilege.system ? 'secondary' : 'info'}>{privilege.system ? 'Système' : 'Custom'}</Badge>
                  </td>
                  <td className="text-center pe-3">
                    <div className="hstack gap-1 justify-content-center">
                      {priv.canEditSettings && (
                        <Button variant="soft-success" size="sm" className="btn-icon rounded-circle" onClick={() => openEditPrivilege(privilege)}>
                          <IconifyIcon icon="tabler:edit" />
                        </Button>
                      )}
                      {/* <Button variant="soft-danger" size="sm" className="btn-icon rounded-circle" disabled={privilege.system} onClick={() => handleDeletePrivilege(privilege)}>
                        <IconifyIcon icon="tabler:trash" />
                      </Button> */}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </CardBody>
      </Card>

      <Card className="mb-4">
        <CardHeader className="d-flex justify-content-between align-items-center">
          <div>
            <h5 className="mb-0">Rôles</h5>
            <p className="text-muted small mb-0">Associez des privilèges aux rôles</p>
          </div>
          {priv.canEditSettings && (
            <Button variant="success" size="sm" onClick={openAddRole}>
              <IconifyIcon icon="tabler:plus" className="me-1" /> Ajouter un rôle
            </Button>
          )}
        </CardHeader>
        <CardBody className="p-0">
          <Table responsive hover className="mb-0 align-middle table-sm">
            <thead className="table-light">
              <tr>
                <th className="ps-3">Nom</th>
                <th>Description</th>
                <th>Privilèges</th>
                <th className="text-center">Statut</th>
                <th className="text-center">Type</th>
                <th className="text-center pe-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.id}>
                  <td className="ps-3 fw-semibold">{role.nom}</td>
                  <td className="text-muted small">{role.description}</td>
                  <td>
                    <div className="d-flex flex-wrap gap-1">
                      {role.privilegeIds.map((id) => (
                        <Badge key={id} bg="light" text="dark" className="fw-normal border">
                          {privilegeById[id]?.nom ?? id}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="text-center"><Badge bg={role.actif ? 'success' : 'secondary'}>{role.actif ? 'Actif' : 'Inactif'}</Badge></td>
                  <td className="text-center"><Badge bg={role.system ? 'secondary' : 'info'}>{role.system ? 'Système' : 'Custom'}</Badge></td>
                  <td className="text-center pe-3">
                    <div className="hstack gap-1 justify-content-center">
                      {priv.canEditSettings && (
                        <Button variant="soft-success" size="sm" className="btn-icon rounded-circle" onClick={() => openEditRole(role)}>
                          <IconifyIcon icon="tabler:edit" />
                        </Button>
                      )}
                      {/* <Button variant="soft-danger" size="sm" className="btn-icon rounded-circle" disabled={role.system} onClick={() => handleDeleteRole(role)}>
                        <IconifyIcon icon="tabler:trash" />
                      </Button> */}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </CardBody>
      </Card>

      <Card>
        <CardHeader className="d-flex justify-content-between align-items-center">
          <div>
            <h5 className="mb-0">Groupes utilisateurs</h5>
            <p className="text-muted small mb-0">Regroupez les utilisateurs par équipes et rôles</p>
          </div>
          {priv.canEditSettings && (
            <Button variant="success" size="sm" onClick={openAddGroup}>
              <IconifyIcon icon="tabler:plus" className="me-1" /> Ajouter un groupe
            </Button>
          )}
        </CardHeader>
        <CardBody className="p-0">
          <Table responsive hover className="mb-0 align-middle table-sm">
            <thead className="table-light">
              <tr>
                <th className="ps-3">Nom</th>
                <th>Description</th>
                <th>Rôles</th>
                <th className="text-center">Statut</th>
                <th className="text-center pe-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((group) => (
                <tr key={group.id}>
                  <td className="ps-3 fw-semibold">{group.nom}</td>
                  <td className="text-muted small">{group.description}</td>
                  <td><RoleNames roleIds={group.roleIds} roles={roles} /></td>
                  <td className="text-center"><Badge bg={group.actif ? 'success' : 'secondary'}>{group.actif ? 'Actif' : 'Inactif'}</Badge></td>
                  <td className="text-center pe-3">
                    <div className="hstack gap-1 justify-content-center">
                      {priv.canEditSettings && (
                        <Button variant="soft-success" size="sm" className="btn-icon rounded-circle" onClick={() => openEditGroup(group)}>
                          <IconifyIcon icon="tabler:edit" />
                        </Button>
                      )}
                      {/* <Button variant="soft-danger" size="sm" className="btn-icon rounded-circle" onClick={() => handleDeleteGroup(group)}>
                        <IconifyIcon icon="tabler:trash" />
                      </Button> */}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </CardBody>
      </Card>

      <Modal show={showPrivilegeModal} onHide={() => setShowPrivilegeModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingPrivilege ? 'Modifier le privilège' : 'Nouveau privilège'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Code</Form.Label>
                <Form.Control value={privilegeForm.code} onChange={(e) => setPrivilegeForm((prev) => ({ ...prev, code: e.target.value }))} />
              </Form.Group>
            </Col>
            <Col md={8}>
              <Form.Group>
                <Form.Label>Nom</Form.Label>
                <Form.Control value={privilegeForm.nom} onChange={(e) => setPrivilegeForm((prev) => ({ ...prev, nom: e.target.value }))} />
              </Form.Group>
            </Col>
            <Col xs={12}>
              <Form.Group>
                <Form.Label>Description</Form.Label>
                <Form.Control as="textarea" rows={2} value={privilegeForm.description} onChange={(e) => setPrivilegeForm((prev) => ({ ...prev, description: e.target.value }))} />
              </Form.Group>
            </Col>
            <Col xs={12}>
              <Form.Label>Règles</Form.Label>
              <Row>
                {RULE_LABELS.map((rule) => (
                  <Col md={6} key={rule.key}>
                    <Form.Check
                      type="switch"
                      id={`rule-${rule.key}`}
                      label={rule.label}
                      checked={privilegeForm.rules[rule.key]}
                      onChange={(e) =>
                        setPrivilegeForm((prev) => ({
                          ...prev,
                          rules: {
                            ...prev.rules,
                            [rule.key]: e.target.checked,
                          },
                        }))
                      }
                    />
                  </Col>
                ))}
              </Row>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={() => setShowPrivilegeModal(false)}>Annuler</Button>
          <Button variant="primary" onClick={savePrivilege}>Enregistrer</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showRoleModal} onHide={() => setShowRoleModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingRole ? 'Modifier le rôle' : 'Nouveau rôle'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-3">
            <Col xs={12}>
              <Form.Group>
                <Form.Label>Nom</Form.Label>
                <Form.Control value={roleForm.nom} onChange={(e) => setRoleForm((prev) => ({ ...prev, nom: e.target.value }))} />
              </Form.Group>
            </Col>
            <Col xs={12}>
              <Form.Group>
                <Form.Label>Description</Form.Label>
                <Form.Control as="textarea" rows={2} value={roleForm.description} onChange={(e) => setRoleForm((prev) => ({ ...prev, description: e.target.value }))} />
              </Form.Group>
            </Col>
            <Col xs={12}>
              <Form.Label>Privilèges associés</Form.Label>
              {privileges.map((privilege) => (
                <Form.Check
                  key={privilege.id}
                  label={`${privilege.nom} (${privilege.code})`}
                  checked={roleForm.privilegeIds.includes(privilege.id)}
                  onChange={(e) =>
                    setRoleForm((prev) => ({
                      ...prev,
                      privilegeIds: e.target.checked
                        ? [...prev.privilegeIds, privilege.id]
                        : prev.privilegeIds.filter((id) => id !== privilege.id),
                    }))
                  }
                />
              ))}
            </Col>
            <Col xs={12}>
              <Form.Check type="switch" label="Rôle actif" checked={roleForm.actif} onChange={(e) => setRoleForm((prev) => ({ ...prev, actif: e.target.checked }))} />
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={() => setShowRoleModal(false)}>Annuler</Button>
          <Button variant="primary" onClick={saveRole}>Enregistrer</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showGroupModal} onHide={() => setShowGroupModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingGroup ? 'Modifier le groupe' : 'Nouveau groupe'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-3">
            <Col xs={12}>
              <Form.Group>
                <Form.Label>Nom</Form.Label>
                <Form.Control value={groupForm.nom} onChange={(e) => setGroupForm((prev) => ({ ...prev, nom: e.target.value }))} />
              </Form.Group>
            </Col>
            <Col xs={12}>
              <Form.Group>
                <Form.Label>Description</Form.Label>
                <Form.Control as="textarea" rows={2} value={groupForm.description} onChange={(e) => setGroupForm((prev) => ({ ...prev, description: e.target.value }))} />
              </Form.Group>
            </Col>
            <Col xs={12}>
              <Form.Label>Rôles affectés</Form.Label>
              {roles.map((role) => (
                <Form.Check
                  key={role.id}
                  label={role.nom}
                  checked={groupForm.roleIds.includes(role.id)}
                  onChange={(e) =>
                    setGroupForm((prev) => ({
                      ...prev,
                      roleIds: e.target.checked
                        ? [...prev.roleIds, role.id]
                        : prev.roleIds.filter((id) => id !== role.id),
                    }))
                  }
                />
              ))}
            </Col>
            <Col xs={12}>
              <Form.Check type="switch" label="Groupe actif" checked={groupForm.actif} onChange={(e) => setGroupForm((prev) => ({ ...prev, actif: e.target.checked }))} />
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={() => setShowGroupModal(false)}>Annuler</Button>
          <Button variant="primary" onClick={saveGroup}>Enregistrer</Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}
