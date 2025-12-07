# Fix for CVE-2025-55182 and CVE-2025-66478

## Critical Vulnerability Detected

Your project is using vulnerable versions of React and Next.js that are exposed to **CVE-2025-55182** (React) and **CVE-2025-66478** (Next.js).

### Vulnerable Versions
- ❌ React: `19.0.0` (vulnerable)
- ❌ Next.js: `15.5.0` (may be vulnerable)

### Patched Versions
- ✅ React: `19.2.1` (or `19.0.1`, `19.1.2`)
- ✅ Next.js: `15.5.7` or higher

## Steps to Resolve

### 1. Resolve Permission Issues (if applicable)

If you encounter permission errors during installation, run:

```bash
# Option 1: Change node_modules permissions
sudo chown -R $(whoami) node_modules

# Option 2: Clean and install
rm -rf node_modules package-lock.json
npm install
```

### 2. Update Dependencies

The `package.json` has already been updated with patched versions. Run:

```bash
npm install
```

Or specifically:

```bash
npm install react@^19.2.1 react-dom@^19.2.1 next@^15.5.7
```

### 3. Verify Installation

```bash
npm list react react-dom next
```

You should see:
- `react@19.2.1`
- `react-dom@19.2.1`
- `next@15.5.7` or higher

### 4. Test the Application

```bash
npm run build
npm run dev
```

## Aikido Configuration for Continuous Scanning

Aikido is a security tool that scans your code for vulnerabilities. There are two ways to use it:

### Option A: Repository Integration (Recommended)

1. Go to https://www.aikido.dev
2. Connect your GitHub repository
3. Aikido will automatically scan your code and alert you about vulnerabilities

### Option B: Local CLI

Install the Aikido CLI:

```bash
npm install -g @aikido/cli
```

Then run scans:

```bash
aikido scan
```

## Additional Vulnerabilities to Check

### Known Vulnerabilities in Dependencies

While the primary focus is on CVE-2025-55182 and CVE-2025-66478, you should also check for vulnerabilities in other dependencies:

#### Potentially Vulnerable Packages to Monitor:

1. **axios** (`^1.12.2`)
   - Check for SSRF vulnerabilities and request smuggling issues
   - Ensure you're using the latest version

2. **protobufjs** (`^7.5.4`)
   - Monitor for deserialization vulnerabilities
   - Keep updated to latest patch versions

3. **@aws-sdk packages**
   - AWS SDK packages should be kept up to date
   - Current versions: `^3.922.0`, `^3.705.0`

4. **Dependencies with "latest" tag**
   - `@radix-ui/react-progress`: "latest"
   - `@radix-ui/react-separator`: "latest"
   - `recharts`: "latest"
   - ⚠️ **Recommendation**: Pin these to specific versions for better security control

### Automatic Security Checks

**Security checks are now automatically run during install and build processes:**

- **Before install** (`preinstall`): Checks for high/critical vulnerabilities and warns if found
- **After install** (`postinstall`): Runs full security audit (non-blocking)
- **Before build** (`prebuild`): **BLOCKS build** if high/critical vulnerabilities are detected
- **After build** (`postbuild`): Runs security audit to verify (non-blocking)

#### Manual Security Audit Commands

You can also run these commands manually:

##### Check for Vulnerabilities

```bash
npm run security:audit
```

##### Auto-fix Vulnerabilities

```bash
npm run security:fix
```

##### Check for Moderate+ Severity Issues

```bash
npm run security:check
```

##### Check Before Install (Non-blocking)

```bash
npm run security:check-install
```

##### Check Before Build (Blocks build on high/critical)

```bash
npm run security:check-build
```

### Build Protection

⚠️ **Important**: The build process will **fail** if high or critical severity vulnerabilities are detected. This ensures you cannot deploy vulnerable code.

To bypass the security check temporarily (not recommended):

```bash
npm run build -- --ignore-scripts
```

**However, you should always fix vulnerabilities before deploying.**

### Recommended Actions

1. **Pin "latest" dependencies**: Replace `"latest"` with specific version numbers
2. **Regular audits**: Run `npm run security:audit` weekly
3. **Update dependencies**: Keep all dependencies updated, especially security-critical ones
4. **Monitor security advisories**: Subscribe to security feeds for React, Next.js, and other major dependencies

## References

- [CVE-2025-55182 Disclosure](https://www.aikido.dev/blog/react-nextjs-cve-2025-55182-rce)
- [React Security Advisory](https://react.dev/blog/security)
- [Next.js Security Notice](https://nextjs.org/docs)

## Important Notes

⚠️ **This is a critical remote code execution (RCE) vulnerability**
- Severity: 10.0/10 (Critical)
- Attack Vector: Remote and unauthenticated
- Impact: Remote code execution

✅ **After updating**, all vulnerable versions must be removed from your `node_modules` and `package-lock.json`.

## Security Best Practices

1. **Regular Audits**: Run `npm run security:audit` regularly
2. **Keep Dependencies Updated**: Update dependencies regularly to get security patches
3. **Use Aikido**: Set up continuous scanning with Aikido for automated vulnerability detection
4. **Review Dependencies**: Periodically review and remove unused dependencies
5. **Monitor Security Advisories**: Stay informed about security updates from React, Next.js, and other dependencies
