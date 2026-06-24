---
layout: post
title: "How I Solved HTB: Cap Machine"
date: 2026-06-14
last_modified_at: 2026-06-15
tags: [hackingthebox, htb, cap, idor, privilege-escalation, python-capsetuid]
description: "Step-by-step walkthrough of Hack The Box's Cap machine: discovering IDOR via pcap download, extracting FTP credentials from Wireshark, attempting CVE-2021-3156 (Baron Samedit), and exploiting Python's cap_setuid capability for root access."
image: /assets/images/htbcap.png
---


![Hack The Box Cap machine dashboard](/assets/images/htbcap.png)

## Disclaimer

This walkthrough is for educational purposes only. All activities were performed on legally authorised Hack The Box systems.

## Initial Reconnaissance

I started with a basic Nmap scan to identify open ports and services:

```bash
nmap -sC -p- 10.129.3.175
```

While the scan was running, I checked if there was a website. Yes—there was a security dashboard running. I explored the site, read source code from different pages, tried logging out, but found nothing useful.

The most interesting page let users download a `.pcap` capture file.

<img width="1640" height="701" alt="Screenshot_20260614_094248" src="https://github.com/user-attachments/assets/e69adf3f-bb31-429b-b96f-07b8d37065d6" />


## .pcap Download Page → IDOR Vulnerability

I downloaded the file and checked for something valuable, but found nothing. Then I noticed the URL and experimented with it:

- Changing the value to `10` → nothing changed
- Changing it to `0` → **access to another user's capture data**

This is a classic **IDOR (Insecure Direct Object Reference)** vulnerability.

I downloaded the other user's `.pcap` file and analysed it in Wireshark. After scrolling through the traffic, I found the username and password transmitted in plaintext.

<img width="1912" height="963" alt="image" src="https://github.com/user-attachments/assets/2031eb0f-263f-49d2-9ba8-764b0af61c65" />

## Credentials Extracted from PCAP

The protocol used was **FTP**. I checked my Nmap results (better image attached since I lost the original screenshot):

<img width="719" height="142" alt="Screenshot_20260614_124343" src="https://github.com/user-attachments/assets/b0ab3f48-de97-41a0-bb25-52bdb3ab3e6c" />


**Open Ports:** (FTP was one of them)

I logged in using the FTP credentials from Wireshark, and **YEAH I WAS IN**. I checked the user file and found the flag.

<img width="1325" height="645" alt="image" src="https://github.com/user-attachments/assets/99ea3b13-c445-44e7-ba89-ac3008f31400" />

## Privilege Escalation

Now I needed the root flag. I used **Linpeas**, a privilege escalation script:

- **GitHub:** [PEASS-ng/linPEAS](https://github.com/peass-ng/PEASS-ng/tree/master/linPEAS)
- **Official Website:** [linpeas.org](https://linpeas.org/) — tons of free resources

I tried uploading it via FTP, but it failed due to a permission error.

<img width="1395" height="499" alt="Screenshot_20260614_095146" src="https://github.com/user-attachments/assets/23b6d696-e876-43f0-880e-ab63626d31ea" />

Instead, I transferred the script over **SSH** and ran it from there. LinPEAS ran successfully and returned its findings.

<img width="1908" height="823" alt="Screenshot_20260614_105002" src="https://github.com/user-attachments/assets/2708a769-cb83-4b14-964f-dc1e1f165e70" />

## LinPEAS Output → CVE-2021–3156

LinPEAS flagged **CVE-2021–3156**. I started reading about it and was confident it would work (I was so wrong).

### What is CVE-2021–3156?

Also known as **Baron Samedit**, it's a heap-based buffer overflow in `sudo`:

- Privilege-escalation bug in sudo
- Once you have local access, you can compromise the entire system
- Particularly serious since it's in sudo

**How it works:**
1. When you run `sudo` in shell mode, it allocates memory to process your command
2. You give input ending with a single backslash (`\`)
3. `sudo` reads the backslash and skips to the next character, jumping over the "null terminator" (stop sign for text end)
4. Missing the stop sign, `sudo` blindly copies data past its boundaries into neighbouring memory blocks
5. This overwrites sudo's internal settings, tricking the system into running malicious code with root privileges

I found an exploit online offering **C** and **Python** versions (in case C fails):

**GitHub:** [worawit/CVE-2021-3156](https://github.com/worawit/CVE-2021-3156/)

I ran the C version first since the system met the requirements:

<img width="1330" height="224" alt="image" src="https://github.com/user-attachments/assets/888a6920-a714-40ee-a674-1f9fb2580739" />


File successfully compiled. Let's go. Now let's run it.

<img width="1470" height="411" alt="Screenshot_20260614_111129" src="https://github.com/user-attachments/assets/18e77b2e-e5b3-44a5-af60-2aa3a33769d9" />


**It failed.** Why? This exploit needs to write to `/etc/passwd` in a tiny window (milliseconds). The default timing (4000ms) wasn't right. I tried:

- `2000` (faster) → failed
- `5000` (slower) → failed

All timings failed.

<img width="1100" height="221" alt="1_jHysF6j-md4JYGYeKOwAUQ" src="https://github.com/user-attachments/assets/686471cc-e0cc-462e-8449-c5d934824a62" />


I switched to the Python version & Here’s what happened

<img width="1330" height="190" alt="image" src="https://github.com/user-attachments/assets/e2b1609d-91f9-44fd-82b8-080034f00d94" />

The exploit says the vulnerability is patched. Now I had a choice:
Either I debug further why the exploits aren’t working, or I look for another vulnerability because

- <b> C exploit (race condition) </b> — compiled fine, but race timing failed
- <b> Python exploit (heap manipulation) </b> — says target is patched

I decided not to waste time going deeper into the rabbit hole and started looking for another vulnerability.

## The Real Vulnerability: Python cap_setuid Misconfiguration

Five minutes of re-reading the LinPEAS output, I spotted what I missed the first time
Python had the `cap_setuid` capability set.
This is a Linux capability to change your User ID to 0 (System ID / Root).

### The Exploit Code

```python
import os
os.setuid(0)
os.system('/bin/bash')
```


Running this gave me a **root shell**, and I found the root flag.

<img width="1607" height="536" alt="image" src="https://github.com/user-attachments/assets/7be978d4-b49f-49c5-af14-002d1e8931f8" />


## Key Takeaways

| Takeaway | Explanation |
|----------|-------------|
| **IDOR via URL manipulation** | Always test numeric parameters at boundaries (0, -1, sequential IDs) |
| **Know when to move on** | Spending too long on a failed CVE exploit is a common time sink. If it's patched, it's patched |
| **Linux capabilities = dangerous as SUID** | `cap_setuid` on Python = instant root shell. Read your LinPEAS output carefully |

Thanks for reading. Happy hacking.
