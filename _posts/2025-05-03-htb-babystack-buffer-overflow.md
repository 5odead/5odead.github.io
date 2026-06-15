---
layout: post
title: "A Beginner's Guide to Tor Exit Nodes"
date: 2026-06-15
last_modified_at: 2026-06-15
tags: [tor, privacy, networking]
description: "How Tor exit nodes work, why you might pick a specific country, and exact torrc config snippets for ExitNodes, StrictNodes, and ExcludeExitNodes."
---

Tor routes traffic through multiple relays to hide your IP. The exit node is the last relay—where your traffic leaves Tor and hits the public internet. You can force Tor to use exits in a specific country (or block certain countries) by editing the `torrc` file.

## What Tor Actually Does

Tor (The Onion Router) is a decentralized network of volunteer relays. Each relay encrypts your traffic and peels off a layer like an onion before forwarding it. The final relay—the **exit node**—delivers your request to the destination site.

Tor Browser is the ready-to-use package: it automatically sends all traffic through Tor, hides your IP, and blocks many tracking methods.

## Why Exit Nodes Matter

Exit nodes don't see your real IP, but they **can see the destination site** and the unencrypted contents of your traffic (unless the site uses HTTPS). Tor picks exits randomly by default, but you may want to control them for:

- **Testing**: Check how a site behaves from a specific country  
- **Research**: Access region-restricted content  
- **Content access**: Ensure traffic exits in a certain location  

## Edit torrc to Control Exits

Find your `torrc` file:

- **Windows**: `C:\Users\<YourUsername>\AppData\Roaming\Tor\torrc`  
- **macOS/Linux**: `/etc/tor/torrc` or `~/.tor/torrc`  

Open it and add the lines below.

### Pick a country

```text
ExitNodes ua
StrictNodes 1
```

- Replace `ua` with a country code: `us` (USA), `fr` (France), `de` (Germany), etc.  
- `StrictNodes 1` forces Tor to **only** use exits in that country.  
- Set `StrictNodes 0` if you want Tor to prefer that country but allow others if needed.

### Use multiple countries

```text
ExitNodes us,de,fr
StrictNodes 0
```

Tor will prioritize exits in the US, Germany, and France, but can fall back to others.

### Pin by IP address (optional)

```text
ExitNodes 192.168.1.1
StrictNodes 1
```

Replace with the actual exit node IP you want.

## Blacklist countries or nodes

### Block as exit nodes only

```text
ExcludeExitNodes ru,cn
```

Tor won't use Russia or China as exits, but can still use them as entry/middle relays.

### Block from the entire circuit

```text
ExcludeNodes ru,cn
```

This prevents Tor from using those countries at any position (entry, middle, or exit).

## Quick reference

| Setting              | Effect                                                                 |
|----------------------|------------------------------------------------------------------------|
| `ExitNodes us`       | Prefer US exits                                                        |
| `StrictNodes 1`      | Only use specified exits/countries                                     |
| `StrictNodes 0`      | Prefer specified exits, but allow others                               |
| `ExcludeExitNodes ru,cn` | Do not use Russia/China as exits                                    |
| `ExcludeNodes ru,cn`     | Do not use Russia/China anywhere in the circuit                     |

## References

- Tor Project Documentation — official config guide  
- Tor Network Overview — how relays and circuits work  
- Country codes list — ISO-2 codes for `ExitNodes`/`ExcludeExitNodes`
