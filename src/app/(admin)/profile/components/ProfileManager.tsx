/* Konrad Ahodan : konrad.ahodan@approbations.ca */
'use client'

import { useEffect, useMemo, useState } from 'react'
import { Badge, Button, Card, CardBody, CardHeader, Col, Form, Row } from 'react-bootstrap'
import { useSession } from 'next-auth/react'
import { useNotificationContext } from '@/context/useNotificationContext'
import { changeMyPassword, CurrentUserProfile, getCurrentUserProfile } from '@/services/profileService'

function formatDate(value?: string): string {
  if (!value) return '—'
  return new Date(value).toLocaleString('fr-FR')
}

export default function ProfileManager() {
  const { data: session } = useSession()
  const { showNotification } = useNotificationContext()

  const [loadingProfile, setLoadingProfile] = useState(false)
  const [profile, setProfile] = useState<CurrentUserProfile | null>(null)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)

  const apiToken = (session as { apiToken?: string } | null)?.apiToken
  const sessionFallback = useMemo<CurrentUserProfile>(() => ({
    nom: session?.user?.name ?? 'Utilisateur',
    email: session?.user?.email ?? '',
    statut: 'Actif',
  }), [session])

  useEffect(() => {
    let mounted = true

    const load = async () => {
      setLoadingProfile(true)
      try {
        const data = await getCurrentUserProfile(apiToken)
        if (!mounted) return
        setProfile(data ?? sessionFallback)
      } catch {
        if (!mounted) return
        setProfile(sessionFallback)
      } finally {
        if (mounted) setLoadingProfile(false)
      }
    }

    load()

    return () => {
      mounted = false
    }
  }, [apiToken, sessionFallback])

  const onSubmitPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!currentPassword || !newPassword || !confirmPassword) {
      showNotification({ message: 'Veuillez remplir tous les champs.', variant: 'warning' })
      return
    }

    if (newPassword.length < 8) {
      showNotification({ message: 'Le nouveau mot de passe doit contenir au moins 8 caractères.', variant: 'warning' })
      return
    }

    if (newPassword !== confirmPassword) {
      showNotification({ message: 'La confirmation ne correspond pas au nouveau mot de passe.', variant: 'warning' })
      return
    }

    setSavingPassword(true)
    try {
      await changeMyPassword({ currentPassword, newPassword, confirmPassword }, apiToken)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      showNotification({ message: 'Mot de passe modifié avec succès.', variant: 'success' })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Impossible de modifier le mot de passe.'
      showNotification({ message, variant: 'danger' })
    } finally {
      setSavingPassword(false)
    }
  }

  const profileData = profile ?? sessionFallback

  return (
    <Row className="g-4">
      <Col xl={5}>
        <Card>
          <CardHeader>
            <h5 className="mb-0">Informations du profil</h5>
          </CardHeader>
          <CardBody>
            {loadingProfile ? (
              <p className="text-muted mb-0">Chargement du profil...</p>
            ) : (
              <div className="d-flex flex-column gap-3">
                <div>
                  <small className="text-muted d-block">Nom</small>
                  <span className="fw-semibold">{profileData.nom || '—'}</span>
                </div>
                <div>
                  <small className="text-muted d-block">Email</small>
                  <span className="fw-semibold">{profileData.email || '—'}</span>
                </div>
                <div>
                  <small className="text-muted d-block">Téléphone</small>
                  <span className="fw-semibold">{profileData.telephone || '—'}</span>
                </div>
                <div>
                  <small className="text-muted d-block">Statut</small>
                  <Badge bg={profileData.statut === 'Actif' ? 'success' : 'secondary'}>
                    {profileData.statut ?? 'Actif'}
                  </Badge>
                </div>
                <div>
                  <small className="text-muted d-block">Compte créé le</small>
                  <span className="fw-semibold">{formatDate(profileData.createdAt)}</span>
                </div>
                <div>
                  <small className="text-muted d-block">Dernier changement mot de passe</small>
                  <span className="fw-semibold">{formatDate(profileData.lastPasswordResetAt)}</span>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </Col>

      <Col xl={7}>
        <Card>
          <CardHeader>
            <h5 className="mb-0">Changer le mot de passe</h5>
          </CardHeader>
          <CardBody>
            <form onSubmit={onSubmitPassword}>
              <Row className="g-3">
                <Col xs={12}>
                  <Form.Group>
                    <Form.Label>Mot de passe actuel</Form.Label>
                    <Form.Control
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Entrer le mot de passe actuel"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Nouveau mot de passe</Form.Label>
                    <Form.Control
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 8 caractères"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Confirmer le mot de passe</Form.Label>
                    <Form.Control
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirmer le nouveau mot de passe"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <div className="d-flex justify-content-end mt-4">
                <Button type="submit" variant="primary" disabled={savingPassword}>
                  {savingPassword ? 'Enregistrement...' : 'Mettre à jour'}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </Col>
    </Row>
  )
}

