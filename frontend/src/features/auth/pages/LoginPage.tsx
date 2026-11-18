import {
  useState,
  type FormEvent,
} from 'react'

import {
  useLocation,
  useNavigate,
} from 'react-router-dom'

import { useAuth } from '../../../context/AuthContext'

import './auth.css';
function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const { login } = useAuth()

  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [mostrarPassword, setMostrarPassword] =
    useState(false)

  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    if (cargando) {
      return
    }

    setError('')
    setCargando(true)

    try {
      const usuario = await login(
        correo.trim(),
        password,
      )

      const destinoAnterior =
        location.state?.from?.pathname

      if (
        destinoAnterior &&
        destinoAnterior !== '/login'
      ) {
        navigate(destinoAnterior, {
          replace: true,
        })

        return
      }

      const rol = usuario.rol.toUpperCase()

      switch (rol) {
        case 'ADMIN':
          navigate('/admin', {
            replace: true,
          })
          break

        case 'OPERADOR':
          navigate('/operador', {
            replace: true,
          })
          break

        case 'RESPONSABLE':
          navigate('/responsable', {
            replace: true,
          })
          break

        default:
          setError(
            'El usuario no tiene un rol válido para ingresar al sistema.',
          )
      }
    } catch (error: any) {
      console.error(
        'Error al iniciar sesión:',
        error,
      )

      if (error?.response?.status === 401) {
        setError(
          'Correo o contraseña incorrectos.',
        )
      } else if (error?.response?.status === 403) {
        setError(
          'El usuario no tiene autorización para ingresar.',
        )
      } else if (error?.response?.status === 500) {
        setError(
          'El servidor presentó un error. Intenta nuevamente.',
        )
      } else {
        setError(
          'No se pudo conectar con el servidor.',
        )
      }
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">

        <div className="login-brand">
          <div className="login-logo">
            <i className="bi bi-buildings-fill" />
          </div>

          <div>
            <h1>
              Municipalidad Distrital de Santiago
            </h1>

            <p>
              Sistema de Gestión de Incidencias Urbanas
            </p>
          </div>
        </div>

        <div className="login-card">

          <div className="login-header">
            <span className="badge text-bg-primary mb-3">
              ACCESO INTERNO
            </span>

            <h2>
              Iniciar sesión
            </h2>

            <p>
              Accede al sistema con tu cuenta institucional.
            </p>
          </div>

          {error && (
            <div
              className="alert alert-danger d-flex align-items-center"
              role="alert"
            >
              <i className="bi bi-exclamation-triangle-fill me-2" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>

            <div className="mb-3">
              <label
                htmlFor="correo"
                className="form-label"
              >
                Correo electrónico
              </label>

              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-envelope" />
                </span>

                <input
                  id="correo"
                  type="email"
                  className="form-control"
                  placeholder="correo@municipio.gob.pe"
                  value={correo}
                  onChange={(event) =>
                    setCorreo(event.target.value)
                  }
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label
                htmlFor="password"
                className="form-label"
              >
                Contraseña
              </label>

              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-lock" />
                </span>

                <input
                  id="password"
                  type={
                    mostrarPassword
                      ? 'text'
                      : 'password'
                  }
                  className="form-control"
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() =>
                    setMostrarPassword(
                      !mostrarPassword,
                    )
                  }
                  aria-label={
                    mostrarPassword
                      ? 'Ocultar contraseña'
                      : 'Mostrar contraseña'
                  }
                >
                  <i
                    className={
                      mostrarPassword
                        ? 'bi bi-eye-slash'
                        : 'bi bi-eye'
                    }
                  />
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 py-2"
              disabled={cargando}
            >
              {cargando ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    aria-hidden="true"
                  />

                  Verificando acceso...
                </>
              ) : (
                <>
                  <i className="bi bi-box-arrow-in-right me-2" />
                  Iniciar sesión
                </>
              )}
            </button>

          </form>

          <div className="login-footer">
            <i className="bi bi-shield-lock me-2" />

            Acceso exclusivo para personal autorizado.
          </div>

        </div>
      </div>
    </div>
  )
}

export default LoginPage