---
layout: post
title: "Keylogging: A Practical Approach"
date: 2026-06-15
last_modified_at: 2026-06-15
tags: [keylogging, linux, evdev, cybersecurity]
description: "Building a Linux keylogger from scratch: switching from pynput to evdev for system-wide capture, Telegram Bot exfiltration, volatile storage in /dev/shm, and stealth-oriented file naming."
image: /assets/images/keylogger-linux-cover.png
---

A practical walkthrough of building a keylogger on Linux that actually works—switching from pynput to evdev, exfiltrating via Telegram Bot API, storing logs in volatile /dev/shm, and naming files to mimic system processes.

![Diagram of keylogger flow: evdev → /dev/shm log → Telegram Bot API](/assets/images/keylogger-linux-cover.png)

## What is a Keylogger?

A keylogger is a software or hardware tool that records your keystrokes as you type. It's often used for malicious purposes. There are two main types:

| Type | Description |
|------|-------------|
| Software Keylogger | Runs as a program or process on a system |
| Hardware Keylogger | Physical device installed on a motherboard or between keyboard and computer |

> ⚠️ **Disclaimer**: This post is intended for educational and cybersecurity research purposes only. The techniques and code discussed are designed for controlled testing on systems you own or have explicit permission to work on. Unauthorized use of keyloggers is illegal and unethical. The author does not take responsibility for any misuse.

## Initial Attempts

Recently, I wanted to test a keylogger on my own device to understand how it works, so I convinced ChatGPT to help me write one in Python. I ran the script, but it didn't record any keystrokes.

After digging, I discovered the problem: the **pynput** library—a popular Python module for capturing keyboard events—doesn't work properly with the **Wayland** display server. I tried debugging, but ran into another issue related to my desktop environment. I use **KDE Plasma**, and I wasn't switching DEs just because of one error.

Looking for alternatives, I searched "keylogger linux download" on Google and found GitHub repositories. I picked one, cloned the repo, followed the README—and it failed again. I checked the code and spotted **pynput** being used there too. I made tweaks, still no luck. Frustrated, I `sudo rm -rf`ed it.

> (`sudo rm -rf`: Forcefully delete a directory and its content)

Cloned a new repo with new code and libraries—but the same compatibility issue. The project hadn't been maintained for years. I gave up on others' solutions and decided to write my own keylogger from scratch.

## Design Overview

I outlined the basic features I wanted, focusing on core elements for an intermediate-level keylogger:

### Keystroke Logging
I decided to use **pynput** because I was determined to get it running—and it's the easiest to use.

### Remote Access & Exfiltration
This was the most challenging part. Thinking from a **SOC Team** perspective, I wanted to exfiltrate data without triggering an **IPS (Intrusion Prevention System)**. Some of the worst methods include:

- Email
- FTP
- SMB
- DNS Tunneling

### Anti-Detection Mechanism
No interactive terminals or obvious signs of activity. Everything runs in the background in the least detectable way possible.

### Self-Destruction & Persistence
Keystroke logs wouldn't be saved permanently—they could grow and trigger alerts. The keylogger needed to function autonomously without leaving easily detectable traces.

## First Attempt

After reading 2–3 tutorials and some documentation, my first keylogger was ready. It worked—but did it behave like malware or a rootkit from sketchy game/movie download sites? Not even close.

**Problems:**
- Pynput couldn't capture keystrokes across multiple virtual desktops
- Keylogs stored directly in the home directory
- Exfiltration: plain text sent over HTTP to a random site

Yeah—this would get flagged and blocked in less than a second. I realized I needed to think like an actual malware developer, from coding style down to file naming.

I spent a day researching keyloggers properly: YouTube videos, GitHub code, blog posts, and ChatGPT for ideas. Now I knew what a keylogger is.

## The Keylogger

I switched from **pynput** to **evdev** since evdev reads events directly from `/dev/input` and captures system-wide input, completely solving the virtual desktop capturing issue.

For exfiltration, I used the **Telegram Bot API**—it blends in with normal web traffic and uses encrypted HTTP requests. Captured data is sent directly to a Telegram channel. I got the idea from phishing pages; many use Telegram API to exfiltrate stolen data, so I knew it would be reliable.

The keylogger now stores keystrokes in `/dev/shm/`, a volatile directory (automatically cleared on reboot), and deletes the log file after sending it to Telegram.

**Result:**
- Runs quietly in the background
- Uses less CPU
- Avoids repeated requests that could trigger detection

## PROJECT LINK

[**GitHub - 5odead/Trevent**](https://github.com/5odead/Trevent) — A keyboard input monitoring and logging tool for cybersecurity research. Designed for Ethical Testing ⌨️

## File Structure and Names for Full Stealth

Create a folder called `networkd-helper` in `/usr/lib/systemd/`:

```bash
mkdir -p /usr/lib/systemd/networkd-helper
```

**Installation Path**: `/usr/lib/systemd/networkd-helper/`

> Names that mimic actual system files people won't find suspicious.

| File | Purpose |
|------|---------|
| `systemd-timed.py` | Keylogger file name |
| `telemetry-sync.py` | Exfiltration file name (mimics system log files) |
| `/dev/shm/.cache-netlog` | Temporary keylog storage |

**Run Command** (nohup to run in the background):

```bash
nohup sudo python3 FILENAME.py &
```

## Notes

1. Set **`KEYBOARD_DEVICE`** to your actual event number—or the logger won't capture anything.
2. Update **`CHAT_ID`** and **`BOT_TOKEN`** in your exfiltration script—or data won't get sent.

## Conclusion

The keylogger now uses some of the best tricks and strategies I'm aware of, but it still has flaws a blue team professional could easily detect.

For example, the process can be spotted effortlessly using `ps aux`. I'll continue refining and improving it over time.

If you have questions, feel free to reach out or leave a comment.
