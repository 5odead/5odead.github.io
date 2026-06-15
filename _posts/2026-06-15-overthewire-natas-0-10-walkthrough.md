---
layout: post
title: "OverTheWire Natas: Levels 0–10 Walkthrough"
date: 2026-06-15
last_modified_at: 2026-06-15
tags: [web, sqli, natas, overthewire]
description: "Step-by-step walkthrough of OverTheWire's Natas wargame levels 0–10: source code disclosure, file inclusion, referer manipulation, cookie tampering, file path traversal, base64 reversal, command injection, and grep manipulation."
image: /assets/images/Overthewire.png
---


OverTheWire Natas: Levels 0–10 Walkthrough
=========================================

OverTheWire's Natas wargame is a series of web security challenges that teach server-side vulnerabilities.

Prerequisites
-------------

What you should know:

- Basic HTML/CSS structure
- How to use browser developer tools
- Basic command line usage
- Understanding of HTTP requests (helpful but not required)

Tools you'll need:

- A web browser (I used Chrome/Firefox)
- [Burp Suite Community Edition](https://portswigger.net/burp/communitydownload) (for intercepting HTTP requests)
- Python 3 (for decoding in Level 8)
- A text editor or terminal for running quick scripts

Natas Level 0
-------------

Authentication Credentials:  
Username: natas0  
Password: natas0  
URL: http://natas0.natas.labs.overthewire.org

Upon visiting the website, we are asked for a username & password, which we already have, so we enter them as given.

<img width="1918" height="911" alt="Screenshot_20260523_120931" src="https://github.com/user-attachments/assets/6e6a94ed-0fea-4601-a71c-0dde428148f3" />


After logging in, we see this page. There's nothing here except a 'Submit token' button, which takes us outside the scope, so let's check the source. On hitting Ctrl + U (View Source), we can see the password in line 16.

<img width="800" height="380" alt="0_o7CA7kPQeXyq9rdE" src="https://github.com/user-attachments/assets/f8841fdf-1572-4b37-a262-ea2b6e2787b2" />


Natas Level 0 → Level 1
-----------------------

Authentication Credentials:  
Username: natas1  
URL: http://natas1.natas.labs.overthewire.org

Upon visiting the website, we are asked for Username & Password. We use the provided username and the password we got from the previous level. After logging in, we see this page.

<img width="1918" height="905" alt="Screenshot_20260523_122135" src="https://github.com/user-attachments/assets/a98f4a73-e77f-4bf0-87af-4e780ea3fa30" />


Right-click is blocked on this page, but since we know shortcuts, we don't need to worry. You can use any of the following:

Alternative methods to access developer tools:

- Ctrl + Shift + I : Opens the browser's Inspect Element panel
- Ctrl + U : Displays the page source in a new tab

<img width="3840" height="1814" alt="Screenshot_20260523_122635" src="https://github.com/user-attachments/assets/60fc3262-49cc-4f92-95ce-a893fce82292" />


I used Inspect Element, and on Line 17, we can see the password.

Pro tip: For complex websites with extensive code, use Ctrl + Shift + I rather than Ctrl + U. The Inspect Element panel allows you to collapse and expand code blocks, making navigation much easier.

Natas Level 1 → Level 2
-----------------------

Authentication Credentials:  
Username: natas2  
URL: http://natas2.natas.labs.overthewire.org

Upon visiting the website, we are asked for username & password. We use the provided username and the password we got from the previous level. After logging in, we see this page.

<img width="1920" height="391" alt="Screenshot_20260523_123504" src="https://github.com/user-attachments/assets/ddbd09a5-aa05-42bb-a921-82d350b37828" />

Nothing again, so I view the source.

<img width="1920" height="541" alt="Screenshot_20260523_123640" src="https://github.com/user-attachments/assets/15969e5a-67c6-4f00-bee2-b42610648f6a" />


On Line 15, there's a PNG image attached, so I clicked the image, and it was just a blank image. I thought this might have to do with image steganography, so I downloaded the image and decided to check for Exif information (metadata), but found nothing until I realized this entire challenge is related to web security, not image steganography. I went a step back and decided to see the source of the image, but found nothing. Then I went back one more step, and something caught my eye.

Can you see it? Take a guess.

We have the full file path of the image. I quickly reopened the image and removed the image portion from the link.

From:  
http://natas2.natas.labs.overthewire.org/files/pixel.png

To:  
http://natas2.natas.labs.overthewire.org/files/

<img width="1031" height="498" alt="Screenshot_20260523_125444" src="https://github.com/user-attachments/assets/4d7650cf-89f0-4ae3-a0c3-b53192996436" />


I clicked the users.txt (http://natas2.natas.labs.overthewire.org/files/users.txt) and got the password.

<img width="1774" height="644" alt="Screenshot_20260523_125619" src="https://github.com/user-attachments/assets/68dc6216-c4df-4693-9248-06149b24cccf" />


Natas Level 2 → Level 3
-----------------------

Authentication Credentials:  
Username: natas3  
URL: http://natas3.natas.labs.overthewire.org

Nothing on the page, no password or image in the source code, but there's a hint. Line 3 says:

 <i> This stuff in the header has nothing to do with the level </i>

I fired up Burp Suite, checked the headers, and found nothing. I was confused. I went a step back and read the source code, and read Line 15, which I had ignored previously.

<i> No more information leaks!! Not even Google will find it this time… </i>

"Not even Google will find it this time" Hmmm, why can't Google find it? What could it be? What is something on a website that Google can't find?

Thought about it for a minute, then it clicked in my mind: robots.txt. That's something Google can't index. I fixed the link:

From:  
http://natas3.natas.labs.overthewire.org/

To:  
http://natas3.natas.labs.overthewire.org/robots.txt

<img width="926" height="265" alt="Screenshot_20260523_132713" src="https://github.com/user-attachments/assets/fcc81a91-788c-44fc-8686-002dfa9464a5" />


We got it. The robots.txt is disallowing the /s3cr3t folder. Time to check it out, I changed the link again.

From:  
http://natas3.natas.labs.overthewire.org/robots.txt

To:  
http://natas3.natas.labs.overthewire.org/s3cr3t/

<img width="787" height="465" alt="Screenshot_20260523_132848" src="https://github.com/user-attachments/assets/56681542-4d15-4b05-a92c-608cf276919b" />


I clicked the users.txt (http://natas3.natas.labs.overthewire.org/s3cr3t/users.txt) and got the password.

<img width="1856" height="544" alt="Screenshot_20260523_133115" src="https://github.com/user-attachments/assets/87904430-1692-4964-aa2c-9f766734e47d" />


Natas Level 3 → Level 4
-----------------------

Authentication Credentials:  
Username: natas4  
URL: http://natas4.natas.labs.overthewire.org

<img width="1912" height="686" alt="Screenshot_20260525_125516" src="https://github.com/user-attachments/assets/772041e5-af3c-468c-ac85-9bdbcd82290c" />


The website says Access Disallowed and gives us a hint. I load up Burp Suite and see the request over there, but I see nothing. Then I click the Refresh Page button provided on the site, and I see it.

<img width="983" height="481" alt="Screenshot_20260525_125928" src="https://github.com/user-attachments/assets/120bb46d-3713-4450-9511-a0ac6f9313dc" />


This is an example of Referer-based access control. The site is checking if the request came from http://natas5.natas.labs.overthewire.org/ or not. We change the Referer part in the request.

From:  
http://natas4.natas.labs.overthewire.org/

To:  
http://natas5.natas.labs.overthewire.org/

Then we get the response we wanted. Check Line 24.

<img width="3160" height="942" alt="Screenshot_20260525_130356" src="https://github.com/user-attachments/assets/dbd1d9eb-bb57-42ea-b1ea-f4b62988db33" />


Natas Level 4 → Level 5
-----------------------

Authentication Credentials:  
Username: natas5  
URL: http://natas5.natas.labs.overthewire.org

Upon entering the username and password, we are greeted with this page. I checked the source code, and I see nothing.

<img width="1920" height="906" alt="Screenshot_20260525_130825" src="https://github.com/user-attachments/assets/1c3e95aa-e3f3-432b-9581-4f00d6a80da1" />

I open Burp Suite, send the Request to the repeater and take a look at it, then I see it.

<img width="973" height="476" alt="Screenshot_20260525_132819" src="https://github.com/user-attachments/assets/ade6204e-c96b-4ef4-be0d-dfb4dbe8e121" />

Line 12 gives away the answer:

<i> Cookie: loggedin=0 </i>

Cookie here means the login status, and it is set to 0, which means False, so I changed it.

From:  
<i> Cookie: loggedin=0 </i>

To:  
<i> Cookie: loggedin=1 </i>

Then I sent the request and got the password in response.

<img width="3094" height="1744" alt="Screenshot_20260525_133455" src="https://github.com/user-attachments/assets/79cc609e-0a9f-4677-8659-708b1b0056bd" />

Natas Level 5 → Level 6
-----------------------

Authentication Credentials:  
Username: natas6  
URL: https://natas6.natas.labs.overthewire.org

The page asks for a secret and includes a View Source Code button.

<img width="1452" height="445" alt="Screenshot_20260526_144001" src="https://github.com/user-attachments/assets/a86ef2b5-14c3-4842-9d09-504580eeb6d9" />

I click the View Source Code button, and we can see the following code.

<img width="1470" height="917" alt="Screenshot_20260526_144300" src="https://github.com/user-attachments/assets/c721a588-2b39-4f38-9523-764ac0e97fd6" />

Here we can see the PHP code of how authentication works. The script is importing an external file called secret.inc, so I quickly copied the path of the file and pasted it in the URL.

From:  
http://natas6.natas.labs.overthewire.org/index-source.html

To:  
http://natas6.natas.labs.overthewire.org/includes/secret.inc

Here we can see the secret.

<img width="1826" height="490" alt="Screenshot_20260526_144716" src="https://github.com/user-attachments/assets/2ce82bae-8cc3-424f-bf74-0d4e3fe8d616" />

Now, upon entering this secret in the input field, we will get the password.

<img width="1548" height="427" alt="image" src="https://github.com/user-attachments/assets/6baff176-767e-4268-bb24-efa71c2ad030" />

Natas Level 6 → Level 7
-----------------------

Authentication Credentials:  
Username: natas7  
URL: http://natas7.natas.labs.overthewire.org

After logging in, I see this.

<img width="1412" height="323" alt="Screenshot_20260526_150638" src="https://github.com/user-attachments/assets/4c6957e6-d533-4281-9c6a-2fbbff1bb91f" />


I click the Home Button and see its source (Ctrl + U). Line 21 gives us a clear hint:

<img width="1538" height="627" alt="Screenshot_20260526_150745" src="https://github.com/user-attachments/assets/9189e87a-3df6-41d0-ba4c-718ce203c902" />

<i> -- hint: password for webuser natas8 is in /etc/natas_webpass/natas8 --> </i>

I changed the URL

From:  
<i> view-source:http://natas7.natas.labs.overthewire.org/index.php?page=home </i>

To:  
<i> view-source:http://natas7.natas.labs.overthewire.org/index.php?page=/etc/natas_webpass/natas8 </i>

<img width="1501" height="736" alt="image" src="https://github.com/user-attachments/assets/5c87a751-f185-4728-ac12-215f12199f84" />

Now, we have the password to move further.

Natas Level 7 → Level 8
-----------------------

Authentication Credentials:  
Username: natas9  
URL: http://natas9.natas.labs.overthewire.org

We see this when logging in, I quickly press the View source code button given on the site.
<img width="1437" height="680" alt="Screenshot_20260526_152018" src="https://github.com/user-attachments/assets/a43bd7fc-7bac-4be6-8fd3-578aafcae861" />

The site's source code looks like this. We can see a PHP script embedded in it. Let's understand it.

<img width="1498" height="951" alt="Screenshot_20260526_151955" src="https://github.com/user-attachments/assets/7051a6bd-44d0-428b-adb6-4418a2d8e65f" />

Code Explanation:

- There's a variable called encodedSecret that stores some value.
- There's a function called encodeSecret() which takes the value of a variable called secret (not encodedSecret, don't confuse it with the previous step's variable). The secret value gets encoded in Base64, then it gets reversed, and at last it gets converted to Hexadecimal. This function just exists; it's not being executed yet.
- The script checks if the user has clicked the submit button.
- If not clicked, then do nothing.
- If clicked, then take the value entered by the user, then pass it to the encodeSecret() function (STEP 2), where it gets converted.
- Compare the final converted output to the encodedSecret variable (STEP 1). If they match, then print Access Granted.

Now that we have understood the code, let's reverse it. To reverse it, we have to do the following:

1. Convert the hex back to a string.  
2. Reverse the string.  
3. Decode the string from Base64 to its original value.

Instead of manually decoding all these strings online, I have written a small code for it in Python:

```python
python3 -c 'import base64, binascii; print(base64.b64decode(binascii.unhexlify("3d3d516343746d4d6d6c315669563362")[::-1]).decode())'
```

This will give us the decoded secret, which is <i>oubWYf2kBq</i>. Now enter it as the secret and hit the submit button. You will get the password.

<img width="1472" height="595" alt="image" src="https://github.com/user-attachments/assets/de64dc1e-2501-4d4c-9af1-11aa7cf456c4" />

Natas Level 8 → Level 9
-----------------------

Authentication Credentials:  
Username: natas9  
URL: http://natas9.natas.labs.overthewire.org

After authenticating, we see this input field on the site. I decide to click the View source code button on the page.

<img width="1430" height="420" alt="Screenshot_20260526_172632" src="https://github.com/user-attachments/assets/5309c38d-4ba6-4aa1-9d67-2a0b199fbec0" />

An embedded PHP script that makes a query via passthru. Interesting!

<img width="1482" height="888" alt="Screenshot_20260526_172759" src="https://github.com/user-attachments/assets/1c379d08-4f64-4483-86ab-62415b028fbc" />

Passthru is used to execute system commands. This script takes input from the user and directly gets it executed through passthru; there's no input sanitisation, so let's test if we can chain commands in it.

<img width="1401" height="557" alt="Screenshot_20260526_173146" src="https://github.com/user-attachments/assets/c3cb8c53-777e-4f23-82d5-ed75be8ca915" />

Command chaining means executing multiple commands in a single line using special operators. Here I used a semicolon to chain and put pwd to check if it's working — and it worked. The command pwd prints the working directory, so now we can see where we are at right now. Let's exploit this vulnerability now.

In level 7, the password was stored in /etc/natas_webpass/natas8, so I decided to check if the same folder exists or not.

<img width="1668" height="882" alt="Screenshot_20260526_173623" src="https://github.com/user-attachments/assets/da671162-3e7f-4f4f-bc72-47b8d55bc475" />

Found it. Now we know where our password can be, so I tried this:

```text
;cat /etc/natas_webpass/natas10
```

and got the password.

<img width="1596" height="962" alt="image" src="https://github.com/user-attachments/assets/6f3a451b-e827-4e4f-9e57-5d0b135923b9" />


Natas Level 9 → Level 10
------------------------

Authentication Credentials:  
Username: natas10  
URL: http://natas10.natas.labs.overthewire.org

Enter the username provided & password from the previous level. 
<img width="1406" height="501" alt="Screenshot_20260526_173951" src="https://github.com/user-attachments/assets/7917e339-a00a-4dec-8bfd-2f197c9f0607" />

Click View Source Code.

<img width="1355" height="932" alt="Screenshot_20260526_174042" src="https://github.com/user-attachments/assets/76280246-a161-4173-ab61-a942f7c4c57e" />

Hmm, they seem to have added input sanitisation now, but they missed one thing — they still use passthru. We can't chain commands, but we can manipulate grep to do the work for us. We can do this by putting:

```text
.* /etc/natas_webpass/natas11
```

as input, what this does is tell grep to read everything.

<img width="1640" height="842" alt="image" src="https://github.com/user-attachments/assets/5ea9c373-cb91-4b55-ba86-c5ad6634f564" />

We got the password.

That is it for this walkthrough, I will upload the walkthrough of the next levels in the next write-up. Till then. Keep Hacking
