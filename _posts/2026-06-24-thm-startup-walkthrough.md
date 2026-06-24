---
layout: post
title: "How I Solved THM: Startup"
date: 2026-06-24
last_modified_at: 2026-06-24
tags: [tryhackme, thm, startup, ffuf, directory-enumeration, ftp, reverse-shell, privilege-escalation, cronjob]
description: "Step-by-step walkthrough of TryHackMe's Startup machine: directory enumeration with ffuf, uploading a PHP reverse shell via FTP, extracting SSH credentials from a pcap file, and exploiting a writable cronjob script for root access."
image: /assets/images/thmstartup.png
---

<img width="1626" height="296" alt="TryHackMe Startup machine banner" src="https://github.com/user-attachments/assets/fcbaf3a9-eab2-43a1-8b2e-0fe353f0e9c0" />

## Disclaimer

This walkthrough is for educational purposes only. All activities were performed on legally authorised TryHackMe systems.

## Initial Reconnaissance

I started with a basic Nmap scan to identify open ports and services:

```bash
nmap -sC -sV -p- -v <IP>
```

While the scan was running, I decided to check if there was a website running. There was. I checked the source code (Ctrl+U) but found nothing useful, so I moved on to directory enumeration.

## Directory Enumeration with ffuf

I copied the URL and ran [ffuf](https://github.com/ffuf/ffuf) against it. You can use dirbuster or gobuster too. I just prefer ffuf because it's fast.

> **Advice** — Tools don't matter. What matters is whether you understand what you're doing. Tools come and go; logic and skill stay.

The wordlist I used is from [SecLists](https://github.com/danielmiessler/SecLists), specifically `common.txt`.

```bash
ffuf -u http://<IP>/FUZZ -w common.txt -t 100
```

Here are the results:

<img width="1143" height="645" alt="ffuf results showing /files directory" src="https://github.com/user-attachments/assets/d4ddbcf1-2956-4eb7-bc3c-11646be86333" />

## Exploring /files

There is a `/files` directory. I copied the URL and opened it in my browser:

<img width="941" height="603" alt="/files directory listing in browser" src="https://github.com/user-attachments/assets/d4d1b88d-9ad1-4933-8565-fc449e68ffa3" />

I opened `notice.txt` and spotted a name: **Maya**. Interesting. I checked the other files and directories but nothing stood out. Meanwhile, my Nmap scan finished:

<img width="1730" height="216" alt="Nmap scan results" src="https://github.com/user-attachments/assets/5b6ebebd-9427-41e1-bceb-7e769cb24a30" />

## Digging Into Open Ports

**Port 21** is running FTP with anonymous login enabled. I logged in and poked around, but found the same files we already saw in the browser. Nothing new. Time to switch.

**Port 22** is running OpenSSH 7.2p2. I went online to look for known vulnerabilities and found **CVE-2016-6210**, an information disclosure vulnerability that lets you check whether a username exists on the target system.

<img width="1403" height="700" alt="CVE-2016-6210 exploit details" src="https://github.com/user-attachments/assets/6933e417-b0e7-4a71-8bcd-416759239fa8" />

**Exploit:** [exploit-db.com/exploits/40136](https://www.exploit-db.com/exploits/40136)

## CVE-2016-6210 Rabbit Hole

Remember the name we found in `notice.txt`? Maya. I thought it could lead somewhere. The plan was simple: confirm the username with this vulnerability, then brute-force my way in.

I fired up Metasploit and found the SSH username enumerator at `scanners/ssh/ssh_enumusers`. I set `RHOST` as the machine IP and hit run, but got an error straight away. I forgot to set `USERNAME`. I set it to Maya, hit run again, and got a false positive error. I then set `CHECK_FALSE` to false, hit run again, and it said **USER MAYA FOUND**.

<img width="1337" height="603" alt="Metasploit SSH username enumeration result" src="https://github.com/user-attachments/assets/50a3928d-f379-4408-a59a-8aa2e454fcf8" />

Something felt off, so I tried the username `rfvewbfibk`. It also came back as **FOUND**. Now I knew something was wrong.

I went online and tried every CVE-2016-6210 exploit I could find. Nothing worked because of a bug in Python's `paramiko` library. I tried Python virtual environments, forcefully installing requirements on main Python, everything. Still nothing.

<img width="1689" height="910" alt="CVE-2016-6210 exploit errors in terminal" src="https://github.com/user-attachments/assets/208f47b0-e909-41d7-affc-72a6e4bd1ccb" />

At this point I let Gemini generate a custom exploit for it. I was confident. Hit enter. **MAYA FOUND**. Let's go.

<img width="1450" height="914" alt="AI generated exploit result showing Maya found" src="https://github.com/user-attachments/assets/8de15e1d-3076-47aa-b51a-5210b90096cd" />

I cross-checked it with a random string as the username. Found again. False positives across the board. This time I chose not to fall into the same rabbit hole I did last time, debugging broken code I found online. I stepped back completely. No more SSH. Back to FTP.

## The Real Way In: FTP Write Access

I started retracing my steps. How did I reach FTP? Did I miss anything? Any bug on the website? Any port I ignored? I read through the Nmap results again and saw it. Here are the results again. Do you see it?

<img width="1403" height="575" alt="Nmap scan showing FTP directory is writable" src="https://github.com/user-attachments/assets/f25f7207-4e23-4841-bcdd-354a781fae5b" />

**The FTP directory is writable.**

I logged back into FTP and uploaded two files to the `/files/ftp` directory:

- `linpeas.sh`
- A [Pentest Monkey PHP reverse shell](https://github.com/pentestmonkey/php-reverse-shell)

I was confident PHP was installed since this was a web server. I started a Netcat listener, opened the browser, and clicked `payload.php`.

<img width="1362" height="659" alt="Successful reverse shell connection in terminal" src="https://github.com/user-attachments/assets/2009792e-eeff-47ee-9e79-569e006f0bd8" />

**And I was in.** Successful reverse shell. I navigated to the FTP directory and ran LinPEAS.

<img width="1061" height="401" alt="LinPEAS output highlighting /incidents directory" src="https://github.com/user-attachments/assets/1fa62f3d-80ac-4053-a6d1-fb455ca18843" />

## Finding Credentials in a PCAP

If you know what a Linux file system normally looks like, you will spot it immediately. There is an `/incidents` directory. That is not standard. I checked it and found a file called `suspicious.pcapng`. I downloaded it to my machine and opened it in Wireshark.

<img width="1919" height="1060" alt="suspicious.pcapng opened in Wireshark" src="https://github.com/user-attachments/assets/74a50856-a35d-4e8a-8cd9-f2c2f255535b" />

Lots going on. I tried filtering HTTP packets first but found nothing useful. I tried searching for passwords as strings but still nothing. Finally, I followed the TCP stream and that is where it all was.

<img width="1920" height="1040" alt="TCP stream in Wireshark showing plaintext credentials" src="https://github.com/user-attachments/assets/7a2e3b6f-f26f-4c96-a896-931207fa09be" />

There is a user named **Lennie**, and her password was captured in plaintext. I copied it and SSHed in immediately. User flag found.

<img width="1740" height="747" alt="SSH login as Lennie and user flag" src="https://github.com/user-attachments/assets/66791986-0eb8-4e47-ad9f-20ef9e4dd19c" />

## Privilege Escalation: Writable Cronjob Script

Time to get the root flag. I explored Lennie's files and a `scripts` folder caught my eye. Inside it was a script called `planner.sh`. I opened it and saw it executes another script at an unusual path: `/etc/print.sh`. That screamed cronjob to me.

<img width="541" height="270" alt="planner.sh script contents showing /etc/print.sh" src="https://github.com/user-attachments/assets/6a218c9b-4c8e-4993-897f-7bd65639d1b0" />

I added a Bash reverse shell line to `/etc/print.sh`, saved it, and started a Netcat listener. About a minute later, the shell came back. Root flag found.

<img width="1886" height="1012" alt="Root shell and root flag" src="https://github.com/user-attachments/assets/dabc91b9-4091-4ac7-904f-88caf4e086b2" />

## Key Takeaways

| Takeaway | Explanation |
|----------|-------------|
| **Check FTP write permissions** | Anonymous FTP login is suspicious on its own. Writable FTP plus a web server is a direct path to a reverse shell |
| **Know when to move on** | I wasted time on CVE-2016-6210 when every result was a false positive. If the tool is giving nonsense output, the tool is broken |
| **Non-standard directories are a signal** | `/incidents` does not belong in a normal Linux file system. When something looks out of place, check it |
| **Cronjobs run as root** | A script executed by root that a low-privilege user can write to is game over. Always check scripts being called by other scripts |

Thanks for reading. Happy hacking.
