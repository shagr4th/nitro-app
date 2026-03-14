import { useState, useEffect, useCallback } from "react";
import {
  Stack,
  Title,
  Table,
  Badge,
  ActionIcon,
  Group,
  Modal,
  TextInput,
  Button,
  Switch,
  Text,
  Alert,
  LoadingOverlay,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconEdit, IconTrash, IconPlus, IconShield } from "@tabler/icons-react";

interface User {
  id: number;
  email: string;
  name: string | null;
  admin: number;
  oauth_provider: string | null;
  created_at: string;
  updated_at: string;
}

function authHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem("token")}` };
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
  const [deleteOpened, { open: openDelete, close: closeDelete }] = useDisclosure(false);
  const [rightsOpened, { open: openRights, close: closeRights }] = useDisclosure(false);
  const [selected, setSelected] = useState<User | null>(null);

  const [createName, setCreateName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createAdmin, setCreateAdmin] = useState(false);

  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editAdmin, setEditAdmin] = useState(false);
  const [saving, setSaving] = useState(false);

  const [userRights, setUserRights] = useState<string[]>([]);
  const [newRight, setNewRight] = useState("");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/users", { headers: authHeaders() });
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleEdit = (user: User) => {
    setSelected(user);
    setEditName(user.name || "");
    setEditEmail(user.email);
    setEditAdmin(!!user.admin);
    openEdit();
  };

  const handleDelete = (user: User) => {
    setSelected(user);
    openDelete();
  };

  const handleRights = async (user: User) => {
    setSelected(user);
    setNewRight("");
    try {
      const res = await fetch(`/api/users/${user.id}/rights`, { headers: authHeaders() });
      if (!res.ok) throw new Error("Failed to fetch rights");
      const data = await res.json();
      setUserRights(data.rights);
    } catch {
      setUserRights([]);
    }
    openRights();
  };

  const saveRights = async (rights: string[]) => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/users/${selected.id}/rights`, {
        method: "PUT",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ rights }),
      });
      if (!res.ok) throw new Error("Failed to update rights");
      setUserRights(rights);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update rights");
    } finally {
      setSaving(false);
    }
  };

  const addRight = () => {
    const trimmed = newRight.trim();
    if (!trimmed || userRights.includes(trimmed)) return;
    const updated = [...userRights, trimmed];
    setNewRight("");
    saveRights(updated);
  };

  const removeRight = (right: string) => {
    saveRights(userRights.filter((r) => r !== right));
  };

  const saveEdit = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/users/${selected.id}`, {
        method: "PUT",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ email: editEmail, name: editName, admin: editAdmin ? 1 : 0 }),
      });
      if (!res.ok) throw new Error("Failed to update user");
      closeEdit();
      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = () => {
    setCreateName("");
    setCreateEmail("");
    setCreatePassword("");
    setCreateAdmin(false);
    openCreate();
  };

  const saveCreate = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ email: createEmail, password: createPassword || undefined, name: createName || undefined, admin: createAdmin ? 1 : 0 }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.statusMessage || "Failed to create user");
      }
      closeCreate();
      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/users/${selected.id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Failed to delete user");
      closeDelete();
      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack pos="relative">
      <LoadingOverlay visible={loading} />
      <Group justify="space-between">
        <Title order={2}>Users</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={handleCreate}>
          New user
        </Button>
      </Group>

      {error && (
        <Alert color="red" variant="light" withCloseButton onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>ID</Table.Th>
            <Table.Th>Email</Table.Th>
            <Table.Th>Name</Table.Th>
            <Table.Th>Role</Table.Th>
            <Table.Th>Provider</Table.Th>
            <Table.Th>Created</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {users.map((user) => (
            <Table.Tr key={user.id}>
              <Table.Td>{user.id}</Table.Td>
              <Table.Td>{user.email}</Table.Td>
              <Table.Td>{user.name || "—"}</Table.Td>
              <Table.Td>
                <Badge color={user.admin ? "red" : "blue"} variant="light">
                  {user.admin ? "Admin" : "User"}
                </Badge>
              </Table.Td>
              <Table.Td>{user.oauth_provider || "email"}</Table.Td>
              <Table.Td>{new Date(user.created_at).toLocaleDateString()}</Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <ActionIcon variant="subtle" color="teal" onClick={() => handleRights(user)}>
                    <IconShield size={16} />
                  </ActionIcon>
                  <ActionIcon variant="subtle" onClick={() => handleEdit(user)}>
                    <IconEdit size={16} />
                  </ActionIcon>
                  <ActionIcon variant="subtle" color="red" onClick={() => handleDelete(user)}>
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      <Modal opened={createOpened} onClose={closeCreate} title="New user" centered>
        <Stack>
          <TextInput label="Email" value={createEmail} onChange={(e) => setCreateEmail(e.currentTarget.value)} required />
          <TextInput label="Name" value={createName} onChange={(e) => setCreateName(e.currentTarget.value)} />
          <TextInput label="Password" value={createPassword} onChange={(e) => setCreatePassword(e.currentTarget.value)} placeholder="Leave empty for OAuth-only user" />
          <Switch label="Admin" checked={createAdmin} onChange={(e) => setCreateAdmin(e.currentTarget.checked)} />
          <Button onClick={saveCreate} loading={saving}>Create</Button>
        </Stack>
      </Modal>

      <Modal opened={editOpened} onClose={closeEdit} title="Edit user" centered>
        <Stack>
          <TextInput label="Email" value={editEmail} onChange={(e) => setEditEmail(e.currentTarget.value)} required />
          <TextInput label="Name" value={editName} onChange={(e) => setEditName(e.currentTarget.value)} />
          <Switch label="Admin" checked={editAdmin} onChange={(e) => setEditAdmin(e.currentTarget.checked)} />
          <Button onClick={saveEdit} loading={saving}>Save</Button>
        </Stack>
      </Modal>

      <Modal opened={deleteOpened} onClose={closeDelete} title="Delete user" centered>
        <Stack>
          <Text>Are you sure you want to delete <strong>{selected?.email}</strong>?</Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={closeDelete}>Cancel</Button>
            <Button color="red" onClick={confirmDelete} loading={saving}>Delete</Button>
          </Group>
        </Stack>
      </Modal>

      <Modal opened={rightsOpened} onClose={closeRights} title={`Rights — ${selected?.email}`} centered>
        <Stack>
          {userRights.length === 0 && (
            <Text c="dimmed" size="sm">No rights assigned.</Text>
          )}
          {userRights.map((right) => (
            <Group key={right} justify="space-between">
              <Badge variant="light" color="teal">{right}</Badge>
              <ActionIcon variant="subtle" color="red" size="sm" onClick={() => removeRight(right)} disabled={saving}>
                <IconTrash size={14} />
              </ActionIcon>
            </Group>
          ))}
          <Group>
            <TextInput
              placeholder="e.g. reports:read"
              value={newRight}
              onChange={(e) => setNewRight(e.currentTarget.value)}
              onKeyDown={(e) => e.key === "Enter" && addRight()}
              style={{ flex: 1 }}
            />
            <Button size="sm" onClick={addRight} loading={saving} disabled={!newRight.trim()}>Add</Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
