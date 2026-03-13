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
import LoginPage from "./LoginPage";

export default function App() {
  const [opened, { toggle }] = useDisclosure();
  const [active, setActive] = useState(0);
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // Handle OAuth callback: token & email come back as query params
    const params = new URLSearchParams(window.location.search);
    const oauthToken = params.get("token");
    const oauthEmail = params.get("email");
    if (oauthToken && oauthEmail) {
      localStorage.setItem("token", oauthToken);
      setUsername(oauthEmail);
      setLoggedIn(true);
      setCheckingAuth(false);
      window.history.replaceState({}, "", "/");
      return;
    }

    // Check existing token
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
        <LoginPage onLogin={(email) => { setUsername(email); setLoggedIn(true); }} />
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
