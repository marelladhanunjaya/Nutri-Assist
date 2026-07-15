import assert from 'node:assert/strict';
import test from 'node:test';
import { canAccessClient, canManageClient } from '../src/services/accessService.js';

const client = { user: 'user-1', dietitian: 'dietitian-1' };

test('admin can access and manage every client', () => {
  const admin = { _id: 'admin-1', role: 'admin' };
  assert.equal(canAccessClient(admin, client), true);
  assert.equal(canManageClient(admin, client), true);
});

test('assigned dietitian can manage client', () => {
  const dietitian = { _id: 'dietitian-1', role: 'dietitian' };
  assert.equal(canAccessClient(dietitian, client), true);
  assert.equal(canManageClient(dietitian, client), true);
});

test('wellness user can read own client but cannot manage it', () => {
  const user = { _id: 'user-1', role: 'user' };
  assert.equal(canAccessClient(user, client), true);
  assert.equal(canManageClient(user, client), false);
});

test('unrelated users cannot access client', () => {
  assert.equal(canAccessClient({ _id: 'user-2', role: 'user' }, client), false);
  assert.equal(canAccessClient({ _id: 'dietitian-2', role: 'dietitian' }, client), false);
});
