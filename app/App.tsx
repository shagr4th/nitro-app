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
IconRocket,
  IconUser,
  IconUsers,
} from "@tabler/icons-react";
import "@mantine/core/styles.css";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";
import UsersPage from "./UsersPage";
import ProfilePage from "./ProfilePage";

export default function App() {
  const [opened, { toggle }] = useDisclosure();
  const [active, setActive] = useState(0);
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [userName, setUserName] = useState("");
  const [userPicture, setUserPicture] = useState<string | null>(null);
  const [oauthProvider, setOauthProvider] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState(0);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authPage, setAuthPage] = useState<"login" | "register">("login");

  useEffect(() => {
    // Handle OAuth callback: token comes back as a query param
    const params = new URLSearchParams(window.location.search);
    const oauthToken = params.get("token");
    if (oauthToken) {
      localStorage.setItem("token", oauthToken);
      window.history.replaceState({}, "", "/");
    }

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
        setUserName(data.user.name ?? "");
        setUserPicture(data.user.picture ?? null);
        setOauthProvider(data.user.oauth_provider ?? null);
        setIsAdmin(!!data.user.admin);
        setUserId(data.user.id);
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
    { icon: IconUser, label: "Profile" },
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
    setUserName("");
    setUserPicture(null);
    setOauthProvider(null);
    setIsAdmin(false);
    setUserId(0);
  };

  if (checkingAuth) {
    return (
      <MantineProvider defaultColorScheme="dark">
        <LoadingOverlay visible />
      </MantineProvider>
    );
  }

  if (!loggedIn) {
    const handleAuth = (email: string) => { setUsername(email); setLoggedIn(true); setIsAdmin(false); setUserId(0); };
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
            <ProfilePage
              email={username}
              name={userName}
              picture={userPicture}
              oauthProvider={oauthProvider}
              userId={userId}
              onProfileUpdate={(name) => setUserName(name)}
            />
          )}

          {active === 3 && isAdmin && <UsersPage />}
        </AppShell.Main>
      </AppShell>
    </MantineProvider>
  );
}
