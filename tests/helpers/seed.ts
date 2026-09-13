export async function createUnitTest(
  token: string,
  workspaceId: string,
  name: string,
  code: string
) {
  const res = await fetch('http://localhost:4000/api/products/units', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'x-workspace-id': workspaceId,
    },
    body: JSON.stringify({ name, code }),
  });
  return res.json();
}

export async function createCategoryTest(
  token: string,
  workspaceId: string,
  name: string,
  code?: string
) {
  const res = await fetch('http://localhost:4000/api/products/categories', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'x-workspace-id': workspaceId,
    },
    body: JSON.stringify({ name, code }),
  });
  return res.json();
}

export async function createLocationTest(
  token: string,
  workspaceId: string,
  name: string,
  code: string,
  type = 'STORE'
) {
  const res = await fetch('http://localhost:4000/api/inventory/locations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'x-workspace-id': workspaceId,
    },
    body: JSON.stringify({ name, code, type }),
  });
  return res.json();
}
