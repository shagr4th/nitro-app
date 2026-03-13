import { useState } from "react";
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
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconHome,
  IconApi,
  IconSettings,
  IconRocket,
} from "@tabler/icons-react";
import "@mantine/core/styles.css";

export default function App() {
  const [opened, { toggle }] = useDisclosure();
  const [active, setActive] = useState(0);
  const [apiResponse, setApiResponse] = useState<string | null>(null);

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

  return (
    <MantineProvider defaultColorScheme="dark">
      <AppShell
        header={{ height: 60 }}
        navbar={{ width: 250, breakpoint: "sm", collapsed: { mobile: !opened } }}
        padding="md"
      >
        <AppShell.Header>
          <Group h="100%" px="md">
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <IconRocket size={28} color="var(--mantine-color-blue-6)" />
            <Title order={3}>Nitro + Vite</Title>
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
