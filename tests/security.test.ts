import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Security & Zero-Trust Architecture Tests', () => {
  it('verifies that no API keys or secrets are exposed in client-side source code', () => {
    const srcDir = path.resolve(process.cwd(), 'src');

    function searchDirectory(dir: string): string[] {
      let files: string[] = [];
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          files = files.concat(searchDirectory(fullPath));
        } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
          files.push(fullPath);
        }
      }
      return files;
    }

    const clientFiles = searchDirectory(srcDir);
    const forbiddenPatterns = [
      /AIzaSy[A-Za-z0-9_-]{33}/, // Google API key regex
      /sk-[A-Za-z0-9_-]{20,}/, // Generic secret key regex
      /process\.env\.GEMINI_API_KEY/, // Direct server env reference in client
    ];

    for (const file of clientFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      for (const pattern of forbiddenPatterns) {
        const match = content.match(pattern);
        expect(match, `Secret leak pattern detected in client file: ${file}`).toBeNull();
      }
    }
  });

  it('validates that firestore.rules enforces tenancy isolation and valid user binding', () => {
    const rulesPath = path.resolve(process.cwd(), 'firestore.rules');
    expect(fs.existsSync(rulesPath)).toBe(true);

    const rulesContent = fs.readFileSync(rulesPath, 'utf-8');

    // Tenancy rule assertions
    expect(rulesContent).toContain('function isSignedIn()');
    expect(rulesContent).toContain('function isOwner(userId)');
    expect(rulesContent).toContain('request.auth != null');
    expect(rulesContent).toContain('request.auth.uid == userId');

    // Master Deny-All fallback assertion
    expect(rulesContent).toContain('match /{document=**}');
    expect(rulesContent).toContain('allow read, write: if false;');
  });

  it('validates that security_spec.md documents threat models and penetration scenarios', () => {
    const specPath = path.resolve(process.cwd(), 'security_spec.md');
    expect(fs.existsSync(specPath)).toBe(true);

    const specContent = fs.readFileSync(specPath, 'utf-8');
    expect(specContent).toContain('Zero-Trust');
    expect(specContent).toContain('Tenancy Isolation');
    expect(specContent).toContain('Dirty Dozen Payloads');
    expect(specContent).toContain('API Key Concealment');
  });
});
