import { useState } from "react";
import {
  Center,
  Paper,
  Stack,
  Group,
  Title,
  Text,
  TextInput,
  PasswordInput,
  Checkbox,
  Anchor,
  Alert,
  Button,
  Divider,
} from "@mantine/core";
import { IconRocket, IconBrandGoogle } from "@tabler/icons-react";

interface LoginPageProps {
  onLogin: (email: string, token: string) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.statusMessage || "Login failed");
      }

      const data = await res.json();
      localStorage.setItem("token", data.token);
      onLogin(data.user.email, data.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Center h="100vh">
      <Paper w={400} p="xl" radius="md" withBorder>
        <Stack>
          <Group justify="center">
            <IconRocket size={32} color="var(--mantine-color-blue-6)" />
            <Title order={2}>Nitro + Vite</Title>
          </Group>
          <Text c="dimmed" ta="center" size="sm">
            Sign in to continue
          </Text>
          {error && (
            <Alert color="red" variant="light">
              {error}
            </Alert>
          )}
          <Button
            fullWidth
            variant="default"
            leftSection={<IconBrandGoogle size={18} />}
            component="a"
            href="/api/auth/google"
          >
            Continue with Google
          </Button>
          <Divider label="Or continue with email" labelPosition="center" />
          <form onSubmit={handleSubmit}>
            <Stack>
              <TextInput
                name="email"
                label="Email"
                placeholder="you@example.com"
                required
              />
              <PasswordInput
                name="password"
                label="Password"
                placeholder="Your password"
                required
              />
              <Group justify="space-between">
                <Checkbox label="Remember me" />
                <Anchor size="sm">Forgot password?</Anchor>
              </Group>
              <Button type="submit" fullWidth loading={loading}>
                Sign in
              </Button>
            </Stack>
          </form>
        </Stack>
      </Paper>
    </Center>
  );
}
