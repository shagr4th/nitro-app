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
  Alert,
  Button,
  Anchor,
} from "@mantine/core";
import { IconRocket } from "@tabler/icons-react";

interface RegisterPageProps {
  onRegister: (email: string, token: string) => void;
  onSwitchToLogin: () => void;
}

export default function RegisterPage({ onRegister, onSwitchToLogin }: RegisterPageProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.statusMessage || "Registration failed");
      }

      const data = await res.json();
      localStorage.setItem("token", data.token);
      onRegister(data.user.email, data.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
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
            Create your account
          </Text>
          {error && (
            <Alert color="red" variant="light">
              {error}
            </Alert>
          )}
          <form onSubmit={handleSubmit}>
            <Stack>
              <TextInput
                name="name"
                label="Name"
                placeholder="Your name"
              />
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
              <PasswordInput
                name="confirmPassword"
                label="Confirm password"
                placeholder="Repeat your password"
                required
              />
              <Button type="submit" fullWidth loading={loading}>
                Create account
              </Button>
            </Stack>
          </form>
          <Text ta="center" size="sm">
            Already have an account?{" "}
            <Anchor size="sm" onClick={onSwitchToLogin}>
              Sign in
            </Anchor>
          </Text>
        </Stack>
      </Paper>
    </Center>
  );
}
