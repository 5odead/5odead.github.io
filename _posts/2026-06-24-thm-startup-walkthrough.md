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

I open the notice.txt. There's a name mentioned here — **Maya**. Interesting. I checked around the other files and directories, but nothing stood out. Meanwhile, my Nmap scan finished. Here are the scan results

IMAGE

Port 21 is running FTP and has anonymous login enabled. I logged in and started looking for something juicy, but nothing good was the same as what we saw on the browser. Time to switch.

Port 22 is also open, running OpenSSH 7.2p2, so I decided to look online for its vulnerabilities and found CVE-2016-6210. It is an information disclosure vulnerability. It allows hackers to determine whether a username is valid on the targeted system

https://www.exploit-db.com/exploits/40136

Remember the name we found on notice.txt - Maya. I thought it could lead us somewhere from here. I could verify the username with this vulnerability, then brute-force my way in. This is what I thought

I fired up Metasploit, found this SSH username enumerator in scanners/ssh/ssh_enumusers. I set RHOST as the machine's IP and hit run, but error. Ooops, I forgot to SET USERNAME. I set Username as Maya, Excited to get it started, hit run again, but got a false positive error (check image below). Hmmmm, I set CHECK_FALSE as FALSE, hit enter again, and now it said "USER MAYA FOUND"

IMAGE

Something felt off, so I decided to set the username as "rfvewbfibk" and hit run again. Only for the result to say USER rfvewbfibk Found. Now I knew something was wrong. I went online, tried many CVE-2016-6210 exploits, but nothing worked because there was an issue in Python's paramiko library. I tried every tool I could find online, I used Python virtual environment to install requirements, but they still didn't work. I tried forcefully installing it on the main Python, but they still didn't work

IMAGE

I thought let's get AI to exploit this vulnerability , Gemini generated the code for me I was confident it would work and i hit enter as see MAYA FOUND. Lets gooo, I decided to crosscheck it before moving on so i put a random string as Username again and yeah you could guess. it found that as username too. This time i chose not to fall into the rabbit hole of solving bugs in code i found online like i did last time so i went a step back back, No more SSH, back to FTP. I started rechecking my process again how i reached to the FTP server, did i miss anything in between, ant bug in the website, any port ignored, I started reading the Nmap scan result again and saw it. Im sharing it again, Do You see it?

<img width="1403" height="575" alt="image" src="https://github.com/user-attachments/assets/f25f7207-4e23-4841-bcdd-354a781fae5b" />

The ftp Directory is writeable. I logged in back to FTP uploaded Linpeas.sh and Pentest Monkey PHP_reverse shell
