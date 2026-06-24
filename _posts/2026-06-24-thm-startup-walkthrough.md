---
layout: post
title: "How I Solved THM: Startup"
date: 2026-06-24
last_modified_at: 2026-06-24
tags: [tryhackme, thm, startup, ffuf, directory-enumeration, privilege-escalation]
description: "Step-by-step walkthrough of TryHackMe's Startup machine: directory enumeration with ffuf, finding an exposed /files directory, and working towards privilege escalation."
---

## Disclaimer

This walkthrough is for educational purposes only. All activities were performed on legally authorised TryHackMe systems.

## Initial Reconnaissance

I started with a basic Nmap scan to identify open ports and services:

```bash
nmap -sC -p- <IP>
```

While the scan was running, I decided to check if there was a website running. There was. I checked the source code (Ctrl+U) but found nothing useful, so I moved on to directory enumeration.

## Directory Enumeration with ffuf

I copied the URL and ran [ffuf](https://github.com/ffuf/ffuf) against it. You can use dirbuster or gobuster too — I just prefer ffuf because it's fast.

> **Advice** — Tools don't matter. What matters is whether you understand what you're doing. Tools come and go; logic and skill stay.

The wordlist I used is from [SecLists](https://github.com/danielmiessler/SecLists) — specifically `common.txt`.

```bash
ffuf -u http://<IP>/FUZZ -w common.txt -t 100
```

Here are the results:

IMAGE

## Exploring /files

There's a `/files` directory. I copied the URL and opened it in my browser:

IMAGE

There's a name mentioned here — **Maya**. Interesting. I checked around the other files and directories, but nothing stood out. Meanwhile, my Nmap scan finished:

IMAGE
