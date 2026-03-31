import { useState } from "react";
import {
  Stack,
  Title,
  TextInput,
  Textarea,
  Button,
  Paper,
  Group,
  Text,
  Avatar,
  Alert,
  Divider,
  Grid,
} from "@mantine/core";
import { useForm, hasLength } from "@mantine/form";
import {
  IconUser,
  IconCheck,
  IconAlertCircle,
  IconBrandGithub,
  IconBrandX,
  IconWorld,
} from "@tabler/icons-react";

interface ProfilePageProps {
  email: string;
  name: string;
  picture: string | null;
  oauthProvider: string | null;
  userId: number;
  onProfileUpdate: (name: string) => void;
}

interface ProfileFormValues {
  name: string;
  displayName: string;
  location: string;
  bio: string;
  social: {
    github: string;
    twitter: string;
    website: string;
  };
}

export default function ProfilePage({ email, name, picture, oauthProvider, userId, onProfileUpdate }: ProfilePageProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ProfileFormValues>({
    initialValues: {
      name: name,
      displayName: "",
      location: "",
      bio: "",
      social: {
        github: "",
        twitter: "",
        website: "",
      },
    },
    validate: {
      name: hasLength({ min: 2, max: 50 }, "Name must be 2–50 characters"),
      displayName: (value) =>
        value.length > 0 && value.length < 2
          ? "Display name must be at least 2 characters"
          : null,
      bio: (value) =>
        value.length > 200 ? "Bio must be 200 characters or fewer" : null,
      social: {
        github: (value) =>
          value && !/^[a-zA-Z0-9-]+$/.test(value)
            ? "GitHub username can only contain letters, numbers, and hyphens"
            : null,
        twitter: (value) =>
          value && !/^[a-zA-Z0-9_]+$/.test(value)
            ? "X/Twitter handle can only contain letters, numbers, and underscores"
            : null,
        website: (value) => {
          if (!value) return null;
          try {
            new URL(value);
            return null;
          } catch {
            return "Enter a valid URL (e.g. https://example.com)";
          }
        },
      },
    },
  });

  const handleSubmit = async (values: ProfileFormValues) => {
    setLoading(true);
    setSuccess(false);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: values.name }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.statusMessage || "Failed to update profile");
      }

      const data = await res.json();
      onProfileUpdate(data.user.name || data.user.email);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const initials = (name || email.split("@")[0] || email).slice(0, 2).toUpperCase();

  return (
    <Stack>
      <Title order={2}>Profile</Title>

      <Paper p="xl" radius="md" withBorder>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="lg">
            {/* Avatar section */}
            <Group>
              <Avatar size={64} radius="xl" color="blue" src={picture}>
                {initials}
              </Avatar>
              <Stack gap={4}>
                <Text fw={500}>{name || email}</Text>
                <Text size="sm" c="dimmed">
                  User ID: {userId}
                </Text>
              </Stack>
            </Group>

            <Divider label="Basic info" labelPosition="left" />

            {/* Basic info */}
            <Grid>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput
                  label="Full name"
                  placeholder="Jane Doe"
                  leftSection={<IconUser size={16} />}
                  {...form.getInputProps("name")}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput
                  label="Display name"
                  placeholder="janedoe"
                  description="Shown publicly in place of your full name"
                  {...form.getInputProps("displayName")}
                />
              </Grid.Col>
              <Grid.Col span={12}>
                <TextInput
                  label="Location"
                  placeholder="Paris, France"
                  {...form.getInputProps("location")}
                />
              </Grid.Col>
              <Grid.Col span={12}>
                <Textarea
                  label="Bio"
                  placeholder="A short description about yourself…"
                  description={`${form.values.bio.length}/200`}
                  autosize
                  minRows={3}
                  maxRows={6}
                  {...form.getInputProps("bio")}
                />
              </Grid.Col>
            </Grid>

            <Divider label="Social links" labelPosition="left" />

            {/* Nested social object */}
            <Grid>
              <Grid.Col span={{ base: 12, sm: 4 }}>
                <TextInput
                  label="GitHub"
                  placeholder="username"
                  leftSection={<IconBrandGithub size={16} />}
                  {...form.getInputProps("social.github")}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 4 }}>
                <TextInput
                  label="X / Twitter"
                  placeholder="handle"
                  leftSection={<IconBrandX size={16} />}
                  {...form.getInputProps("social.twitter")}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 4 }}>
                <TextInput
                  label="Website"
                  placeholder="https://example.com"
                  leftSection={<IconWorld size={16} />}
                  {...form.getInputProps("social.website")}
                />
              </Grid.Col>
            </Grid>

            {/* Feedback */}
            {success && (
              <Alert
                color="green"
                variant="light"
                icon={<IconCheck size={16} />}
              >
                Profile updated successfully.
              </Alert>
            )}
            {error && (
              <Alert
                color="red"
                variant="light"
                icon={<IconAlertCircle size={16} />}
              >
                {error}
              </Alert>
            )}

            <Group justify="flex-end">
              <Button variant="default" onClick={() => form.reset()} disabled={!!oauthProvider}>
                Reset
              </Button>
              <Button type="submit" loading={loading} disabled={!!oauthProvider}>
                Save changes
              </Button>
            </Group>
          </Stack>
        </form>
      </Paper>
    </Stack>
  );
}
