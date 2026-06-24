---
layout: post
title: "How I Solved THM: Startup"
date: 2026-06-24
last_modified_at: 2026-06-24
tags: [tryhackme, thm, startup, ffuf, directory-enumeration, privilege-escalation]
description: "Step-by-step walkthrough of TryHackMe's Startup machine: directory enumeration with ffuf, finding an exposed /files directory, and working towards privilege escalation."
---

<img width="1626" height="296" alt="Screenshot_20260624_145047" src="https://github.com/user-attachments/assets/fcbaf3a9-eab2-43a1-8b2e-0fe353f0e9c0" />


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

<img width="1143" height="645" alt="Screenshot_20260621_224440" src="https://github.com/user-attachments/assets/d4ddbcf1-2956-4eb7-bc3c-11646be86333" />

## Exploring /files

There's a `/files` directory. I copied the URL and opened it in my browser:

<img width="941" height="603" alt="Screenshot_20260621_223327" src="https://github.com/user-attachments/assets/d4d1b88d-9ad1-4933-8565-fc449e68ffa3" />

I open the notice.txt. There's a name mentioned here — **Maya**. Interesting. I checked around the other files and directories, but nothing stood out. Meanwhile, my Nmap scan finished. Here are the scan results

<img width="1730" height="216" alt="Screenshot_20260621_224623" src="https://github.com/user-attachments/assets/5b6ebebd-9427-41e1-bceb-7e769cb24a30" />

Meanwhile, my Nmap scan finished. Here are the scan results

Port 21 is running FTP and has anonymous login enabled. I logged in and started looking for something juicy, but nothing good was the same as what we saw on the browser. Time to switch.

Port 22 is also open, running OpenSSH 7.2p2, so I decided to look online for its vulnerabilities and found CVE-2016-6210. It is an information disclosure vulnerability. It allows hackers to determine whether a username is valid on the targeted system

<img width="1403" height="700" alt="Screenshot_20260624_145745" src="https://github.com/user-attachments/assets/6933e417-b0e7-4a71-8bcd-416759239fa8" />

https://www.exploit-db.com/exploits/40136

Remember the name we found on notice.txt - Maya. I thought it could lead us somewhere from here. I could verify the username with this vulnerability, then brute-force my way in. This is what I thought

I fired up Metasploit, found this SSH username enumerator in scanners/ssh/ssh_enumusers. I set RHOST as the machine's IP and hit run, but error. Ooops, I forgot to SET USERNAME. I set Username as Maya, Excited to get it started, hit run again, but got a false positive error (check image below). Hmmmm, I set CHECK_FALSE as FALSE, hit enter again, and now it said "USER MAYA FOUND"

<img width="1337" height="603" alt="Screenshot_20260621_231029" src="https://github.com/user-attachments/assets/50a3928d-f379-4408-a59a-8aa2e454fcf8" />

Something felt off, so I decided to set the username as "rfvewbfibk" and hit run again. Only for the result to say USER rfvewbfibk Found. Now I knew something was wrong. I went online, tried many CVE-2016-6210 exploits, but nothing worked because there was an issue in Python's paramiko library. I tried every tool I could find online, and I used Python virtual environment to install requirements, but they still didn't work. I tried forcefully installing it on the main Python, but they still didn't work

<img width="1689" height="910" alt="Screenshot_20260624_180923" src="https://github.com/user-attachments/assets/208f47b0-e909-41d7-affc-72a6e4bd1ccb" />

I thought, let's get AI to exploit this vulnerability. Gemini generated the code for me. I was confident it would work, and I hit enter as I saw MAYA FOUND. Let's gooo,

<img width="1450" height="914" alt="Screenshot_20260624_181142" src="https://github.com/user-attachments/assets/8de15e1d-3076-47aa-b51a-5210b90096cd" />

I decided to cross-check it before moving on, so I put a random string as Username again, and yes, you could guess. It found that as a username too. This time i chose not to fall into the rabbit hole of solving bugs in code i found online like i did last time so i went a step back back, No more SSH, back to FTP. I started rechecking my process again, how I reached the FTP server, did I miss anything in between, any bug in the website, any port ignored? I started reading the Nmap scan result again and saw it. I'm sharing it again. Do you see it?

<img width="1403" height="575" alt="image" src="https://github.com/user-attachments/assets/f25f7207-4e23-4841-bcdd-354a781fae5b" />

The ftp Directory is writeable. I logged back in to FTP, uploaded Linpeas.sh and Pentest Monkey PHP_reverse shell file to  the file/ftp directory to get a reverse shell back to my system because I was confident that PHP is installed. I started a netcat listener, went to the site, and clicked the payload.php

<img width="1362" height="659" alt="image" src="https://github.com/user-attachments/assets/2009792e-eeff-47ee-9e79-569e006f0bd8" />

And I was in the mainframe lol. I got a successful reverse shell connection. I went to the ftp directory and executed LinPEAS.sh. Here is something I found interesting.

<img width="1061" height="401" alt="Screenshot_20260622_013852" src="https://github.com/user-attachments/assets/1fa62f3d-80ac-4053-a6d1-fb455ca18843" />

If you have experience with Linux and know what its file system looks like, you will spot it in no time. There is a /incidents directory. Strange, I decided to check it and found a file called suspicious.pcapng. I downloaded it to my system and opened it in Wireshark.

<img width="1919" height="1060" alt="Screenshot_20260624_213703" src="https://github.com/user-attachments/assets/74a50856-a35d-4e8a-8cd9-f2c2f255535b" />

There are lots of things going on in it. First, I tried going through HTTP packets, but didn't find much. Then, I tried different filters to search for the password as a string, but still nothing. At last, I followed the TCP Packet stream, and I got what's going on

<img width="1920" height="1040" alt="Screenshot_20260622_020951" src="https://github.com/user-attachments/assets/7a2e3b6f-f26f-4c96-a896-931207fa09be" />

There is a user named Lennie, too, and her password was captured in plaintext, so I copied the password and, without wasting a second, SSHed into the system with her credentials & found the user flag

<img width="1740" height="747" alt="Screenshot_20260622_022606-1" src="https://github.com/user-attachments/assets/66791986-0eb8-4e47-ad9f-20ef9e4dd19c" />

Now it was time to get the root flag. I explored Lennie's files, but what caught my eye was the scripts folder. Inside it, I found another script called planner.sh, I opened it and saw that it executes another script with a bit unusual permissions - /etc/print.sh (seemed like a cronjob to me)

<img width="541" height="270" alt="crop" src="https://github.com/user-attachments/assets/6a218c9b-4c8e-4993-897f-7bd65639d1b0" />

I put a line to get Bash reverse_shell in it, saved it and started a netcat listener. After a minute, I got the reverse_shell and I found the root flag

<img width="1886" height="1012" alt="Screenshot_20260622_030328" src="https://github.com/user-attachments/assets/dabc91b9-4091-4ac7-904f-88caf4e086b2" />
