import { useEffect, useMemo, useState } from 'react'
import { useUsuarios } from '../hooks/useUsuarios'
import type {
  Usuario,
  RolUsuario,
  CrearUsuarioPayload,
  ActualizarUsuarioPayload,
} from '../types/usuario.types'
import './usuarios.css'

type ModalMode = 'crear' | 'editar' | 'password' | null

interface FormUsuario {
  nombre: string
  correo: string
  password: string
  id_rol: string
  id_oficina: string
}

const ROLES_CONOCIDOS: RolUsuario[] = [
  'ADMIN',
  'OPERADOR',
  'RESPONSABLE',
]

const normalizar = (value: string | null | undefined) =>
  (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

const mensajeFecha = (fecha: string | null) => {
  if (!fecha) return 'Nunca'

  const parsed = new Date(fecha)

  if (Number.isNaN(parsed.getTime())) return '—'

  return parsed.toLocaleString('es-PE', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

const formularioInicial: FormUsuario = {
  nombre: '',
  correo: '',
  password: '',
  id_rol: '',
  id_oficina: '',
}

export default function UsuariosPage() {
  const {
    usuarios,
    loading,
    saving,
    error,
    setError,
    loadUsuarios,
    create,
    update,
    changePassword,
    changeStatus,
    deactivate,
  } = useUsuarios()

  const [busqueda, setBusqueda] = useState('')
  const [filtroRol, setFiltroRol] = useState('TODOS')
  const [filtroEstado, setFiltroEstado] = useState('TODOS')
  const [modal, setModal] = useState<ModalMode>(null)
  const [usuarioSeleccionado, setUsuarioSeleccionado] =
    useState<Usuario | null>(null)
  const [form, setForm] = useState<FormUsuario>(formularioInicial)
  const [confirmarPassword, setConfirmarPassword] = useState('')

  const [mensaje, setMensaje] = useState<string | null>(null)
  const [errorFormulario, setErrorFormulario] = useState<string | null>(null)

  useEffect(() => {
    void loadUsuarios()
  }, [loadUsuarios])

  // Los roles se obtienen de usuarios existentes porque
  // el backend actual no expone una ruta de catálogo de roles.
  const rolesDisponibles = useMemo(() => {
    const encontrados = new Map<number, string>()

    usuarios.forEach((usuario) => {
      if (usuario.id_rol && usuario.rol) {
        encontrados.set(usuario.id_rol, String(usuario.rol).toUpperCase())
      }
    })

    return [...encontrados.entries()]
      .map(([id, nombre]) => ({ id, nombre }))
      .sort((a, b) => {
        const aIndex = ROLES_CONOCIDOS.indexOf(a.nombre as RolUsuario)
        const bIndex = ROLES_CONOCIDOS.indexOf(b.nombre as RolUsuario)
        return (aIndex < 0 ? 99 : aIndex) - (bIndex < 0 ? 99 : bIndex)
      })
  }, [usuarios])

  // Las oficinas se obtienen de los usuarios existentes.
  const oficinasDisponibles = useMemo(() => {
    const encontrados = new Map<number, string>()

    usuarios.forEach((usuario) => {
      if (usuario.id_oficina && usuario.oficina) {
        encontrados.set(usuario.id_oficina, usuario.oficina)
      }
    })

    return [...encontrados.entries()]
      .map(([id, nombre]) => ({ id, nombre }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
  }, [usuarios])

  const usuariosFiltrados = useMemo(() => {
    const termino = normalizar(busqueda)

    return usuarios.filter((usuario) => {
      const coincideBusqueda =
        !termino ||
        normalizar(usuario.nombre).includes(termino) ||
        normalizar(usuario.correo).includes(termino) ||
        String(usuario.id_usuario).includes(termino) ||
        normalizar(usuario.oficina).includes(termino)

      const coincideRol =
        filtroRol === 'TODOS' ||
        String(usuario.id_rol ?? '') === filtroRol

      const coincideEstado =
        filtroEstado === 'TODOS' ||
        (filtroEstado === 'ACTIVOS' && usuario.estado) ||
        (filtroEstado === 'INACTIVOS' && !usuario.estado)

      return coincideBusqueda && coincideRol && coincideEstado
    })
  }, [usuarios, busqueda, filtroRol, filtroEstado])

  const activos = usuarios.filter((usuario) => usuario.estado).length
  const inactivos = usuarios.length - activos

  const cerrarModal = () => {
    setModal(null)
    setUsuarioSeleccionado(null)
    setForm(formularioInicial)
    setConfirmarPassword('')
    setErrorFormulario(null)
    setError(null)
  }

  const abrirCrear = () => {
    setUsuarioSeleccionado(null)
    setForm({
      ...formularioInicial,
      id_rol: rolesDisponibles[0]?.id.toString() ?? '',
    })
    setErrorFormulario(null)
    setMensaje(null)
    setModal('crear')
  }

  const abrirEditar = (usuario: Usuario) => {
    setUsuarioSeleccionado(usuario)
    setForm({
      nombre: usuario.nombre,
      correo: usuario.correo,
      password: '',
      id_rol: usuario.id_rol?.toString() ?? '',
      id_oficina: usuario.id_oficina?.toString() ?? '',
    })
    setErrorFormulario(null)
    setMensaje(null)
    setModal('editar')
  }

  const abrirPassword = (usuario: Usuario) => {
    setUsuarioSeleccionado(usuario)
    setForm(formularioInicial)
    setConfirmarPassword('')
    setErrorFormulario(null)
    setMensaje(null)
    setModal('password')
  }

  const rolSeleccionado = rolesDisponibles.find(
    (rol) => String(rol.id) === form.id_rol
  )

  const esAdmin = rolSeleccionado?.nombre === 'ADMIN'

  const guardarUsuario = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorFormulario(null)
    setMensaje(null)

    const nombre = form.nombre.trim()
    const correo = form.correo.trim()

    if (!nombre || !correo || !form.id_rol) {
      setErrorFormulario('Completa el nombre, correo y rol.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      setErrorFormulario('Ingresa un correo electrónico válido.')
      return
    }

    if (modal === 'crear' && form.password.length < 6) {
      setErrorFormulario('La contraseña debe tener al menos 6 caracteres.')
      return
    }

    if (!esAdmin && !form.id_oficina) {
      setErrorFormulario('Selecciona una oficina para este rol.')
      return
    }

    const idOficina = esAdmin ? null : Number(form.id_oficina)
    const idRol = Number(form.id_rol)

    if (modal === 'crear') {
      const payload: CrearUsuarioPayload = {
        nombre,
        correo,
        password: form.password,
        id_rol: idRol,
        id_oficina: idOficina,
      }

      const ok = await create(payload)

      if (ok) {
        cerrarModal()
        setMensaje('Usuario creado correctamente.')
      }
    }

    if (modal === 'editar' && usuarioSeleccionado) {
      const payload: ActualizarUsuarioPayload = {
        nombre,
        correo,
        id_rol: idRol,
        id_oficina: idOficina,
      }

      const ok = await update(usuarioSeleccionado.id_usuario, payload)

      if (ok) {
        cerrarModal()
        setMensaje('Usuario actualizado correctamente.')
      }
    }
  }

  const guardarPassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorFormulario(null)
    setMensaje(null)

    if (form.password.length < 6) {
      setErrorFormulario('La contraseña debe tener al menos 6 caracteres.')
      return
    }

    if (form.password !== confirmarPassword) {
      setErrorFormulario('Las contraseñas no coinciden.')
      return
    }

    if (!usuarioSeleccionado) return

    const ok = await changePassword(
      usuarioSeleccionado.id_usuario,
      form.password
    )

    if (ok) {
      cerrarModal()
      setMensaje('Contraseña actualizada correctamente.')
    }
  }

  const alternarEstado = async (usuario: Usuario) => {
    const accion = usuario.estado ? 'desactivar' : 'activar'

    if (
      !window.confirm(
        `¿Deseas ${accion} al usuario "${usuario.nombre}"?`
      )
    ) {
      return
    }

    setMensaje(null)
    const ok = await changeStatus(usuario.id_usuario, !usuario.estado)

    if (ok) {
      setMensaje(`Usuario ${usuario.estado ? 'desactivado' : 'activado'} correctamente.`)
    }
  }

  const eliminarLogicamente = async (usuario: Usuario) => {
    if (
      !window.confirm(
        `¿Confirmas la desactivación lógica de "${usuario.nombre}"?`
      )
    ) {
      return
    }

    setMensaje(null)
    const ok = await deactivate(usuario.id_usuario)

    if (ok) setMensaje('Usuario desactivado correctamente.')
  }

  return (
    <main className="usuarios-page">
      <header className="usuarios-header">
        <div>
          <div className="usuarios-breadcrumb">
            Administración <span>/</span> Usuarios
          </div>
          <h1>Gestión de usuarios</h1>
          <p>
            Administra las cuentas, los roles, las oficinas y el estado de acceso.
          </p>
        </div>

        <div className="usuarios-header-actions">
          <button
            type="button"
            className="usuarios-btn usuarios-btn-secondary"
            onClick={() => void loadUsuarios()}
            disabled={loading}
          >
            <span aria-hidden="true">↻</span>
            {loading ? 'Actualizando…' : 'Actualizar'}
          </button>
          <button
            type="button"
            className="usuarios-btn usuarios-btn-primary"
            onClick={abrirCrear}
            disabled={rolesDisponibles.length === 0}
            title={
              rolesDisponibles.length === 0
                ? 'No se encontraron roles para seleccionar.'
                : 'Crear un usuario'
            }
          >
            <span aria-hidden="true">＋</span>
            Nuevo usuario
          </button>
        </div>
      </header>

      {mensaje && (
        <div className="usuarios-alert usuarios-alert-success" role="status">
          <span>{mensaje}</span>
          <button type="button" onClick={() => setMensaje(null)} aria-label="Cerrar">
            ×
          </button>
        </div>
      )}

      {error && (
        <div className="usuarios-alert usuarios-alert-error" role="alert">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} aria-label="Cerrar">
            ×
          </button>
        </div>
      )}

      <section className="usuarios-stats">
        <article className="usuarios-stat">
          <div className="usuarios-stat-icon usuarios-stat-icon-blue">U</div>
          <div>
            <span>Total de usuarios</span>
            <strong>{usuarios.length}</strong>
          </div>
        </article>

        <article className="usuarios-stat">
          <div className="usuarios-stat-icon usuarios-stat-icon-green">✓</div>
          <div>
            <span>Usuarios activos</span>
            <strong>{activos}</strong>
          </div>
        </article>

        <article className="usuarios-stat">
          <div className="usuarios-stat-icon usuarios-stat-icon-gray">–</div>
          <div>
            <span>Usuarios inactivos</span>
            <strong>{inactivos}</strong>
          </div>
        </article>
      </section>

      <section className="usuarios-panel">
        <div className="usuarios-panel-heading">
          <div>
            <h2>Usuarios registrados</h2>
            <p>Busca, filtra y administra las cuentas del sistema.</p>
          </div>
          <span className="usuarios-count">
            {usuariosFiltrados.length} resultado(s)
          </span>
        </div>

        <div className="usuarios-filters">
          <label className="usuarios-search">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              placeholder="Buscar por nombre, correo, ID u oficina…"
              aria-label="Buscar usuarios"
            />
          </label>

          <select
            value={filtroRol}
            onChange={(event) => setFiltroRol(event.target.value)}
            aria-label="Filtrar por rol"
          >
            <option value="TODOS">Todos los roles</option>
            {rolesDisponibles.map((rol) => (
              <option key={rol.id} value={String(rol.id)}>
                {rol.nombre}
              </option>
            ))}
          </select>

          <select
            value={filtroEstado}
            onChange={(event) => setFiltroEstado(event.target.value)}
            aria-label="Filtrar por estado"
          >
            <option value="TODOS">Todos los estados</option>
            <option value="ACTIVOS">Activos</option>
            <option value="INACTIVOS">Inactivos</option>
          </select>

          <button
            type="button"
            className="usuarios-btn usuarios-btn-secondary"
            onClick={() => {
              setBusqueda('')
              setFiltroRol('TODOS')
              setFiltroEstado('TODOS')
            }}
          >
            Limpiar
          </button>
        </div>

        {loading && usuarios.length === 0 ? (
          <div className="usuarios-empty">
            <div className="usuarios-spinner" />
            <p>Cargando usuarios…</p>
          </div>
        ) : usuariosFiltrados.length === 0 ? (
          <div className="usuarios-empty">
            <div className="usuarios-empty-icon">U</div>
            <h3>No se encontraron usuarios</h3>
            <p>
              {usuarios.length === 0
                ? 'Todavía no hay usuarios disponibles o no tienes permiso para listarlos.'
                : 'Prueba cambiando los filtros de búsqueda.'}
            </p>
          </div>
        ) : (
          <div className="usuarios-table-wrap">
            <table className="usuarios-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Rol</th>
                  <th>Oficina</th>
                  <th>Estado</th>
                  <th>Último acceso</th>
                  <th className="usuarios-actions-heading">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.map((usuario) => (
                  <tr key={usuario.id_usuario}>
                    <td>
                      <div className="usuarios-identity">
                        <div className="usuarios-avatar">
                          {usuario.nombre.trim().charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="usuarios-identity-text">
                          <strong>{usuario.nombre}</strong>
                          <span>{usuario.correo}</span>
                          <small>ID: {usuario.id_usuario}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`usuarios-role usuarios-role-${normalizar(usuario.rol).replace(/\s/g, '-')}`}>
                        {usuario.rol || 'Sin rol'}
                      </span>
                    </td>
                    <td>{usuario.oficina || '—'}</td>
                    <td>
                      <span className={`usuarios-status ${usuario.estado ? 'is-active' : 'is-inactive'}`}>
                        <span />
                        {usuario.estado ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="usuarios-last-access">
                      {mensajeFecha(usuario.ultimo_acceso)}
                    </td>
                    <td>
                      <div className="usuarios-row-actions">
                        <button
                          type="button"
                          className="usuarios-icon-btn"
                          title="Editar usuario"
                          aria-label={`Editar ${usuario.nombre}`}
                          onClick={() => abrirEditar(usuario)}
                        >
                          ✎
                        </button>
                        <button
                          type="button"
                          className="usuarios-icon-btn"
                          title="Cambiar contraseña"
                          aria-label={`Cambiar contraseña de ${usuario.nombre}`}
                          onClick={() => abrirPassword(usuario)}
                        >
                          ⚿
                        </button>
                        <button
                          type="button"
                          className={`usuarios-icon-btn ${usuario.estado ? 'usuarios-icon-danger' : 'usuarios-icon-success'}`}
                          title={usuario.estado ? 'Desactivar usuario' : 'Activar usuario'}
                          aria-label={`${usuario.estado ? 'Desactivar' : 'Activar'} ${usuario.nombre}`}
                          onClick={() => void alternarEstado(usuario)}
                          disabled={saving}
                        >
                          {usuario.estado ? '⊘' : '✓'}
                        </button>
                        <button
                          type="button"
                          className="usuarios-icon-btn usuarios-icon-danger"
                          title="Desactivar mediante eliminación lógica"
                          aria-label={`Desactivar ${usuario.nombre} mediante eliminación lógica`}
                          onClick={() => void eliminarLogicamente(usuario)}
                          disabled={saving || !usuario.estado}
                        >
                          ×
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {modal && (
        <div
          className="usuarios-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) cerrarModal()
          }}
        >
          <section
            className="usuarios-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="usuarios-modal-title"
          >
            <header className="usuarios-modal-header">
              <div>
                <span className="usuarios-modal-kicker">
                  Administración de cuentas
                </span>
                <h2 id="usuarios-modal-title">
                  {modal === 'crear' && 'Crear usuario'}
                  {modal === 'editar' && 'Editar usuario'}
                  {modal === 'password' && 'Cambiar contraseña'}
                </h2>
                <p>
                  {modal === 'password'
                    ? `Actualiza las credenciales de ${usuarioSeleccionado?.nombre ?? 'este usuario'}.`
                    : 'Completa los datos solicitados para continuar.'}
                </p>
              </div>
              <button
                type="button"
                className="usuarios-modal-close"
                onClick={cerrarModal}
                aria-label="Cerrar ventana"
              >
                ×
              </button>
            </header>

            {modal === 'password' ? (
              <form onSubmit={(event) => void guardarPassword(event)}>
                <div className="usuarios-modal-body">
                  {errorFormulario && (
                    <div className="usuarios-alert usuarios-alert-error">
                      {errorFormulario}
                    </div>
                  )}

                  <label className="usuarios-field">
                    <span>Nueva contraseña *</span>
                    <input
                      type="password"
                      value={form.password}
                      onChange={(event) =>
                        setForm({ ...form, password: event.target.value })
                      }
                      autoComplete="new-password"
                      minLength={6}
                      required
                    />
                    <small>Debe contener al menos 6 caracteres.</small>
                  </label>

                  <label className="usuarios-field">
                    <span>Confirmar contraseña *</span>
                    <input
                      type="password"
                      value={confirmarPassword}
                      onChange={(event) => setConfirmarPassword(event.target.value)}
                      autoComplete="new-password"
                      minLength={6}
                      required
                    />
                  </label>
                </div>

                <footer className="usuarios-modal-footer">
                  <button
                    type="button"
                    className="usuarios-btn usuarios-btn-secondary"
                    onClick={cerrarModal}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="usuarios-btn usuarios-btn-primary"
                    disabled={saving}
                  >
                    {saving ? 'Guardando…' : 'Actualizar contraseña'}
                  </button>
                </footer>
              </form>
            ) : (
              <form onSubmit={(event) => void guardarUsuario(event)}>
                <div className="usuarios-modal-body">
                  {errorFormulario && (
                    <div className="usuarios-alert usuarios-alert-error">
                      {errorFormulario}
                    </div>
                  )}

                  <label className="usuarios-field">
                    <span>Nombre completo *</span>
                    <input
                      type="text"
                      value={form.nombre}
                      onChange={(event) =>
                        setForm({ ...form, nombre: event.target.value })
                      }
                      autoComplete="name"
                      maxLength={150}
                      required
                    />
                  </label>

                  <label className="usuarios-field">
                    <span>Correo electrónico *</span>
                    <input
                      type="email"
                      value={form.correo}
                      onChange={(event) =>
                        setForm({ ...form, correo: event.target.value })
                      }
                      autoComplete="email"
                      required
                    />
                  </label>

                  {modal === 'crear' && (
                    <label className="usuarios-field">
                      <span>Contraseña inicial *</span>
                      <input
                        type="password"
                        value={form.password}
                        onChange={(event) =>
                          setForm({ ...form, password: event.target.value })
                        }
                        autoComplete="new-password"
                        minLength={6}
                        required
                      />
                      <small>Mínimo 6 caracteres.</small>
                    </label>
                  )}

                  <label className="usuarios-field">
                    <span>Rol del usuario *</span>
                    <select
                      value={form.id_rol}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          id_rol: event.target.value,
                          id_oficina: '',
                        })
                      }
                      required
                    >
                      <option value="">Selecciona un rol</option>
                      {rolesDisponibles.map((rol) => (
                        <option key={rol.id} value={String(rol.id)}>
                          {rol.nombre}
                        </option>
                      ))}
                    </select>
                  </label>

                  {esAdmin ? (
                    <div className="usuarios-office-note">
                      <strong>Rol administrador</strong>
                      <span>
                        Este rol no requiere una oficina asignada.
                      </span>
                    </div>
                  ) : (
                    <label className="usuarios-field">
                      <span>Oficina *</span>
                      <select
                        value={form.id_oficina}
                        onChange={(event) =>
                          setForm({ ...form, id_oficina: event.target.value })
                        }
                        required
                      >
                        <option value="">Selecciona una oficina</option>
                        {oficinasDisponibles.map((oficina) => (
                          <option key={oficina.id} value={String(oficina.id)}>
                            {oficina.nombre}
                          </option>
                        ))}
                      </select>
                      {oficinasDisponibles.length === 0 && (
                        <small>
                          No se encontraron oficinas en los usuarios cargados.
                        </small>
                      )}
                    </label>
                  )}
                </div>

                <footer className="usuarios-modal-footer">
                  <button
                    type="button"
                    className="usuarios-btn usuarios-btn-secondary"
                    onClick={cerrarModal}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="usuarios-btn usuarios-btn-primary"
                    disabled={saving}
                  >
                    {saving
                      ? 'Guardando…'
                      : modal === 'crear'
                        ? 'Crear usuario'
                        : 'Guardar cambios'}
                  </button>
                </footer>
              </form>
            )}
          </section>
        </div>
      )}
    </main>
  )
}