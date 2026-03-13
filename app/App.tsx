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
  IconUsers,
} from "@tabler/icons-react";
import "@mantine/core/styles.css";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";
import UsersPage from "./UsersPage";

export default function App() {
  const [opened, { toggle }] = useDisclosure();
  const [active, setActive] = useState(0);
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authPage, setAuthPage] = useState<"login" | "register">("login");

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
        setIsAdmin(!!data.user.admin);
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
    ...(isAdmin ? [{ icon: IconUsers, label: "Users" }] : []),
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
    setIsAdmin(false);
  };

  if (checkingAuth) {
    return (
      <MantineProvider defaultColorScheme="dark">
        <LoadingOverlay visible />
      </MantineProvider>
    );
  }

  if (!loggedIn) {
    const handleAuth = (email: string) => { setUsername(email); setLoggedIn(true); setIsAdmin(false); };
    return (
      <MantineProvider defaultColorScheme="dark">
        {authPage === "login" ? (
          <LoginPage onLogin={handleAuth} onSwitchToRegister={() => setAuthPage("register")} />
        ) : (
          <RegisterPage onRegister={handleAuth} onSwitchToLogin={() => setAuthPage("login")} />
        )}
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

          {active === 3 && isAdmin && <UsersPage />}
        </AppShell.Main>
      </AppShell>
    </MantineProvider>
  );
}
