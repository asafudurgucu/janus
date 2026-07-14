# Security Policy

Janus stores all servers, keys and passwords in a single **AES-256-GCM** encrypted
vault. The master password is used only to derive the key (scrypt) and never leaves
your device. The renderer has no Node access (`contextIsolation`), and remote-desktop
and database connections are tunneled over SSH.

## Reporting a vulnerability

Please **do not** open a public issue for security problems.

Email **asafudurgucu1@gmail.com** with:

- a description of the issue and its impact,
- steps to reproduce or a proof of concept,
- affected version.

You'll get a response as soon as possible. Responsible disclosure is appreciated.

## Supported versions

The latest released version receives security fixes.
