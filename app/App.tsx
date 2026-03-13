import { useState, useEffect } from "react";
import {
  MantineProvider,
  AppShell,
  Burger,
  Group,
  NavLink,
  Title,
  Button,
  Text,
  Code,
  Stack,
  TextInput,
  PasswordInput,
  Checkbox,
  Anchor,
  Alert,
  Center,
  Paper,
  LoadingOverlay,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconHome,
  IconApi,
  IconSettings,
  IconRocket,
  IconUser,
} from "@tabler/icons-react";
import "@mantine/core/styles.css";

export default function App() {
  const [opened, { toggle }] = useDisclosure();
  const [active, setActive] = useState(0);
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setCheckingAuth(false);
      return;
    }
    fetch("/api/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        setUsername(data.user.email);
        setLoggedIn(true);
      })
      .catch(() => {
        localStorage.removeItem("token");
      })
      .finally(() => setCheckingAuth(false));
  }, []);

  const navItems = [
    { icon: IconHome, label: "Home" },
    { icon: IconApi, label: "API Test" },
    { icon: IconSettings, label: "Settings" },
  ];

  const callApi = async () => {
    const res = await fetch("/api/hello");
    const data = await res.json();
    setApiResponse(JSON.stringify(data, null, 2));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

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
      setUsername(data.user.email);
      setLoggedIn(true);
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setLoggedIn(false);
    setUsername("");
  };

  if (checkingAuth) {
    return (
      <MantineProvider defaultColorScheme="dark">
        <LoadingOverlay visible />
      </MantineProvider>
    );
  }

  if (!loggedIn) {
    return (
      <MantineProvider defaultColorScheme="dark">
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
              {loginError && (
                <Alert color="red" variant="light">
                  {loginError}
                </Alert>
              )}
              <form onSubmit={handleLogin}>
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
                  <Button type="submit" fullWidth loading={loginLoading}>
                    Sign in
                  </Button>
                </Stack>
              </form>
            </Stack>
          </Paper>
        </Center>
      </MantineProvider>
    );
  }

  return (
    <MantineProvider defaultColorScheme="dark">
      <AppShell
        header={{ height: 60 }}
        navbar={{ width: 250, breakpoint: "sm", collapsed: { mobile: !opened } }}
        padding="md"
      >
        <AppShell.Header>
          <Group h="100%" px="md" justify="space-between">
            <Group>
              <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
              <IconRocket size={28} color="var(--mantine-color-blue-6)" />
              <Title order={3}>Nitro + Vite</Title>
            </Group>
            <Group gap="xs">
              <IconUser size={18} />
              <Text size="sm">{username}</Text>
              <Button variant="subtle" size="xs" onClick={handleLogout}>
                Logout
              </Button>
            </Group>
          </Group>
        </AppShell.Header>

        <AppShell.Navbar p="md">
          {navItems.map((item, index) => (
            <NavLink
              key={item.label}
              active={index === active}
              label={item.label}
              leftSection={<item.icon size={20} />}
              onClick={() => {
                setActive(index);
                toggle();
              }}
            />
          ))}
        </AppShell.Navbar>

        <AppShell.Main>
          {active === 0 && (
            <Stack>
              <Title order={2}>Welcome</Title>
              <Text>
                This app is powered by <strong>Nitro</strong> and <strong>Vite</strong> with a{" "}
                <strong>Mantine</strong> UI.
              </Text>
            </Stack>
          )}

          {active === 1 && (
            <Stack>
              <Title order={2}>API Test</Title>
              <Button onClick={callApi} w="fit-content">
                Call /api/hello
              </Button>
              {apiResponse && (
                <Code block>{apiResponse}</Code>
              )}
            </Stack>
          )}

          {active === 2 && (
            <Stack>
              <Title order={2}>Settings</Title>
              <Text c="dimmed">Nothing here yet.</Text>
            </Stack>
          )}
        </AppShell.Main>
      </AppShell>
    </MantineProvider>
  );
}
