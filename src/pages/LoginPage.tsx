import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';

const AUTH_ERRORS: Record<string, string> = {
  'auth/invalid-credential': 'E-mail ou senha incorretos.',
  'auth/email-already-in-use': 'Já existe uma conta com este e-mail.',
  'auth/invalid-email': 'Digite um e-mail válido.',
  'auth/weak-password': 'A senha precisa ter pelo menos 6 caracteres.',
  'auth/too-many-requests': 'Muitas tentativas. Aguarde um pouco e tente de novo.',
  'auth/network-request-failed': 'Sem conexão com o servidor. Verifique sua internet.',
  'auth/operation-not-allowed': 'O login por e-mail e senha não está ativado no Firebase.',
  'auth/configuration-not-found': 'O Authentication ainda não foi ativado no projeto Firebase.',
  'auth/api-key-not-valid.-please-pass-a-valid-api-key.': 'Chave do Firebase inválida. Confira o arquivo .env.local.',
};

function errorMessage(error: unknown): string {
  const code = (error as { code?: string }).code ?? '';
  return AUTH_ERRORS[code] ?? 'Não foi possível entrar. Tente novamente.';
}

export default function LoginPage() {
  const { user } = useAuth();
  const location = useLocation();
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const firstField = useRef<HTMLInputElement>(null);

  // Ao alternar entre entrar e criar conta, o cursor vai para o primeiro campo.
  useEffect(() => {
    firstField.current?.focus();
  }, [isRegistering]);

  if (user) {
    const from = (location.state as { from?: string } | null)?.from ?? '/painel';
    return <Navigate to={from} replace />;
  }

  async function run(action: () => Promise<void>) {
    setSubmitting(true);
    setError(null);
    try {
      await action();
    } catch (caught) {
      setError(errorMessage(caught));
      setSubmitting(false);
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (isRegistering && password.length < 6) {
      setError('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }
    void run(() =>
      isRegistering ? api.register(name.trim(), email.trim(), password) : api.login(email.trim(), password),
    );
  }

  return (
    <section className="auth">
      <h1>{isRegistering ? 'Crie sua conta' : 'Bem-vindo de volta'}</h1>
      <form className="panel form-stack" onSubmit={handleSubmit}>
        {isRegistering && (
          <label className="field">
            <span>Nome</span>
            <input ref={firstField} required autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} />
          </label>
        )}
        <label className="field">
          <span>E-mail</span>
          <input
            ref={isRegistering ? undefined : firstField}
            required
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label className="field">
          <span>Senha</span>
          <input
            required
            type="password"
            autoComplete={isRegistering ? 'new-password' : 'current-password'}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        {error && <p className="alert alert-error" role="alert">{error}</p>}
        <button type="submit" className="button" disabled={submitting}>
          {isRegistering ? 'Criar conta' : 'Entrar'}
        </button>
        {api.loginWithSampleData && (
          <button
            type="button"
            className="button button-ghost"
            disabled={submitting}
            onClick={() => void run(() => api.loginWithSampleData!())}
          >
            Entrar com dados de exemplo
          </button>
        )}
      </form>
      <button
        type="button"
        className="button-link auth-switch"
        onClick={() => {
          setIsRegistering(!isRegistering);
          setError(null);
        }}
      >
        {isRegistering ? 'Já tenho uma conta' : 'Ainda não tenho conta'}
      </button>
    </section>
  );
}
